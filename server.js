const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fetch = require('node-fetch');
server.listen(process.env.PORT || 5000);

io.on('connection', function (socket) {
  console.log(socket.id + " connected.");
  socket.on('validate', username => {
    if (username === "Battle squid" || username === "Oluwamayowa Esan") {
      console.log("Validation requested");
      const data = fetchGuildData();
      console.log(data);
      socket.emit('guildData', data);
    }
  });
  socket.on('guildChannelsRequest', data => {
    let charr = [];
    let guild = bot.guilds.find(g => g.id === data);
    let channels = guild.channels.filter(c => c.type === "text");
    channels.forEach(ch => {
      charr.push({
        name: ch.name,
        id: ch.id,
        guild: ch.guild.id
      });
    });
    // console.log(charr);
    socket.emit('guildChannelsResponse', charr);
  });
  socket.on('webhookRequest', data => {
    const g = bot.guilds.find(guild => guild.id === data.g);
    const ch = g.channels.find(channel => channel.id === data.ch);
    ch.fetchWebhooks()
      .then(hooks => {
        const bhook = hooks.find(h => h.name === "Battlesquid");
        if (bhook == undefined) {
          console.log("HOOK NOT FOUND, CREATING ONE NOW");
          ch.createWebhook('Battlesquid', "https://battlesquid.github.io/bsquad.png", "A communication webhook for Battlesquid")
            .then(hook => {
              console.log("CREATED NEW HOOK");
              socket.emit('webhookResponse', {
                hook: "https://discordapp.com/api/webhooks/" + hook.id + "/" + hook.token,
                ch: ch.id
              });
            });
        } else {
          console.log("HOOK FOUND, SENDING");
          console.log("https://discordapp.com/api/webhooks/" + bhook.id + "/" + bhook.token);
          socket.emit('webhookResponse', {
            hook: "https://discordapp.com/api/webhooks/" + bhook.id + "/" + bhook.token,
            ch: ch.id
          });
        }
      });
  });
  socket.on('disconnect', () => {
    console.log("User disconnected");
  });
});

const Discord = require('discord.js');
const bot = new Discord.Client();
const admin = require("firebase-admin");
const serviceAccount = require("./service.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lastlink-1d001.firebaseio.com/"
});


