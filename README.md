<img width="1200" height="800" alt="fobot" src="https://github.com/user-attachments/assets/01d5b89c-dd23-4329-bb0b-f8aef365592e" />

A simple Node.js-based Discord status bot for FOnline. Reworked old Zaika code.

<img width="265" height="106" alt="image" src="https://github.com/user-attachments/assets/1895c3ff-b7b5-4f5f-bed8-f414712f7df7" />

#

Docker / Podman:
1. Build container image ```docker build -t fonline-bot .```
1. Create and run the container ```docker run -d -p 44861:44861 --name fo-bot -e TOKEN={token-goes-here} -e SERVER_ADDRESS=game.fonline-aop.net -e SERVER_PORT=4000 fonline-bot```
History of online can be viewed through logs of container:
```docker container logs fo-bot```

Normal:
1. Fill out the token, server IP address and server port number constants inside bot.js
1. Install dependencies ```npm install```
1. Run the bot ```node bot.js```

#
