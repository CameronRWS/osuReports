var fs = require('fs');
const globalInstances = {
  playerObjects: [],
  numberOfSessionsRecorded: 0,
  sessionTimeout: 60,
  minimalSessionLengthSeconds: 300,
  convertTimeToHMS: function (h, m, s) {
    var time = '';
    if (h != 0) {
      time = time + h + 'h ';
      if (m != 0) {
        time = time + m + 'm ';
        if (s != 0) {
          time = time + s + 's';
        }
      }
    } else if (m != 0) {
      time = time + m + 'm ';
      if (s != 0) {
        time = time + s + 's';
      }
    } else if (s != 0) {
      time = time + s + 's';
    }
    return time;
  },
  logMessage: function (message, error) {
    message = getCaller() + ': ' + message;
    if (error) {
      message += error.stack;
    }
    message += ' <via logMessage()>';
    if (!process.env.NO_FILE_LOG) {
      fs.appendFile('./logs.txt', message, (err) => {
        if (err) throw err;
      });
    }
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
    // weird casting because TS doesn't like converting string -> CallSite[]
    let callers = /** @type {NodeJS.CallSite[]} */ (
      /** @type {unknown} */ (err.stack.slice(2))
    );
    let functionName = callers[0] && callers[0].getFunctionName();
    return functionName || '<unknown caller>';
  } catch (e) {
    Error.prepareStackTrace = originalStackTrace;
    console.error(e);
  } finally {
    Error.prepareStackTrace = originalStackTrace;
  }
}

module.exports = globalInstances;
