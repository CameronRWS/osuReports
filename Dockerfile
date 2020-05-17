FROM node:lts-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY ./ ./
RUN mv ./src/consumerKeys.docker.js ./src/consumerKeys.js
RUN chown -R node:node ./
CMD ["node", "./osuReportsDriver.js"]

VOLUME ["/data"]
ENV DATABASE /data/osuReports.db
USER node