FROM python:3.8-slim
WORKDIR /app/searchEngine
COPY . .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
CMD ["python", "FactBankIRServer.py", "8080"]