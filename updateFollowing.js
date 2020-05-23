var osuApi = require('./src/osuApi');
var T = require('./src/twitterInstance');
const db = require('./src/db');
var globalInstances = require('./src/globalInstances');

updateFollowingList();

async function updateFollowingList() {
  var friendsList = await getFriends('osureports');
  var playersList = await getWhitelistedUsers();

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
  console.log(peopleToUnfollow);
  console.log(peopleToFollow);
  // remove comment once you get write access.
  // await followTwitterUsers(peopleToFollow);
  // await unfollowTwitterUsers(peopleToFollow);
}

async function unfollowTwitterUsers(peopleToUnfollow) {
  return new Promise(async (resolve, reject) => {
    for (var person of peopleToUnfollow) {
      await T.post('friendships/destroy', {
        screen_name: person,
      });
    }
    resolve();
  });
}

async function followTwitterUsers(peopleToFollow) {
  for (var person of peopleToFollow) {
    await T.post('friendships/create', {
      screen_name: person,
    });
  }
}

async function getWhitelistedUsers() {
  return new Promise(async (resolve, reject) => {
    var players = [];
    await db.all(
      'SELECT osuUsername, twitterUsername FROM playersTable',
      async (err, rows) => {
        if (err !== null) reject(err);
        for (var i = 0; i < rows.length; i++) {
          players.push(rows[i].twitterUsername.replace('@', ''));
        }
        resolve(players);
      }
    );
  });
}

async function getFriends(username) {
  let oldCursor = "doesn't matter";
  let nextCursor = "doesn't matter first time";
  let friends = [];
  return new Promise(async (resolve, reject) => {
    do {
      const { data } = await T.get('friends/list', {
        screen_name: username,
        cursor: nextCursor,
        count: 200,
      });
      oldCursor = nextCursor;
      nextCursor = data.next_cursor_str;
      for (let user of data.users) {
        friends.push(user.screen_name);
      }
    } while (nextCursor != '0' && oldCursor != nextCursor);
    resolve(friends);
  });
}
