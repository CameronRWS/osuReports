FROM node:lts-slim

WORKDIR /app
RUN chown node:node /app
USER node

COPY package*.json ./
RUN npm ci

COPY --chown=node:node ./ ./
RUN mv ./src/consumerKeys.docker.js ./src/consumerKeys.js
RUN npm run build
CMD ["npm", "run", "start"]

EXPOSE 3000
VOLUME ["/data"]
ENV DATABASE /data/osuReports.db