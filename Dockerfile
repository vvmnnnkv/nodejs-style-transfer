FROM node:10

ENV PORT 3000
EXPOSE $PORT

WORKDIR /app
COPY package*.json ./

RUN npm install
COPY . .

CMD [ "npm", "start" ]