const token = process.env.TOKEN;
const serverAddress = process.env.SERVER_ADDRESS;
const serverPort = process.env.SERVER_PORT;

const net      = require('net');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client(
{
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
	],
});

client.on("ready", function()
{
    bot_FOnline();
});

client.login(token);

let buff = Buffer.from( [0xFF, 0xFF, 0xFF, 0xFF] );
let onlineLast = 0;

function bot_FOnline()
{
    try
    {
        var connection = new net.Socket();
        connection.setTimeout(10000);

        connection.connect(serverPort, serverAddress, function()
        {
            connection.write(buff);
        });

        connection.on('data', function (data)
        {
        var buffer = Buffer.from(' ', "hex" );
        buffer = Buffer.concat([buffer, Buffer.from(data, "hex" )]);

        online = buffer.readUInt32LE(0);
        uptimeRaw = buffer.readUInt32LE(4);

        if (online != '')
        {
            console.log( (new Date).toLocaleTimeString() + " Online: " + online);

            var date = new Date( Math.round( uptimeRaw * 1000 ) );
            uptimeString = date.getHours() + "h";

            change = Math.abs(onlineLast - online);

            if( onlineLast < online && (online - onlineLast) > 5 )
                changeString = `+${change} ⇑`;
            else if( onlineLast < online )
                changeString = `+${change} ⇗`;
            else if( onlineLast > online && (onlineLast - online) > 5  )
                changeString = `-${change} ⇓`;
            else if( onlineLast > online )
                changeString = `-${change} ⇘`;
            else
                changeString = `-`;

            client.user.setActivity(`Online: ${online} Uptime: ${uptimeString}`);
            onlineLast = online;
        }
        connection.destroy();
        });

        connection.on('error', function (err)
        {
            client.user.setActivity("Bad omen! Can't reach Core!")
            connection.destroy();
        });

        setTimeout(bot_FOnline, 60000);
    }
    catch (error)
    {
        console.log(error);
    }
}

