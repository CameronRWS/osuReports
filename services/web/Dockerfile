FROM ajmadsen/osureports:base

COPY --chown=node services/web/package.json services/web/
RUN yarn install --frozen-lockfile

COPY --chown=node:node services/web services/web
WORKDIR /usr/src/app/services/web
RUN yarn build
CMD ["yarn", "start"]

EXPOSE 3000
VOLUME ["/data"]
ENV DATABASE /data/osuReports.db