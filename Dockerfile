FROM node:20.10.0
WORKDIR /app
COPY . .

RUN ["npm","install"]

RUN ["npm","run","build:prod"]

CMD ["npm","run","start"]
