const db = require("@osureport/common/lib/db");
const osuApi = require("@osureport/common/lib/osuApi");
const globalInstances = require("../src/globalInstances");
const { promisify } = require("util");

updateSessions();

async function convertOsuUser(osuUsernameOrId, requestedForm) {
  return osuApi
    .getUser({ u: osuUsernameOrId })
    .then(user => (requestedForm === "id" ? user.id : user.name))
    .catch(err => {
      globalInstances.logMessage("Failed to fetch user information", err);
      return null;
    });
}

async function updateSessions() {
  const usernames = await promisify(db.all).call(
    db,
    "select distinct osuUsername from sessionsTable"
  );
  let nameMap = {};
  for (const { osuUsername } of usernames) {
    console.log("Fetching info on", osuUsername);
    let id;
    try {
      id = await convertOsuUser(osuUsername, "id");
    } catch (e) {
      console.error("failed", e.stack);
    }
    nameMap[osuUsername] = id;
  }

  const run = promisify(db.run).bind(db);
  await run('attach database ":memory:" as test');
  await run("create table test.userLookup (username text, userId text)");
  for (const username in nameMap) {
    const userId = nameMap[username];
    await run("insert into test.userLookup values(?, ?)", username, userId);
  }

  await run(
    "update or ignore sessionsTable as a set osuUsername = (select b.userId from test.userLookup as b where b.username = a.osuUsername)"
  );
}

async function startOb() {
  var players = await getUsers();
  for (var player of players) {
    var osuUserId = await convertOsuUser(player, "id");
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
