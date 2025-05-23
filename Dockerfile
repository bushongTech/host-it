FROM node:23-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install nptdms pandas

EXPOSE 8080
CMD ["node", "server.js"]