#!/usr/bin/env node

const { promisify } = require("util");
const glob = promisify(require("glob").glob);
const { spawn } = require("child_process");
const path = require("path");
const { ArgumentParser, ZERO_OR_MORE } = require("argparse");
const { yarnScript } = require("./_common");

let execProcess = "yarn";
let execArgs = [];

if (process.env.npm_execpath && process.env.npm_node_execpath) {
  execProcess = process.env.npm_node_execpath;
  execArgs.push(process.env.npm_execpath);
}

async function runScript(script, { prefix, ignore }) {
  glob(`${prefix}/**/package.json`, { ignore }).then(async projects =>
    Promise.all(
      projects.map(async project => {
        const packageJson = require(path.resolve(project));
        if ("scripts" in packageJson && script in packageJson["scripts"]) {
          console.log(`Running "${script}" in ${path.dirname(project)}`);
          return yarnScript(script, path.dirname(project));
        }
        return Promise.resolve(void 0);
      })
    ).catch(err => {
      console.error("Error building all", err);
      process.exit(1);
    })
  );
}

const parser = new ArgumentParser({
  description: "Run an npm script in all sub-projects that have it"
});

parser.add_argument("-p", "--prefix", { default: "./packages" });
parser.add_argument("-x", "--exclude", {
  default: ["./**/node_modules/**"],
  action: "append"
});
parser.add_argument("script", { default: ["build"], nargs: ZERO_OR_MORE });

const args = parser.parse_args();
runScript(args.script, { prefix: args.prefix, ignore: args.exclude });
