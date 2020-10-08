const { promises: fsPromises } = require("fs");
const path = require("path");

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

module.exports = recursiveFind;
