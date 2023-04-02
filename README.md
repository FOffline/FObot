# fonline-bot
Simple FOnline Discord status bot:

![alt text](https://files.catbox.moe/ypat2w.png)
#
## Running:

Docker / Podman:

1. Build container image ```docker build -t fonline-bot .```

1. Create and run the container ```docker run -d -p 44861:44861 --name fo-bot -e TOKEN={token-goes-here} -e SERVER_ADDRESS=game.fonline-aop.net -e SERVER_PORT=4000 fonline-bot```

Classic:

1. Fill out the token, server IP address and server port number constants inside bot.js
1. Install dependencies ```npm install```
1. Run the bot ```node bot.js```

History of online can be viewed through logs of container:

```docker container logs fo-bot```
#
