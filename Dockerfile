FROM node:12.15-alpine

WORKDIR /usr/src/app

COPY package*.json  ./ 
RUN npm install --frozen-lockfile
COPY . .

EXPOSE 3000
ENTRYPOINT [ "npm" ]


