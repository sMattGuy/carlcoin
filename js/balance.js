const Discord = require('discord.js');
const fs = require('fs');

function checkBalance(client,message){
	//fetch and store data
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	//stores user
	let user = message.author.username;
	let id = message.author.id;
	//flag
	let notFound = true;
	//checks for name
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
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
			if(isNaN(data.users[i]["robTimer"])){
				data.users[i]["robTimer"] = Date.now();
			}	
			if(data.users[i]["robTimer"] < Date.now()){
				messageToSend += `You can rob!`
			}
			else{
				let timeLeftRob = data.users[i]["robTimer"] - Date.now();
				timeLeftRob = Math.floor(timeLeftRob / 1000);
				timeLeftRob = Math.floor(timeLeftRob / 60);
				messageToSend += `You have ${timeLeftRob} mins left before you can rob again`
			}
			//crazy stats
			if(data.users[i]["unstable"] >= 100){
				let fakeBalance = Math.floor(Math.random() * 1001);
				let fakeBuildings = Math.floor(Math.random() * 1001);
				let fakeHomes = Math.floor(Math.random() * 1001);
				let fakeApartments = Math.floor(Math.random() * 1001);
				let fakeSkyscrapers = Math.floor(Math.random() * 1001);
				let fakeStr = Math.floor(Math.random() * 1001);
				let fakeDex = Math.floor(Math.random() * 1001);
				let fakeCon = -1 * Math.floor(Math.random() * 1001);
				let fakeInt = -1 * Math.floor(Math.random() * 1001);
				let fakeWis = -1 * Math.floor(Math.random() * 1001);
				let fakeChr = -1 * Math.floor(Math.random() * 1001);
				let fakePercent = Math.floor(Math.random() * 1001);
				const playercardEmbed = new Discord.MessageEmbed()
					.setColor('#FA2700')
					.setTitle(`${data.users[i].name}'s playercard?`)
					.setAuthor(`${data.users[i].name}`, `${message.author.displayAvatarURL()}`)
					.setThumbnail('https://i.imgur.com/0aDFif9.png')
					.addFields(
						{ name: 'Summary Info?', value: `Balance: ${fakeBalance}CC\nBuildings: ${fakeBuildings}\nSanity: ${sanity}\n${fakePercent}% of the economy owned`},
						{ name: 'Building Info?', value: `Homes: ${fakeHomes}, Apartments: ${fakeApartments}, Skyscrapers: ${fakeSkyscrapers}}\nYou recieve crazy coin from Santa daily`},
						{ name: 'Cooldowns', value: `${messageToSend}`},
						{ name: 'Stats?', value: '\u200B' },
						{ name: 'STR', value: `${fakeStr}`, inline: true },
						{ name: 'CON', value: `${fakeCon}`, inline: true },
						{ name: 'WIS', value: `${fakeWis}`, inline: true },
						{ name: 'DEX', value: `${fakeDex}`, inline: true },
						{ name: 'INT', value: `${fakeInt}`, inline: true },
						{ name: 'CHR', value: `${fakeChr}`, inline: true },
					)
				message.channel.send(playercardEmbed);
			}
			else{
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
				let buildings = homes + apartments + skyscrapers;
				let dailyPayout = (homes * 10) + (apartments * 25) + (skyscrapers * 50);
				let perc = (balance / data.econ) * 100;
				perc = perc.toFixed(2);
				const playercardEmbed = new Discord.MessageEmbed()
					.setColor('#F7931A')
					.setTitle(`${data.users[i].name}'s playercard`)
					.setAuthor(`${data.users[i].name}`, `${message.author.displayAvatarURL()}`)
					.setThumbnail('https://i.imgur.com/0aDFif9.png')
					.addFields(
						{ name: 'Summary Info', value: `Balance: ${balance}CC\nBuildings: ${buildings}\nSanity: ${sanity}\n${perc}% of the economy owned`},
						{ name: 'Building Info', value: `Homes: ${homes}, Apartments: ${apartments}, Skyscrapers: ${skyscrapers}\nYou recieve ${dailyPayout}CC (before tax) daily`},
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
			}
			notFound = false;
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			break;	
		}
	}
	if(notFound){
		message.channel.send('You are not registered for CC!');
	}
}

//export functions
module.exports = {
	checkBalance
};