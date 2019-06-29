const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

const cmds = {};
const prefix = process.env.PREFIX;

async function loadcommands() {
    fs.readdir('commands', (err, files) => {
        if (err)
            console.error(err);
        files.forEach(file => {
            const name = file.split('.js')[0];
            cmds[name] = require(`./commands/${name}`);
        });
    });
}

bot.on('ready', () => {
    bot.user.setStatus('online');
    bot.user.setPresence({
        game: {
            name: prefix + 'help | ' + bot.guilds.array().length + ' servers',
            type: "PLAYING"
        }
    });
    loadcommands();
});

bot.on('message', msg => {
    if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(prefix.length).trim().split(/ +/g);
        args.push({});
      args[args.length - 1]['msg'] = msg;
      args[args.length - 1]['channel'] = msg.channel;
        const command = args.shift().toLowerCase();
        cmds[command].action(args);
    }
});

bot.login(process.env.TOKEN);

// console.log((new Date(Date.now())).getTimezoneOffset())