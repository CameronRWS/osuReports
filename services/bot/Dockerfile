FROM node:lts-slim

WORKDIR /app
RUN chown node:node /app
USER node

COPY --chown=node yarn.lock package.json ./
COPY --chown=node packages/common/package.json ./packages/common/
COPY --chown=node packages/resources/package.json ./packages/resources/
COPY --chown=node services/bot/package.json ./services/bot/
RUN yarn install --frozen-lockfile

COPY --chown=node:node ./ ./
RUN mv ./packages/common/lib/consumerKeys.docker.js ./packages/common/lib/consumerKeys.js
CMD ["node", "./osuReportsDriver.js"]

VOLUME ["/data"]
ENV DATABASE /data/osuReports.db