FROM node:20-alpine

COPY package.json .
COPY package-lock.json .
COPY . .

RUN npm install --omit=dev
RUN npm i -D @swc/cli @swc/core
RUN npm run build

# Set environment variable explicitly
ENV NODE_ENV=prod

EXPOSE 80

CMD ["npm", "run", "start:prod"]
