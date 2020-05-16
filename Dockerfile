FROM node:lts-slim

WORKDIR /app
COPY package*.json .
RUN npm ci

COPY ./ ./
CMD ["node", "./osuReportsDriver.js"]

VOLUME ["/data"]
ENV DATABASE /data/osuReports.db
