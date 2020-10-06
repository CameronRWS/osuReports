const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("osuReports.db");
const fs = require("fs");
const { promisify } = require("util");

const schema = fs
  .readFileSync("schema.sql")
  .toString("utf-8")
  .split(/;\s*/)
  .map((s) => s.trim())
  .filter((s) => s !== "");

for (const command of schema) {
  db.serialize(() => {
    promisify(db.run)
      .bind(db)(command)
      .catch((err) => console.log(err));
  });
}
