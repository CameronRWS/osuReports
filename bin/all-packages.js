const { promisify } = require("util");
const glob = promisify(require("glob").glob);
const { spawn } = require("child_process");
const path = require("path");

let [script] = [...process.argv.slice(2), "build"];
let execProcess = "yarn";
let execArgs = ["run", script];

if (process.env.npm_execpath && process.env.npm_node_execpath) {
  execProcess = process.env.npm_node_execpath;
  execArgs.splice(0, 0, process.env.npm_execpath);
}

glob("./packages/**/package.json", { ignore: ["./**/node_modules/**"] }).then(
  async projects =>
    Promise.all(
      projects.map(async project => {
        const packageJson = require(path.resolve(project));
        if ("scripts" in packageJson && script in packageJson["scripts"]) {
          console.log(`Running "${script}" in ${path.dirname(project)}`);
          const proc = spawn(execProcess, execArgs, {
            cwd: path.dirname(project),
            stdio: "inherit"
          });
          return new Promise((resolve, reject) => {
            proc
              .once("error", err => reject(`spawn error: ${err}`))
              .on("exit", (code, signal) => {
                if (signal !== null) reject(`signal ${signal}`);
                if (code !== 0) reject(`non-zero exit code ${code}`);
                resolve(void 0);
              });
          });
        }
        return Promise.resolve(void 0);
      })
    ).catch(err => {
      console.error("Error building all", err);
      process.exit(1);
    })
);
