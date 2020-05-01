var globalInstances = require("./src/globalInstances");
var playerObject = require("./src/playerObject");
var startServer = require("./src/server");
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database("osuReports_v2.db");
var fs = require("fs");

var loopTime = 1000;

setSessionsRecorded();

startServer();

//initialize();

test();

function test() {
  globalInstances.playerObjects.push(new playerObject("PenZa", "@penz_"));
  globalInstances.playerObjects[0].createFakeSession();
  setTimeout(function () {
    globalInstances.logMessage("From test(): Ending session...");
    globalInstances.playerObjects[0].sessionObject.endSession();
  }, 30000);
}

function initialize() {
  db.all(
    "SELECT osuUsername, twitterUsername FROM playersTable",
    (err, rows) => {
      for (var i = 0; i < rows.length; i++) {
        globalInstances.playerObjects.push(
          new playerObject(rows[i].osuUsername, rows[i].twitterUsername)
        );
      }
      globalInstances.logMessage(
        "From initialize(): Starting to loop through players..."
      );
      loopThroughPlayers();
    }
  );
}

var iPlayers = 0;
function loopThroughPlayers() {
  loopTime = 30000 / globalInstances.playerObjects.length;
  globalInstances.playerObjects[iPlayers].updateSessionObjectv3();
  if (iPlayers == globalInstances.playerObjects.length - 1) {
    iPlayers = 0;
    getSessionInfoForConsole();
  } else {
    iPlayers = iPlayers + 1;
  }
  setTimeout(loopThroughPlayers, loopTime);
}

var numOfOutputs = 0;

function getSessionInfoForConsole() {
  numOfOutputs++;
  if (numOfOutputs > 2000) {
    //notice the writeFile
    fs.writeFile("./logs.txt", "CLEARED", (err) => {
      if (err) throw err;
    });
    numOfOutputs = 0;
  }
  var countPlayerObjects = globalInstances.playerObjects.length;
  var countPlayObjects = 0;
  var countSessionObjects = 0;
  var currentTime = new Date();
  currentTime.setHours(currentTime.getHours() - 6);
  var output = "";
  output += "\nx-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x\n";
  output +=
    "\nDate: " +
    (currentTime.getMonth() + 1) +
    "/" +
    currentTime.getDate() +
    "/" +
    currentTime.getFullYear() +
    " | Time: " +
    currentTime.getHours() +
    ":" +
    currentTime.getMinutes() +
    ":" +
    currentTime.getSeconds();
  output += "";
  for (var i = 0; i < globalInstances.playerObjects.length; i++) {
    if (globalInstances.playerObjects[i].sessionObject != null) {
      countSessionObjects++;
      output +=
        "\n             -- '" +
        globalInstances.playerObjects[i].osuUsername +
        "' --\n   Plays:\n";
      var isPlays = false;
      var totalPlays = 0;
      for (
        var j = 0;
        j < globalInstances.playerObjects[i].sessionObject.playObjects.length;
        j++
      ) {
        countPlayObjects++;
        totalPlays++;
        if (
          globalInstances.playerObjects[i].sessionObject.playObjects[j].title !=
          null
        ) {
          output +=
            "       " +
            globalInstances.playerObjects[i].sessionObject.playObjects[j]
              .title +
            " [" +
            globalInstances.playerObjects[i].sessionObject.playObjects[j]
              .version +
            "] by: " +
            globalInstances.playerObjects[i].sessionObject.playObjects[j]
              .artist +
            "\n\n";
          // output += ("           Rank: " + globalInstances.playerObjects[i].sessionObject.playObjects[j].rank + "\n");
          // output += ("           Acc: " + globalInstances.playerObjects[i].sessionObject.playObjects[j].accuracy + "%" + "\n");
          // output += ("           PP: " + globalInstances.playerObjects[i].sessionObject.playObjects[j].pp + "\n");
          isPlays = true;
        }
      }
      if (!isPlays) {
        output += "       No plays that will be tweeted...\n";
      }
      output += "       Total plays (including failed): " + totalPlays + "\n";
    }
  }
  output += "\n   Count of player objects: " + countPlayerObjects + "\n";
  output += "   Count of session objects: " + countSessionObjects + "\n";
  output += "   Count of play objects: " + countPlayObjects + "\n";
  output += "\nx-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x\n";
  globalInstances.logMessage(output);
}

function setSessionsRecorded() {
  db.get(
    "SELECT sessionID FROM sessionsTable ORDER BY sessionID DESC LIMIT 1",
    (err, row) => {
      globalInstances.logMessage(row.sessionID + " entries in the db.");
      globalInstances.numberOfSessionsRecorded = row.sessionID + 1;
    }
  );
}
