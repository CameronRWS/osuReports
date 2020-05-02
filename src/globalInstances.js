var whitelistedUsernamesString =
  "PenZa,ptrn,gothicteens,Cecelia,Spock,Herbafobe,Mathi,Rafis,wobble,vows,Onii Chan,hikkuwu,ameo,Hirasawa-Yui,Logan Paul,TsukinoseTillot,Hitman,Fubu,Oceaneqllt,Mitsuha boii,ramtonic,GastonGL,Cata,Aoi Boii,Koyaiba,- Manuu,SansREPZ,EIVO,reedmarler,Yunoxa,Not Jorge,Shorikan";
var whitelistedTwitterUsernamesString =
  "@PenZaIV,@ptrn74,@spacebenz,@ceceliaosu,@kirbyfan03,@Herbafobe,@osureports,Rafis,@twe4k_,@vowpsd,@ONIlCHAN,@reluwu,@Ameobea10,@Yuidere_,@Browzi,@tillot_,@Hitman_OSU,@lntetsu,@oceaneqllt,@sakurak0San,@ramtonic,@Gaston_Osu,@_Cataaaa,@kalmuk_osu,@frzvoid,@Manuhuwu,@SansREPZ,@EIVO_osu,@penz_,@Yunoxaa,@Not__Jorge,@ImNorlax";
var fs = require("fs");
const globalInstances = {
  playerObjects: [],
  numberOfSessionsRecorded: 0,
  sessionTimeout: 152,
  minimalSessionLengthSeconds: 300,
  whitelistedUsernames: whitelistedUsernamesString.split(","),
  whitelistedTwitterUsernames: whitelistedTwitterUsernamesString.split(","),
  reportNumber: 1,
  convertTimeToHMS: function (h, m, s) {
    var time = "";
    if (h != 0) {
      time = time + h + "h ";
      if (m != 0) {
        time = time + m + "m ";
        if (s != 0) {
          time = time + s + "s";
        }
      }
    } else if (m != 0) {
      time = time + m + "m ";
      if (s != 0) {
        time = time + s + "s";
      }
    } else if (s != 0) {
      time = time + s + "s";
    }
    return time;
  },
  logMessage: function (message, error) {
    message = getCaller() + ": " + message;
    if (error) {
      message += error.stack;
    }
    message += " <via logMessage()>";
    fs.appendFile("./logs.txt", message, (err) => {
      if (err) throw err;
    });
    console.log(message);
  },
  isSessionEnding: false,
};

function getCaller() {
  const originalStackTrace = Error.prepareStackTrace;
  try {
    const err = new Error();
    Error.prepareStackTrace = function (err, stack) {
      return stack;
    };

    // skip this function and the parent, since we want the caller of
    // the function who calls this function
    let callers = err.stack.slice(2);
    let functionName = callers[0] && callers[0].getFunctionName();
    return functionName || "<unknown caller>";
  } catch (e) {
    Error.prepareStackTrace = originalStackTrace;
    console.error(e);
  } finally {
    Error.prepareStackTrace = originalStackTrace;
  }
}

module.exports = globalInstances;
