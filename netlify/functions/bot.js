require('dotenv').config()
const { Telegraf, Markup, session } = require("telegraf");
const { message } = require('telegraf/filters')
const Jimp = require("jimp");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
 
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
bot.use(session());


bot.start(async (ctx) => {
  ctx.session ??= { wait: 'empty' };
    return await ctx.reply('Привет!', Markup
      .keyboard([
        ['получить билет'],
      ])
      .oneTime()
      .resize()
    )
  })
bot.on(message('sticker'), (ctx) => ctx.reply('вы ввели не число, введите число.'))

const isNumber = (userInput) => {
    return !isNaN(Number(userInput));
}

const checkCorrectNumber = (number) => {
  let count = 0;
  while(number > 0) {
      const a = number % 10;
    
      if(a == 0 || a > 6) {
          return  false;
      }
      count = count + 1;
      number = Math.floor(number / 10);
  }
  return count === 6;
//  return 100000 <= number && number <= 999999;
}

const addTextToImage = async (text, username, ctx) => {
   // const fileName = './img/foto.jpg';
    //const fileName = process.env.PHOTO_URL;

    let loadedImage = await Jimp.read(process.env.PHOTO_URL);
    //const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    const font1 = await Jimp.loadFont('fonts/leaguespartan-bold/UmUBC09APAHdmWww4TzQtilV.ttf.fnt');
    //const font1 = await Jimp.loadFont(process.env.FONT1);
    loadedImage = loadedImage.rotate(-90).print(font1, 80, 1100, text);
    //const font1 = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const font2 = await Jimp.loadFont('fonts/CarroisGothicSC-Regular/WKPrnvBd9RtsiEmCBtSoKDiE.ttf.fnt');
    //const font2 = await Jimp.loadFont(process.env.FONT2);
    loadedImage = loadedImage.print(font2, 50, 1000, username).rotate(90);
    const buffer = await loadedImage.getBufferAsync("image/png");
    await ctx.replyWithPhoto({ source: buffer});
}

const addTextToImage1 = async (text, username, ctx) => {
  const sX = 80, sY = 80;     // text position
   
  const img = await loadImage(process.env.PHOTO_URL);
  const canvas = createCanvas(img.width, img.height);
  const context = canvas.getContext("2d");
  context.drawImage(img, 0, 0);
  context.save();
  context.translate( canvas.width - 1, 0 );
  context.rotate(-Math.PI/2);
  context.font = "64px serif bold";
  context.fillStyle = "#5b5c3c";
  context.textAlign = "center";
  context.fillText(text, -220, -100 );
  context.font = "32px serif";
  context.textAlign = "center";
  context.fillText(username, -220, -200);
  context.restore();
  const stream = canvas.createPNGStream();
  return stream;
}

bot.on(message('text'), async (ctx) => {
  ctx.session ??= { wait: 'empty' };
  if(ctx.message.text === "получить билет" ) { 
    ctx.session.wait = 'username';
    return await ctx.reply("введите ник, который хотите видеть на билете");
  }
  if(ctx.session.wait === "username") {
    ctx.session.username = ctx.message.text;
    ctx.session.wait = "number"
    return await ctx.reply("введите 6 цифр (каждая в диапазоне от 1 до 6)");
  }

  if(ctx.session.wait === "number") {
    if(!isNumber(ctx.message.text)) {
      return await ctx.reply("вы ввели не число, введите число.");
    }
    if(checkCorrectNumber(Number(ctx.message.text))) {
      await ctx.reply("Ваш билет создаётся, подождите какое-то время");
      const stream = await addTextToImage1(ctx.message.text, ctx.session.username, ctx);
      ctx.session.wait = "empty";
      return await ctx.replyWithPhoto({ source: stream});
    } else {
      return await ctx.reply("число неккоректно, введите другое.");
    }
  }
})

bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

/**
 * 
 *  exports.handler = async event => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.log(e)
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
  }
}

 */