require('dotenv').config()
const { Telegraf } = require("telegraf");
const { message } = require('telegraf/filters')
const Jimp = require("jimp");
const axios = require('axios');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('вы ввели не число, введите число.'))

const isNumber = (userInput) => {
    return !isNaN(Number(userInput));
}
const checkCorrectNumber = (number) => {
    return 100000 <= number && number <= 999999;
}

const addTextToImage = async (text, username, ctx) => {
   // const fileName = './img/foto.jpg';
    const fileName = process.env.PHOTO_URL;
    const response = await axios.get(fileName, { responseType: 'arraybuffer' });
    let blob = new Blob(
        [response.data], 
        { type: response.headers['content-type'] }
      )
      let initImage = URL.createObjectURL(blob);
    let loadedImage = await Jimp.read(initImage);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
    loadedImage = loadedImage.rotate(-90).print(font, 80, 1100, text)
    .print(font, 80, 1000, username).rotate(90);
    const buffer = await loadedImage.getBufferAsync("image/png");
    await ctx.replyWithPhoto({ source: buffer});
}
bot.on(message('text'), async (ctx) => {
    // Using context shortcut
    const message = ctx.message.text;

    if(!isNumber(message)) {
        return await ctx.reply("вы ввели не число, введите число.");
    } 

    if(checkCorrectNumber(Number(message))) {
        const text = ctx.message.text;
        const username = ctx.message.from.username;
        const fileName = `./img/${username}.jpg`;
    
        await addTextToImage(text, '@' + username, ctx);
    } else {
        await ctx.reply("введите шестизначное число.");
    }
  })

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))