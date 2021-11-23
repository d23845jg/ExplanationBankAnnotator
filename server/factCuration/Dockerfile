FROM python:3.8-slim
WORKDIR /app/factCuration
COPY . .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
CMD ["python", "FactCuration.py", "8081"]