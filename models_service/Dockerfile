FROM python:3.14-alpine

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 7777

CMD ["python", "-m", "models_server"]