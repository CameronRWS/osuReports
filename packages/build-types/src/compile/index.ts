#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";
import ts from "typescript";
import { glob as globOrig } from "glob";
import { promisify } from "util";
import { ArgumentParser } from "argparse";
const { version } = require("../../package.json");
const glob = promisify(globOrig);

async function copyAll(sources: string[], base: string, dest: string) {
  try {
    const s = await fs.stat(dest);
    if (!s.isDirectory()) {
      throw new Error(`${dest} exists but is not a directory`);
    }
  } catch (_e) {
    await fs.mkdir(dest, { recursive: true });
  }

  const createdDirs = { [dest]: true };
  for (const source of sources) {
    const absSrc = path.join(base, source);
    if (!(await fs.stat(absSrc)).isFile()) continue;

    const relDir = path.dirname(source);
    const absDestDir = path.join(dest, relDir);
    if (!(absDestDir in createdDirs)) {
      await fs.mkdir(absDestDir, { recursive: true });
      createdDirs[absDestDir] = true;
      let tmpDir = relDir,
        tmpDir2 = absDestDir;
      while (path.dirname(tmpDir) !== tmpDir) {
        tmpDir = path.dirname(tmpDir);
        tmpDir2 = path.dirname(tmpDir2);
        createdDirs[tmpDir2] = true;
      }
    }
    await fs.copyFile(absSrc, path.join(dest, source));
  }
}

class NotFoundError extends Error {}

async function findRoot(basePath: string): Promise<string> {
  if (!(await fs.stat(basePath)).isDirectory()) {
    basePath = path.dirname(basePath);
  }

  const testPath = path.join(basePath, "package.json");
  if (
    await fs
      .stat(testPath)
      .then(s => s.isFile())
      .catch(err => !(err.code === "ENOENT") && Promise.reject(err))
  ) {
    return basePath;
  }

  const nextBase = path.dirname(basePath);
  if (nextBase === basePath) {
    throw new NotFoundError(`Could not find package.json`);
  }
  return findRoot(path.dirname(basePath)).catch(err => {
    if (err instanceof NotFoundError) {
      throw new NotFoundError(
        `Could not find package.json in any parent of ${basePath}`
      );
    }
    throw err;
  });
}

async function buildTypes(
  packageName: string,
  {
    workingDir = process.cwd(),
    srcDir = "./src",
    libDir = "./lib",
    abortOnExist = false
  }
): Promise<void> {
  const importPath = require.resolve(packageName);
  const basePath = await findRoot(importPath);

  srcDir = path.resolve(workingDir, srcDir);
  libDir = path.resolve(workingDir, libDir);
  const entry = path.join(srcDir, path.relative(basePath, importPath));

  if (
    await fs
      .stat(srcDir)
      .then(() => true)
      .catch(() => false)
  ) {
    throw new Error(
      `${srcDir} already exists, please remove it first if you intended to write here`
    );
  }

  if (
    abortOnExist &&
    (await fs
      .access(libDir)
      .then(() => true)
      .catch(() => false))
  ) {
    console.info(`${libDir} already exists... exiting.`);
    return;
  }

  await glob(`${basePath}/**/*`)
    .then(files => files.map(f => path.relative(basePath, f)))
    .then(async files => copyAll(files, basePath, srcDir));

  const compilerOptions: ts.CompilerOptions = {
    allowJs: true,
    checkJs: true,
    emitDeclarationOnly: true,
    declaration: true,
    rootDir: srcDir,
    baseUrl: srcDir,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    outDir: libDir
  };

  await fs
    .unlink(path.join(srcDir, "..", "tsconfig.tsbuildinfo"))
    .catch(() => void 0);
  const program = ts.createProgram({
    rootNames: [entry],
    options: compilerOptions
  });
  program.emit();
  await fs.rmdir(srcDir, { recursive: true });
}

process.on("unhandledRejection", err => {
  console.error(`${err}`);
  process.exit(1);
});

const parser = new ArgumentParser({
  description: "Generate types for a javascript library"
});

parser.add_argument("-v", "--version", { action: "version", version });
parser.add_argument("-n", "--non-destructive", {
  help: "do nothing if entrypoint already exists",
  action: "store_true",
  default: false
});
parser.add_argument("-o", "--out-dir", {
  default: process.cwd(),
  help:
    "the directory we will generate sources in (must not have a `src` directory)"
});
parser.add_argument("library", {
  help: "the library to generate types for"
});

const args = parser.parse_args();
buildTypes(args.library, {
  workingDir: args.out_dir,
  abortOnExist: args.non_destructive
});
