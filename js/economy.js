const Discord = require('discord.js');
const fs = require('fs');

function checkEcon(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let houseCount = 0;
	let apartmentCount = 0;
	let skyCount = 0;
	let horses = 0;
	let carlball = data.carlball;
	console.log(message.author.username + ' is checking the econ');
	//searches for highest and lowest earner
	for(let i=0;i<data.users.length;i++){
		if(data.users[i]["house"] > 0 && !isNaN(data.users[i]["house"])){
			houseCount += data.users[i]["house"];
		}
		if(data.users[i]["apartment"] > 0 && !isNaN(data.users[i]["apartment"])){
			apartmentCount += data.users[i]["apartment"];
		}
		if(data.users[i]["skyscraper"] > 0 && !isNaN(data.users[i]["skyscraper"])){
			skyCount += data.users[i]["skyscraper"];
		}
		if(data.users[i].hasOwnProperty("horses")){
			if(data.users[i].horses.length > 0){
				horses += data.users[i].horses.length;
			}
		}
	}
	const econEmbed = new Discord.MessageEmbed()
		.setColor('#F7931A')
		.setTitle(`The Carl Coin Economy`)
		.setThumbnail('https://i.imgur.com/0aDFif9.png')
		.addFields(
			{ name: 'Carl Coin Circulating', value: `${data.econ}CC`},
			{ name: 'Users Registered', value: `${data.users.length}`},
			{ name: 'CarlBall Jackpot', value: `${carlball}CC`, inline: true },
			{ name: 'Blackjack Pot', value: `${data.blackjack}CC`, inline: true },
			{ name: '\u200B', value: `\u200B`, inline: true },
			{ name: 'Mines', value: `${data.welfare}CC`, inline: true },
			{ name: '\u200B', value: `\u200B`, inline: true },
			{ name: '\u200B', value: `\u200B`, inline: true },
			{ name: 'Homes', value: `${houseCount}`, inline: true },
			{ name: 'Apartments', value: `${apartmentCount}`, inline: true },
			{ name: 'Skyscrapers', value: `${skyCount}`, inline: true },
			{ name: 'Horses', value: `${horses}`, inline: true },
		)
	message.channel.send(econEmbed);
}

//export functions
module.exports = {
	checkEcon
};