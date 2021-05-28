const Discord = require('discord.js');
const fs = require('fs');

// !cc giveCarlCoin user amount

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
		console.log(buyer);
		if(mentionOK){
			let price = parseInt(chop[chop.length-1]);
			if(isNaN(price) || price < 0){
				message.channel.send('Invalid amount entered!');
				return;
			}
			else{
				for(let i=0;i<data.users.length;i++){
					if(data.users[i].id == buyer){
						data.users[i].balance += price;
						data.econ += price;
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
	
	let newData = JSON.stringify(data);
	fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
	message.channel.send(`A Giant Coin is about to appear!`);
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
	summonGaintCoin
};