var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('osuReports_v2.db');

db.serialize(() => {

    db.run("CREATE TABLE sessionsTable (sessionID INT, tweetID VARCHAR(30),date VARCHAR(30), osuUsername VARCHAR(100), sessionDuration VARCHAR(50), globalRank VARCHAR(15), difGlobalRank VARCHAR(15), countryRank VARCHAR(15), difCountryRank VARCHAR(15)," +
        "level VARCHAR(10), difLevel VARCHAR(10), " +
        "accuracy VARCHAR(15), difAcc VARCHAR(15), totalPP VARCHAR(15), difPP VARCHAR(5), playCount VARCHAR(15), difPlayCount VARCHAR(15)," +
        "countSSPlus VARCHAR(10), countSS VARCHAR(10), countSPlus VARCHAR(10), countS VARCHAR(10), countA VARCHAR(10))");

    //db.run("INSERT INTO sessionsTable VALUES ('PenZa', '@PenZaIV', '10 Minutes', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22')");



    // db.run("CREATE TABLE playsTable (sessionID INT, background VARCHAR(100), title VARCHAR(100), version VARCHAR(100), artist VARCHAR(100), combo VARCHAR(50), bpm VARCHAR(3), playDuration VARCHAR(15), difficulty VARCHAR(6)," +
    //     "playAccuracy VARCHAR(6), rank VARCHAR(3), mods VARCHAR(100), counts300 VARCHAR(5), counts100 VARCHAR(5), counts50 VARCHAR(5), countsMiss VARCHAR(5), playPP VARCHAR(6))");
});

// db.each("SELECT osuUsername, twitterUsername FROM playersTable", (err, row) => {
//     console.log(row.osuUsername + " " + row.twitterUsername + " FROM DATABASE _-_-_-_-_-_-_")
// });

// db.each("SELECT globalRank, countryRank FROM sessionsTable", (err, row) => {
//     console.log(row.globalRank + " " + row.countryRank + " FROM DATABASE _-_-_-_-_-_-_")
// });