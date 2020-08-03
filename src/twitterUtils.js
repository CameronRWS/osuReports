var osuApi = require("./osuApi");
var T = require("./twitterInstance");
const db = require("./db");
var globalInstances = require("./globalInstances");
const {
  startCase
} = require("lodash");



class twitterUtils {
  getTwitterInstance() {
    return T;
  }

  async isTwitterUserActive(user) {
    return new Promise(async (resolve, reject) => {
      await T.get("users/lookup", {
          screen_name: user
        })
        .then(data => {
          // globalInstances.logMessage("data");
          // globalInstances.logMessage(data);
          resolve(true);
        })
        .catch(err => {
          // globalInstances.logMessage("err");
          if (err.message === "No user matches for specified terms.") {
            resolve(false);
          } else {
            //may have reached the limit to amount of requests in the future (300 per 15 min)
            resolve(true);
          }
        });
    });
  }
  async updateFollowingList() {
    globalInstances.logMessage("updating following list");
    var friendsList = await this.getFriends("osuReports");
    var playersList = await this.getWhitelistedUsers();

    // var friendsList = ["penz_"];
    // var playersList = ["penz_", "SoaRPenZa"];
    var peopleToUnfollow = [];
    var peopleToFollow = [];
    for (var friend of friendsList) {
      //if this friend does not appear in the players list, then unfollow them
      if (!playersList.includes(friend)) {
        peopleToUnfollow.push(friend);
      }
    }
    for (var player of playersList) {
      //if this player does not appear in the following list, then follow them
      if (!friendsList.includes(player)) {
        peopleToFollow.push(player);
      }
    }
    // remove comment once you get write access.
    // globalInstances.logMessage(peopleToFollow);
    // globalInstances.logMessage("-___________-__________-__________-")
    // globalInstances.logMessage(peopleToUnfollow);
    await this.followTwitterUsers(peopleToFollow);
    await this.unfollowTwitterUsers(peopleToUnfollow);
  }

  async unfollowTwitterUsers(peopleToUnfollow) {
    return new Promise(async (resolve, reject) => {
      for (var person of peopleToUnfollow) {
        globalInstances.logMessage("attempting to unfollow: @" + person)
        try {
          await T.post("friendships/destroy", {
            screen_name: person
          });
        } catch (err) {
          globalInstances.logMessage("---- failed to unfollow: @" + person + " because err: " + err.message)
        }
      }
      resolve();
    });
  }

  async followTwitterUsers(peopleToFollow) {
    for (var person of peopleToFollow) {
      globalInstances.logMessage("attempting to follow: @" + person)
      try {
        await T.post("friendships/create", {
          screen_name: person
        });
      } catch (err) {
        globalInstances.logMessage("---- failed to follow: @" + person + " because err: " + err.message)
        if (err.message.includes("Cannot find specified user.")) {
          await db.deletePlayer("@" + person);
          globalInstances.logMessage("deleted user from whitelist")
        } else if (err.message.includes("You are unable to follow more people at this time.")) {
          return;
        }
      }
    }
  }

  async getWhitelistedUsers() {
    return new Promise(async (resolve, reject) => {
      var players = [];
      await db.all(
        "SELECT osuUsername, twitterUsername FROM playersTable",
        async (err, rows) => {
          if (err !== null) reject(err);
          for (var i = 0; i < rows.length; i++) {
            players.push(rows[i].twitterUsername.replace("@", ""));
          }
          resolve(players);
        }
      );
    });
  }

  async getFriends(username) {
    let oldCursor = "doesn't matter";
    let nextCursor = "doesn't matter first time";
    let friends = [];
    return new Promise(async (resolve, reject) => {
      do {
        const {
          data
        } = await T.get("friends/list", {
          screen_name: username,
          cursor: nextCursor,
          count: 200
        });
        oldCursor = nextCursor;
        nextCursor = data.next_cursor_str;
        for (let user of data.users) {
          friends.push(user.screen_name);
        }
      } while (nextCursor != "0" && oldCursor != nextCursor);
      resolve(friends);
    });
  }

  async getUserId(user) {
    return T.get("users/show", {
        screen_name: user
      })
      .then(async data => {
        let id = data.data.id_str;
        return id;
      })
      .catch(err => {
        globalInstances.logMessage(err);
        return null;
      });
  }

  async sendDirectMessage(to, message) {
    let userId = await this.getUserId(to);
    const msgObj = {
      event: {
        type: "message_create",
        message_create: {
          target: {
            recipient_id: userId
          },
          message_data: {
            text: message
          }
        }
      }
    };
    let sent = null;
    await T.post("direct_messages/events/new", msgObj)
      .then(async data => {
        sent = true;
      })
      .catch(err => {
        sent = false;
      });
    return sent;
  }

  async sendTweet(message) {
    const tweet = {
      status: message,
      media_ids: ""
    };
    T.post("statuses/update", tweet)
      .then(async data => {
        globalInstances.logMessage("sent");
      })
      .catch(err => {
        globalInstances.logMessage("error" + err);
      });
  }

  async checkIfShouldRetweet(eventMsg) {
    if (eventMsg.entities.urls.length === 1 && eventMsg.entities.urls[0].display_url.includes("osu.report")) {
      this.retweet(eventMsg.id_str)
    } else {
      globalInstances.logMessage("not retweeted")
    }
  }

  async retweet(tweetId) {
    T.post('statuses/retweet/:id', {
      id: tweetId
    }, function (err, data, response) {
      globalInstances.logMessage("retweeted tweet: " + tweetId)
    })
  }
}

module.exports = new twitterUtils();