const globalInstances = require("./src/globalInstances");
const playerObject = require("./src/playerObject");
const fs = require("fs");
const http = require("http");
const sessionStore = require("./src/sessionStore");
const db = require("./src/db");
const UserCache = require("./src/userCache");
const beatmapCache = require("./src/beatmapCache");

const { activeSessions, totalUsers, activePlays } = require("./src/metrics");
const { inspect } = require("util");

const msPerIteration = 45000;

if (!process.env.DEBUG) {
  initialize();
  http.createServer(require("./src/metrics").app).listen(9010);
} else {
  test();
}

async function test() {
  await setSessionsRecorded();
  globalInstances.playerObjects.push(new playerObject("PenZa", "@penz_"));
  await globalInstances.playerObjects[0].createFakeSession();
  globalInstances.logMessage("From test(): Ending session...");
  await globalInstances.playerObjects[0].sessionObject.endSession();
}

async function initialize() {
  await setSessionsRecorded();
  return db.all(
    "SELECT osuUsername, twitterUsername FROM playersTable",
    async (err, rows) => {
      if (err !== null) {
        console.log(
          "Could not read players from the database! Something is wrong."
        );
        return;
      }
      for (var i = 0; i < rows.length; i++) {
        globalInstances.playerObjects.push(
          new playerObject(rows[i].osuUsername, rows[i].twitterUsername)
        );
      }
      globalInstances.logMessage(
        `Tracking ${globalInstances.playerObjects.length} osu! nerds`
      );
      totalUsers.set(globalInstances.playerObjects.length);

      globalInstances.logMessage("Loading sessions...");
      await sessionStore.loadSessions();

      globalInstances.logMessage(
        "From initialize(): Starting to loop through players..."
      );
      mainLoop();
    }
  );
}

async function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

async function mainLoop() {
  let shutdownRequested = false;
  let canShutdown = true;

  const handler = () => {
    if (canShutdown) {
      globalInstances.logMessage("Shutting down...");
      process.exit(0);
    }
    globalInstances.logMessage("Shutdown requested...");
    shutdownRequested = true;
  };

  process.on("SIGINT", handler);
  process.on("SIGTERM", handler);

  const loopTime = msPerIteration / globalInstances.playerObjects.length;
  while (true) {
    for (const player of globalInstances.playerObjects) {
      const start = +new Date();
      canShutdown = false;
      await player.updateSessionObjectv3();
      const runTime = +new Date() - start;
      canShutdown = true;

      if (shutdownRequested) {
        globalInstances.logMessage("Shutting down...");
        process.exit(0);
      }

      const delay = loopTime - runTime;
      // globalInstances.logMessage(
      //   `Sleeping ${delay.toFixed(0)} ms before checking next player`
      // );
      await sleep(delay);
    }

    await updatePlayersList();
    await getSessionInfoForConsole();
  }
}

async function updatePlayersList() {
  let players = await db.getPlayers();
  //console.log("beginning: DB: " + players.length + ", Mem: " + globalInstances.playerObjects.length)

  const playersMap = Object.fromEntries(
    players.map(p => [p.twitterUsername, p])
  );
  const memorySet = new Set(
    globalInstances.playerObjects.map(p => p.twitterUsername)
  );

  const playersToAdd = Object.keys(playersMap).filter(p => !memorySet.has(p));
  const playersToRemove = new Set(
    [...memorySet].filter(p => !(p in playersMap))
  );

  if (playersToAdd.length) {
    globalInstances.logMessage(`Adding players ${inspect(playersToAdd)}`);
  }

  if (playersToRemove.size) {
    globalInstances.logMessage(
      `Removing players ${inspect([...playersToRemove])}`
    );
  }

  globalInstances.playerObjects = [
    ...globalInstances.playerObjects.filter(
      p => !playersToRemove.has(p.twitterUsername)
    ),
    ...playersToAdd.map(
      p =>
        new playerObject(
          playersMap[p].osuUsername,
          playersMap[p].twitterUsername
        )
    )
  ];
}

var numOfOutputs = 0;
async function getSessionInfoForConsole() {
  numOfOutputs++;
  if (numOfOutputs > 2000) {
    //notice the writeFile
    if (!process.env.NO_FILE_LOG) {
      fs.writeFile("./logs.txt", "CLEARED", err => {
        if (err) throw err;
      });
    }
    numOfOutputs = 0;
  }
  var countPlayerObjects = globalInstances.playerObjects.length;
  var countPlayObjects = 0;
  var countSessionObjects = 0;
  var currentTime = new Date();
  var output = "";
  output += "\nx-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x\n";
  output += `\nDate: ${currentTime.toLocaleString("en-US", {
    timeZone: "America/Chicago"
  })}`;
  for (const player of globalInstances.playerObjects) {
    if (!player.sessionObject) {
      continue;
    }
    countSessionObjects++;
    output += `\n             -- '${await UserCache.getOsuUser(
      player.osuUsername
    )}' --\n   Plays:\n`;
    var isPlays = false;
    var totalPlays = 0;
    for (const play of player.sessionObject.playObjects) {
      countPlayObjects++;
      totalPlays++;
      if (play.title !== null && play.rank !== "F") {
        output += `       ${play.title} [${play.version}] by: ${play.artist}\n\n`;
        isPlays = true;
      }
    }
    if (!isPlays) {
      output += "       No plays that will be tweeted...\n";
    }
    output += "       Total plays (including failed): " + totalPlays + "\n";
  }
  output += `\n   Count of player objects: ${countPlayerObjects}\n`;
  output += `   Count of session objects: ${countSessionObjects}\n`;
  output += `   Count of play objects: ${countPlayObjects}\n`;
  output += `   Beatmap cache hit ratio is: ${(
    beatmapCache.getHitRatio() * 100
  ).toFixed(2)}%`;
  output += "\nx-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x\n";
  globalInstances.logMessage(output);

  activeSessions.set(countSessionObjects);
  activePlays.set(countPlayObjects);
  totalUsers.set(countPlayerObjects);
}

async function setSessionsRecorded() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT sessionID FROM sessionsTable ORDER BY sessionID DESC LIMIT 1",
      (err, row) => {
        if (err !== null) reject(err);
        const lastSession = (row && row.sessionID) || 0;
        globalInstances.logMessage(lastSession + " entries in the db.");
        globalInstances.numberOfSessionsRecorded = lastSession + 1;
        resolve();
      }
    );
  });
}
