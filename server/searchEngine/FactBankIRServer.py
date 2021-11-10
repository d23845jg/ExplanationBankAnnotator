import uuid
import logging
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler, HTTPServer
from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F
import json
import math
import numpy as np
import heapq
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# Mean Pooling - Take attention mask into account for correct averaging
def mean_pooling(model_output, attention_mask):
    # First element of model_output contains all token embeddings
    token_embeddings = model_output[0]
    input_mask_expanded = attention_mask.unsqueeze(
        -1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    return sum_embeddings / sum_mask

# Retrieve fact based on BioBERT
class RetrieveFact:

    def __init__(self, fp, sen_emb_fp):
        # Load AutoModel from huggingface model repository
        self.tokenizer = AutoTokenizer.from_pretrained("dmis-lab/biobert-v1.1")
        self.bert = AutoModel.from_pretrained("dmis-lab/biobert-v1.1")

        print('BERT model loaded')

        self.breastcancer_facts_df = pd.read_csv(fp)

        # self.encoded_inputs=torch.load(enc_inp_fp)

        with open(sen_emb_fp, 'rb') as f:
            self.sentence_embeddings = np.load(f)

        print('sentence embedding get,', self.sentence_embeddings.shape)

    def retrieve(self, query, fact_type=None):
        filtered_facts_df = None
        if fact_type is None or fact_type == "all":
            filtered_facts_df = self.breastcancer_facts_df.copy()
            filtered_sentence_embeddings = self.sentence_embeddings
        elif fact_type == "definition":
            filter_indicate = self.breastcancer_facts_df["type"].apply(
                lambda x: x.endswith("_definition"))
            filtered_facts_df = self.breastcancer_facts_df[filter_indicate]
            filtered_sentence_embeddings = self.sentence_embeddings[
                [i for i in range(len(self.sentence_embeddings))
                 if filter_indicate[i]]
            ]
        else:
            filter_indicate = self.breastcancer_facts_df["type"].apply(
                lambda x: x == fact_type)
            filtered_facts_df = self.breastcancer_facts_df[filter_indicate]
            filtered_sentence_embeddings = self.sentence_embeddings[
                [i for i in range(len(self.sentence_embeddings))
                 if filter_indicate[i]]
            ]

        encoded_input = self.tokenizer(
            [query], padding=True, truncation=True, max_length=512, return_tensors='pt')
        with torch.no_grad():
            model_output = self.bert(**encoded_input)
        query_embedding = mean_pooling(
            model_output, encoded_input['attention_mask']).detach().numpy()

        cos_sim = cosine_similarity(
            query_embedding, filtered_sentence_embeddings)[0].tolist()

        def validate(value):
            return value if not pd.isna(value) else 'NaN'

        return [
            {
                'cosine_similarity': cos_sim[i],
                'unique_id': filtered_facts_df.unique_id.values[i],
                # self.breastcancer_facts_df.statement[i],
                'Statement': filtered_facts_df.text.values[i],
                'Resource': '',  # self.breastcancer_facts_df.resource[i],
                # 'LoE/GoR':self.breastcancer_facts_df.LoE/GoR[i],
                # validate(self.breastcancer_facts_df.consensus[i]),
                'Consensus': '',
                # validate(self.breastcancer_facts_df.type[i]),
                'Type': filtered_facts_df.type.values[i],
                # validate(self.breastcancer_facts_df.section[i])
                'Section': ''
            }
            for i in heapq.nlargest(20, range(len(filtered_facts_df)), key=lambda i:cos_sim[i])
        ]

retrieve_fact = RetrieveFact(fp='./output/breast_cancer_facts_sample.csv',
                             sen_emb_fp='./output/all_fact_sentence_embeddings_sample.npy')

# HTTP SERVER ------------------------------------------------------------------------------------------------------------------------------------------
class MyHandler(BaseHTTPRequestHandler):

    def _send_headers(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin',
                         'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def _send_error(self):
        self.send_response(400)
        self.send_header('Access-Control-Allow-Origin',
                         'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def do_GET(self):
        logging.info('GET request,\nPath: %s\nHeaders:\n%s\n',
                     str(self.path), str(self.headers))
        url = urlparse(self.path)
        fields = parse_qs(url.query)
        if url.path == '/search' and 'query' in fields:
            if 'type' in fields and fields['type'][0] in ["all", "definition", "guideline", "statement"]:
                self._send_headers()
                self.wfile.write(json.dumps(retrieve_fact.retrieve(
                    fields['query'][0], fields['type'][0])).encode('utf-8'))
            else:
                self._send_headers()
                self.wfile.write(json.dumps(retrieve_fact.retrieve(
                    fields['query'][0], "all")).encode('utf-8'))
        else:
            self._send_error()
            self.wfile.write('Invalid URL'.encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n", str(
            self.path), str(self.headers), post_data)

        url = urlparse(self.path)
        if url.path == '/tree' and 'treeData' in post_data:
            treeId = str(uuid.uuid4())
            newFactTree = {"treeId": treeId, "treeData": post_data['treeData']}
            with open('tree/%s.json' % treeId, 'w') as file:
                json.dump(newFactTree, file)

            self._send_headers()
            self.wfile.write("POST request for {}".format(
                self.path).encode('utf-8'))
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
