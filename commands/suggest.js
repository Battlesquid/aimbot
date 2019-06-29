const Discord = require('discord.js');
// const RichEmbed = new Discord.RichEmbed();
module.exports = {
  action(args) {
        const channel = args[args.length - 1]['channel'];
        const msg = args[args.length - 1]['msg'];
    try {
      const suggestion = msg.content.split(/]\w+\s/)[1];
      const suggestions = channel.guild.channels.find(c => c.name === 'suggestions');
      const time = new Date(Date.now());
      const emb = new Discord.RichEmbed()
        .setTitle(`New suggestion from **${msg.author.tag}**`)
        .setFooter(`Suggested on ${time.toLocaleTimeString('en-US')}`, msg.author.avatarURL)
        .addField("Suggestion:", suggestion)
      .setColor(0x0cbaff);
      suggestions.send(emb);
    }
    catch(e) {
      msg.reply(e.message);
    }
  }, 
  desc: '',
  syntax: ''
}