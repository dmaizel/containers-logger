FROM node:latest

#LABEL "com.example.logger.label"="testing-logger"

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 8887

CMD ["npm", "start"]
