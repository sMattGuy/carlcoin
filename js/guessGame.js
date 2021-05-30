const Discord = require('discord.js');
const fs = require('fs');
const md5 = require('md5');

function startGuessGame(client,message){
	//create new raffle rng
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	data.raffleRNG = Math.floor(Math.random() * (300 - 250 + 1)) + 250;
	console.log("rafflerng",data.raffleRNG);
	//create new mystery number for people to guess
	data.mysteryNumber = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
	console.log("mystery",data.mysteryNumber);
	//sets the value of the coin to claim
	data.md5Val = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
	//reset message counter
	messageCounter = 0;
	//hash number
	let mysteryMD5 = md5(data.mysteryNumber);
	console.log("md5",mysteryMD5);
	let newData = JSON.stringify(data);
	fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
	//send to all general chats
	client.guilds.cache.forEach((guild) => {
		try{
			guild.channels.cache.find((x) => x.name == 'general').send(`https://i.imgur.com/0aDFif9.png`);
			guild.channels.cache.find((x) => x.name == 'general').send(`${data.md5Val} Carl Coin has appeared! the MD5 is ${mysteryMD5}\nType !cc guess <number> to try to crack the hash! (between 1 and 100)`);
		}
		catch(err){
			console.log("no general chat in "+guild.name);
		}
	});
}

function guessNumber(client,message){
	message.delete({timeout:60000}).catch(error => {console.log(error)});
	//chop message to parse
	let chop = message.content.split(" ");
	//if too many arguments
	if(chop.length != 3){
		message.channel.send(`Usage: !cc guess <1-100>`);
	}
	else{
		//gets number user guessed and checks if valid
		let guess = parseInt(chop[chop.length-1]);
		if(guess < 1 || isNaN(guess) || guess > 100){
			message.channel.send(`Invalid amount entered!`);
		}
		else{
			//stores name and id
			let user = message.author.username;
			let id = message.author.id;
			//reads database file and parses it
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			//find user loop
			console.log(message.author.username + ' guessed ' + guess);
			if(data.mysteryNumber == guess){
				for(let i=0;i<data.users.length;i++){
					if(data.users[i].id == id){
						console.log(data.users[i].name + ' has won the guessing game');
						data.users[i].balance += data.md5Val;
						data.econ += data.md5Val;
						data.users[i]["activity"] = Date.now();
						if(isNaN(data.users[i]["DEX"])){
							data.users[i]["DEX"] = 0;
						}
						if(isNaN(data.users[i]["dexExp"])){
							data.users[i]["dexExp"] = 0;
						}
						data.users[i]["dexExp"] += 1;
						if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
							data.users[i]["dexExp"] = 0;
							data.users[i]["DEX"] += 1;
							message.channel.send(`You were quick to get the right answer, your DEX has increased!`);
						}
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						client.guilds.cache.forEach((guild) => {
							try{
								guild.channels.cache.find((x) => x.name == 'general').send(`${data.users[i].name} has won! ${data.users[i].name} now has ${data.users[i].balance}CC. The mining game is over.`);
							}
							catch(err){
								console.log("no general chat in "+guild.name);
							}
						});
						return true;
					}
				}
			}
			else if(data.mysteryNumber > guess){
				message.react('⏫');
			}
			else{
				message.react('⏬');
			}
			return false;
		}
	}
}

//export functions
module.exports = {
	startGuessGame,
	guessNumber
};
