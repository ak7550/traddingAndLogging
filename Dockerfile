FROM node:20-alpine

WORKDIR /ak-trading-and-logging

COPY package.json .
COPY package-lock.json .
COPY . .

RUN npm i -D @swc/cli @swc/core
RUN npm install
RUN npm run build

EXPOSE 80

CMD ["npm", "run", "start:prod"]
