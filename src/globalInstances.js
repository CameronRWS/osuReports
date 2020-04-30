var whitelistedUsernamesString = "PenZa,ptrn,gothicteens,Cecelia,Spock,Herbafobe,Mathi,Rafis,wobble,vows,Onii Chan,hikkuwu,ameo,Hirasawa-Yui,Logan Paul,TsukinoseTillot,Hitman,Fubu,Oceaneqllt,Mitsuha boii,ramtonic,GastonGL,Cata,Aoi Boii,Koyaiba,- Manuu,SansREPZ,EIVO,reedmarler,Yunoxa,Not Jorge,Shorikan";
var whitelistedTwitterUsernamesString = "@PenZaIV,@ptrn74,@spacebenz,@ceceliaosu,@kirbyfan03,@Herbafobe,@osureports,Rafis,@twe4k_,@vowpsd,@ONIlCHAN,@reluwu,@Ameobea10,@Yuidere_,@Browzi,@tillot_,@Hitman_OSU,@lntetsu,@oceaneqllt,@sakurak0San,@ramtonic,@Gaston_Osu,@_Cataaaa,@kalmuk_osu,@frzvoid,@Manuhuwu,@SansREPZ,@EIVO_osu,@penz_,@Yunoxaa,@Not__Jorge,@ImNorlax"
var fs = require("fs");
const globalInstances = {
	playerObjects: [],
	numberOfSessionsRecorded: 0,
	sessionTimeout: 60,
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
	logMessage: function (message) {
		message += " <via logMessage()>";
		fs.appendFile("./logs.txt", message, (err) => {
			if (err) throw err;
		});
		console.log(message)
	},
	isSessionEnding: false
};

module.exports = globalInstances;
