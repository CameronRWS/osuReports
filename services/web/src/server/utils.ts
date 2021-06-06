import { isArray, isString, all } from "lodash/fp";
import { RequestHandler } from "express";

export const requireAuth: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    if (req.xhr)
      return res
        .status(401)
        .json("unauthenticated")
        .end();
    return res.status(302).redirect("/");
  }
  next();
};

export const flash: RequestHandler = async (req, res, next) => {
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
};
