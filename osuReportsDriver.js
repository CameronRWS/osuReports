var globalInstances = require('./src/globalInstances');
var playerObject = require('./src/playerObject');
var startServer = require('./src/server');
var fs = require('fs');
const sessionStore = require('./src/sessionStore');
const db = require('./src/db');
var UserCache = require('./src/userCache');

const msPerIteration = 30000;

if (!process.env.DEBUG) {
  startServer();
  initialize();
} else {
  test();
}

async function test() {
  setSessionsRecorded();
  globalInstances.playerObjects.push(new playerObject('PenZa', '@penz_'));
  await globalInstances.playerObjects[0].createFakeSession();
  globalInstances.logMessage('From test(): Ending session...');
  await globalInstances.playerObjects[0].sessionObject.endSession();
}

async function initialize() {
  setSessionsRecorded();
  return db.all(
    'SELECT osuUsername, twitterUsername FROM playersTable',
    async (err, rows) => {
      for (var i = 0; i < rows.length; i++) {
        globalInstances.playerObjects.push(
          new playerObject(rows[i].osuUsername, rows[i].twitterUsername)
        );
      }
      globalInstances.logMessage('Loading sessions...');
      await sessionStore.loadSessions();

      globalInstances.logMessage(
        'From initialize(): Starting to loop through players...'
      );
      // globalInstances.playerObjects = [new playerObject('PenZa', '@penz_')];
      mainLoop();
    }
  );
}

async function sleep(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

async function mainLoop() {
  let shutdownRequested = false;
  let canShutdown = true;

  const handler = () => {
    if (canShutdown) {
      globalInstances.logMessage('Shutting down...');
      process.exit(0);
    }
    globalInstances.logMessage('Shutdown requested...');
    shutdownRequested = true;
  };

  process.on('SIGINT', handler);
  process.on('SIGTERM', handler);

  const loopTime = msPerIteration / globalInstances.playerObjects.length;
  while (true) {
    for (const player of globalInstances.playerObjects) {
      const start = +new Date();
      canShutdown = false;
      await player.updateSessionObjectv3();
      const runTime = +new Date() - start;
      canShutdown = true;

      if (shutdownRequested) {
        globalInstances.logMessage('Shutting down...');
        process.exit(0);
      }

      const delay = loopTime - runTime;
      // globalInstances.logMessage(
      //   `Sleeping ${delay.toFixed(0)} ms before checking next player`
      // );
      await sleep(delay);
    }
    getSessionInfoForConsole();
  }
}

var numOfOutputs = 0;

async function getSessionInfoForConsole() {
  numOfOutputs++;
  if (numOfOutputs > 2000) {
    //notice the writeFile
    if (!process.env.NO_FILE_LOG) {
      fs.writeFile('./logs.txt', 'CLEARED', (err) => {
        if (err) throw err;
      });
    }
    numOfOutputs = 0;
  }
  var countPlayerObjects = globalInstances.playerObjects.length;
  var countPlayObjects = 0;
  var countSessionObjects = 0;
  var currentTime = new Date();
  var output = '';
  output += '\nx-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x\n';
  output += `\nDate: ${currentTime.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
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
      if (play.title != null) {
        output += `       ${play.title} [${play.version}] by: ${play.artist}\n\n`;
        isPlays = true;
      }
    }
    if (!isPlays) {
      output += '       No plays that will be tweeted...\n';
    }
    output += '       Total plays (including failed): ' + totalPlays + '\n';
  }
  output += `\n   Count of player objects: ${countPlayerObjects}\n`;
  output += `   Count of session objects: ${countSessionObjects}\n`;
  output += `   Count of play objects: ${countPlayObjects}\n`;
  output += '\nx-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x\n';
  globalInstances.logMessage(output);
}

function setSessionsRecorded() {
  db.get(
    'SELECT sessionID FROM sessionsTable ORDER BY sessionID DESC LIMIT 1',
    (err, row) => {
      if (err !== null) return;
      globalInstances.logMessage(row.sessionID + ' entries in the db.');
      globalInstances.numberOfSessionsRecorded = row.sessionID + 1;
    }
  );
}
