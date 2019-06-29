module.exports = {
  action(args) {
    const msg = args[args.length - 1]['msg'];
    msg.channel.send(`I have been up for`)
  }
}

// 'uptime': {
//     "action": function (msg) {
//       msg.channel.send('I have been up for ' + new Date(bot.uptime));
//     },
//     "desc": "Displays the bot's uptime",
//     "syntax": prefix + "uptime",
//     "category": "misc"
//   }