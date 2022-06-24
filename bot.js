const config   = require("./config.json");
const net      = require('net');
const Discord  = require('discord.js'); 
const client   = new Discord.Client( { intents: ["GUILDS", "GUILD_MESSAGES"]  } );  

client.on("ready", function()
{
    bot_FOnline();
});

client.login(config.token);

let buff = new Buffer([0xFF, 0xFF, 0xFF, 0xFF]); 

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

        var buffer = new Buffer('', 'hex');
        buffer = Buffer.concat(
        [
            buffer, new Buffer(data, 'hex')
        ]);

        online = buffer.readUInt32LE(0);
        
        console.log("Online is " +online)

        if (online != '') 
		{
            client.user.setActivity("Online: " +online)
        }
        connection.destroy();
    });
            
	connection.on('error', function (err) 
	{
        client.user.setActivity("Bad omen! Can't reach Core!")
        connection.destroy();
    });

	setTimeout(bot_FOnline, 50000);
}

