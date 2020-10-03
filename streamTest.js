require("./src/twitterStream");
const db = require("./src/db");

start();
async function start() {
    var x = await db.getPlayerSubscriptionStatus("@path_selector");
    var y = await db.getStats();
    console.log(x)
    console.log(y);
}