const token = process.env.TOKEN;
const serverAddress = process.env.SERVER_ADDRESS;
const serverPort = parseInt(process.env.SERVER_PORT, 10);

if (!token || !serverAddress || isNaN(serverPort)) {
    console.error("Missing or invalid environment variables. Please set TOKEN, SERVER_ADDRESS, and SERVER_PORT.");
    process.exit(1);
}

const net = require('net');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.on("ready", () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    bot_FOnline();
});

client.login(token);

const buff = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]);
let onlineLast = 0;

function bot_FOnline() {
    try {
        const connection = new net.Socket();
        connection.setTimeout(10000);

        connection.connect(serverPort, serverAddress, () => {
            connection.write(buff);
        });

        connection.on('data', (data) => {
            if (data.length >= 8) {
                const online = data.readUInt32LE(0);
                const uptimeRaw = data.readUInt32LE(4);
                console.log(`${(new Date).toLocaleTimeString()} Online: ${online}`);

                const totalHours = Math.floor(uptimeRaw / 3600);
                const days = Math.floor(totalHours / 24);
                let uptimeString; // Declare uptimeString here
                if (totalHours === 1) {
                    uptimeString = "1 hour";
                } else if (totalHours > 1 && totalHours < 24) {
                    uptimeString = `${totalHours} hours`;
                } else if (days === 1) {
                    uptimeString = "1 day";
                } else {
                    uptimeString = `${days} days`;
                }

                let changeSymbol;
                if (onlineLast < online) {
                    changeSymbol = `🟡`;
                } else if (onlineLast > online) {
                    changeSymbol = `🔴`;
                } else {
                    changeSymbol = `🟢`;
                }

                if (client?.user) {
                    const playerText = online === 1 ? 'wastelander' : 'wastelanders';
                    client.user.setActivity({
                        name: `${changeSymbol} ${online} ${playerText}   🕒 ${uptimeString}`,
                        type: ActivityType.Custom
                    });
                }
                onlineLast = online; 
            } else {
                console.warn("Received less than 8 bytes from server, cannot parse online and uptime.");
                if (client?.user) {
                    client.user.setActivity({
                        name: "🕱 Data Error 🕱",
                        type: ActivityType.Custom
                    });
                }
            }
            connection.destroy(); 
        });

        connection.on('error', (err) => {
            console.error(`Connection error: ${err.message}`);
            if (client?.user) {
                client.user.setActivity({
                    name: "🕱 Offline 🕱",
                    type: ActivityType.Custom
                });
            }
            connection.destroy();
        });

        connection.on('timeout', () => {
            console.warn("Connection timed out.");
            if (client?.user) {
                client.user.setActivity({
                    name: "🕱 Offline (Timeout) 🕱",
                    type: ActivityType.Custom
                });
            }
            connection.destroy();
        });

        // Schedule next poll
        setTimeout(bot_FOnline, 60000);
    } catch (error) {
        console.error("Unexpected error in bot_FOnline:", error);
        if (client?.user) {
            client.user.setActivity({
                name: "🕱 Error 🕱",
                type: ActivityType.Custom
            });
        }
        setTimeout(bot_FOnline, 60000);
    }
}
