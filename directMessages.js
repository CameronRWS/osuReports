const https = require("https");
const keys = require("./src/consumerKeys");
const T = require("./src/twitterInstance");
const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const axios = require("axios").default;
const bodyParser = require("body-parser");

const app = express();

app.use(morgan("tiny"));
app.use(bodyParser.json());

app.get("/webhook", (req, res) => {
  const token = (req.query.crc_token || "").toString();

  const response_token =
    "sha256=" +
    crypto
      .createHmac("sha256", keys.consumer_secret)
      .update(token)
      .digest("base64");

  res.json({ response_token });
});

app.post("/webhook", (req, res) => {
  console.dir(req.body, { depth: 10 });
  res.status(200).end();
});

https
  .createServer(
    {
      key: fs.readFileSync("./server.key"),
      cert: fs.readFileSync("./server.pem")
    },
    app
  )
  .listen(3000);

async function doWebhook() {
  console.log("listing webhooks");
  const hooks = await T.get("account_activity/all/dev/webhooks");

  if (!hooks.data.length || !hooks.data[0].valid) {
    for (const hook in hooks.data) {
      console.log(`Deleting hook ${hook.id}`);
      await T.delete(`account_activity/all/dev/webhooks/${hook.id}`);
    }
    return testWebhook();
  }

  return subscribe();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWebhook() {
  console.log("test webhook");
  for (let i = 0; i < 10; i++) {
    const { data } = await axios.get(
      "https://test.osu.report/webhook?crc_token=asdf"
    );
    console.log(data);
    await sleep(100);
  }
  setTimeout(registerWebhook, 5000);
}

async function registerWebhook() {
  console.log("registering webhook");
  const response = await T.post("account_activity/all/dev/webhooks", {
    url: "https://test.osu.report/webhook"
  });
  console.dir(response.data);
}

doWebhook();

async function subscribe() {
  console.log("checking subscriptions");
  try {
    const { data } = await T.get("account_activity/all/dev/subscriptions");
    console.dir(data);
  } catch (_ignored) {
    console.log("subscribing");
    const { data } = await T.post("account_activity/all/dev/subscriptions");
    console.dir(data);
  }
}
