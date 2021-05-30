const Discord = require('discord.js');
const fs = require('fs');

function giveUserMoney(client, message){
	let chop = message.content.split(" ");
	if(chop.length != 4){
		message.channel.send('Usage: !cc giveCarlCoin user amount');
	}
	else{
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let mentionOK = true;
		let buyer = 0;
		try{
			buyer = getUserFromMention(client,chop[chop.length-2]).id;
		}
		catch(err){
			message.channel.send('Invalid user selected!');
			mentionOK = false;
		}
		if(mentionOK){
			let price = parseInt(chop[chop.length-1]);
			if(isNaN(price)){
				message.channel.send('Invalid amount entered!');
				return;
			}
			else{
				for(let i=0;i<data.users.length;i++){
					if(data.users[i].id == buyer){
						data.users[i].balance += price;
						data.econ += price;
						console.log(data.users[i].name + ' has been bestowed ' + price + 'CC');
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have been bestowed ${price} CarlCoin!`);
						return;
					}
				}
			}
		}
	}
}

function summonGaintCoin(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	data.raffleRNG = 0
	console.log('giant coin has been summoned');
	let newData = JSON.stringify(data);
	fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
	message.channel.send(`A Giant Coin is about to appear!`);
}
// !cc leaveServer serverID
function leaveServer(client,message){
	let chop = message.content.split(" ");
	if(chop.length != 3){
		let servers = '';
		client.guilds.cache.forEach(guild => {servers += `${guild.name} | ${guild.id}\n`;});
		message.channel.send(`Usage: !cc leaveServer <serverID>\n${servers}`);
	}
	else{
		let server;
		let serverID = chop[chop.length - 1];
		let guildOK = true;
		console.log(serverID + ' server to be left');
		try{
			server = client.guilds.cache.get(serverID);
		}
		catch(err){
			message.channel.send('Invalid server selected!');
			guildOK = false;
		}
		if(guildOK){
			console.log('leaving server');
			server.leave().then(g => console.log(`Left the guild ${g}`)).catch(console.error);
		}
		else{
			console.log('failed to leave server');
		}
	}
}

function getUserFromMention(client,mention) {
	if (!mention) return;
	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

module.exports = {
	giveUserMoney,
	summonGaintCoin,
	leaveServer
};