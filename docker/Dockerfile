FROM node:lts-slim as builder
WORKDIR /usr/src/app

# copy package.json
COPY packages/common/package.json packages/common/package.json
COPY packages/resources/package.json packages/resources/package.json
COPY packages/types_node_osu/bin packages/types_node_osu/bin
COPY packages/types_node_osu/package.json packages/types_node_osu/package.json
COPY yarn.lock package.json ./
RUN yarn install --frozen-lockfile

COPY tsconfig.json ./
COPY ./packages ./packages
RUN mv ./packages/common/src/consumerKeys.docker.ts ./packages/common/src/consumerKeys.ts
RUN yarn workspaces run build

FROM node:lts-slim
WORKDIR /usr/src/app
RUN chown node .

COPY --from=builder --chown=node /usr/src/app/ ./
USER node
