<img width="513" height="258" alt="fobot" src="https://github.com/user-attachments/assets/11053caf-1597-44b8-adcb-576fee8ea284" />

A simple Node.js-based Discord status bot for FOnline (reworked old Zaika code).

#

Added variables validation, more logs and statuses in case of errors, and other minor code improvements.

New adjustable status display based on ActivityType.Custom. 

More to come.

#

Docker / Podman:
1. Build container image ```docker build -t fonline-bot .```
1. Create and run the container ```docker run -d -p 44861:44861 --name fo-bot -e TOKEN={token-goes-here} -e SERVER_ADDRESS=game.fonline-aop.net -e SERVER_PORT=4000 fonline-bot```
1. History of online can be viewed through logs of container:
```docker container logs fo-bot```

Classic:
1. Fill out the token, server IP address and server port number constants inside bot.js or handle that via environment variables on your hosting
1. Install dependencies ```npm install```
1. Run the bot ```node bot.js```

#

Latest builds:


https://github.com/FOffline/FObot/releases/tag/v1.0.0
<img width="265" height="106" alt="image" src="https://github.com/user-attachments/assets/1895c3ff-b7b5-4f5f-bed8-f414712f7df7" />

<img width="265" height="106" alt="image" src="https://github.com/user-attachments/assets/561fc6c8-1003-48ed-90e5-4efc64dc881e" />


[symbol based on total online][symbol based on gain/loss in comparison to previous ping][total online + text][symbol][uptime + text]

