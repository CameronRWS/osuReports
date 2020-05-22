const db = require("./src/db");
var UserCache = require("./src/userCache");

start();

async function start() {
  var players = await getUsers();
  for (var player of players) {
    var osuUserId = await UserCache.convertOsuUser(player, "id");
    console.log(osuUserId + " " + player);
    await updateDB(osuUserId, player);
  }
}

async function getUsers() {
  return new Promise(async (resolve, reject) => {
    var players = [];
    await db.all("SELECT osuUsername FROM playersTable", async (err, rows) => {
      for (var i = 0; i < rows.length; i++) {
        players.push(rows[i].osuUsername);
      }
      resolve(players);
    });
  });
}

async function updateDB(osuUserId, player) {
  var cmd =
    "UPDATE playersTable SET osuUsername = '" +
    osuUserId +
    "' WHERE osuUsername LIKE '" +
    player +
    "'";
  console.log(cmd);
  db.run(cmd);
}
