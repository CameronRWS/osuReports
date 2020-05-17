const express = require('express');
const axios = require('axios').default;
var playerObject = require('./playerObject');
var keys = require('./consumerKeys');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var globalInstances = require('./globalInstances');
var db = require('./db');

var session = require('express-session');

app.use(express.static('./static'));

app.use(bodyParser.urlencoded({ extended: false }));

var Twit = require('twit');
var T = new Twit({
  consumer_key: keys.consumer_key,
  consumer_secret: keys.consumer_secret,
  access_token: keys.access_token,
  access_token_secret: keys.access_token_secret,
});

passport.use(
  new Strategy(
    {
      consumerKey: keys.consumer_key,
      consumerSecret: keys.consumer_secret,
      callbackURL:
        process.env.CALLBACK_URL ||
        'https://osureports.ameo.design/twitter/return', // 'http://localhost:3000/twitter/return' //'https://osureports.ameo.design/twitter/return'
    },
    function (token, tokenSecret, profile, callback) {
      return callback(null, profile);
    }
  )
);

passport.serializeUser(function (user, callback) {
  callback(null, user);
});

passport.deserializeUser(function (obj, callback) {
  callback(null, obj);
});

app.use(session({ secret: 'whatever', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', './static/views');

function startServer() {
  app.get('/', (req, res) => {
    var numOfPlayers = 0,
      numOfPlays = 0,
      numOfSessions = 0;
    db.get('SELECT Count(*) FROM playersTable', (err, rows) => {
      numOfPlayers = rows['Count(*)'];
      db.get('SELECT Count(*) FROM playsTable', (err, rows) => {
        numOfPlays = rows['Count(*)'];
        db.get('SELECT Count(*) FROM sessionsTable', (err, rows) => {
          numOfSessions = rows['Count(*)'];
          res.render('index.ejs', {
            user: ' ',
            numOfPlayers: numOfPlayers,
            numOfPlays: numOfPlays,
            numOfSessions: numOfSessions,
          });
        });
      });
    });
  });

  app.get('/return', (req, res) => {
    updatePage(req, res);
  });

  app.get('/whitelist', (req, res) => {
    if (req.user.username == null) {
      res.render('privacy.ejs', { user: 'x' });
      return;
    }
    db.all('SELECT * FROM playersTable', (err, rows) => {
      res.render('whitelist.ejs', { user: req.user.username, rows: rows });
    });
  });

  app.get('/sessionslist', (req, res) => {
    console.log(req);
    console.log(res);
    if (req.user.username == null) {
      res.render('privacy.ejs', { user: 'x' });
      return;
    }
    db.all('SELECT * FROM sessionsTable', (err, rows) => {
      res.render('sessionslist.ejs', { user: req.user.username, rows: rows });
    });
  });

  app.get('/sessions', (req, res) => {
    console.log(req.user.username);
    db.all(
      "SELECT * FROM sessionsTable WHERE osuUsername = (SELECT osuUsername FROM  playersTable WHERE twitterUsername = '@" +
        req.user.username +
        "') ORDER BY sessionID DESC",
      (err, rows) => {
        res.render('sessions.ejs', { user: req.user.username, sessions: rows });
      }
    );
  });

  app.get('/stats', (req, res) => {
    console.log(req.user.username);
    db.all(
      "SELECT * FROM sessionsTable WHERE osuUsername = (SELECT osuUsername FROM  playersTable WHERE twitterUsername = '@" +
        req.user.username +
        "') ORDER BY sessionID ASC",
      (err, rows) => {
        res.render('stats.ejs', {
          user: req.user.username,
          sessionObjectsSQL: rows,
        });
      }
    );
  });

  app.get('/privacy', (req, res) => {
    res.render('privacy.ejs', { user: 'x' });
  });

  app.get('/twitter/login', passport.authenticate('twitter'));

  app.get(
    '/twitter/return',
    passport.authenticate('twitter', {
      failureRedirect: '/',
    }),
    function (req, res) {
      updatePage(req, res, '');
    }
  );

  app.post('/action_enable', (req, res) => {
    console.log(req.body.username + ' ' + req.body.twitterUsername);

    var canBeWhitelisted = true;
    var cap = '';

    var osuUserURL = 'https://osu.ppy.sh/users/' + req.body.username;
    axios
      .get(osuUserURL)
      .then(() => {
        //console.log("profile exists");
        for (var i = 0; i < globalInstances.playerObjects.length; i++) {
          if (
            globalInstances.playerObjects[i].twitterUsername ==
            req.body.twitterUsername
          ) {
            canBeWhitelisted = false;
            //console.log("Failed: " + req.body.username + "'s osu! Reports are already tweeted at " + req.body.twitterUsername);
          } else if (
            globalInstances.playerObjects[i].osuUsername == req.body.username
          ) {
            canBeWhitelisted = false;
            cap =
              'Activation failed: \nThe osu! username ' +
              req.body.username +
              ' is already enabled by the twitter user: ' +
              globalInstances.playerObjects[i].twitterUsername +
              '. If this is your old twitter account and you still have access, sign in with it and disable osu! Reports. If you do not recognize this twitter username or you no longer have access to the twitter account, DM @osureports and explain your issue.';
          }
        }
        if (canBeWhitelisted == true) {
          globalInstances.playerObjects.push(
            new playerObject(req.body.username, req.body.twitterUsername)
          );

          db.run(
            "INSERT INTO playersTable VALUES ('" +
              req.body.username +
              "', '" +
              req.body.twitterUsername +
              "')"
          );

          var tweet = {
            status:
              '.' +
              req.body.twitterUsername +
              ' has joined osu! Reports. osu! profile linked: https://osu.ppy.sh/users/' +
              req.body.username.replace(/ /g, '%20'),
          };
          T.post('statuses/update', tweet, function (err, data, response) {
            if (err) {
              console.log(err);
              cap = 'Activation successful!';
            } else {
              console.log(
                ' ---------------------------------------------------------------------------------A tweet was tweeted - whitelisted person'
              );
              cap =
                "Activation successful! - Check osu! Reports' latest tweet to ensure everything is setup properly.";
            }
          });
        }
        updatePage(req, res, cap);
      })
      .catch(() => {
        //console.log("profile does not exist.")
        canBeWhitelisted = false;
        cap =
          'Activation failed: \nThe osu! profile ' +
          req.body.username +
          ' does not exist.';
        updatePage(req, res, cap);
      });
  });

  //called when a user wants to disable osu! Reports
  app.post('/action_disable', (req, res) => {
    for (var i = 0; i < globalInstances.playerObjects.length; i++) {
      if (
        globalInstances.playerObjects[i].twitterUsername ==
        req.body.twitterUsername
      ) {
        //console.log("osu! Reports have been disable for: " + req.body.twitterUsername);
        cap =
          'Successfully disabled osu! Reports for: ' +
          globalInstances.playerObjects[i].osuUsername;
        globalInstances.playerObjects.splice(i, 1);
        db.run(
          "DELETE FROM playersTable WHERE twitterUsername = '" +
            req.body.twitterUsername +
            "'"
        );
      }
    }
    updatePage(req, res, cap);
  });

  app.listen(port, () => console.log(`app listening on port ${port}!`));
}

function updatePage(req, res, cap) {
  //console.log(req.user.username);

  var statusString = '';
  var ejspage = 'disable.ejs';
  var numberOfSessions = '0';
  var isUsernameWhitelisted = false;
  for (var i = 0; i < globalInstances.playerObjects.length; i++) {
    if (
      '@' + req.user.username ==
      globalInstances.playerObjects[i].twitterUsername
    ) {
      statusString = 'osu! Reports are enabled';
      isUsernameWhitelisted = true;
      cap =
        'Assigned osu! username: ' +
        globalInstances.playerObjects[i].osuUsername;
      db.all(
        "SELECT Count(*) FROM sessionsTable WHERE osuUsername = (SELECT osuUsername FROM  playersTable WHERE twitterUsername = '@" +
          req.user.username +
          "') ORDER BY sessionID ASC",
        (err, rows) => {
          numberOfSessions = rows[0]['Count(*)'];
          //console.log(numberOfSessions);
          res.render(ejspage, {
            cap: cap,
            user: req.user.username,
            statusString: statusString,
            numberOfSessions: numberOfSessions,
          });
        }
      );
      break;
    }
  }

  if (!isUsernameWhitelisted) {
    if (statusString == '') {
      statusString = 'osu! Reports are currently disabled';
      ejspage = 'enable.ejs';
    }

    //console.log(statusString);
    //console.log("passed: " + numberOfSessions);
    res.render(ejspage, {
      cap: cap,
      user: req.user.username,
      statusString: statusString,
      numberOfSessions: numberOfSessions,
    });
  }
}

module.exports = startServer;
