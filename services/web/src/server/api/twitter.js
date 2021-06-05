const express = require("express");
const passport = require("passport");
const { Strategy } = require("passport-twitter");

const { Keys } = require("@osureport/common");

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
      return callback(null, profile);
    }
  )
);

passport.serializeUser(function(user, callback) {
  const {
    id,
    username,
    _json: { profile_image_url_https: profileImage }
  } = user;
  const biggerProfileImage = profileImage.replace(
    /_normal\.(\w+)$/,
    "_bigger.$1"
  );
  callback(null, { id, username, profileImage: biggerProfileImage });
});

passport.deserializeUser(function(obj, callback) {
  callback(null, obj);
});

const app = express();

app.use(passport.initialize());
app.use(passport.session());

app.get("/login", passport.authenticate("twitter"));
app.get(
  "/return",
  passport.authenticate("twitter", {
    failureFlash: "Login failed",
    failureRedirect: "/",
    assignProperty: "user"
  }),
  (req, res) => {
    res.redirect("/player");
  }
);

module.exports = {
  path: "/twitter",
  handler: app
};
