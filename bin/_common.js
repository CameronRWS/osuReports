const { spawn } = require("child_process");

let execProcess = "yarn";
let execArgs = [];

if (process.env.npm_execpath && process.env.npm_node_execpath) {
  execProcess = process.env.npm_node_execpath;
  execArgs.push(process.env.npm_execpath);
}

/**
 *
 * @param {string[]} script
 * @param {string=} cwd
 */
async function yarnScript(script, cwd) {
  const proc = spawn(execProcess, [...execArgs, "run", ...script], {
    cwd,
    stdio: "inherit",
    shell: true
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

module.exports = {
  yarnScript
};
