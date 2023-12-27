require('dotenv').config()
const { Telegraf, Markup, session } = require("telegraf");
const { message } = require('telegraf/filters')
const { createCanvas, loadImage } = require("canvas");

const express = require('express')
const app = express()

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
bot.use(session());

app.get('/', function(req, res) {
  res.send('Hello World')
})

app.listen(3000, () => console.log("Server is Ready"))
bot.start(async (ctx) => {
  ctx.session ??= { wait: 'empty' };
  return await ctx.reply('Привет!', Markup
    .keyboard([
      ['🎫 участвовать в Q ЛОТТО'],
      ['связаться с Джокером🃏'],
      [Markup.button.webApp("🔖 смотреть АНИМЕ", "https://anixart.me/")]
    ])
    .oneTime()
    .resize(),
    Markup.removeKeyboard(true)
  )
})
bot.on(message('sticker'), (ctx) => ctx.reply('смотреть аниме', 'вы ввели не число, введите число.'))

const isNumber = (userInput) => {
  return !isNaN(Number(userInput));
}

const checkCorrectNumber = (number) => {
  let count = 0;
  while (number > 0) {
    const a = number % 10;

    if (a == 0 || a > 6) {
      return false;
    }
    count = count + 1;
    number = Math.floor(number / 10);
  }
  return count === 6;
  //  return 100000 <= number && number <= 999999;
}

const addTextToImage = async (text, username, ctx) => {
  const sX = 80, sY = 80;     // text position

  const img = await loadImage(process.env.PHOTO_URL);
  const canvas = createCanvas(img.width, img.height);
  const context = canvas.getContext("2d");
  context.drawImage(img, 0, 0);
  context.save();
 // context.translate(canvas.width - 1, 0);
 // context.rotate(-Math.PI / 2);
  context.font = "64px serif bold";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.fillText(text, 600, 230);
  context.font = "48px serif";
  context.textAlign = "center";
  context.fillText(username, 260, 300)
  context.restore();
  const stream = canvas.createPNGStream();
  return stream;
}

bot.on(message('text'), async (ctx) => {
  ctx.session ??= { wait: 'empty' };
  // console.log(ctx.message.chat.id);
  if (ctx.message.text === "связаться с Джокером🃏") {
    ctx.session.wait = 'support';
    return ctx.reply("напишите то, что вы хотите отправить Джокеру");
  }
  if (ctx.session.wait === "support") {
    ctx.session.wait = 'empty';
    await ctx.telegram.sendMessage(process.env.CHAT_ID, `Сообщение от ${ctx.chat?.first_name ?? ""} ${ctx.chat?.last_name ?? ""}, @${ctx.chat?.username}`);
    await ctx.telegram.sendMessage(process.env.CHAT_ID, ctx.message.text);
    return ctx.reply("Cообщение успешно отправлено.");
  }
  if (ctx.message.text === "🎫 участвовать в Q ЛОТТО") {
    ctx.session.wait = 'username';
    await ctx.reply("розыгрыш пройдёт X декабря в X:X по мск на канале @slovo_jokera (время уточняется)")
    return await ctx.reply("введите ник, который хотите видеть на билете");
  }
  if (ctx.session.wait === "username") {
    ctx.session.username = ctx.message.text;
    ctx.session.wait = "number"
    return await ctx.reply("введите 6 цифр (каждая в диапазоне от 1 до 6)");
  }

  if (ctx.session.wait === "number") {
    if (!isNumber(ctx.message.text)) {
      return await ctx.reply("вы ввели не число, введите число.");
    }
    if (checkCorrectNumber(Number(ctx.message.text))) {
      await ctx.reply("Ваш билет создаётся, подождите какое-то время");
      const stream = await addTextToImage(ctx.message.text, ctx.session.username, ctx);
      ctx.session.wait = "empty";
      await ctx.replyWithPhoto({ source: stream });
      return ctx.reply("отправьте ваш билет в лс Джокеру @JoJoker_law для подтверждения")
    } else {
      return await ctx.reply("число неккоректно, введите другое.");
    }
  }
})

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
