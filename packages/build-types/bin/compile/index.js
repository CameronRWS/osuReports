#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs_1 = require("fs");
var path_1 = tslib_1.__importDefault(require("path"));
var typescript_1 = tslib_1.__importDefault(require("typescript"));
var glob_1 = require("glob");
var util_1 = require("util");
var argparse_1 = require("argparse");
var version = require("../../package.json").version;
var glob = util_1.promisify(glob_1.glob);
function copyAll(sources, base, dest) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var s, _e_1, createdDirs, sources_1, sources_1_1, source, absSrc, relDir, absDestDir, tmpDir, tmpDir2, e_1_1;
        var _a, e_1, _b;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 4]);
                    return [4 /*yield*/, fs_1.promises.stat(dest)];
                case 1:
                    s = _c.sent();
                    if (!s.isDirectory()) {
                        throw new Error(dest + " exists but is not a directory");
                    }
                    return [3 /*break*/, 4];
                case 2:
                    _e_1 = _c.sent();
                    return [4 /*yield*/, fs_1.promises.mkdir(dest, { recursive: true })];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    createdDirs = (_a = {}, _a[dest] = true, _a);
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 13, 14, 15]);
                    sources_1 = tslib_1.__values(sources), sources_1_1 = sources_1.next();
                    _c.label = 6;
                case 6:
                    if (!!sources_1_1.done) return [3 /*break*/, 12];
                    source = sources_1_1.value;
                    absSrc = path_1.default.join(base, source);
                    return [4 /*yield*/, fs_1.promises.stat(absSrc)];
                case 7:
                    if (!(_c.sent()).isFile())
                        return [3 /*break*/, 11];
                    relDir = path_1.default.dirname(source);
                    absDestDir = path_1.default.join(dest, relDir);
                    if (!!(absDestDir in createdDirs)) return [3 /*break*/, 9];
                    return [4 /*yield*/, fs_1.promises.mkdir(absDestDir, { recursive: true })];
                case 8:
                    _c.sent();
                    createdDirs[absDestDir] = true;
                    tmpDir = relDir, tmpDir2 = absDestDir;
                    while (path_1.default.dirname(tmpDir) !== tmpDir) {
                        tmpDir = path_1.default.dirname(tmpDir);
                        tmpDir2 = path_1.default.dirname(tmpDir2);
                        createdDirs[tmpDir2] = true;
                    }
                    _c.label = 9;
                case 9: return [4 /*yield*/, fs_1.promises.copyFile(absSrc, path_1.default.join(dest, source))];
                case 10:
                    _c.sent();
                    _c.label = 11;
                case 11:
                    sources_1_1 = sources_1.next();
                    return [3 /*break*/, 6];
                case 12: return [3 /*break*/, 15];
                case 13:
                    e_1_1 = _c.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 15];
                case 14:
                    try {
                        if (sources_1_1 && !sources_1_1.done && (_b = sources_1.return)) _b.call(sources_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
var NotFoundError = /** @class */ (function (_super) {
    tslib_1.__extends(NotFoundError, _super);
    function NotFoundError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NotFoundError;
}(Error));
function findRoot(basePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var testPath, nextBase;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.stat(basePath)];
                case 1:
                    if (!(_a.sent()).isDirectory()) {
                        basePath = path_1.default.dirname(basePath);
                    }
                    testPath = path_1.default.join(basePath, "package.json");
                    return [4 /*yield*/, fs_1.promises
                            .stat(testPath)
                            .then(function (s) { return s.isFile(); })
                            .catch(function (err) { return !(err.code === "ENOENT") && Promise.reject(err); })];
                case 2:
                    if (_a.sent()) {
                        return [2 /*return*/, basePath];
                    }
                    nextBase = path_1.default.dirname(basePath);
                    if (nextBase === basePath) {
                        throw new NotFoundError("Could not find package.json");
                    }
                    return [2 /*return*/, findRoot(path_1.default.dirname(basePath)).catch(function (err) {
                            if (err instanceof NotFoundError) {
                                throw new NotFoundError("Could not find package.json in any parent of " + basePath);
                            }
                            throw err;
                        })];
            }
        });
    });
}
function buildTypes(packageName, _a) {
    var _b = _a.workingDir, workingDir = _b === void 0 ? process.cwd() : _b, _c = _a.srcDir, srcDir = _c === void 0 ? "./src" : _c, _d = _a.libDir, libDir = _d === void 0 ? "./lib" : _d, _f = _a.abortOnExist, abortOnExist = _f === void 0 ? false : _f;
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var importPath, basePath, entry, _g, compilerOptions, program;
        var _this = this;
        return tslib_1.__generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    importPath = require.resolve(packageName);
                    return [4 /*yield*/, findRoot(importPath)];
                case 1:
                    basePath = _h.sent();
                    srcDir = path_1.default.resolve(workingDir, srcDir);
                    libDir = path_1.default.resolve(workingDir, libDir);
                    entry = path_1.default.join(srcDir, path_1.default.relative(basePath, importPath));
                    return [4 /*yield*/, fs_1.promises
                            .stat(srcDir)
                            .then(function () { return true; })
                            .catch(function () { return false; })];
                case 2:
                    if (_h.sent()) {
                        throw new Error(srcDir + " already exists, please remove it first if you intended to write here");
                    }
                    _g = abortOnExist;
                    if (!_g) return [3 /*break*/, 4];
                    return [4 /*yield*/, fs_1.promises
                            .access(libDir)
                            .then(function () { return true; })
                            .catch(function () { return false; })];
                case 3:
                    _g = (_h.sent());
                    _h.label = 4;
                case 4:
                    if (_g) {
                        console.info(libDir + " already exists... exiting.");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, glob(basePath + "/**/*")
                            .then(function (files) { return files.map(function (f) { return path_1.default.relative(basePath, f); }); })
                            .then(function (files) { return tslib_1.__awaiter(_this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
                            return [2 /*return*/, copyAll(files, basePath, srcDir)];
                        }); }); })];
                case 5:
                    _h.sent();
                    compilerOptions = {
                        allowJs: true,
                        checkJs: true,
                        emitDeclarationOnly: true,
                        declaration: true,
                        rootDir: srcDir,
                        baseUrl: srcDir,
                        moduleResolution: typescript_1.default.ModuleResolutionKind.NodeJs,
                        outDir: libDir
                    };
                    return [4 /*yield*/, fs_1.promises
                            .unlink(path_1.default.join(srcDir, "..", "tsconfig.tsbuildinfo"))
                            .catch(function () { return void 0; })];
                case 6:
                    _h.sent();
                    program = typescript_1.default.createProgram({
                        rootNames: [entry],
                        options: compilerOptions
                    });
                    program.emit();
                    return [4 /*yield*/, fs_1.promises.rmdir(srcDir, { recursive: true })];
                case 7:
                    _h.sent();
                    return [2 /*return*/];
            }
        });
    });
}
process.on("unhandledRejection", function (err) {
    console.error("" + err);
    process.exit(1);
});
var parser = new argparse_1.ArgumentParser({
    description: "Generate types for a javascript library"
});
parser.add_argument("-v", "--version", { action: "version", version: version });
parser.add_argument("-n", "--non-destructive", {
    help: "do nothing if entrypoint already exists",
    action: "store_true",
    default: false
});
parser.add_argument("-o", "--out-dir", {
    default: process.cwd(),
    help: "the directory we will generate sources in (must not have a `src` directory)"
});
parser.add_argument("library", {
    help: "the library to generate types for"
});
var args = parser.parse_args();
buildTypes(args.library, {
    workingDir: args.out_dir,
    abortOnExist: args.non_destructive
});
