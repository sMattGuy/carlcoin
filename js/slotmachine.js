const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');


const symbols = ['🍒','🍇','🍉','🍎','❤️','♦️','♣️','♠️','<a:77:787576141074530314>'];

function playSlots(client,message){
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !cc slots <amount>');
	}
	else{
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id){
				if(isNaN(data.users[i]["dexExp"])){
					data.users[i]["dexExp"] = 0;
				}
				if(isNaN(data.users[i]["DEX"])){
					data.users[i]["DEX"] = 0;
				}
				let wager = parseInt(chop[chop.length-1]);
				if(isNaN(wager) || wager < 0){
					message.channel.send('Invalid amount entered!');
				}
				else if(wager < 5 || wager > 100){
					message.channel.send(`Invalid amount entered (Bets are between 5CC and 25CC)`);
				}
				else if((wager * 15) >= data.blackjack){
					message.channel.send('The slot machine doesnt have enough CC!');
				}
				else if(data.users[i].balance - wager < 0){
					message.channel.send('You dont have enough CC!');
				}
				else{
					data.users[i].balance -= wager;
					data.blackjack += wager;
					let gameMessage = '';
					message.channel.send(`You spin the slot machine`);
					let reel1 = Math.floor(Math.random() * 80);
					while(reel1 == 26 || reel1 == 35 || reel1 == 44 || (reel1 >= 49 && reel1 <= 53) || (reel1 >= 58 && reel1 <= 62) || (reel1 >= 67 && reel1 <= 71) || (reel1 >= 76 && reel1 <= 80)){
						reel1 = Math.floor(Math.random() * 80);
					}
					let reel2 = Math.floor(Math.random() * 80);
					while(reel2 == 26 || reel2 == 35 || reel2 == 44 || (reel2 >= 49 && reel2 <= 53) || (reel2 >= 58 && reel2 <= 62) || (reel2 >= 67 && reel2 <= 71) || (reel2 >= 76 && reel2 <= 80)){
						reel2 = Math.floor(Math.random() * 80);
					}
					let reel3 = Math.floor(Math.random() * 80);
					while(reel3 == 26 || reel3 == 35 || reel3 == 44 || (reel3 >= 49 && reel3 <= 53) || (reel3 >= 58 && reel3 <= 62) || (reel3 >= 67 && reel3 <= 71) || (reel3 >= 76 && reel3 <= 80)){
						reel3 = Math.floor(Math.random() * 80);
					}
					console.log(reel1 + " " + reel2 + " " + reel3);
					if(data.users[i]["unstable"] >= 100){
						if(data.users[i].balance - wager < 0){
							wager += data.users[i].balance;
							data.blackjack += data.users[i].balance;
							data.users[i].balance = 0;
						}
						else{
							data.users[i].balance -= wager;
							data.blackjack += wager;
							wager += wager;
						}
						let autoFail = Math.random();
						gameMessage += `How much money did you put in again....? You can't remember.\n`
						if(autoFail > 0.3){
							gameMessage += `Nothing makes sense.... did you win or lose? No money came out either way.\n`;
							drawSlots(message.channel, gameMessage, reel1, reel2, reel3);
							return;
						}
					}
					//7 win
					if(reel1%9 == 8 || reel2%9 == 8 || reel3%9 == 8){
						gameMessage += getInstantWinResults(reel1, reel2, reel3, wager, 4, data, client, message, 8, i);
					}
					//heart
					else if(reel1%9 == 4){
						gameMessage += getSlotResults(reel1, reel2, reel3, wager, 4, data, client, message, 4, 5, 6, 7, i);
					}
					//diamond
					else if(reel1%9 == 5){
						gameMessage += getSlotResults(reel1, reel2, reel3, wager, 4, data, client, message, 5, 6, 7, 4, i);
					}
					//club
					else if(reel1%9 == 6){
						gameMessage += getSlotResults(reel1, reel2, reel3, wager, 4, data, client, message, 6, 7, 4, 5, i);
					}
					//spade
					else if(reel1%9 == 7){
						gameMessage += getSlotResults(reel1, reel2, reel3, wager, 4, data, client, message, 7, 4, 5, 6, i);
					}
					//cherry first
					else if(reel1%9 == 0){
						gameMessage += getSlotResults(reel1, reel2, reel3, wager, 2, data, client, message, 0, 1, 2, 3, i);
					}
					//grape
					else if(reel1%9 == 1){
						gameMessage += getSlotResults(reel1, reel2, reel3, wager, 2, data, client, message, 1, 2, 3, 0, i);
					}
					//watermelon
					else if(reel1%9 == 2){
						gameMessage += getSlotResults(reel1, reel2, reel3, wager, 2, data, client, message, 2, 3, 0, 1, i);
					}
					//apple
					else{
						gameMessage += getSlotResults(reel1, reel2, reel3, wager, 2, data, client, message, 3, 0, 1, 2, i);
					}
					drawSlots(message.channel, gameMessage, reel1, reel2, reel3);
				}
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				break;
			}
		}
	}
}

