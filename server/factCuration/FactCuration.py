import csv
import json
import requests
import pymongo
import uuid
import logging

# Explanation Bank -------------------------------------------------------------------------------------------------------------------------------------
class CurationFact:
    def __init__(self):
        conn_str = "mongodb://mongo:27017/db"
        # conn_str = "mongodb://localhost:27017"
        try:
            client = pymongo.MongoClient(conn_str)
            logging.info("Connected to MongoDB")
            self.db = client["facts"]
        except Exception:
            logging.error("Unable to connect to MongoDB")

    def retrieveAllFacts(self):
        facts = list(self.db.facts.find({}))
        return facts

    def retrieveNegativeSamplingFacts(self, ids, size):
        ids = json.loads(ids.replace("'", '"'))
        facts = list(
            self.db.facts.aggregate(
                [{"$match": {"_id": {"$nin": ids}}}, {"$sample": {"size": int(size)}}]
            )
        )
        return facts

    def deleteFactByID(self, id):
        self.db.facts.delete_one({"_id": id})

    def saveByID(self, json_content):
        json_content["Embedding"] = requests.get("http://search-engine:8080/embedding?statement={0}".format(json_content["Statement"])).json()["Embedding"]
        # json_content['Embedding'] = requests.get("http://localhost:8080/embedding?statement={0}".format(json_content['Statement'])).json()['Embedding']
        self.db.facts.update_one(
            {"_id": json_content["_id"]}, {"$set": json_content}, upsert=True
        )

    def save_all(self, csv_file):
        lines = csv_file.splitlines()
        reader = csv.reader(lines)
        parsed_csv = list(reader)

        header = parsed_csv[0]
        rows = parsed_csv[1:]

        for row in rows:
            json_content = {}
            for i in range(len(header)):
                json_content[header[i]] = row[i]
            json_content["Embedding"] = requests.get("http://search-engine:8080/embedding?statement={0}".format(json_content["Statement"])).json()["Embedding"]
            # json_content['Embedding'] = requests.get("http://localhost:8080/embedding?statement={0}".format(json_content['Statement'])).json()['Embedding']
            # json_content['_id'] = str(uuid.uuid4())
            json_content["_id"] = json_content["Statement"]
            self.saveByID(json_content)

curation_fact = CurationFact()


# HTTP Server ------------------------------------------------------------------------------------------------------------------------------------------
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json


class MyHandler(BaseHTTPRequestHandler):
    def _send_headers(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Type", "application/json")
        self.end_headers()

    def _send_error(self):
        self.send_response(400)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Type", "application/json")
        self.end_headers()

    def do_GET(self):
        logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
        url = urlparse(self.path)
        fields = parse_qs(url.query)
        if url.path == "/facts":
            self._send_headers()
            self.wfile.write(json.dumps(curation_fact.retrieveAllFacts()).encode("utf-8"))
        elif (
            url.path == "/negativeSamplingFacts"
            and "ids" in fields
            and "size" in fields
        ):
            self._send_headers()
            self.wfile.write(
                json.dumps(
                    curation_fact.retrieveNegativeSamplingFacts(
                        fields["ids"][0], fields["size"][0]
                    )
                ).encode("utf-8")
            )
        else:
            self._send_error()
            self.wfile.write("Invalid URL".encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers["Content-Length"])
        # logging.info('POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n',str(self.path), str(self.headers), post_data)

        url = urlparse(self.path)
        fields = parse_qs(url.query)

        if (
            url.path == "/save"
            and "type" in fields
            and fields["type"][0] == "explanationBank"
        ):
            post_data = self.rfile.read(content_length).decode("utf-8")
            curation_fact.save_all(post_data)
            self._send_headers()
            self.wfile.write("POST request for {}".format(self.path).encode("utf-8"))
            return
        elif url.path == "/save":
            post_data = json.loads(self.rfile.read(content_length).decode("utf-8"))
            if "factData" in post_data and "Type" in post_data["factData"]:
                curation_fact.saveByID(post_data["factData"])
                self._send_headers()
                self.wfile.write("POST request for {}".format(self.path).encode("utf-8"))
                return
        self._send_error()
        self.wfile.write("Invalid URL".encode("utf-8"))

    def do_DELETE(self):
        logging.info('DELETE request,\nPath: %s\nHeaders:\n%s\n', str(self.path), str(self.headers))

        url = urlparse(self.path)
        fields = parse_qs(url.query)

        if url.path == "/delete" and "id" in fields:
            curation_fact.deleteFactByID(fields["id"][0])
            self._send_headers()
            self.wfile.write("DELETE request for {}".format(self.path).encode("utf-8"))
        else:
            self._send_error()
            self.wfile.write("Invalid URL".encode("utf-8"))

    def do_OPTIONS(self):
        self._send_headers()


def run(server_class=HTTPServer, handler_class=MyHandler, port=8081):
    logging.basicConfig(level=logging.INFO)
    server_address = ("", port)
    httpd = server_class(server_address, handler_class)
    logging.info("Starting httpd...\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    logging.info("Stopping httpd...\n")


if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
