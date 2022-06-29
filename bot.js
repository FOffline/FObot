const config   = require("./config.json");
const net      = require('net');
const Discord  = require('discord.js');
const client   = new Discord.Client( { intents: ["GUILDS", "GUILD_MESSAGES"]  } );

client.on("ready", function()
{
    bot_FOnline();
});

client.login(config.token);

let buff = Buffer.from( [0xFF, 0xFF, 0xFF, 0xFF] );
let onlineLast = 0;

function bot_FOnline()
{
    var connection = new net.Socket();
    connection.setTimeout(10000);
    connection.connect(config.serverPort, config.serverAddress, function ()
    {
        console.log(`Writing ${buff}`)
        connection.write(buff);
    });

	connection.on('data', function (data)
	{
        console.log('Received: ' + data);

        var buffer = Buffer.from(' ', "hex" );
        buffer = Buffer.concat(
        [
            buffer, Buffer.from(data, "hex" )
        ]);

        online = buffer.readUInt32LE(0);
        uptimeRaw = buffer.readUInt32LE(4);
        
        if (online != '') 
	    {
            console.log("Online: " + online);

            var date = new Date( Math.round( uptimeRaw * 1000 ) );
            uptimeString = "Up: " + date.getHours() + "h";
            console.log(uptimeString);

            if( onlineLast < online && (online - onlineLast) > 5 )
                changeString = "Ch: ⇑";
            else if( onlineLast < online ) 
                changeString = "Ch: ⇗";
            else if( onlineLast > online && (onlineLast - online) > 5  )
                changeString = "Ch: ⇓";
            else if( onlineLast > online )
                changeString = "Ch: ⇘";
            else
                changeString = "Ch: -";

            client.user.setActivity(online + " " + changeString + " " + uptimeString);
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

