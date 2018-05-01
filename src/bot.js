const Twit = require("twit");
const dotenv = require("dotenv");
const snowflake = require("./snowflake");
dotenv.config();

const botname = "mauritscorneIis";

const secrets = {
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret
};

const twitter = new Twit(secrets);
const stream = twitter.stream("statuses/sample");

exports.start = () => {
  console.log("Starting bot...");
  stream.on("tweet", receive);
  resetFlag();
};

exports.stop = () => {
  console.log("Stopping bot...");
  stream.stop();
};

exports.lastStatus = () => lastSent;

let lastSent = "";
let shouldTweet = true;
const REPS = 2;

const state = {
  workerId: 20,
  datacenterId: 10,
  1: {
    delay: 300
  },
  2: {
    delay: 150
  }
};

const receive = t => {
  if (shouldTweet) {
    shouldTweet = false;
    tweet(1, [t.id_str]);
  }
};

const tweet = (count, ids) => {
  if (count > REPS) {
    console.log(ids.join(","));
    lastSent = `${new Date()},${ids.join(",")}`;
    return;
  }

  const currentId = ids.slice(-1)[0];
  const oldIdInfo = snowflake.parse(currentId);
  const newIdInfo = {
    sequence: 0,
    workerId: state.workerId,
    datacenterId: state.datacenterId,
    timestamp: oldIdInfo.timestamp + state[count].delay,
    delay: state[count].delay
  };
  const newId = snowflake.create(newIdInfo);
  newIdInfo.newId = newId;

  const status = `Is this tweet recursive? https://twitter.com/${botname}/status/${newId}`;
  twitter.post("statuses/update", { status }, (err, t, response) => {
    const actualIdInfo = snowflake.parse(t.id_str);
    state.workerId = actualIdInfo.workerId;
    state.datacenterId = actualIdInfo.datacenterId;
    state[count].delay = actualIdInfo.timestamp - oldIdInfo.timestamp;
    tweet(count + 1, [...ids, t.id_str]);
    replyWithStats(oldIdInfo, newIdInfo, actualIdInfo);
  });
};

const resetFlag = () => {
  setTimeout(() => {
    shouldTweet = true;
    resetFlag();
  }, 3 * 60 * 1000);
};

const replyWithStats = (oldIdInfo, newIdInfo, actualIdInfo) => {
  const sequenceMatch = newIdInfo.sequence == actualIdInfo.sequence;
  const sequenceLine = `📋${
    sequenceMatch ? `✅` : `❌`
  } ${actualIdInfo.sequence
    .toString()
    .padStart(2, "0")} | ${newIdInfo.sequence.toString().padStart(2, "0")}`;

  const workerIdMatch = newIdInfo.workerId == actualIdInfo.workerId;
  const workerIdLine = `⚙️${
    workerIdMatch ? `✅` : `❌`
  } ${actualIdInfo.workerId
    .toString()
    .padStart(2, "0")} | ${newIdInfo.workerId.toString().padStart(2, "0")}`;

  const datacenterIdMatch = newIdInfo.datacenterId == actualIdInfo.datacenterId;
  const datacenterIdLine = `🏭${
    datacenterIdMatch ? `✅` : `❌`
  } ${actualIdInfo.datacenterId
    .toString()
    .padStart(2, "0")} | ${newIdInfo.datacenterId.toString().padStart(2, "0")}`;

  const timestampMatch = newIdInfo.timestamp == actualIdInfo.timestamp;
  const timestampLine = `⏱️${
    timestampMatch ? `✅` : `❌`
  } ${actualIdInfo.timestamp - newIdInfo.timestamp}ms`;

  let status = `${sequenceLine}
${workerIdLine}
${datacenterIdLine}
${timestampLine}
`;
  if (newIdInfo.id === actualIdInfo.id) {
    status += `
🎉🎉 We did it @pomber! 🎉🎉`;
  }

  twitter.post(
    "statuses/update",
    { status, in_reply_to_status_id: actualIdInfo.id },
    (err, t, response) => {}
  );
};