const db = admin.database();
const prefix = "]";
const categories = ['utility', 'misc', 'search', 'role'];
const rolealias = {
  "FF0000": "Red",
  "00FF00": "Green",
  "0000FF": "Blue",
  "FFA500": "Orange",
  "FFFF00": "Yellow",
  "00FFFF": "Cyan",
  "9400D3": "Violet"
};
let reactionListener;
const commands = {
  'qadd': {
    "action": (msg) => {
      let txt = msg.content.substring(6, msg.content.length);
      if (txt.length > 7) {
        db.ref('total').transaction(d => { return d + 1 }, (err, commit, val) => {
          console.log(val.val());
          db.ref('quotes/' + val.val()).set({
            t: txt.toString(),
            u: msg.author.tag
          });
          msg.reply("Added quote:**" + txt + "** at approximately " + new Date().toLocaleString());
        });
      }
      else {
        msg.reply("Quote must have more than 6 characters!");
      }
    },
    "desc": "Something funny or cool you wanna remember? Quote it with this command!",
    "syntax": prefix + "quadd [`String`]",
    "category": "utility"
  },
  'qget': function (msg) {
    let num = msg.content.substring(8, msg.content.length);
    console.log(num);
    console.log(typeof db.ref('quotes/200').key);
  },
  'invite': {
    "action": (msg) => {
      msg.reply("here's an invite link: https://discordapp.com/api/oauth2/authorize?client_id=488867331452436481&permissions=1879436369&scope=bot");
    },
    "desc": "Reply's with an invite link for adding me.",
    "syntax": prefix + "invite",
    "category": "misc"
  },
  'uptime': {
    "action": function (msg) {
      msg.channel.send('I have been up for ' + new Date(bot.uptime));
    },
    "desc": "Displays the bot's uptime",
    "syntax": prefix + "uptime",
    "category": "misc"
  },
  'botsay': {
    "action": function (msg) {
      msg.delete();
      let guild = bot.guilds.array().find(ch => ch.name === "SquadDev");
      // let guild = bot.guilds.array().find(ch => ch.name === "general");
      let channel = guild.channels.array().find(ch => ch.name === "general");
      channel.send('test');
    }
  },
  'wiki': {
    "action": function (msg) {
      let orig_query = msg.content.substring(6, msg.content.length);
      let parsed_query = orig_query.replace(/\s/g, "%20");
      let url = "https://en.wikipedia.org/w/api.php?action=query&srlimit=3&list=search&srsearch=" + parsed_query + "&utf8=&format=json";
      fetch(url)
        .then(response => response.json())
        .then(json => {
          msg.reply("I've found requested information for " + orig_query + ": https://en.wikipedia.org?curid=" + json['query']['search'][0]['pageid']);
        })
        .catch(err => {
          msg.reply("I was not able to find the page:" + err + ".");
        });
    },
    "desc": "Get a wikipedia page!",
    "syntax": prefix + "wiki [`Search Term`]",
    "category": "search"
  },
  'yt': {
    "action": msg => {
      let query = msg.content.substring(4, msg.content.length);
      let new_query = query.replace(/\s/g, "%20");
      console.log(new_query);
      if (query.search(/\w+/g) !== -1) {

        fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&type=video&q=" + new_query + "&key=AIzaSyBnOtD51arR9aHXweN4zkZXfKky8TojNk8")
          .then(response => response.json())
          .then(json => {
            console.log(json.items);
            msg.reply("I've found a video using the search query `" + query + "`: https://youtube.com/watch?v=" + json.items[0].id.videoId);
          });

      }
    },
    "desc": "Search Youtube given a search query!",
    "syntax": prefix + "yt [`Search Term`]",
    "category": "search"
  },
  'help': {
    "action": function (msg, cmd) {
      // console.log(msg.content.length);
      if (msg.content.length < 6) {

        let str = "";
        let emb;
        let category_arr = [];
        categories.forEach(cm => {
          str = "";
          // console.log("Category:" + cm);
          for (let i = 0; i < Object.keys(commands).length; i++) {
            if (commands[Object.keys(commands)[i]]['category'] === cm) {
              // console.log(Object.keys(commands)[i]);
              str = str + Object.keys(commands)[i] + "\n";
            }
          }
          if (str.length > 0)
            category_arr.push({
              "cmd": str,
              "cat": cm
            });
        });
        // console.log();
        // console.log(category_arr);
        emb = new Discord.RichEmbed()
          .setTitle("/Help Menu")
          .setColor(0xffbf00)
          .setFooter("Requested by " + msg.author.username, msg.author.avatarUrl);
        // console.log(categories.length);
        for (let i = 0; i < category_arr.length; i++) {
          emb.addField("[`" + category_arr[i].cat.toUpperCase() + "`]", category_arr[i].cmd, true);
        }
        msg.channel.send(emb);
      }
    }
  },
  "desc": {
    "action": msg => {
      let emb = new Discord.RichEmbed()
        .setTitle("[`/Help Menu/" + msg.content.substring(6, msg.content.length) + "`]")
        .setColor(0xffbf00)
        .setFooter("\:dart:")
        .addField("Description", commands[msg.content.substring(6, msg.content.length)]['desc']);
      msg.channel.send(emb);
    }
  },
  "rolepanel": {
    "action": msg => {
      let emb = new Discord.RichEmbed()
        .setTitle("[ROLES]")
        .setColor(0xffbf00)
        .setFooter("Need some help? Run `]desc initroles` for more detail!")
      msg.channel.send(emb);
    },
    "desc": "Initializes an empty role panel.",
    "category": "role"

  },
  "muda": {
    "action": msg => {
      if (msg.channel.name === "spam") {
        for (let i = 0; i < 50; i++) {
          msg.channel.send('MUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDAMUDA');
        }
      } else {
        msg.channel.send('Must be in a spam channel to run!');
      }
    },
    "desc": "MUDAMUDAMUDAMUDA",
    "category": "misc"
  },
  "ora": {
    action(msg) {
            if (msg.channel.name === "spam") {
        for (let i = 0; i < 50; i++) {
          msg.channel.send('ORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORA');
        }
      } else {
        msg.channel.send('Must be in a spam channel to run!');
      }
    },
    "desc": "ORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORAORA",
    "category": "misc"
  },
  "addpresets": {
    "action": msg => {
      let guild = msg.guild;
      let channel = msg.channel;

      let flag = guild.roles.find(r => r.name === "AIMBOTpresetFlag");
      if (flag) return;

      channel.fetchMessages({ limit: 10 })
        .then(messages => {
          let nmsg = messages.filter(m => m.embeds.length > 0).array()[0];
          let collection = bot.emojis.filter(emoji => emoji.name.includes("aimbot") && emoji.guild.name === "Aimbot Official");
          collection.sort();
          let n = new Discord.RichEmbed(nmsg.embeds[0]);
          collection.array().forEach((c, i) => {
            n.addField(rolealias[c.name.substring(6, c.name.length)], c, true);
            guild.createRole({
              name: rolealias[c.name.substring(6, c.name.length)],
              color: c.name.substring(6, c.name.length),
              hoist: false
            })
              .then(role => {
                nmsg.react(c);
              })
              .catch(e => {
                console.log(e);
              });
          });
          nmsg.edit("", n);
        });
      guild.createRole({
        name: "AIMBOTpresetFlag"
      });
      // let pos = guild.roles.find(r => r.name === "../Aimbot");
      // console.log(pos);
    },
    "desc": "Initializes a role panel with preset color roles.",
    "category": "role"
  }, 
  'hastebin': {
    action(msg) {
      msg.channel.send('https://hastebin.com/');
    }
  }
};
bot.on('ready', () => {
  // bot.user.setStatus('invisible')
  bot.user.setPresence({
    game: {
      name: prefix + 'help | ' + bot.guilds.array().length + ' servers',
      type: "PLAYING",
    }
  });
});

