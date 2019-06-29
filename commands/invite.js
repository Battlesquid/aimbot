module.exports = {
  action(args) {
    try {
      const msg = args[args.length - 1]['msg'];
    msg.reply("here's an invite link: https://discordapp.com/api/oauth2/authorize?client_id=488867331452436481&permissions=1879436369&scope=bot");
    }
    catch(e) {
      console.error(e);
    }
  }, 
  desc: 'Replies with a link to invite Aimbot to your server',
  syntax: `${process.env.PREFIX}invite`
}