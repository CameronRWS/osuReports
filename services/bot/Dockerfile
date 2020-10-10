FROM ajmadsen/osureports:base

COPY --chown=node services/bot/package.json services/bot/
RUN yarn install --frozen-lockfile

COPY --chown=node:node services/bot services/bot
WORKDIR /usr/src/app/services/bot
CMD ["node", "./osuReportsDriver.js"]

VOLUME ["/data"]
ENV DATABASE /data/osuReports.db