bot.on('message', message => {
  console.log(message.channel.type);
  if (message.channel.type !== 'dm') {
    console.log(message.content);
    // if(message.author.bot !== true && message.author.tagName !== "Battlesquid#0000") {
    let msg = "";
    let cmd = parseMessage(message.content);
    if (cmd !== undefined) {
      commands[cmd]["action"](message, cmd);
      console.log(commands[cmd]);
    }
    console.log(message.author.tag);
    if(message.author.tag !== "../Aimbot#1937") {
    if (message.content.includes("ORA")) {
      message.channel.send('MUDA');
    }
    if (message.content.includes("MUDA")) {
      message.channel.send('ORA');
    }
    }
    console.log(message.guild.name + "|" + message.channel.name + "| " + message.author.tag + ": " + message.content);
    message.attachments.forEach(img => {
      msg += img.url;
      console.log(img.url);
      console.log(msg);
    });
    db.ref('count').transaction(d => {
      return d + 1;
    }, (err, commit, val) => {
      db.ref('msg/' + message.guild.id + '/' + message.channel.id + "/" + val.val()).set({
        'un': message.author.tag,
        'pfp': message.author.avatarURL,
        'msg': msg.length > 0 ? msg + message.cleanContent : message.cleanContent,
        'g': message.guild.name,
        'ts': Date.now()
      });
    });
  }
});

const events = {
  MESSAGE_REACTION_ADD: 'messageReactionAdd',
  MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

bot.on('raw', async event => {
  if (!events.hasOwnProperty(event.t)) return;

  const { d: data } = event;
  const user = bot.users.get(data.user_id);
  const channel = bot.channels.get(data.channel_id) || await user.createDM();

  if (channel.messages.has(data.message_id)) return;

  const message = await channel.fetchMessage(data.message_id);
  const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
  const reaction = message.reactions.get(emojiKey);

  bot.emit(events[event.t], reaction, user);
});

bot.on('messageReactionAdd', (reaction, user) => {
  if (user.bot !== true && user.username !== "Battlesquid") {
    console.log(`${user.username} reacted with "${reaction.emoji.name}".`);
    reaction.message.guild.fetchMember(user)
      .then(guildmember => {
        let role = reaction.message.guild.roles.find(r => r.name === rolealias[reaction.emoji.name.substring(6, reaction.emoji.name.length)]);
        console.log(role.position)
        guildmember.roles.has(role.id) ? guildmember.removeRole(role) : guildmember.addRole(role);
      });
    reaction.remove(user);
  }
});

bot.on('messageReactionRemove', (reaction, user) => {
  console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
});

function parseMessage(msg) {
  if (msg.startsWith(prefix)) {
    return Object.keys(commands).find(cmd => msg.match(new RegExp("]" + cmd, "g")));
  }
}

function help(msg) {
  msg.channel.send("I am a Multipurpose bot. Find out more about me on https://battlesquid.github.io/NgeriaBot");
}

function fetchGuildData() {
  let glist = [];
  bot.guilds.forEach(guild => {
    glist.push({
      abbrev: guild.nameAcronym,
      name: guild.name,
      id: guild.id,
      icon: guild.iconURL,
      channels: guild.channels.array().length
    });
    console.log(guild.name);
    // console.log(guild.icon);
  });
  return glist;
  console.log(glist);
}

function fetchClientInfo() {
  let serverlist = [];
  let gn = bot.guilds.array().length;
  let cn = bot.channels.array().filter(c => c.type === "text").length;
  console.log("Total Channels:" + cn)
  let req = new Promise((resolve, reject) => {
    if (cn === serverlist.length) resolve(serverlist);
  });
  req.then(list => {
    console.log(list);
  });



  bot.guilds.forEach(guild => {
    let nch = guild.channels.filter(c => c.type === "text");
    nch.forEach(ch => {
      ch.fetchWebhooks()
        .then(hooks => {
          if (hooks.find(h => h.name === "Battlesquid") == undefined) {
            console.log("No webook in " + ch.name);
            ch.createWebhook("Battlesquid", "https://battlesquid.github.io/bsquad.png", "A communication webhook for Battlesquid")
              .then(hook => {
                console.log("Created Hook!");
                serverlist.push({
                  guild: guild.name,
                  channel: ch.name,
                  url: "https://discordapp.com/api/webhooks/" + hook.id + "/" + hook.token
                });
                console.log(serverlist.length);
              })
              .catch(err => { });
          } else {
            let hook = hooks.find(h => h.name === "Battlesquid");
            // console.log("Webhook already exists");
            // console.log("URL:https://discordapp.com/api/webhooks/" + hook.id + "/" + hook.token);
            // serverlist[ch.name] = "https://discordapp.com/api/webhooks/" + hook.id + "/" + hook.token ;
            serverlist.push({
              guild: guild.name,
              channel: ch.name,
              url: "https://discordapp.com/api/webhooks/" + hook.id + "/" + hook.token
            });
            console.log(serverlist.length);
          }
        })
        .catch(err => { });
    });
  });
}
// console.log(bot.guilds);
bot.login("NDg4ODY3MzMxNDUyNDM2NDgx.Dnic0g.mPy6CJwycCLeIfLncIz_KgeL1yg");

