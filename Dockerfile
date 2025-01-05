FROM node:20-alpine

COPY package.json .
COPY package-lock.json .

RUN npm install --omit=dev
RUN npm i -D @swc/cli @swc/core

COPY . .
RUN npm run build

EXPOSE 80

CMD ["npm", "run", "start"]