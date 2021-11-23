import uuid
import logging
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler, HTTPServer
from transformers import AutoTokenizer, AutoModel
import torch
import csv
import json
import numpy as np
import heapq
from sklearn.metrics.pairwise import cosine_similarity
import requests

"""
TODO:
· Create a proper database
· Docker
· 
"""

# Mean Pooling - Take attention mask into account for correct averaging
def mean_pooling(model_output, attention_mask):
    # First element of model_output contains all token embeddings
    token_embeddings = model_output[0]
    #token_embeddings = model_output.last_hidden_state
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    return sum_embeddings / sum_mask

# Retrieve fact based on BioBERT -----------------------------------------------------------------------------------------------------------------------
class RetrieveFact:

    def __init__(self):
        # Load AutoModel from huggingface model repository
        self.tokenizer = AutoTokenizer.from_pretrained("dmis-lab/biobert-v1.1")
        self.bert = AutoModel.from_pretrained("dmis-lab/biobert-v1.1")
        print('BERT model loaded')

    def retrieve(self, query):
        encoded_input = self.tokenizer([query], padding=True, truncation=True, max_length=512, return_tensors='pt')
        with torch.no_grad():
            model_output = self.bert(**encoded_input)
        query_embedding = mean_pooling(model_output, encoded_input['attention_mask']).detach().numpy()

        all_facts_with_embeddings = requests.get("http://fact-curation:8081/facts").json()

        filtered_facts_df = []
        filtered_sentence_embeddings = []
        for fact in all_facts_with_embeddings:
            embedding = fact.pop('Embedding', [])
            filtered_facts_df.append(fact)
            filtered_sentence_embeddings.append(embedding[0])
        filtered_sentence_embeddings = np.array(filtered_sentence_embeddings)
        print('sentence embedding get,', filtered_sentence_embeddings.shape)

        cos_sim = cosine_similarity(query_embedding, filtered_sentence_embeddings)[0].tolist()

        # def validate(value):
        #     return value if not pd.isna(value) else 'NaN'

        return [
            {
                'cosine_similarity': cos_sim[i],
                'unique_id': filtered_facts_df[i]['unique_id'],
                # self.breastcancer_facts_df.statement[i],
                'Statement': filtered_facts_df[i]['Statement'],
                'Resource': '',  # self.breastcancer_facts_df.resource[i],
                # 'LoE/GoR':self.breastcancer_facts_df.LoE/GoR[i],
                # validate(self.breastcancer_facts_df.consensus[i]),
                'Consensus': '',
                # validate(self.breastcancer_facts_df.type[i]),
                'Type': filtered_facts_df[i]['Type'],
                # validate(self.breastcancer_facts_df.section[i])
                'Section': ''
            }
            for i in heapq.nlargest(20, range(len(filtered_facts_df)), key=lambda i:cos_sim[i])
        ]

    def findEmbedding(self, statement):
        encoded_input = self.tokenizer([statement], padding=True, truncation=True, max_length=512, return_tensors='pt')
        with torch.no_grad():
            model_output = self.bert(**encoded_input)
        query_embedding = mean_pooling(model_output, encoded_input['attention_mask']).detach().numpy().tolist()

        return {
            'Embedding': query_embedding
        }

retrieve_fact = RetrieveFact()

# Pre-Process Tree -------------------------------------------------------------------------------------------------------------------------------------
class ProcessTree():

    def __init__(self, path):
        self.__path = path
    
    def __generateNegativeSamples(self, all_tree_data, query, data):
        if query not in self.__negative_samples:
            self.__negative_samples[query] = all_tree_data
        self.__negative_samples[query].remove(data)

    def __getAllNegativeSamples(self):
        csv_data = []
        for query in self.__negative_samples:
            negative_sample = self.__negative_samples[query]
            for data in negative_sample:
                csv_data.append([query, data['Statement'], data['unique_id'], 0])
        return csv_data

    def __getAllPositiveSamples(self, treeData, csv_data):
        for node in treeData:
            # unique_id == -1 (manually created statements) and 0 (user query)
            if node['data']['unique_id'] not in [-1, 0]:
                csv_data.append([node['query'], node['data']['Statement'], node['data']['unique_id'], 1])
                self.__generateNegativeSamples(node['allQueryData'], node['query'], node['data'])
            if 'children' in node:
                self.__getAllPositiveSamples(node['children'], csv_data)
        return csv_data

    def __generateCSVFile(self, fileId, annotationTreeData):
        with open(self.__path+'csv/'+fileId+'.csv', 'w+') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["query", "statement", "unique_id", "label"])

            self.__negative_samples = {}
            csv_data = self.__getAllPositiveSamples(annotationTreeData, [])
            writer.writerows(csv_data)

            csv_data = self.__getAllNegativeSamples()
            writer.writerows(csv_data)
    
    def __generateJSONTreeFile(self, fileId, annotationTreeData):
        with open(self.__path+'json/'+fileId+'.json', 'w+') as file:
            json.dump(annotationTreeData, file)

    def generateFiles(self, annotationTreeData):
        fileId = str(uuid.uuid4())
        self.__generateCSVFile(fileId, annotationTreeData)
        self.__generateJSONTreeFile(fileId, annotationTreeData)

process_tree = ProcessTree(path='./tree/')

# HTTP SERVER ------------------------------------------------------------------------------------------------------------------------------------------
class MyHandler(BaseHTTPRequestHandler):

    def _send_headers(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def _send_error(self):
        self.send_response(400)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def do_GET(self):
        logging.info('GET request,\nPath: %s\nHeaders:\n%s\n',str(self.path), str(self.headers))
        url = urlparse(self.path)
        fields = parse_qs(url.query)
        if url.path == '/search' and 'query' in fields:
            self._send_headers()
            self.wfile.write(json.dumps(retrieve_fact.retrieve(fields['query'][0])).encode('utf-8'))

        elif url.path == '/embedding' and 'statement' in fields:
            self._send_headers()
            self.wfile.write(json.dumps(retrieve_fact.findEmbedding(fields['statement'][0])).encode('utf-8'))

        else:
            self._send_error()
            self.wfile.write('Invalid URL'.encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n", str(self.path), str(self.headers), post_data)

        url = urlparse(self.path)
        if url.path == '/tree' and 'treeData' in post_data:
            process_tree.generateFiles(post_data['treeData'])
            self._send_headers()
            self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))
        else:
            self._send_error()
            self.wfile.write('Invalid URL'.encode('utf-8'))

    def do_OPTIONS(self):
        self._send_headers()

def run(server_class=HTTPServer, handler_class=MyHandler, port=8080):
    logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    logging.info('Starting httpd...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info('Stopping httpd...\n')


if __name__ == '__main__':
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
