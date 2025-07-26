const net = require('net');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

// Load environment variables
const token = process.env.TOKEN;
const serverAddress = process.env.SERVER_ADDRESS;
const serverPort = parseInt(process.env.SERVER_PORT, 10);

// Validate environment variables
if (!token || !serverAddress || isNaN(serverPort)) {
    console.error("Missing or invalid environment variables. Please set TOKEN, SERVER_ADDRESS, and SERVER_PORT.");
    process.exit(1);
}

// Initialize Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

// Event listener for when the bot is ready
client.once("ready", async () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    // Initiate the first online check when the bot starts
    bot_FOnline();
});

// Event listener for Discord.js errors
client.on('error', error => {
    console.error('A Discord.js error occurred:', error);
});

// Log in to Discord with your bot token
client.login(token);

// Buffer to send to the game server (e.g., a status request)
const buff = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]);
let onlineLast = 0; // Stores the previously reported online player count

/**
 * Schedules the next execution of the bot_FOnline function.
 * This ensures the function runs periodically (every 60 seconds).
 */
function scheduleNextUpdate() {
    setTimeout(bot_FOnline, 60000); // Schedule to run again in 60 seconds (1 minute)
}

/**
 * Connects to the game server, requests online player data,
 * and updates the bot's Discord activity status.
 */
function bot_FOnline() {
    const connection = new net.Socket();
    connection.setTimeout(10000); // Set a timeout for the connection (10 seconds)

    // Attempt to connect to the game server
    connection.connect(serverPort, serverAddress, () => {
        console.log(`Connected to server at ${serverAddress}:${serverPort}`);
        connection.write(buff); // Send the request buffer
    });

    // Handle data received from the server
    connection.on('data', (data) => {
        if (data.length >= 8) {
            // Read online players (first 4 bytes, Little Endian)
            const online = data.readUInt32LE(0);
            // Read uptime (next 4 bytes, Little Endian)
            const uptimeRaw = data.readUInt32LE(4);
            console.log(`${(new Date).toLocaleTimeString()} Online: ${online}`);

            // Calculate uptime in a human-readable format
            const totalHours = Math.floor(uptimeRaw / 3600);
            const days = Math.floor(totalHours / 24);
            let uptimeString;

            if (totalHours < 24) {
                if (totalHours === 1) {
                    uptimeString = "1 hour";
                } else {
                    uptimeString = `${totalHours} hours`;
                }
            } else {
                if (days === 1) {
                    uptimeString = "1 day";
                } else {
                    uptimeString = `${days} days`;
                }
            }

            // Determine the change symbol (up, down, or no change)
            let changeSymbol;
            if (onlineLast < online) {
                changeSymbol = `🡅`; // Up arrow
            } else if (onlineLast > online) {
                changeSymbol = `🡇`; // Down arrow
            } else {
                changeSymbol = `●`; // Dot (no change)
            }

            // Determine the online tier symbol (based on player count)
            let onlineTierSymbol;
            if (online === 0) {
                onlineTierSymbol = `⚫`; // Black circle (offline)
            } else if (online >= 1 && online <= 9) {
                onlineTierSymbol = `🔴`; // Red circle (low players)
            } else if (online >= 10 && online <= 19) {
                onlineTierSymbol = `🟠`; // Orange circle (medium players)
            } else if (online >= 20 && online <= 29) {
                onlineTierSymbol = `🟡`; // Yellow circle (higher players)
            } else {
                onlineTierSymbol = `🔥`; // Fire (many players)
            }

            // Update the bot's Discord activity
            if (client?.user) {
                const playerText = online === 1 ? 'player' : 'players';
                client.user.setActivity({
                    name: `${onlineTierSymbol} ${changeSymbol} ${online} ${playerText} 🕒 ${uptimeString}`,
                    type: ActivityType.Custom // Custom status
                });
            }
            onlineLast = online; // Update the last known online count
        } else {
            // If data is less than 8 bytes, it's not the expected format
            console.warn("Received less than 8 bytes from server, cannot parse online and uptime.");
            if (client?.user) {
                client.user.setActivity({
                    name: "⚠️ Data Error!",
                    type: ActivityType.Custom
                });
            }
        }
        connection.destroy(); // Close the connection after receiving data
        scheduleNextUpdate(); // Schedule the next check
    });

    // Handle connection errors
    connection.on('error', (err) => {
        console.error(`Connection error: ${err.message}`);
        if (client?.user) {
            client.user.setActivity({
                name: "⛔ Offline!",
                type: ActivityType.Custom
            });
        }
        connection.destroy(); // Destroy the connection on error
        scheduleNextUpdate(); // Schedule the next check
    });

    // Handle connection timeouts
    connection.on('timeout', () => {
        console.warn("Connection timed out.");
        if (client?.user) {
            client.user.setActivity({
                name: "⛔ Offline!",
                type: ActivityType.Custom
            });
        }
        connection.destroy(); // Destroy the connection on timeout
        scheduleNextUpdate(); // Schedule the next check
    });
}
