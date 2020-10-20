const { glob: globOrig } = require("glob");
const { promisify } = require("util");
const path = require("path");
const glob = promisify(globOrig);
const { yarnScript } = require("./_common");

async function callPreCommit(workspaces) {
  for (const workspace of workspaces) {
    const pjson = require(workspace);
    if (!("pre-commit" in pjson)) continue;

    const dirname = path.dirname(workspace);

    let preCommit = pjson["pre-commit"];
    if (!Array.isArray(preCommit)) preCommit = [preCommit];

    for (const scriptName of preCommit) {
      await yarnScript([scriptName], dirname);
    }
  }
}

const workspace = require(path.resolve(__dirname, "..", "package.json"));
Promise.all(workspace.workspaces.map(w => glob(`${w}/package.json`)))
  .then(ws =>
    ws
      .flat()
      .map(w => path.resolve(w))
      .filter(w => !/node_modules/.test(w))
  )
  .then(callPreCommit);
