const { isArray, isString, all } = require("lodash/fp");

/** @type {import("express").RequestHandler} */
async function requireAuth(req, res, next) {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    console.log(req.headers);
    if (req.xhr) return res.status(401).json("unauthenticated");
    return res.status(302).redirect("/");
  }
  req.user = req.session.passport.user;
  next();
}

/** @type {import("express").RequestHandler} */
async function flash(req, res, next) {
  let flashes = JSON.parse((req.cookies || {})["flash"] || "[]");
  const valid = isArray(flashes) && all(el => isString(el), flashes);
  if (!valid) flashes = [];

  req.flashes = [...flashes];
  res.flashes = flashes;

  res.flash = msg => {
    res.flashes.push(msg);
    res.cookie("flash", JSON.stringify(res.flashes));
    return res;
  };

  res.clearFlashes = () => {
    if (req.cookies.flash) res.clearCookie("flash");
    res.flashes = [];
    return res;
  };

  next();
}

module.exports = {
  requireAuth,
  flash
};
