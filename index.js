const nodeCleanup = require("node-cleanup");
const bot = require("./src/bot");

bot.start();
nodeCleanup(() => bot.stop());

module.exports = (req, res) => bot.lastStatus();
