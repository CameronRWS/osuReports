let twitterUtils = require("./twitterUtils");
let ONE_HOUR = 3600000
let T = twitterUtils.getTwitterInstance();
const {
    db
} = require("@osureport/common");
let stream = T.stream('statuses/filter', {
    track: '@osuReports'
})
stream.on('tweet', twitterUtils.checkIfShouldRetweetThenRetweet);
twitterUtils.updateFollowingList();
setInterval(twitterUtils.updateFollowingList, ONE_HOUR * 12);

test();

async function test() {
    await handleMessageEvent({
        messageText: "Register",
        messageMetaData: "N/A",
        from: "@path_selector"
    })
}

function handleMessageEvent(messageEvent) {
    let message = messageEvent.messageText.toUpperCase();
    let messageMetaData = messageEvent.messageMetaData.toUpperCase();
    let from = twitterUtils.getUserId(messageEvent.from);

    if (message === "UNREGISTER") {
        if (isRegistered(from)) {
            if (removePlayerFromDB(from)) {
                twitterUtils.sendDirectMessage(from, "You have successfully been unregistered " +
                    "from osu! Reports. Your sessions will no longer be tracked and sent via DM's.")
            } else {
                twitterUtils.sendDirectMessage(from, "There was an issue unregistering your account. " +
                    "Try again later.")
            }
        } else {
            twitterUtils.sendDirectMessage(from, "You are currently not registered for osu! Reports.");
        }
    } else if (message === "REGISTER" || messageMetaData === "REGISTER") {
        if (!isRegistered(from)) {
            if (message === "REGISTER") {
                let quick_reply = {
                    "type": "text_input",
                    "text_input": {
                        // "keyboard": "number",
                        "label": "osu! username or ID",
                        "metadata": "REGISTER"
                    }
                };
                twitterUtils.sendDirectMessageWithQuickReply(from, "Reply with your osu! username or ID to register!", quick_reply);
            } else {
                if (addPlayerToDB(message)) {
                    let quick_reply = {
                        "type": "options",
                        "options": [{
                            "label": "Subscribe",
                            "description": "Click to receive DM's when your sessions finish.",
                        }, ]
                    };
                    twitterUtils.sendDirectMessageWithQuickReply(from, "You have successfully been registered " +
                        "for osu! Reports. Your sessions will be tracked on the website. To receive a DM " +
                        "when your sessions finish reply with \"Subscribe\".", quick_reply);
                } else {
                    twitterUtils.sendDirectMessage(from, "There was an issue registering your account. " +
                        "Try again later.")
                }
            }

        } else {
            twitterUtils.sendDirectMessage(from, "You are currently registered for osu! Reports.");
        }
    } else if (message = "UNSUBSCRIBE") {
        if (isRegistered(from)) {
            if (db.setPlayerSubscriptionStatus(from, 0)) {
                twitterUtils.sendDirectMessageWithQuickReply(from, "You have successfully been unsubscribed. " +
                    "Your sessions will still be tracked on the website.");
            } else {
                twitterUtils.sendDirectMessage(from, "There was an issue unsubscribing your account. " +
                    "Try again later.")
            }
        } else {
            twitterUtils.sendDirectMessage(from, "You are currently not registered for osu! Reports.");
        }
    } else if (message = "SUBSCRIBE") {
        if (isRegistered(from)) {
            if (db.setPlayerSubscriptionStatus(from, 1)) {
                twitterUtils.sendDirectMessageWithQuickReply(from, "You have successfully been subscribed. " +
                    "You will now received a DM when your sessions finish.");
            } else {
                twitterUtils.sendDirectMessage(from, "There was an issue subscribing your account. " +
                    "Try again later.")
            }
        } else {
            twitterUtils.sendDirectMessage(from, "You are currently not registered for osu! Reports.");
        }
    }
}

db.setPlayerSubscriptionStatus = function (x, o) {
    return true;
}

function addPlayerToDB(from) {
    return true;
}

function removePlayerFromDB(from) {
    return true;
}

function isRegistered(from) {
    return true;
}