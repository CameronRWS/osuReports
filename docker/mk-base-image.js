const { promises: fsPromises } = require("fs");
const path = require("path").posix;
const { promisify } = require("util");
const { spawn } = require("child_process");
const glob = promisify(require("glob").glob);


const REPLACE_PATTERN = new RegExp(`(# copy package.json)`);
const DOCKERFILE_TEMPLATE = `\
FROM node:lts-slim as builder
WORKDIR /usr/src/app

# copy package.json
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
`;


glob("packages/**/@(bin|package.json)", { ignore: ["**/node_modules/**"] }).then(
  async paths => {
    const copyLines = paths.map(p => `COPY ${p} ${p}`).join("\n");
    const contents = DOCKERFILE_TEMPLATE.replace(
      REPLACE_PATTERN,
      `$1\n${copyLines}`
    );
    const [fileName] = [...process.argv.slice(2), "Dockerfile"];
    await fsPromises.writeFile(fileName, contents);

    if (process.env.GIT_INDEX_FILE) {
      // we're running in a commit hook
      const proc = spawn("git", ["add", fileName], {
        env: process.env,
        cwd: path.dirname(__dirname)
      });
      return new Promise((resolve, reject) => {
        proc
          .on("error", err => reject(err))
          .on("exit", (code, signal) => {
            if (signal !== null) reject(`signal ${signal}`);
            if (code !== 0) reject(`code ${code}`);
            resolve(code);
          });
      })
        .catch(err => {
          console.error(`Process exited abnormally: ${err}`);
          process.exit(1);
        })
        .then(() => {
          process.exit(0);
        });
    }
  }
);;
