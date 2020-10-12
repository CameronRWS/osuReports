import { promises as fs } from "fs";
import path from "path";
import ts from "typescript";
import { glob as globOrig } from "glob";
import { promisify } from "util";
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

const importPath = require.resolve("node-osu");
const basePath = path.dirname(importPath);
const files = glob(`${basePath}/**/*`)
  .then(files => files.map(f => path.relative(basePath, f)))
  .then(async files =>
    copyAll(files, basePath, path.join(process.cwd(), "src"))
  );

const srcDir = path.join(__dirname, "..", "src");

const options: ts.CompilerOptions = {
  allowJs: true,
  checkJs: true,
  emitDeclarationOnly: true,
  declaration: true,
  rootDir: srcDir,
  baseUrl: srcDir,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  outDir: path.join(process.cwd(), "lib")
};

const entry = path.join(srcDir, "index.js");

files.then(async () => {
  await fs
    .unlink(path.join(srcDir, "..", "tsconfig.tsbuildinfo"))
    .catch(() => void 0);
  let program = ts.createProgram({
    rootNames: [entry],
    options
  });
  program.emit();
  await fs.rmdir(srcDir, { recursive: true });
});
