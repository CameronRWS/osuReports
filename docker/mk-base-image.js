const { promises: fsPromises } = require("fs");
const path = require("path").posix;
const { spawn } = require("child_process");

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

Array.prototype.any = function(predicate) {
  for (let i = 0; i < this.length; ++i) {
    if (predicate(this[i], i, this)) {
      return true;
    }
  }
  return false;
};

/**
 * Finds all files matching the given fileName under the desired path
 * @param {string} base
 * @param {string} fileName
 * @param {Object} options
 * @param {RegExp | RegExp[]} [options.exclude=[]]
 * @returns {Promise<string[]>}
 */
async function recursiveFind(base, fileName, options = {}) {
  if (!options.exclude || !Array.isArray(options.exclude)) {
    options.exclude = options.exclude ? [options.exclude] : [];
  }
  const exclude = options.exclude;

  const listing = await fsPromises.readdir(base, { withFileTypes: true });
  const matched = listing
    .filter(ent => ent.isFile && ent.name === fileName)
    .map(ent => path.join(base, ent.name))
    .filter(relPath => !exclude.any(regex => regex.test(relPath)));
  return matched.concat(
    (
      await Promise.all(
        listing
          .filter(ent => ent.isDirectory())
          .map(async ent =>
            recursiveFind(path.join(base, ent.name), fileName, options)
          )
      )
    ).flatMap(el => el)
  );
}

recursiveFind("packages", "package.json", {
  exclude: [/node_modules/]
}).then(async paths => {
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
});
