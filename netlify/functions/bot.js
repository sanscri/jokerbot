const { Telegraf } = require('telegraf')
exports.handler = async (event) => {
    console.log("Received an update from Telegram!", event.body);
    return { statusCode: 200 };
};

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.on(message('text'), async (ctx) => {
    // Using context shortcut
    await ctx.replyWithPhoto({ source: '/img/foto.jpeg' });
    await ctx.reply(ctx.message.text);
  })

exports.handler = async event => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.log(e)
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
  }

}

