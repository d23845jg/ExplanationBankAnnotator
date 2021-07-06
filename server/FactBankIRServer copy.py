from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F
import json
import math
import numpy as np
import heapq
from sklearn.metrics.pairwise import cosine_similarity

import pyspark
from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.linalg import Vectors
from pyspark.mllib.linalg.distributed import CoordinateMatrix

# Mean Pooling - Take attention mask into account for correct averaging
def mean_pooling(model_output, attention_mask):
    token_embeddings = model_output[0] # First element of model_output contains all token embeddings
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    return sum_embeddings / sum_mask

# Retrieve fact based on BioBERT
class RetrieveFact:

    def __init__(self, sen_info_emb_fp):#'output/facts_lst.jsonl'
        # Load AutoModel from huggingface model repository
        self.tokenizer = AutoTokenizer.from_pretrained('dmis-lab/biobert-v1.1')
        self.bert = AutoModel.from_pretrained('dmis-lab/biobert-v1.1')
        print('BERT model loaded')

        self.spark = (
            SparkSession
            .builder
            .appName('CancerFactBank')
            .getOrCreate()
        )

        self.sen_info_emb_fp = self.spark.read.options(inferSchema=True, header=True).csv(sen_info_emb_fp)
        #self.sen_info_emb_fp.printSchema()
        #self.sen_info_emb_fp.show(truncate=False)

        assembler = VectorAssembler(inputCols=self.sen_info_emb_fp.columns[7:], outputCol='sen_emb')
        self.sentence_embeddings_df = assembler.transform(self.sen_info_emb_fp).select('sen_emb') #could add the unique_id to track elements
        #self.sentence_embeddings_df.printSchema()
        #self.sentence_embeddings_df.show(truncate=False)
        print('sentence embedings loaded')


    def retrieve(self,query):
        encoded_input = self.tokenizer([query], padding=True, truncation=True, max_length=512, return_tensors='pt')
        with torch.no_grad():
            model_output = self.bert(**encoded_input)
        query_embedding=mean_pooling(model_output, encoded_input['attention_mask']).detach().numpy()

        query_emb_tuple = map(lambda x: ( True, Vectors.dense(x)), query_embedding)
        query_emb_df = self.spark.createDataFrame(query_emb_tuple, schema=['true', 'que_emb'])
        #query_emb_df.printSchema()
        #que_emb_df.show()


        # For the cosine similarity I think we can do e.g. RowMatrix(sc.parallelize(vectors)) - https://stackoverflow.com/questions/30169841/convert-matrix-to-rowmatrix-in-apache-spark-using-scala
        



        cos_sim=cosine_similarity(query_embedding,self.sentence_embeddings)[0].tolist()

        return [
            {
                'cosine_similarity':cos_sim[i],'sentence':self.facts_lst[i][1],
                'paragraph':self.facts_lst[i][2],'pmcid':self.facts_lst[i][3],
                'unique_id':self.facts_lst[i][0],'type':self.facts_lst[i][4],
                'title':self.facts_lst[i][5],'author_citation':self.facts_lst[i][6]
            }
            for i in heapq.nlargest(20,range(len(self.facts_lst)),key=lambda i:cos_sim[i])
        ]

#retrieve_fact=RetrieveFact(fp='output/facts_lst.jsonl',sen_emb_fp='output/sentence_embeddings.npy')
retrieve_fact=RetrieveFact(sen_info_emb_fp='output/sampled_40_sentence_info_embeddings.csv')


# HTTP SERVER ------------------------------------------------------------------------------------------------------------------------------------------
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
import logging

class MyHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        logging.info('GET request,\nPath: %s\nHeaders:\n%s\n', str(self.path), str(self.headers))
        url = urlparse(self.path)
        fields = parse_qs(url.query)
        if url.path == '/search' and 'query' in fields:
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(retrieve_fact.retrieve(fields['query'][0])).encode('utf-8'))
        else:
            self.send_response(400)
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write('Invalid URL'.encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")

def run(server_class = HTTPServer, handler_class = MyHandler, port = 8080):
    logging.basicConfig(level = logging.INFO)
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