function getInstantWinResults(reel1, reel2, reel3, wager, wagerMulti, data, client, message, symbol1, i){
	let gameMessage = '';
	if(reel1%9 == symbol1){
		if(reel2%9 == symbol1){
			if(reel3%9 == symbol1){
				data.blackjack -= wager * (wagerMulti * 3);
				data.users[i].balance += wager * (wagerMulti * 3);
				gameMessage = `JACKPOT!!!!!!!!!! You won ${wager * (wagerMulti * 3)}CC! You now have ${data.users[i].balance}CC!`;
				//cure insane
				let insane = false;
				if(data.users[i]["unstable"] >= 100){
					insane = true;
				}
				data.users[i]["unstable"] -= Math.floor(wager * (wagerMulti * 3));
				if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
					data.users[i]["unstable"] = 0;
				}
				if(insane && data.users[i]["unstable"] + Math.floor(wager * (wagerMulti * 3)) >= 100 && data.users[i]["unstable"] < 100){
					data.users[i]["suicide"] = 1;
					gameMessage += `\nYou come to your senses.`;
					console.log(data.users[i].name + " has calmed down");
				}
				//level
				if(isNaN(data.users[i]["dexExp"])){
					data.users[i]["dexExp"] = 0;
				}
				if(isNaN(data.users[i]["DEX"])){
					data.users[i]["DEX"] = 0;
				}
				data.users[i]["dexExp"] += wager * (wagerMulti * 3);
				if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
					data.users[i]["dexExp"] = 0;
					data.users[i]["DEX"] += 1;
					gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
				}
			}
			else{
				data.blackjack -= wager * (wagerMulti * 2);
				data.users[i].balance += wager * (wagerMulti * 2);
				gameMessage = `A double! Very lucky win! You won ${wager * (wagerMulti * 2)}CC! You now have ${data.users[i].balance}CC!`;
				//cure insane
				let insane = false;
				if(data.users[i]["unstable"] >= 100){
					insane = true;
				}
				data.users[i]["unstable"] -= Math.floor(wager * (wagerMulti * 2));
				if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
					data.users[i]["unstable"] = 0;
				}
				if(insane && data.users[i]["unstable"] + Math.floor(wager * (wagerMulti * 2)) >= 100 && data.users[i]["unstable"] < 100){
					data.users[i]["suicide"] = 1;
					gameMessage += `\nYou come to your senses.`;
					console.log(data.users[i].name + " has calmed down");
				}
				//level
				if(isNaN(data.users[i]["dexExp"])){
					data.users[i]["dexExp"] = 0;
				}
				if(isNaN(data.users[i]["DEX"])){
					data.users[i]["DEX"] = 0;
				}
				data.users[i]["dexExp"] += wager * (wagerMulti * 2);
				if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
					data.users[i]["dexExp"] = 0;
					data.users[i]["DEX"] += 1;
					gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
				}
			}
		}
		else if(reel3%9 == symbol1){
			data.blackjack -= wager * (wagerMulti * 2);
			data.users[i].balance += wager * (wagerMulti * 2);
			gameMessage = `A double! Very lucky win! You won ${wager * (wagerMulti * 2)}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * (wagerMulti * 2));
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * (wagerMulti * 2)) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * (wagerMulti * 2);
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
		else{
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `A single! You win! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
	}
	else if(reel2%9 == symbol1){
		if(reel3%9 == symbol1){
			data.blackjack -= wager * (wagerMulti * 2);
			data.users[i].balance += wager * (wagerMulti * 2);
			gameMessage = `A double! Very lucky win! You won ${wager * (wagerMulti * 2)}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * (wagerMulti * 2));
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * (wagerMulti * 2)) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * (wagerMulti * 2);
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
		else{
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `A single! You win! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
	}
	else if(reel3%9 == symbol1){
		data.blackjack -= wager * wagerMulti;
		data.users[i].balance += wager * wagerMulti;
		gameMessage = `A single! You win! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
		//cure insane
		let insane = false;
		if(data.users[i]["unstable"] >= 100){
			insane = true;
		}
		data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
		if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
			data.users[i]["unstable"] = 0;
		}
		if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
			data.users[i]["suicide"] = 1;
			gameMessage += `\nYou come to your senses.`;
			console.log(data.users[i].name + " has calmed down");
		}
		//level
		if(isNaN(data.users[i]["dexExp"])){
			data.users[i]["dexExp"] = 0;
		}
		if(isNaN(data.users[i]["DEX"])){
			data.users[i]["DEX"] = 0;
		}
		data.users[i]["dexExp"] += wager * wagerMulti;
		if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
			data.users[i]["dexExp"] = 0;
			data.users[i]["DEX"] += 1;
			gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
		}
	}
	return gameMessage;
}

function getSlotResults(reel1, reel2, reel3, wager, wagerMulti, data, client, message, symbol1, symbol2, symbol3, symbol4, i){
	if(reel2%9 == symbol1 && reel3%9 == symbol1){
		data.blackjack -= wager * wagerMulti;
		data.users[i].balance += wager * wagerMulti;
		gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\n3 of a kind! You've won! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
		//cure insane
		let insane = false;
		if(data.users[i]["unstable"] >= 100){
			insane = true;
		}
		data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
		if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
			data.users[i]["unstable"] = 0;
		}
		if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
			data.users[i]["suicide"] = 1;
			gameMessage += `\nYou come to your senses.`;
			console.log(data.users[i].name + " has calmed down");
		}
		//level
		if(isNaN(data.users[i]["dexExp"])){
			data.users[i]["dexExp"] = 0;
		}
		if(isNaN(data.users[i]["DEX"])){
			data.users[i]["DEX"] = 0;
		}
		data.users[i]["dexExp"] += wager * wagerMulti;
		if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
			data.users[i]["dexExp"] = 0;
			data.users[i]["DEX"] += 1;
			gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
		}
	}
	else if(reel2%9 == symbol2){
		if(reel3%9 == symbol3){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nA straight! You've won! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
		else if(reel3%9 == symbol4){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nA straight! You've won! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
		else{
			gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nSorry, You've lost! You now have ${data.users[i].balance}CC!`;
			if(isNaN(data.users[i]["unstable"])){
				data.users[i]["unstable"] = 0;
			}
			data.users[i]["unstable"] += wager;
			if(isNaN(data.users[i]["unstable"])){
				data.users[i]["unstable"] = wager;
			}
			if(isNaN(data.users[i]["suicide"])){
				data.users[i]["suicide"] = 1;
			}
			if(data.users[i]["unstable"] >= 100 && data.users[i]["unstable"] - wager < 100){
				data.users[i]["suicide"] = 0;
				gameMessage += `\nYou are starting to feel irrational.`;
				console.log(data.users[i].name + " has become irrational");
			}
			if(data.users[i]["unstable"] > 250){
				gameMessage += `\nYou are completely unstable`;
				console.log(data.users[i].name + " has become unstable");
				data.users[i]["unstable"] = 250
			}
		}
	}
	else if(reel2%9 == symbol3){
		if(reel3%9 == symbol2){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nA straight! You've won! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
		else if(reel3%9 == symbol4){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nA straight! You've won! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
		else{
			gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nSorry, You've lost! You now have ${data.users[i].balance}CC!`;
			if(isNaN(data.users[i]["unstable"])){
				data.users[i]["unstable"] = 0;
			}
			data.users[i]["unstable"] += wager;
			if(isNaN(data.users[i]["unstable"])){
				data.users[i]["unstable"] = wager;
			}
			if(isNaN(data.users[i]["suicide"])){
				data.users[i]["suicide"] = 1;
			}
			if(data.users[i]["unstable"] >= 100 && data.users[i]["unstable"] - wager < 100){
				data.users[i]["suicide"] = 0;
				gameMessage += `\nYou are starting to feel irrational.`;
				console.log(data.users[i].name + " has become irrational");
			}
			if(data.users[i]["unstable"] > 250){
				gameMessage += `\nYou are completely unstable`;
				console.log(data.users[i].name + " has become unstable");
				data.users[i]["unstable"] = 250
			}
		}
	}
	else if(reel2%9 == symbol4){
		if(reel3%9 == symbol2){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nA straight! You've won! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
		else if(reel3%9 == symbol3){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nA straight! You've won! You won ${wager * wagerMulti}CC! You now have ${data.users[i].balance}CC!`;
			//cure insane
			let insane = false;
			if(data.users[i]["unstable"] >= 100){
				insane = true;
			}
			data.users[i]["unstable"] -= Math.floor(wager * wagerMulti);
			if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
			if(insane && data.users[i]["unstable"] + Math.floor(wager * wagerMulti) >= 100 && data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
				gameMessage += `\nYou come to your senses.`;
				console.log(data.users[i].name + " has calmed down");
			}
			//level
			if(isNaN(data.users[i]["dexExp"])){
				data.users[i]["dexExp"] = 0;
			}
			if(isNaN(data.users[i]["DEX"])){
				data.users[i]["DEX"] = 0;
			}
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				gameMessage += `\nThe thrill of slots makes you antsy, your DEX has increased!`;
			}
		}
		else{
			gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nSorry, You've lost! You now have ${data.users[i].balance}CC!`;
			if(isNaN(data.users[i]["unstable"])){
				data.users[i]["unstable"] = 0;
			}
			data.users[i]["unstable"] += wager;
			if(isNaN(data.users[i]["unstable"])){
				data.users[i]["unstable"] = wager;
			}
			if(isNaN(data.users[i]["suicide"])){
				data.users[i]["suicide"] = 1;
			}
			if(data.users[i]["unstable"] >= 100 && data.users[i]["unstable"] - wager < 100){
				data.users[i]["suicide"] = 0;
				gameMessage += `\nYou are starting to feel irrational.`;
				console.log(data.users[i].name + " has become irrational");
			}
			if(data.users[i]["unstable"] > 250){
				gameMessage += `\nYou are completely unstable`;
				console.log(data.users[i].name + " has become unstable");
				data.users[i]["unstable"] = 250
			}
		}
	}
	else{
		gameMessage = `${symbols[reel1%9]}|${symbols[reel2%9]}|${symbols[reel3%9]}\nSorry, You've lost! You now have ${data.users[i].balance}CC!`;
		if(isNaN(data.users[i]["unstable"])){
			data.users[i]["unstable"] = 0;
		}
		data.users[i]["unstable"] += wager;
		if(isNaN(data.users[i]["unstable"])){
			data.users[i]["unstable"] = wager;
		}
		if(isNaN(data.users[i]["suicide"])){
			data.users[i]["suicide"] = 1;
		}
		if(data.users[i]["unstable"] >= 100 && data.users[i]["unstable"] - wager < 100){
			data.users[i]["suicide"] = 0;
			gameMessage += `\nYou are starting to feel irrational.`;
			console.log(data.users[i].name + " has become irrational");
		}
		if(data.users[i]["unstable"] > 250){
			gameMessage += `\nYou are completely unstable`;
			console.log(data.users[i].name + " has become unstable");
			data.users[i]["unstable"] = 250
		}
	}
	return gameMessage;
}

//draw slot machine function
async function drawSlots(channel, gameMessage, reel1, reel2, reel3){
	const canvas = Canvas.createCanvas(440,440);
	const ctx = canvas.getContext('2d');
	let value = ['cherry','grape','watermelon','apple','heart','diamond','club','spades','7'];
	const background = await Canvas.loadImage('/home/mattguy/carlcoin/slotmachine/slotmachinebackground.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#0000';
	ctx.strokeRect(0,0,canvas.width,canvas.height);
		
	let currentCard = await Canvas.loadImage(`/home/mattguy/carlcoin/slotmachine/${value[reel1%9]}.png`);
	ctx.drawImage(currentCard,35,100,100,100);
	currentCard = await Canvas.loadImage(`/home/mattguy/carlcoin/slotmachine/${value[reel2%9]}.png`);
	ctx.drawImage(currentCard,170,100,100,100);
	currentCard = await Canvas.loadImage(`/home/mattguy/carlcoin/slotmachine/${value[reel3%9]}.png`);
	ctx.drawImage(currentCard,290,100,90,90);
		
	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'machine.png');
	channel.send(`${gameMessage}`,attachment);
}

//export functions
module.exports = {
	playSlots
};