const Discord = require('discord.js');
const fs = require('fs');

function robPlayer(client,message){
	let chop = message.content.split(" ");
	let corrUser = true;
	//if too many arguments
	if(chop.length != 3){
		message.channel.send(`Usage: !cc rob <user>`);
	}
	else{
		let recipient = "";
		let recpid = "";
		//attempts to get username
		try{
			recipient = getUserFromMention(client,chop[chop.length-1]).username;
			recpid = getUserFromMention(client,chop[chop.length-1]).id;
		}
		//if username cannot be gotten
		catch(err){
			message.channel.send(`Invalid person`);
			corrUser = false;
		}
		//if username works
		if(corrUser){
			//fetch and store data
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			//store user
			let user = message.author.username;
			let id = message.author.id;
			//flag
			let notFound = true;
			//finds robber
			if(id == recpid){
				message.channel.send(`Try meditation instead`);
				notFound = false;
			}
			else{
				for(let i=0;i<data.users.length;i++){
					//if username found
					if(data.users[i].id == id){
						if(isNaN(data.users[i]["robTimer"]) || data.users[i]["robTimer"] < Date.now()){
							let balance = data.users[i].balance;
							let currentDate = new Date();
							let noRecp = true;
							let nextMatch = 3600000;
							//finds other user
							for(let j=0;j<data.users.length;j++){
								//starts robbing
								if(data.users[j].id == recpid){
									noRecp = false;
									let robAmount = Math.floor(Math.random() * 3) + 1;
									if(data.users[j].balance - robAmount < 0){
										message.channel.send(`User doesn't have any money to rob`);
									}
									else if(data.users[i].balance - robAmount < 0){
										message.channel.send(`You can't even afford a skimask!`);
									}
									else{
										noRecp = false;
										const dodgeVerbs = ['dodges','backpedals','sidesteps','jumps over','evades','avoids','ducks under','matrixs under','grabs'];
										const attackVerbs = ['attacks','charges','pounces','strikes','ambushes','blitzs','assaults','bombards','hits','monkey punches','grabs','hooks'];
										const damageVerbs = ['injured','harmed','mangled','impaired','hit','wrecked','devistated','hurt','messed up','damaged','clipped'];
										let attackerHP = 3;
										let defenderHP = 3;
										let turnCount = 0;
										let arrested = false;
										message.channel.send(`${user} is trying to rob ${recipient}!`);
										console.log(user + ' is trying to rob ' + recipient);
										let nextMessage = ``;
										if(isNaN(data.users[i]["STR"])){
											data.users[i]["STR"] = 0;
										}
										if(isNaN(data.users[i]["CHR"])){
											data.users[i]["CHR"] = 0;
										}
										if(isNaN(data.users[j]["CHR"])){
											data.users[j]["CHR"] = 0;
										}
										if(isNaN(data.users[j]["STR"])){
											data.users[j]["STR"] = 0;
										}
										if(isNaN(data.users[j]["DEX"])){
											data.users[j]["DEX"] = 0;
										}
										if(isNaN(data.users[i]["unstable"])){
											data.users[i]["unstable"] = 0;
										}
										if(isNaN(data.users[j]["unstable"])){
											data.users[j]["unstable"] = 0;
										}
										
										let moneyDisparity = (data.users[i].balance / data.users[j].balance) * 100;
										moneyDisparity = moneyDisparity.toFixed(2);
										if(moneyDisparity >= 100){
											message.channel.send(`**${user} has ${moneyDisparity}% more CC than ${recipient}! ${recipient} gets that percentage as advantage!**`)
										}
										else{
											moneyDisparity = 0;
										}
										while(attackerHP != 0 && defenderHP != 0){
											nextMessage += `__TURN ${turnCount}__\n`;
											let attackerRoll = Math.random() + (parseInt(data.users[i]["STR"]) * 0.001) + (parseInt(data.users[i]["unstable"]) * 0.0001);
											let defenderRoll = Math.random() + ((parseInt(data.users[j]["DEX"]) + parseInt(data.users[j]["STR"])) * 0.001) + (parseInt(data.users[j]["unstable"]) * 0.0001) + (moneyDisparity / 1000);
											if(turnCount % 2 == 0){
												//attacker turn
												nextMessage += `${user} ${attackVerbs[Math.floor(Math.random() * attackVerbs.length)]} ${recipient}! --> `;
												if(attackerRoll <= defenderRoll){
													nextMessage += `${recipient} ${dodgeVerbs[Math.floor(Math.random() * dodgeVerbs.length)]} ${user} attack!\n`;
												}
												else{
													nextMessage += `${user} ${damageVerbs[Math.floor(Math.random() * damageVerbs.length)]} ${recipient}!\n`;
													defenderHP -= 1;
												}
												turnCount++;
											}
											else{
												//defender turn
												nextMessage += `${recipient} ${attackVerbs[Math.floor(Math.random() * attackVerbs.length)]} ${user}! --> `;
												if(defenderRoll <= attackerRoll){
													nextMessage += `${user} ${dodgeVerbs[Math.floor(Math.random() * dodgeVerbs.length)]} ${recipient} attack!\n`;
												}
												else{
													nextMessage += `${recipient} ${damageVerbs[Math.floor(Math.random() * damageVerbs.length)]} ${user}!\n`;
													attackerHP -= 1;
												}
												turnCount++;
											}
											if(turnCount == 7){
												nextMessage += `**Police have been called, they are on the way!**\n`;
											}
											if(turnCount >= 10){
												nextMessage += `**Police have arrived, ${user} is under arrest!**\n`;
												attackerHP = 0;
												nextMatch *= 4;
												arrested = true;
											}
										}
										message.channel.send(nextMessage).then(msg => msg.delete({timeout:60000})).catch(error => {console.log(error)});
										if(attackerHP == 0){
											//attacker lost
											message.channel.send(`${user} tried to rob ${recipient} and lost! What a massive embarassment! They dropped ${robAmount}CC while running away!`);
											data.users[i].balance -= robAmount;
											data.econ -= robAmount;

											data.users[i]["unstable"] += 10;

											if(data.users[i]["unstable"] >= 100 && data.users[i]["unstable"]-10 < 100){
												message.channel.send(`You are starting to feel irrational`);
											}

											let dropChance = Math.random();
											if(dropChance >= 0.95 || arrested){
												//lose chr
												message.channel.send(`${user} can't handle getting laughed at, their CHR drops!`);
												data.users[i]["CHR"] -= 1;
											}
										}
										else{
											//attacker won
											message.channel.send(`${user} managed to beat ${recipient} to submission.... and got ${robAmount}CC`);
											data.users[i].balance += robAmount;
											data.users[j].balance -= robAmount;
										}
										data.users[i]["robTimer"] = Date.now() + nextMatch;
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
									}
									break;
								}
							}
							//other user not found
							if(noRecp){
								message.channel.send('Person not found');
							}
							notFound = false;
							break;
						}
						else{
							let timeLeft = data.users[i]["robTimer"] - Date.now();
							timeLeft = Math.floor(timeLeft / 1000);
							timeLeft = Math.floor(timeLeft / 60);
							message.channel.send(`You already tried robbing someone, come back in ${timeLeft} mins.`);
							notFound = false;
							break;
						}
					}
				}
			}
			if(notFound){
				message.channel.send('You are not registered for CC!');
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
	robPlayer
};