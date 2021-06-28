from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F
import json
import math
import numpy as np
import heapq
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

#Mean Pooling - Take attention mask into account for correct averaging
def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0] #First element of model_output contains all token embeddings
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    return sum_embeddings / sum_mask

#Retrieve fact based on BioBERT
class RetrieveFact:
    
    def __init__(self, fp, sen_emb_fp):
        #Load AutoModel from huggingface model repository
        self.tokenizer = AutoTokenizer.from_pretrained("dmis-lab/biobert-v1.1")
        self.bert = AutoModel.from_pretrained("dmis-lab/biobert-v1.1")

        print('BERT model loaded')
        
        self.breastcancer_facts_df=pd.read_csv(fp)

        #self.encoded_inputs=torch.load(enc_inp_fp)
    
        with open(sen_emb_fp,'rb') as f:
            self.sentence_embeddings=np.load(f)
        
        print('sentence embedding get,',self.sentence_embeddings.shape)

    def retrieve(self,query):
        encoded_input = self.tokenizer([query], padding=True, truncation=True, max_length=512, return_tensors='pt')
        with torch.no_grad():
            model_output = self.bert(**encoded_input)
        query_embedding=mean_pooling(model_output, encoded_input['attention_mask']).detach().numpy()
        
        cos_sim=cosine_similarity(query_embedding,self.sentence_embeddings)[0].tolist()

        return [
            {'cosine_similarity':cos_sim[i],'sentence':self.breastcancer_facts_df.sentence[i],
             'title':self.breastcancer_facts_df.title[i],'citation':self.breastcancer_facts_df.citation[i],
             'unique_id':self.breastcancer_facts_df.unique_id[i]
            }
            for i in heapq.nlargest(20,range(len(self.breastcancer_facts_df)),key=lambda i:cos_sim[i])
        ]

retrieve_fact=RetrieveFact(fp='output/BreastCancerFacts.csv',sen_emb_fp='output/breastcancerfacts_embeddings.npy')

from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
from urllib.parse import urlparse,parse_qs
import cgi
import json

class S(BaseHTTPRequestHandler):
    def _set_html_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def _set_json_response(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def do_GET(self):
        logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
        query=urlparse(self.path)
        #print(query)
        if query.path=='/home':
            self._set_html_response()
            with open('SearchHome-0.1.html','r') as f:
                line=f.readline()
                while line:
                    self.wfile.write(line.encode('utf-8'))
                    line=f.readline()
        else:
            self.error_page()

    def do_POST(self):
        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        post_data = self.rfile.read(content_length) # <--- Gets the data itself
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                str(self.path), str(self.headers), post_data.decode('utf-8'))
        query=urlparse(self.path)
        #print(query)
        if query.path=='/search':
            fields = parse_qs(post_data.decode('utf-8'))
            #print(fields)
            if 'search' in fields:
                self._set_json_response()
                self.wfile.write(json.dumps(retrieve_fact.retrieve(fields['search'][0])).encode('utf-8'))
            else:
                self.error_page()
        else:
            self.error_page()

    def error_page(self):
        self._set_html_response()
        #self.wfile.write("GET request for {}".format(self.path).encode('utf-8'))
        self.wfile.write('error request'.encode('utf-8'))

def run(server_class=HTTPServer, handler_class=S, port=8080):
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
