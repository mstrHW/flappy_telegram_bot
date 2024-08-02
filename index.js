const process = require('process');
require('dotenv').config();
// import fetch from 'node-fetch';
const request = require('request');
const { Api, Bot, Context, session} = require('grammy');
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
const URL = "https://flappybotback-4fm7p9xx.b4a.run";

async function greeting(conversation, ctx) {
    await ctx.reply("Type title");
    ctx = await conversation.wait();
    const task_title = ctx.message?.text;

    await ctx.reply("Add link");
    ctx = await conversation.wait();
    const task_link = ctx.message?.text;

    await ctx.reply("How much cost?");
    ctx = await conversation.wait();
    const task_money = ctx.message?.text;

    const data = JSON.stringify({
        "title": task_title,
        "link": task_link,
        "money": task_money,
    })
    var base_url = URL + '/add_task';
    fetch(base_url, {
            method: "POST",
            body: data,
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
    )
}

bot.use(createConversation(greeting));


bot.command('start', async (ctx) => {
    await ctx.reply(
    'Привет! Я - Бот 🤖',
    );
    console.log(ctx.from.id);
    console.log(ctx.message.text);
    const myArray = ctx.message.text.split(" ");
    var ref_str = "";
    if (myArray.length > 1)
    {
        ref_str = myArray[1];
    }

    await bot.api.sendMessage(ctx.from.id, "Play");

    await bot.api.setChatMenuButton({
        chat_id: ctx.from.id,
        menu_button: {
            text: "Play",
            type: "web_app",
            web_app: {url: process.env.APP_ENDPOINT + "?user_id=" + ctx.from.id,},
        }
    })

    const data = JSON.stringify({ "user_id": "" + ctx.from.id, "refer": ref_str})
    var base_url = URL + '/create_user'
    fetch(base_url, {
            method: "POST",
            body: data,
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
    )
});

bot.command('add_task',  async (ctx) => {
   await ctx.conversation.enter("greeting");
});

bot.on("message", async (ctx) => {
 await ctx.reply('Надо подумать...');
});


bot.start();
