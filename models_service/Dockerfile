FROM python:3.14.6-slim-bookworm

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

#Instalacion necesaria para lightbm
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN mkdir model_files

EXPOSE 7777

CMD ["python", "-m", "models_server"]