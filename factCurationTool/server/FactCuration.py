import json
import gzip
from os import listdir,path
import uuid
import re
import sqlite3

class CurationFact:
    
    def __init__(self,fp):
        self.db=fp
        
    def retrieve(self,fact_type):
        if fact_type=="guidelines":
            fact_type="guideline"
        elif fact_type=="statements":
            fact_type="statement"
            
        facts=None
        conn=None
        try:
            conn=sqlite3.connect(self.db)
            curs=conn.cursor()
            
            curs.execute("SELECT unique_id, json_content FROM facts WHERE type=?",(fact_type,))
            #facts=dict([(unique_id,json.loads(json_content)) for unique_id,json_content in curs.fetchall()])
            facts=[json.loads(json_content) for unique_id,json_content in curs.fetchall()]
        finally:
            if conn is not None:
                conn.close()
            
        return facts
        
        
    def save(self,fact_type,json_content):
        if fact_type=="guidelines":
            fact_type="guideline"
        elif fact_type=="statements":
            fact_type="statement"
        
        conn=None
        try:
            conn=sqlite3.connect(self.db)
            curs=conn.cursor()
            
            if 'unique_id' not in json_content:
                json_content['unique_id']=str(uuid.uuid4())
                curs.execute("INSERT INTO facts VALUES (?,?,?)",(json_content['unique_id'],json.dumps(json_content),fact_type))
                conn.commit()
            else:
                curs.execute("UPDATE facts SET json_content=? WHERE unique_id=? AND type=?",(json.dumps(json_content), json_content['unique_id'], fact_type))
                conn.commit()
        finally:
            if conn is not None:
                conn.close()
            
        return 0

curation_fact=CurationFact("./output/facts_sample.db")

from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
from urllib.parse import urlparse,parse_qs
import cgi
import json

class MyHandler(BaseHTTPRequestHandler):
    
    def _send_headers(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
    
    def _send_error(self):
        self.send_response(400)
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def do_GET(self):
        logging.info('GET request,\nPath: %s\nHeaders:\n%s\n', str(self.path), str(self.headers))
        url = urlparse(self.path)
        fields = parse_qs(url.query)
        if url.path == '/curation' and 'type' in fields and fields['type'][0] in ["guidelines","statements"]:
            self._send_headers()
            self.wfile.write(json.dumps(curation_fact.retrieve(fields['type'][0])).encode('utf-8'))
        else:
            self._send_error()
            self.wfile.write('Invalid URL'.encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = json.loads(self.rfile.read(content_length).decode('utf-8'))
        logging.info("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",str(self.path), str(self.headers), post_data)

        url = urlparse(self.path)
        fields = parse_qs(url.query)
        # verify uuid4
        pattern = re.compile('^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}$')
        if url.path == '/save' and 'type' in fields and fields['type'][0] in ["guidelines","statements"]\
            and 'factData' in post_data and (('unique_id' not in post_data['factData']) or (pattern.match(post_data['factData']['unique_id']) is not None)):
            curation_fact.save(fields['type'][0],post_data['factData'])

            self._send_headers()
            self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))
        else:
            self._send_error()
            self.wfile.write('Invalid URL'.encode('utf-8'))

    def do_OPTIONS(self):
        self._send_headers()

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