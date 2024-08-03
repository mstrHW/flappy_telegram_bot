const process = require('process');
require('dotenv').config();
// import fetch from 'node-fetch';
const request = require('request');
const { Api, Bot, Context, session} = require('grammy');
const { Menu } = require("@grammyjs/menu");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
const {webhookCallback} = require('grammy');
const bot = new Bot(process.env.BOT_API_KEY);
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
const URL = "https://flappybotback-4fm7p9xx.b4a.run";
const express = require("express");

const app = express(); // or whatever you're using
app.use(express.json()); // parse the JSON request body

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

async function remove_task(conversation, ctx) {
    await ctx.reply("Type task id");
    ctx = await conversation.wait();
    const task_id = ctx.message?.text;

    const data = JSON.stringify({
        "task_id": task_id
    })
    var base_url = URL + '/remove_task';
    fetch(base_url, {
            method: "POST",
            body: data,
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
    )
}

async function user_tasks(conversation, ctx) {
    await ctx.reply("Type user id");
    ctx = await conversation.wait();
    const user_id = ctx.message?.text;

    var base_url = URL + '/get_tasks/' + user_id;
    var status;
    fetch(base_url, {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
    ).then((res) => {
        status = res.status;
        return res.json()
      })
      .then((jsonResponse) => {
            // console.log(jsonResponse);
            // console.log(typeof jsonResponse);
            // console.log(jsonResponse["tasksList"]);
            // console.log(jsonResponse.tasksList);
            var message = "id:title:status\n";
            for (var _item in jsonResponse["tasksList"])
            {
                var item = jsonResponse["tasksList"][_item];
                message += "" + item["task_id"] + ":" + item["title"] + ":" + item["status"] + "\n";
            }
            ctx.reply(message);
            console.log(status);
      })
      .catch((err) => {
        // handle error
        console.error(err);
      });
}

bot.use(createConversation(greeting));
bot.use(createConversation(remove_task));
bot.use(createConversation(user_tasks));

bot.command('start', async (ctx) => {
    // await ctx.reply(
    // 'Привет! Я - Бот 🤖',
    // );
    console.log(ctx.from.id);
    console.log(ctx.message.text);
    const myArray = ctx.message.text.split(" ");
    var ref_str = "";
    if (myArray.length > 1)
    {
        ref_str = myArray[1];
    }
    console.log(ref_str);
    await bot.api.sendMessage(ctx.from.id, "Start to Play!");

    await bot.api.setChatMenuButton({
        chat_id: ctx.from.id,
        menu_button: {
            text: "Play",
            type: "web_app",
            web_app: {url: process.env.APP_ENDPOINT + "?user_id=" + ctx.from.id,},
        }
    })
    // console.log({chat_id: process.env.BOT_NAME, name: "" + ctx.from.id});
    // const invite = await bot.api.createChatInviteLink(process.env.BOT_NAME, {name: "" + ctx.from.id})
    // console.log(invite);
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

const menu = new Menu("movements")
      .text("Add task", (ctx) => ctx.conversation.enter("greeting")).row()
      .text("Remove task", (ctx) => ctx.conversation.enter("remove_task"))
      .text("User tasks", (ctx) => ctx.conversation.enter("user_tasks"));
   // await ctx.conversation.enter("greeting");
    bot.use(menu);

bot.command('tasks',  async (ctx) => {
    await ctx.reply("Tasks menu", {
    reply_markup: menu,
  });
});

bot.command('add_task',  async (ctx) => {
   await ctx.conversation.enter("greeting");
});

bot.command('accept_user_task',  async (ctx) => {
    var items = ctx.message.text.split(" ");
    if (items.length < 3)
    {
        await ctx.reply("Failed");
        return;
    }
    const data = JSON.stringify({ "user_id": "" + items[1], "task_id": items[2]})
    var base_url = URL + '/approve_task'
    fetch(base_url, {
            method: "POST",
            body: data,
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
    )
});

bot.on("message", async (ctx) => {
 await ctx.reply('Надо подумать...');
});


app.use(webhookCallback(bot, "express"));
app.listen(5000, () => console.log(`listening on port 5000`));