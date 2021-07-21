const Discord = require('discord.js');
const fs = require('fs');

function auditUser(client,message){
	let chop = message.content.split(" ");
	//if too many arguments
	if(chop.length != 3){
		message.channel.send(`Usage: !cc audit <user>`);
	}
	else{
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
		let bankJSON = JSON.parse(bankFile);
		//stores user
		let user = "";
		let id = 0;
		let corrUser = true;
		let notFound = true;
		try{
			user = getUserFromMention(client,chop[chop.length-1]).username;
			id = getUserFromMention(client,chop[chop.length-1]).id;
		}
		//if username cannot be gotten
		catch(err){
			message.channel.send(`Invalid recipient`);
			corrUser = false;
		}
		if(corrUser && id != message.author.id){
			//checks for name
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == id){
					let bankValue = 0;
					for(let j=0;j<bankJSON.users.length;j++){
						if(data.users[i].id == bankJSON.users[j].id){
							bankValue = bankJSON.users[j].balance;
							break;
						}
					}
					bankValue = Math.floor(bankValue / 2);
					let personalTax = Math.floor(((data.users[i].balance + bankValue) / data.econ) * 100) + 1;
					console.log('bank val ' + bankValue + ' user val ' + data.users[i].balance + ' pers tax ' + personalTax);
					//sanity
					let sanity = "Fine";
					if(isNaN(data.users[i]["unstable"])){
						data.users[i]["unstable"] = 0;
					}
					if(data.users[i]["unstable"] < 10){
						sanity = "Fine";
					}
					else if(data.users[i]["unstable"] >= 10 && data.users[i]["unstable"] < 25){
						sanity = "Uneasy";
					}
					else if(data.users[i]["unstable"] >= 25 && data.users[i]["unstable"] < 50){
						sanity = "Awful";
					}
					else if(data.users[i]["unstable"] >= 50 && data.users[i]["unstable"] < 75){
						sanity = "Stressed";
					}
					else if(data.users[i]["unstable"] >= 75 && data.users[i]["unstable"] < 100){
						sanity = "Paranoid";
					}
					else if(data.users[i]["unstable"] >= 100 && data.users[i]["unstable"] < 200){
						sanity = "Irrational";
					}
					else if(data.users[i]["unstable"] >= 200){
						sanity = "Unstable";
					}
					let messageToSend = ``;
					if(data.users[i]["claim"] < Date.now()){
					messageToSend += `You can work!\n`
					}
					else{
						let timeLeftClaim = data.users[i]["claim"] - Date.now();
						timeLeftClaim = Math.floor(timeLeftClaim / 1000);
						timeLeftClaim = Math.floor(timeLeftClaim / 60);
						messageToSend += `You have ${timeLeftClaim} mins left before you can work again\n`
					}
					
					if(data.users[i]["relax"] < Date.now()){
						messageToSend += `You can relax!\n`
					}
					else{
						let timeLeftRelax = data.users[i]["relax"] - Date.now();
						timeLeftRelax = Math.floor(timeLeftRelax / 1000);
						timeLeftRelax = Math.floor(timeLeftRelax / 60);
						messageToSend += `You have ${timeLeftRelax} mins left before you can relax again\n`
					}
					
					//buildings and balance
					let balance = data.users[i].balance;
					let homes = data.users[i]["house"];
					if(isNaN(homes)){
						homes = 0;
					}
					let apartments = data.users[i]["apartment"];
					if(isNaN(apartments)){
						apartments = 0;
					}
					let skyscrapers = data.users[i]["skyscraper"];
					if(isNaN(skyscrapers)){
						skyscrapers = 0;
					}
					
					let cities = data.users[i]["city"];
					if(isNaN(cities)){
						cities = 0;
					}
					let countries = data.users[i]["country"];
					if(isNaN(countries)){
						countries = 0;
					}
					let stations = data.users[i]["station"];
					if(isNaN(stations)){
						stations = 0;
					}
					
					
					
					//stats
					let str = data.users[i]["STR"];
					if(isNaN(str)){
						str = 0;
						data.users[i]["STR"] = 0;
					}
					let dex = data.users[i]["DEX"];
					if(isNaN(dex)){
						dex = 0;
						data.users[i]["DEX"] = 0;
					}
					let con = data.users[i]["CON"];
					if(isNaN(con)){
						con = 0;
						data.users[i]["CON"] = 0;
					}
					let inte = data.users[i]["INT"];
					if(isNaN(inte)){
						inte = 0;
						data.users[i]["INT"] = 0;
					}
					let wis = data.users[i]["WIS"];
					if(isNaN(wis)){
						wis = 0;
						data.users[i]["WIS"] = 0;
					}
					let chr = data.users[i]["CHR"];
					if(isNaN(chr)){
						chr = 0;
						data.users[i]["CHR"] = 0;
					}
					let buildings = homes + apartments + skyscrapers + cities + countries + stations;
					if(!data.users[i].hasOwnProperty("horses")){
						data.users[i].horses = [];
					}
					let sprinter = data.users[i]["sprinter"];
					if(isNaN(sprinter)){
						sprinter = 0;
						data.users[i]["sprinter"] = 0;
					}
					let taxAmount = 0;
					taxAmount =  Math.floor(homes * personalTax) * 2;
					taxAmount += Math.floor(apartments * personalTax) * 4;
					taxAmount += Math.floor(skyscrapers * personalTax) * 8;
					
					taxAmount += Math.floor(cities * personalTax) * 16;
					taxAmount += Math.floor(countries * personalTax) * 32;
					taxAmount += Math.floor(stations * personalTax) * 64;
					
					let dailyPayout = (homes * 10) + (apartments * 25) + (skyscrapers * 50) + (cities * 100) + (countries * 200) + (stations * 400);
					dailyPayout -= taxAmount;
					let perc = (balance / data.econ) * 100;
					perc = perc.toFixed(2);
					const playercardEmbed = new Discord.MessageEmbed()
						.setColor('#F7931A')
						.setTitle(`${data.users[i].name}'s playercard`)
						.setAuthor(`${message.author.username}`, `${message.author.displayAvatarURL()}`)
						.setThumbnail('https://i.imgur.com/0aDFif9.png')
						.addFields(
							{ name: 'Summary Info', value: `Balance: ${balance}CC\nBuildings: ${buildings}\nSanity: ${sanity}\n${perc}% of the economy owned`},
							{ name: 'Building Info', value: `Homes: ${homes}, Apartments: ${apartments}, Skyscrapers: ${skyscrapers}, Cities: ${cities}, Countries: ${countries}, Space Stations: ${stations}\nYou recieve ${dailyPayout}CC (Tax takes ${taxAmount}CC) daily`},
							{ name: 'Horses', value: `${data.users[i].horses.length}`, inline: true },
							{ name: 'Sprinters', value: `${sprinter}`, inline: true},
							{ name: 'Cooldowns', value: `${messageToSend}`},
							{ name: 'Stats', value: '\u200B' },
							{ name: 'STR', value: `${str}`, inline: true },
							{ name: 'CON', value: `${con}`, inline: true },
							{ name: 'WIS', value: `${wis}`, inline: true },
							{ name: 'DEX', value: `${dex}`, inline: true },
							{ name: 'INT', value: `${inte}`, inline: true },
							{ name: 'CHR', value: `${chr}`, inline: true },
						)
					message.channel.send(playercardEmbed);
					console.log(data.users[i].name + ' checked their balance');
					notFound = false;
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					break;	
				}
			}
			if(notFound){
				message.channel.send('User is not registered for CC!');
			}
		}
	}
}
//helper function to get user
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

//export functions
module.exports = {
	auditUser
};