require('dotenv').config()
const { Telegraf, Markup } = require("telegraf");
const { message } = require('telegraf/filters')
const Jimp = require("jimp");
const axios = require('axios');
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)


bot.start(async (ctx) => {
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
    return 100000 <= number && number <= 999999;
}

const addTextToImage = async (text, username, ctx) => {
   // const fileName = './img/foto.jpg';
    //const fileName = process.env.PHOTO_URL;

    let loadedImage = await Jimp.read(process.env.PHOTO_URL);
    //const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    const font1 = await Jimp.loadFont('fonts/leaguespartan-bold/UmUBC09APAHdmWww4TzQtilV.ttf.fnt');
   // const font1 = await Jimp.loadFont(process.env.FONT1);
    loadedImage = loadedImage.rotate(-90).print(font1, 80, 1100, text);
    //const font1 = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const font2 = await Jimp.loadFont('fonts/CarroisGothicSC-Regular/WKPrnvBd9RtsiEmCBtSoKDiE.ttf.fnt');
   // const font2 = await Jimp.loadFont(process.env.FONT2);
    loadedImage = loadedImage.print(font2, 50, 1000, username).rotate(90);
    const buffer = await loadedImage.getBufferAsync("image/png");
    await ctx.replyWithPhoto({ source: buffer});
}

const addTextToImage1 = async (text, username, ctx) => {
   return ctx.reply(text);
}
bot.on(message('text'), async (ctx) => {
    if(ctx.message.text === "получить билет" ) {
        return await ctx.reply("введите в одном сообщении ник и 6 цифр через пробел.");
    }
    if(ctx.message.text != "получить билет" && ctx.message.text != "/start") {
        const message = ctx.message.text.split(' ');
        if(message.length != 2){
            return await ctx.reply("вы ввели неккоректное количество параметров");
        }
        if(!isNumber(message[1])) {
            return await ctx.reply("вторым параметром вы ввели не число, введите число.");
        } 
    
        console.log(message);
        if(checkCorrectNumber(Number(message[1]))) {
            const text = message[1];
            const username = message[0];
            await ctx.reply("Ваш билет генерируется, подождите какое-то время");
           // return await addTextToImage1(text, username, ctx);
           await ctx.reply(text);
        } else {
            await ctx.reply("введите шестизначное число.");
        }
    }

})


/**
 * 
 * exports.handler = async event => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.log(e)
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
  }
}


bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

 */