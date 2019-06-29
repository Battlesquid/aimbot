const fetch = require('node-fetch');
module.exports = {
  action(args) {
    const msg = args[args.length - 1]['msg'];
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
  desc: 'Retrieve a wikipedia page!',
  syntax: `${process.env.PREFIX}wiki [\`Search Term\``
}

  // 'wiki': {
  //   "action": function (msg) {
  //     let orig_query = msg.content.substring(6, msg.content.length);
  //     let parsed_query = orig_query.replace(/\s/g, "%20");
  //     let url = "https://en.wikipedia.org/w/api.php?action=query&srlimit=3&list=search&srsearch=" + parsed_query + "&utf8=&format=json";
  //     fetch(url)
  //       .then(response => response.json())
  //       .then(json => {
  //         msg.reply("I've found requested information for " + orig_query + ": https://en.wikipedia.org?curid=" + json['query']['search'][0]['pageid']);
  //       })
  //       .catch(err => {
  //         msg.reply("I was not able to find the page:" + err + ".");
  //       });
  //   },
  //   "desc": "Get a wikipedia page!",
  //   "syntax": prefix + "wiki [`Search Term`]",
  //   "category": "search"
  // }