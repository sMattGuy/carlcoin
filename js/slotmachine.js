const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');

function playSlots(client,message){
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Command arguments incorrect!');
	}
	else{
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id){
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
					let symbols = ['🍒','🍇','🍉','🍎','❤️','♦️','♣️','♠️','<a:77:787576141074530314>','<:worrycarl:691116720181739552>'];
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
					if(reel1%10 == 9){
						if(reel2%10 == 9){
							if(reel3%10 == 9){
								//turbo jackpot
								data.blackjack -= wager * 27;
								data.users[i].balance += wager * 27;
								gameMessage = 'HOLY SHIT THE TURBO CARL JACKPOT';
							}
							else{
								data.blackjack -= wager * 18;
								data.users[i].balance += wager * 18;
								gameMessage = 'A double carl! Very lucky win!';
							}
						}
						else if(reel3%10 == 9){
							data.blackjack -= wager * 18;
							data.users[i].balance += wager * 18;
							gameMessage = 'A double carl! Very lucky win!';
						}
						else{
							data.blackjack -= wager * 9;
							data.users[i].balance += wager * 9;
							gameMessage = 'A carl! You win!';
						}
					}
					else if(reel2%10 == 9){
						if(reel3%10 == 9){
							data.blackjack -= wager * 18;
							data.users[i].balance += wager * 18;
							gameMessage = 'A double carl! Very lucky win!';
						}
						else{
							data.blackjack -= wager * 9;
							data.users[i].balance += wager * 9;
							gameMessage = 'A carl! You win!';
						}
					}
					else if(reel3%10 == 9){
						data.blackjack -= wager * 9;
						data.users[i].balance += wager * 9;
						gameMessage = 'A carl! You win!';
					}
					else if(reel1%10 == 8){
						if(reel2%10 == 8){
							if(reel3%10 == 8){
								//jackpot
								data.blackjack -= wager * 12;
								data.users[i].balance += wager * 12;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nJACKPOT BABY!!!!`;
							}
							else{
								//2 7's
								data.blackjack -= wager * 8;
								data.users[i].balance += wager * 8;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nTwo lucky 7's! You win!`;
							}
						}
						else if(reel3%10 == 8){
							//2 7's
							data.blackjack -= wager * 8;
							data.users[i].balance += wager * 8;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nTwo lucky 7's! You win!`;
						}
						//only one
						else{
							data.blackjack -= wager * 4;
							data.users[i].balance += wager * 4;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA lucky 7! You win!`;
						}	
					}
					else if(reel2%10 == 8){
						if(reel3%10 == 8){
							//jackpot
							data.blackjack -= wager * 8;
							data.users[i].balance += wager * 8;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nTwo lucky 7's! You win!`;
						}
						else{
							//1 7
							data.blackjack -= wager * 4;
							data.users[i].balance += wager * 4;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA lucky 7! You win!`;
						}
					}
					else if(reel3%10 == 8){
						data.blackjack -= wager * 4;
						data.users[i].balance += wager * 4;
						gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA lucky 7! You win!`;
					}
					//straight suit checker
					//heart first
					else if(reel1%10 == 4){
						if(reel2%10 == 4 && reel3%10 == 4){
							data.blackjack -= wager * 4
							data.users[i].balance += wager * 4;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\n3 of a kind! You've won!`;
						}
						else if(reel2%10 == 5){
							if(reel3%10 == 6){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 7){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 6){
							if(reel3%10 == 5){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 7){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 7){
							if(reel3%10 == 5){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 6){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else{
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
						}
					}
					//diamond
					else if(reel1%10 == 5){
						if(reel2%10 == 5 && reel3%10 == 5){
							data.blackjack -= wager * 4
							data.users[i].balance += wager * 4;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\n3 of a kind! You've won!`;
						}
						else if(reel2%10 == 4){
							if(reel3%10 == 7){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 6){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 6){
							if(reel3%10 == 4){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 7){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 7){
							if(reel3%10 == 4){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 6){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else{
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
						}
					}
					//club
					else if(reel1%10 == 6){
						if(reel2%10 == 6 && reel3%10 == 6){
							data.blackjack -= wager * 4
							data.users[i].balance += wager * 4;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\n3 of a kind! You've won!`;
						}
						else if(reel2%10 == 5){
							if(reel3%10 == 4){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 7){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 4){
							if(reel3%10 == 5){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 7){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 7){
							if(reel3%10 == 5){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 4){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else{
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
						}
					}
					//spade
					else if(reel1%10 == 7){
						if(reel2%10 == 7 && reel3%10 == 7){
							data.blackjack -= wager * 4
							data.users[i].balance += wager * 4;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\n3 of a kind! You've won!`;
						}
						else if(reel2%10 == 4){
							if(reel3%10 == 5){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 6){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 6){
							if(reel3%10 == 5){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 4){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 5){
							if(reel3%10 == 4){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 6){
								data.blackjack -= wager * 4;
								data.users[i].balance += wager * 4;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else{
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
						}
					}
					//cherry first
					else if(reel1%10 == 0){
						if(reel2%10 == 0 && reel3%10 == 0){
							data.blackjack -= wager * 2;
							data.users[i].balance += wager * 2;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\n3 of a kind! You've won!`;
						}
						else if(reel2%10 == 1){
							if(reel3%10 == 2){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 3){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 2){
							if(reel3%10 == 1){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 3){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 3){
							if(reel3%10 == 1){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 2){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else{
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
						}
					}
					//grape
					else if(reel1%10 == 1){
						if(reel2%10 == 1 && reel3%10 == 1){
							data.blackjack -= wager * 2;
							data.users[i].balance += wager * 2;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\n3 of a kind! You've won!`;
						}
						else if(reel2%10 == 0){
							if(reel3%10 == 2){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 3){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 2){
							if(reel3%10 == 0){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 3){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 3){
							if(reel3%10 == 0){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 2){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else{
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
						}
					}
					//watermelon
					else if(reel1%10 == 2){
						if(reel2%10 == 2 && reel3%10 == 2){
							data.blackjack -= wager * 2;
							data.users[i].balance += wager * 2;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\n3 of a kind! You've won!`;
						}
						else if(reel2%10 == 1){
							if(reel3%10 == 0){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 3){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 0){
							if(reel3%10 == 1){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 3){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 3){
							if(reel3%10 == 1){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 0){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else{
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
						}
					}
					//apple
					else if(reel1%10 == 3){
						if(reel2%10 == 3 && reel3%10 == 3){
							data.blackjack -= wager * 2;
							data.users[i].balance += wager * 2;
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\n3 of a kind! You've won!`;
						}
						else if(reel2%10 == 0){
							if(reel3%10 == 1){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 2){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 2){
							if(reel3%10 == 1){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 0){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else if(reel2%10 == 1){
							if(reel3%10 == 2){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else if(reel3%10 == 0){
								data.blackjack -= wager * 2;
								data.users[i].balance += wager * 2;
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nA straight! You've won!`;
							}
							else{
								gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
							}
						}
						else{
							gameMessage = `${symbols[reel1%10]}|${symbols[reel2%10]}|${symbols[reel3%10]}\nSorry, You've lost!`;
						}
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