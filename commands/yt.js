const fetch = require('node-fetch');
module.exports = {
    action(args) {
        const channel = args[args.length - 1]['channel'];
        const msg = args[args.length - 1]['msg'];

        try {
            let query = msg.content.substring(4, msg.content.length);
            let new_query = query.replace(/\s/g, "%20");
            console.log(new_query);
            if (query.search(/\w+/g) !== -1) {

                fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&type=video&q=" + new_query + "&key=AIzaSyBnOtD51arR9aHXweN4zkZXfKky8TojNk8")
                    .then(response => response.json())
                    .then(json => {
                        console.log(json.items);
                        msg.reply("I've found a video using the search query `" + query + "`: https://youtube.com/watch?v=" + json.items[0].id.videoId);
                    })
                    .catch(e => {
                        channel.send(e.message);
                        console.log(e);
                    })
            }
        } catch (e) {
            console.warn(e);
            channel.send(e.message);
        }
    },
    desc: "Searches YouTube given a search query.",
    syntax: process.env.TOKEN + "yt [`Search Term`]",
    category: "utility"
}