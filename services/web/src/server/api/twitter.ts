import express from "express";
import passport from "passport";
import { Strategy } from "passport-twitter";

import { Keys } from "@osureport/common";

export interface MinimalUser {
  id: string;
  profileImage: string;
  username: string;
}

passport.use(
  new Strategy(
    {
      consumerKey: Keys.consumer_key || "_this_key_is_undefined",
      consumerSecret: Keys.consumer_secret || "_this_key_is_undefined",
      callbackURL:
        process.env.CALLBACK_URL || "http://localhost:3000/twitter/return",
      requestTokenURL:
        "https://api.twitter.com/oauth/request_token?x_auth_access_type=read"
    },
    function(token, tokenSecret, profile, callback) {
      const {
        id,
        username,
        _json: { profile_image_url_https: profileImage }
      } = profile;
      const biggerProfileImage = profileImage.replace(
        /_normal\.(\w+)$/,
        "_bigger.$1"
      );
      return callback(null, { id, username, profileImage: biggerProfileImage });
    }
  )
);

passport.serializeUser(function(user, callback) {
  callback(null, user);
});

passport.deserializeUser(function(obj: MinimalUser, callback) {
  callback(null, obj);
});

const router = express.Router();

router.get("/login", passport.authenticate("twitter"));
router.get(
  "/return",
  passport.authenticate("twitter", {
    failureFlash: "Login failed",
    failureRedirect: "/"
  }),
  (req, res) => {
    res.redirect("/player");
  }
);

export { router };
