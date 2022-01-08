FROM python:3.8-slim
WORKDIR /app/factCuration
COPY . /app/factCuration
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
EXPOSE 8081
CMD ["python", "FactCuration.py", "8081"]