var osuApi = require("./osuApi");
var username = "9152327";

start();

async function start() {
  var userId = await convertOsuUser(username, 1);
  console.log(userId);
}

async function convertOsuUser(osuUsernameOrId, requestedForm) {
  const USER_NAME_BOOL = 1;
  const USER_ID_BOOL = 0;
  if (USER_NAME_BOOL === requestedForm) {
    if (isNaN(osuUsernameOrId)) {
      return osuUsernameOrId;
    } else {
      return await getIdOrName(requestedForm);
    }
  } else if (USER_ID_BOOL === requestedForm) {
    if (!isNaN(osuUsernameOrId)) {
      return osuUsernameOrId;
    } else {
      return await getIdOrName(requestedForm);
    }
  } else {
    return "problem1";
  }

  async function getIdOrName(requestedForm) {
    return osuApi
      .getUser({ u: username })
      .then((user) => {
        if (requestedForm === USER_NAME_BOOL) {
          return user.name;
        } else {
          return user.id;
        }
      })
      .catch((err) => {
        return "problem2";
      });
  }
}

// var sqlite3 = require('sqlite3');
// var db = new sqlite3.Database('../osuReports_v2.db');

// db.all('SELECT * FROM playersTable', (err, rows) => {
//     console.log(rows);
//     for (var i = 0; i < rows.length; i++) {
//         console.log(rows[i]['osuUsername'] + " " + rows[i]['twitterUsername']);
//     }
// })

// const axios = require('axios');

// var mapURLs = [
//     'https://assets.ppy.sh/beatmaps/1351/covers/cover.jpg?1539845552',
//     'https://assets.ppy.sh/beatmaps/699745/covers/cover.jpg?1521173550',
//     'https://assets.ppy.sh/beatmaps/699745/covers/cover.jpg?1521173550',
// ];

// const fetchedPromise = Promise.all(
//     mapURLs.map(
//         url => axios.get(url).then(() => url).catch(() => 'https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg?1581740491')
//     )
// );
// fetchedPromise.then(mapURLs => mapURLs.forEach(item => console.log(item)));

// // BELOW WORKS

// var $ = cheerio.load(response.data);
// var html = $("").html();
// var data = JSON.parse(html);

// var maps = [];
// maps.push('https://assets.ppy.sh/beatmaps/1351/covers/cover.jpg?1539845552');
// maps.push('https://assets.ppy.sh/beatmaps/699745/covers/cover.jpg?1521173550');
// maps.push('https://assets.ppy.sh/beatmaps/699745/covers/cover.jpg?1521173550');

// var axiosMaps = [];

// for (var i = 0; i < maps.length; i++) {
//     axiosMaps.push(axios.get(maps[i])
//         .then(response => {
//             return 1;
//         }).catch(error => {
//             return 0;
//         }));
// }

// Promise.all(axiosMaps).then(function (res) {
//     for (var i = 0; i < res.length; i++) {
//         if (res[i] == 0) {
//             maps[i] = 'https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg?1581740491';
//         }
//     }
//     console.log(maps)
// }).catch(err => {
//     console.log("-" + err)
// });

// //ABOVE WORKS

// const axios = require('axios');

// var maps = [];
// maps.push('https://assets.ppy.sh/beatmaps/1351/covers/cover.jpg?1539845552');
// maps.push('https://assets.ppy.sh/beatmaps/699745/covers/cover.jpg?1521173550');
// maps.push('https://assets.ppy.sh/beatmaps/699745/covers/cover.jpg?1521173550');

// var axiosMaps = [];
// for (var i = 0; i < maps.length; i++) {
//     axios.get(maps[i])
//         .then((response) => {
//             console.log('ok');
//             return 1;
//         }).catch(error => {
//             console.log("ok2")
//             console.log(i);
//             maps[i] = 'https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg?1581740491';
//             return 0;
//         })
// }

// for (var i = 0; i < maps.length; i++) {
//     console.log(maps[i])
// }

// for (var i = 0; i < maps.length; i++) {
//     axios.get(maps[i])
//         .then((response) => {
//             console.log('ok');
//         }).catch(error => {
//             maps[i] = 'https://assets.ppy.sh/beatmaps/1084284/covers/cover.jpg?1581740491';
//         })
// }

// var Twit = require('twit');

//var T = new Twit({ consumer_key: 'mxPIpMrlXJQz5A1A16ZWmVLo2', consumer_secret: 'ImxILlzTaRXxQ9IrXBRQ31Bh8kwYpMRmubcsUZYeTKLM2UNtRa', access_token: '998620023563407366-Jgqs9c7OlnypiKuruzIqlIGPz5WFLkn', access_token_secret: 'zt2hWnGj47Cdi8MRxruN5KtQWQ1RelHJVirhCfAVqR8D3' });

//var T = new Twit({ consumer_key: 'PKO0uA7y1ihnq4efBOyeISWIu', consumer_secret: 'NlZNEM8BMCAbzKekbaXi66twANL0tu9dKwshNLYYkx8FNU4Ink', access_token: '998620023563407366-1414275464-aR5VncNH6eSPz3DaiC4mldcMYu6aDvPCiGTgumJ', access_token_secret: 'fI81MWNhvo28AwKOz43J4mDLL64cR4wOvP7KZiGgij4o2' });

// recipient = "penz_";
// recipient_id = "";
// message = "hi";

// var stream = T.stream('user');
// //stream.on('direct_message', tweetEvent);

// function tweetEvent(eventMsg) {
//     //console.log("tweet event")
//     var from = eventMsg.user.screen_name;
//     var text = eventMsg.text;
//     var idOfTweet = eventMsg.id_str;
// }

// const axios = require('axios');

// var twitterURL = 'https://osu.ppy.sh/users/PenZa'
// axios.get(twitterURL)
//     .then(() => {
//         console.log("profile exists");
//     }).catch(() => {
//         console.log("profile does not exist.")
//     });

// var twitterURL = 'https://twitter.com/osureports'
// axios.get(twitterURL)
//     .then(() => {
//         console.log("profile exists");
//     }).catch(() => {
//         console.log("profile does not exist.")
//     });

// var x = "https://osu.ppy.sh/users/"

// if (x.length > 20) {
//     x = x.substring(0, 20) + "..."
// }
// console.log(x);

// T.get('users/lookup', { screen_name: recipient }, function (err, data, response) {
//     //console.log(data)
//     recipient_id = data[0].id;
//     console.log("Attept: " + data[0].id);
//     event = {
//         event: {
//             type: "message_create",
//             message_create: {
//                 target: {
//                     recipient_id: recipient_id
//                 },
//                 message_data: {
//                     text: message
//                 }
//             }
//         }
//     }
//     T.post('direct_messages/events/new', event, function (err, data, response) {
//         console.log(data)
//     })
// })
