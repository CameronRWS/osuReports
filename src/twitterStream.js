let twitterUtils = require("./twitterUtils");
let ONE_HOUR = 3600000
let T = twitterUtils.getTwitterInstance();
let stream = T.stream('statuses/filter', {
    track: '@osuReports'
})
stream.on('tweet', twitterUtils.checkIfShouldRetweetThenRetweet);
twitterUtils.updateFollowingList();
setInterval(twitterUtils.updateFollowingList, ONE_HOUR * 12)