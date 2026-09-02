FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

WORKDIR /app/backend
RUN npm install


WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app

EXPOSE 5050

CMD ["node", "backend/server.js"]