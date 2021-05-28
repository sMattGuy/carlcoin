const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');


const symbols = ['🍒','🍇','🍉','🍎','❤️','♦️','♣️','♠️','<a:77:787576141074530314>','<:worrycarl:691116720181739552>'];

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
				else if((wager * 27) >= data.blackjack){
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
					while(reel1 == 19 || reel1 == 28 || reel1 == 29 || reel1 == 38 || reel1 == 39 || reel1 == 48 || reel1 == 49 || (reel1 >= 54 && reel1 <= 59) || (reel1 >= 64 && reel1 <= 69) || (reel1 >= 74 && reel1 <= 79)){
						reel1 = Math.floor(Math.random() * 80);
					}
					let reel2 = Math.floor(Math.random() * 80);
					while(reel2 == 19 || reel2 == 28 || reel2 == 29 || reel2 == 38 || reel2 == 39 || reel2 == 48 || reel2 == 49 || (reel2 >= 54 && reel2 <= 59) || (reel2 >= 64 && reel2 <= 69) || (reel2 >= 74 && reel2 <= 79)){
						reel2 = Math.floor(Math.random() * 80);
					}
					let reel3 = Math.floor(Math.random() * 80);
					while(reel3 == 19 || reel3 == 28 || reel3 == 29 || reel3 == 38 || reel3 == 39 || reel3 == 48 || reel3 == 49 || (reel3 >= 54 && reel3 <= 59) || (reel3 >= 64 && reel3 <= 69) || (reel3 >= 74 && reel3 <= 79)){
						reel3 = Math.floor(Math.random() * 80);
					}
					console.log(reel1 + " " + reel2 + " " + reel3);
					//carl win
					if(reel1%10 == 9 || reel2%10 == 9 || reel3%10 == 9){
						gameMessage = getInstantWinResults(reel1, reel2, reel3, wager, 9, data, client, message, 9);
					}
					//7 win
					else if(reel1%10 == 8 || reel2%10 == 8 || reel3%10 == 8){
						gameMessage = getInstantWinResults(reel1, reel2, reel3, wager, 4, data, client, message, 8);
					}
					//heart
					else if(reel1%10 == 4){
						gameMessage = getSlotResults(reel1, reel2, reel3, wager, 4, data, client, message, 4, 5, 6, 7);
					}
					//diamond
					else if(reel1%10 == 5){
						gameMessage = getSlotResults(reel1, reel2, reel3, wager, 4, data, client, message, 5, 6, 7, 4);
					}
					//club
					else if(reel1%10 == 6){
						gameMessage = getSlotResults(reel1, reel2, reel3, wager, 4, data, client, message, 6, 7, 4, 5);
					}
					//spade
					else if(reel1%10 == 7){
						gameMessage = getSlotResults(reel1, reel2, reel3, wager, 4, data, client, message, 7, 4, 5, 6);
					}
					//cherry first
					else if(reel1%10 == 0){
						gameMessage = getSlotResults(reel1, reel2, reel3, wager, 2, data, client, message, 0, 1, 2, 3);
					}
					//grape
					else if(reel1%10 == 1){
						gameMessage = getSlotResults(reel1, reel2, reel3, wager, 2, data, client, message, 1, 2, 3, 0);
					}
					//watermelon
					else if(reel1%10 == 2){
						gameMessage = getSlotResults(reel1, reel2, reel3, wager, 2, data, client, message, 2, 3, 0, 1);
					}
					//apple
					else if(reel1%10 == 3){
						gameMessage = getSlotResults(reel1, reel2, reel3, wager, 2, data, client, message, 3, 0, 1, 2);
					}
					else{
						gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
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

function getInstantWinResults(reel1, reel2, reel3, wager, wagerMulti, data, client, message, symbol1){
	let gameMessage = '';
	if(reel1%10 == symbol1){
		if(reel2%10 == symbol1){
			if(reel3%10 == symbol1){
				data.blackjack -= wager * (wagerMulti * 3);
				data.users[i].balance += wager * (wagerMulti * 3);
				gameMessage = 'JACKPOT!!!!!!!!!!';
				data.users[i]["dexExp"] += wager * (wagerMulti * 3);
				if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
					data.users[i]["dexExp"] = 0;
					data.users[i]["DEX"] += 1;
					message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
				}
			}
			else{
				data.blackjack -= wager * (wagerMulti * 2);
				data.users[i].balance += wager * (wagerMulti * 2);
				gameMessage = 'A double! Very lucky win!';
				data.users[i]["dexExp"] += wager * (wagerMulti * 2);
				if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
					data.users[i]["dexExp"] = 0;
					data.users[i]["DEX"] += 1;
					message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
				}
			}
		}
		else if(reel3%10 == symbol1){
			data.blackjack -= wager * (wagerMulti * 2);
			data.users[i].balance += wager * (wagerMulti * 2);
			gameMessage = 'A double! Very lucky win!';
			data.users[i]["dexExp"] += wager * (wagerMulti * 2);
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
		else{
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = 'A carl! You win!';
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
	}
	else if(reel2%10 == symbol1){
		if(reel3%10 == symbol1){
			data.blackjack -= wager * (wagerMulti * 2);
			data.users[i].balance += wager * (wagerMulti * 2);
			gameMessage = 'A double carl! Very lucky win!';
			data.users[i]["dexExp"] += wager * (wagerMulti * 2);
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
		else{
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = 'A carl! You win!';
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
	}
	else if(reel3%10 == symbol1){
		data.blackjack -= wager * wagerMulti;
		data.users[i].balance += wager * wagerMulti;
		gameMessage = 'A carl! You win!';
		data.users[i]["dexExp"] += wager * wagerMulti;
		if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
			data.users[i]["dexExp"] = 0;
			data.users[i]["DEX"] += 1;
			message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
		}
	}
	return gameMessage;
}

function getSlotResults(reel1, reel2, reel3, wager, wagerMulti, data, client, message, symbol1, symbol2, symbol3, symbol4){
	if(reel2%10 == symbol1 && reel3%10 == symbol1){
		data.blackjack -= wager * wagerMulti;
		data.users[i].balance += wager * wagerMulti;
		gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\n3 of a kind! You've won!`;
		data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
	}
	else if(reel2%10 == symbol2){
		if(reel3%10 == symbol3){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
		else if(reel3%10 == symbol4){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
		else{
			gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
		}
	}
	else if(reel2%10 == symbol3){
		if(reel3%10 == symbol2){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
		else if(reel3%10 == symbol4){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
		else{
			gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
		}
	}
	else if(reel2%10 == symbol4){
		if(reel3%10 == symbol2){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
		else if(reel3%10 == symbol3){
			data.blackjack -= wager * wagerMulti;
			data.users[i].balance += wager * wagerMulti;
			gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
			data.users[i]["dexExp"] += wager * wagerMulti;
			if(data.users[i]["DEX"] * 2 + 1 < data.users[i]["dexExp"]){
				data.users[i]["dexExp"] = 0;
				data.users[i]["DEX"] += 1;
				message.channel.send(`The thrill of slots makes you antsy, your DEX has increased!`);
			}
		}
		else{
			gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
		}
	}
	else{
		gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
	}
	return gameMessage;
}

//draw slot machine function
async function drawSlots(channel, gameMessage, reel1, reel2, reel3){
	const canvas = Canvas.createCanvas(440,440);
	const ctx = canvas.getContext('2d');
	let value = ['cherry','grape','watermelon','apple','heart','diamond','club','spades','7','carl'];
	const background = await Canvas.loadImage('/home/mattguy/carlcoin/slotmachine/slotmachinebackground.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#0000';
	ctx.strokeRect(0,0,canvas.width,canvas.height);
		
	let currentCard = await Canvas.loadImage(`/home/mattguy/carlcoin/slotmachine/${value[reel1%10]}.png`);
	ctx.drawImage(currentCard,35,100,100,100);
	currentCard = await Canvas.loadImage(`/home/mattguy/carlcoin/slotmachine/${value[reel2%10]}.png`);
	ctx.drawImage(currentCard,170,100,100,100);
	currentCard = await Canvas.loadImage(`/home/mattguy/carlcoin/slotmachine/${value[reel3%10]}.png`);
	ctx.drawImage(currentCard,290,100,90,90);
		
	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'machine.png');
	channel.send(`${gameMessage}`,attachment);
}

//export functions
module.exports = {
	playSlots
};