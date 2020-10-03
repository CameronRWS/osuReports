//require("./src/twitterStream");
const db = require("./src/db");

start();
async function start() {
    var x = await db.getPlayerSubscriptionStatus("@path_selector");
    var y = await db.setPlayerSubscriptionStatus("@path_selector", 0);
    var z = await db.getPlayerSubscriptionStatus("@path_selector");
    console.log(x)
    console.log(y);
    console.log(z);
}