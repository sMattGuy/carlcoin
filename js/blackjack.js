const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');

//cards
const blackjackCards = ['♠A','♠2','♠3','♠4','♠5','♠6','♠7','♠8','♠9','♠10','♠J','♠Q','♠K','♥A','♥2','♥3','♥4','♥5','♥6','♥7','♥8','♥9','♥10','♥J','♥Q','♥K','♦A','♦2','♦3','♦4','♦5','♦6','♦7','♦8','♦9','♦10','♦J','♦Q','♦K','♣A','♣2','♣3','♣4','♣5','♣6','♣7','♣8','♣9','♣10','♣J','♣Q','♣K'];
const blackjackCardsImages = ['AS.png','2S.png','3S.png','4S.png','5S.png','6S.png','7S.png','8S.png','9S.png','10S.png','JS.png','QS.png','KS.png','AH.png','2H.png','3H.png','4H.png','5H.png','6H.png','7H.png','8H.png','9H.png','10H.png','JH.png','QH.png','KH.png','AD.png','2D.png','3D.png','4D.png','5D.png','6D.png','7D.png','8D.png','9D.png','10D.png','JD.png','QD.png','KD.png','AC.png','2C.png','3C.png','4C.png','5C.png','6C.png','7C.png','8C.png','9C.png','10C.png','JC.png','QC.png','KC.png'];

function blackjackStart(client,message){
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !cc blackjack <amount>');
	}
	else{
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let challenger = message.author.id;
		let playing = true;
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/${challenger}blackjack`)){
			let blackjackFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${challenger}blackjack`);
			let blackjackParse = JSON.parse(blackjackFile);
			if(blackjackParse.blackjackEnder < Date.now()){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${challenger}blackjack`);
			}
			else{
				playing = false;
				message.channel.send('You are already playing BlackJack!');
			}
		}
		if(playing){
			let wager = parseInt(chop[chop.length-1]);
			if(isNaN(wager) || wager < 2){
				message.channel.send('Invalid amount entered!');
			}
			else if((wager * 2.5) >= data.blackjack + (wager - Math.floor(wager * .25))){
				message.channel.send('The blackjack pot doesnt have enough CC!');
			}
			else{
				let noUser = true;
				for(let i=0;i<data.users.length;i++){
					if(data.users[i].id == challenger){
						if(data.users[i].balance - wager < 0){
							message.channel.send('You dont have enough CC!');
						}
						else{
							let cardValue = [11,2,3,4,5,6,7,8,9,10,10,10,10];
							console.log(data.users[i].name + ' has started blackjack and bet ' + wager + 'CC');	
							let welfareSupport = Math.floor(wager * .25);
							let blackjackSupport = wager - welfareSupport;
							data.blackjack += blackjackSupport;
							data.welfare += welfareSupport;
							data.users[i].balance -= wager;
							data.users[i]["bitterness"] = 0;
							let blackjackEnder = parseInt(Date.now()) + 60000;
							let usedCards = {"usedCards":[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]};
							//dealer
							let dealerCard1 = (Math.floor(Math.random() * 52));
							usedCards.usedCards[dealerCard1] = true;
							let dealerCard2 = (Math.floor(Math.random() * 52));
							while(usedCards.usedCards[dealerCard2]){
								dealerCard2 = (Math.floor(Math.random() * 52));
							}
							usedCards.usedCards[dealerCard2] = true;
							//player
							let playerCard1 = (Math.floor(Math.random() * 52));
							while(usedCards.usedCards[playerCard1]){
								playerCard1 = (Math.floor(Math.random() * 52));
							}
							usedCards.usedCards[playerCard1] = true;
							let playerCard2 = (Math.floor(Math.random() * 52));
							while(usedCards.usedCards[playerCard2]){
								playerCard2 = (Math.floor(Math.random() * 52));
							}
							usedCards.usedCards[playerCard2] = true;
							let dealerCards = {"dealerCards":[dealerCard1,dealerCard2]};
							let playerCards = {"playerCards":[playerCard1,playerCard2]};
							//check instant win
							if(((playerCard1%13 == 0)&&(playerCard2%13 == 9 || playerCard2%13 == 10 || playerCard2%13 == 11 || playerCard2%13 == 12))|| ((playerCard2%13 == 0)&&(playerCard1%13 == 9 || playerCard1%13 == 10 || playerCard1%13 == 11 || playerCard1%13 == 12))){
								if(((dealerCard1%13 == 0)&&(dealerCard2%13 == 9 || dealerCard2%13 == 10 || dealerCard2%13 == 11 || dealerCard2%13 == 12)) || ((dealerCard2%13 == 0)&&(dealerCard1%13 == 9 || dealerCard1%13 == 10 || dealerCard1%13 == 11 || dealerCard1%13 == 12))){
									data.users[i].balance += wager;
									data.blackjack -= wager;
									let resultsOfGame = `You and the dealer both got a natural..... you get back your CC\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.`;
									drawBoard(message.channel, false, resultsOfGame, playerCards.playerCards, dealerCards.dealerCards,false,true,21,message.author.username,21,message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
									console.log(data.users[i].name + ' drew in blackjack');
								}
								else{
									data.users[i].balance += Math.floor(wager * 2.5);
									data.blackjack -= Math.floor(wager * 2.5);
									let resultsOfGame = `You got a natural! You win!\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.\n`;
									console.log(data.users[i].name + ' won in blackjack');
									//instability counter
									let insane = false;
									if(data.users[i]["unstable"] >= 100){
										insane = true;
									}
									data.users[i]["unstable"] -= Math.floor(wager * 2.5);
									if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
										data.users[i]["unstable"] = 0;
									}
									if(insane && data.users[i]["unstable"] + Math.floor(wager * 2.5) >= 100 && data.users[i]["unstable"] < 100){
										data.users[i]["suicide"] = 1;
										resultsOfGame += `You come to your senses.\n`;
										console.log(data.users[i].name + " has calmed down");
									}
									if(isNaN(data.users[i]["CHR"])){
										data.users[i]["CHR"] = 0;
									}
									if(isNaN(data.users[i]["chrExp"])){
										data.users[i]["chrExp"] = 0;
									}
									data.users[i]["chrExp"] += Math.floor(wager * 2.5);
									if(data.users[i]["CHR"] * 2 + 20 < data.users[i]["chrExp"]){
										data.users[i]["CHR"] += 1;
										data.users[i]["chrExp"] = 0;
										resultsOfGame += `Winning blackjack made you more slick, your CHR increased!\n`;
									}
									drawBoard(message.channel, false, resultsOfGame, playerCards.playerCards, dealerCards.dealerCards,false,true,21,message.author.username,cardValue[dealerCards.dealerCards[0]%13]+cardValue[dealerCards.dealerCards[1]%13],message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
								}
								let newData = JSON.stringify(data);
								fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							}
							else if(((dealerCard1%13 == 0)&&(dealerCard2%13 == 9 || dealerCard2%13 == 10 || dealerCard2%13 == 11 || dealerCard2%13 == 12)) || ((dealerCard2%13 == 0)&&(dealerCard1%13 == 9 || dealerCard1%13 == 10 || dealerCard1%13 == 11 || dealerCard1%13 == 12))){
								//seduce dealer
								let resultsOfGame = `Dealer got a natural! You lose!\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.\n`;
								console.log(data.users[i].name + ' lost in blackjack');
								//wis check
								let wisdomChance = Math.random();
								if(isNaN(data.users[i]["WIS"])){
									data.users[i]["WIS"] = 0;
								}
								let wisBonus = data.users[i]["WIS"] * .01;
								if(wisBonus > .1){
									wisBonus = .1;
								}
								if(1 - wisdomChance < wisBonus){
									resultsOfGame += `...But it didn't happen, you had enough WIS to know this game would have been a loss, so you never played\n`;
									data.users[i].balance += wager;
									data.blackjack -= wager;
								}
								else{
									let seduceChance = Math.random();
									if(isNaN(data.users[i]["CHR"])){
										data.users[i]["CHR"] = 0;
									}
									let chrBonus = data.users[i]["CHR"] * .01;
									if(chrBonus > .25){
										chrBonus = .25;
									}
									if(1 - seduceChance < chrBonus){
										let wagerHalf = Math.floor(wager / 2);
										wager = wager - wagerHalf;
										data.users[i].balance += wagerHalf;
										data.blackjack -= wagerHalf;
										resultsOfGame += `You wink at the dealer, because of your CHR he blushes and averts his eyes.... You sneak back half your bet!\n`;
									}
									//instability counter
									data.users[i]["unstable"] += wager;
									if(isNaN(data.users[i]["unstable"])){
										data.users[i]["unstable"] = wager;
									}
									if(isNaN(data.users[i]["suicide"])){
										data.users[i]["suicide"] = 1;
									}
									if(data.users[i]["unstable"] >= 100 && data.users[i]["unstable"] - wager < 100){
										data.users[i]["suicide"] = 0;
										resultsOfGame += `You are starting to feel irrational.\n`;
										console.log(data.users[i].name + " has become irrational");
									}
									if(data.users[i]["unstable"] > 250){
										resultsOfGame += `You are completely unstable\n`;
										console.log(data.users[i].name + " has become unstable");
										data.users[i]["unstable"] = 250;
									}
								}
								drawBoard(message.channel, false, resultsOfGame, playerCards.playerCards, dealerCards.dealerCards,false,true,cardValue[playerCards.playerCards[0]%13]+cardValue[playerCards.playerCards[1]%13],message.author.username,21,message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
								let newData = JSON.stringify(data);
								fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							}
							else{
								let blackjackInfo = {"name":`${data.users[i].name}`,"challenger":`${challenger}`,"challIndex":`${i}`,"wager":`${wager}`,"blackjackEnder":`${blackjackEnder}`,usedCards,playerCards,dealerCards};
								let jsonBlackjack = JSON.stringify(blackjackInfo);
								fs.writeFileSync(`/home/mattguy/carlcoin/cache/${challenger}blackjack`,jsonBlackjack);
								
								let intChanceSuccess = false;
								let intCheck = Math.random();
								if(isNaN(data.users[i]["INT"])){
									data.users[i]["INT"] = 0;
								}
								let intBonus = data.users[i]["INT"] * .1;
								if(intBonus > .5){
									intBonus = .5;
								}
								if(1 - intCheck < intBonus){
									intChanceSuccess = true;
								}
								
								if(isNaN(data.users[i]["unstable"])){
									data.users[i]["unstable"] = 0;
								}
								let playersValue = cardValue[playerCards.playerCards[0]%13]+cardValue[playerCards.playerCards[1]%13];
								if(playersValue == 22){
									playersValue = 11;
								}
								let dealersValue = cardValue[dealerCards.dealerCards[0]%13]+cardValue[dealerCards.dealerCards[1]%13];
								if(dealersValue == 22){
									dealersValue = 11;
								}
								if(data.users[i]["unstable"] >= 100){
									let resultsOfGame = `Something doesn't feel right... You can't comprehend the cards\n${data.users[i].name}, Type !cc hit or !cc stand, you have 1 min to respond.\nYou:${blackjackCards[playerCard1]},??. Dealer:${blackjackCards[dealerCard1]},??.`;
									drawBoard(message.channel, true, resultsOfGame, playerCards.playerCards, dealerCards.dealerCards,true,false,cardValue[playerCards.playerCards[0]%13],message.author.username,cardValue[dealerCards.dealerCards[0]%13],message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
								}
								else if(intChanceSuccess){
									let resultsOfGame = `Your INT helps you count the cards... You're sure the dealer has this hand\n${data.users[i].name}, Type !cc hit or !cc stand, you have 1 min to respond.\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},??.`;
									drawBoard(message.channel, false, resultsOfGame, playerCards.playerCards, dealerCards.dealerCards,false,false,playersValue,message.author.username,dealersValue,message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
								}
								else{
									let resultsOfGame = `${data.users[i].name}, Type !cc hit or !cc stand, you have 1 min to respond.\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},??.`;
									drawBoard(message.channel, true, resultsOfGame, playerCards.playerCards, dealerCards.dealerCards,false,false,playersValue,message.author.username,cardValue[dealerCards.dealerCards[0]%13],message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
								}
							}
							data.users[i]["activity"] = Date.now();
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);

						}
						noUser = false;
						break;
					}
				}
				if(noUser){
					message.channel.send('You are not registered for CC!').then(msg => msg.delete({timeout:5000})).catch(error => {console.log(error)});;
				}
			}
		}
	}
}

function blackjackHit(client,message){
	message.delete({timeout:60000}).catch(error => {console.log(error)});
	let personsId = message.author.id;
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`)){
		let blackjackFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
		let blackjackParse = JSON.parse(blackjackFile);
		if(blackjackParse.blackjackEnder < Date.now()){
			fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
			message.channel.send('Time has expired to play blackjack, you lost the money you bet!').then(msg => msg.delete({timeout:5000})).catch(error => {console.log(error)});
		}
		else{
			blackjackParse.blackjackEnder = parseInt(blackjackParse.blackjackEnder) + 60000;
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			let cardValue = [1,2,3,4,5,6,7,8,9,10,10,10,10];
			let dealerValue = [11,2,3,4,5,6,7,8,9,10,10,10,10];
			let newCard = (Math.floor(Math.random() * 52));
			while(blackjackParse.usedCards.usedCards[newCard]){
				newCard = (Math.floor(Math.random() * 52));
			}
			blackjackParse.usedCards.usedCards[newCard] == true;
			blackjackParse.playerCards.playerCards.push(newCard);
			let currentTotal = 0;
			let ace = false;
			let bust = false;
			for(let i=0;i<blackjackParse.playerCards.playerCards.length;i++){
				let currentCardValue = cardValue[blackjackParse.playerCards.playerCards[i]%13];
				if(currentCardValue == 1){
					ace = true;
				}
				currentTotal += currentCardValue;
			}
			let cardViewer = "";
			for(let i=0;i<blackjackParse.playerCards.playerCards.length;i++){
				cardViewer += blackjackCards[blackjackParse.playerCards.playerCards[i]];
			}
			if(currentTotal > 21){
				let resultsOfGame = `Bust! You drew a ${blackjackCards[newCard]}, ${blackjackParse.name}, you lose!\nYou:${cardViewer}\n`;
				console.log(blackjackParse.name + ' lost in blackjack');
				//seduce dealer
				let wisdomChance = Math.random();
				if(isNaN(data.users[blackjackParse.challIndex]["WIS"])){
					data.users[blackjackParse.challIndex]["WIS"] = 0;
				}
				let wisBonus = data.users[blackjackParse.challIndex]["WIS"] * .01;
				if(wisBonus > .1){
					wisBonus = .1;
				}
				if(1 - wisdomChance < wisBonus){
					resultsOfGame += `...But it didn't happen, you had enough WIS to know this game would have been a loss, so you never played\n`;
					data.users[blackjackParse.challIndex].balance += parseInt(blackjackParse.wager);
					data.blackjack -= parseInt(blackjackParse.wager);
				}
				else{
					let seduceChance = Math.random();
					if(isNaN(data.users[blackjackParse.challIndex]["CHR"])){
						data.users[blackjackParse.challIndex]["CHR"] = 0;
					}
					let chrBonus = data.users[blackjackParse.challIndex]["CHR"] * .01;
					if(chrBonus > .25){
						chrBonus = .25;
					}
					if(1 - seduceChance < chrBonus){
						let wagerHalf = Math.floor(parseInt(blackjackParse.wager) / 2);
						blackjackParse.wager = parseInt(blackjackParse.wager) - wagerHalf;
						data.users[blackjackParse.challIndex].balance += wagerHalf;
						data.blackjack -= wagerHalf;
						resultsOfGame += `${blackjackParse.name}, you wink at the dealer, because of your CHR he blushes and averts his eyes.... You sneak back half your bet!\n`;
					}
					//instability counter
					data.users[blackjackParse.challIndex]["unstable"] += parseInt(blackjackParse.wager);
					if(isNaN(data.users[blackjackParse.challIndex]["unstable"])){
						data.users[blackjackParse.challIndex]["unstable"] = parseInt(blackjackParse.wager);
					}
					if(isNaN(data.users[blackjackParse.challIndex]["suicide"])){
						data.users[blackjackParse.challIndex]["suicide"] = 1;
					}
					if(data.users[blackjackParse.challIndex]["unstable"] >= 100 && data.users[blackjackParse.challIndex]["unstable"] - parseInt(blackjackParse.wager) < 100){
						data.users[blackjackParse.challIndex]["suicide"] = 0;
						resultsOfGame += `You are starting to feel irrational.\n`;
						console.log(data.users[blackjackParse.challIndex].name + " has become irrational");

					}
					if(data.users[blackjackParse.challIndex]["unstable"] > 250){
						resultsOfGame += `You are completely unstable\n`;
						console.log(data.users[blackjackParse.challIndex].name + " has become unstable");
						data.users[blackjackParse.challIndex]["unstable"] = 250
					}
				}
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				drawBoard(message.channel, false, resultsOfGame, blackjackParse.playerCards.playerCards, blackjackParse.dealerCards.dealerCards,false,true,currentTotal,blackjackParse.name,dealerValue[blackjackParse.dealerCards.dealerCards[0]%13]+dealerValue[blackjackParse.dealerCards.dealerCards[1]%13],message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
			}
			else if(ace && currentTotal + 10 <= 21){
				let jsonBlackjack = JSON.stringify(blackjackParse);
				fs.writeFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`,jsonBlackjack);
				let resultsOfGame = `${blackjackParse.name}, you drew a ${blackjackCards[newCard]} you now have ${currentTotal} (or ${currentTotal + 10} since you have an ace)\nYou:${cardViewer}`;
				drawBoard(message.channel, true, resultsOfGame, blackjackParse.playerCards.playerCards, blackjackParse.dealerCards.dealerCards,false,false,`${currentTotal} (or ${currentTotal + 10})`,blackjackParse.name,dealerValue[blackjackParse.dealerCards.dealerCards[0]%13],message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
			}
			else{
				let jsonBlackjack = JSON.stringify(blackjackParse);
				fs.writeFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`,jsonBlackjack);
				let resultsOfGame = `${blackjackParse.name}, you drew a ${blackjackCards[newCard]} you now have ${currentTotal}\nYou:${cardViewer}`;
				drawBoard(message.channel, true, resultsOfGame, blackjackParse.playerCards.playerCards, blackjackParse.dealerCards.dealerCards,false,false,currentTotal,blackjackParse.name,dealerValue[blackjackParse.dealerCards.dealerCards[0]%13],message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
			}
		}
	}
}

function blackjackStand(client,message){
	message.delete({timeout:60000}).catch(error => {console.log(error)});
	let personsId = message.author.id;
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`)){
		let blackjackFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
		let blackjackParse = JSON.parse(blackjackFile);
		if(blackjackParse.blackjackEnder < Date.now()){
			fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
			message.channel.send('Time has expired to play blackjack, you lost the money you bet!').then(msg => msg.delete({timeout:5000})).catch(error => {console.log(error)});
		}
		else{
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			let cardValue = [1,2,3,4,5,6,7,8,9,10,10,10,10];
			let dealerTotal = 0;
			let ace = false;
			for(let i=0;i<blackjackParse.dealerCards.dealerCards.length;i++){
				let currentCardValue = cardValue[blackjackParse.dealerCards.dealerCards[i]%13];
				if(currentCardValue == 1){
					ace = true;
				}
				dealerTotal += currentCardValue;
			}
			if(ace && dealerTotal + 10 <= 21){
				dealerTotal += 10;
			}
			while(dealerTotal < 17){
				let newCard = (Math.floor(Math.random() * 52));
				while(blackjackParse.usedCards.usedCards[newCard]){
					newCard = (Math.floor(Math.random() * 52));
				}
				blackjackParse.usedCards.usedCards[newCard] == true;
				blackjackParse.dealerCards.dealerCards.push(newCard);
				let currentCardValue = cardValue[newCard%13];
				dealerTotal += currentCardValue;
				if(ace && dealerTotal > 21){
					ace = false;
					dealerTotal -= 10;
				}
			}
			if(ace && dealerTotal + 10 <= 21){
				dealerTotal += 10;
			}
			let cardViewer = "";
			for(let i=0;i<blackjackParse.dealerCards.dealerCards.length;i++){
				cardViewer += blackjackCards[blackjackParse.dealerCards.dealerCards[i]];
			}
			let playerViewer = "";
			for(let i=0;i<blackjackParse.playerCards.playerCards.length;i++){
				playerViewer += blackjackCards[blackjackParse.playerCards.playerCards[i]];
			}
			if(dealerTotal > 21){
				let resultsOfGame = `Bust! Dealer loses, ${blackjackParse.name}, you've won!\nYou:${playerViewer}. Dealer:${cardViewer}\n`;
				console.log(blackjackParse.name + ' won in blackjack');
				data.users[blackjackParse.challIndex].balance += Math.floor(parseInt(blackjackParse.wager) * 2);
				data.blackjack -= Math.floor(parseInt(blackjackParse.wager) * 2);
				data.users[blackjackParse.challIndex]["activity"] = Date.now();
				
				//instability counter
				let insane = false;
				if(data.users[blackjackParse.challIndex]["unstable"] >= 100){
					insane = true;
				}
				data.users[blackjackParse.challIndex]["unstable"] -= Math.floor(parseInt(blackjackParse.wager) * 2);
				if(isNaN(data.users[blackjackParse.challIndex]["unstable"]) || data.users[blackjackParse.challIndex]["unstable"] < 0){
					data.users[blackjackParse.challIndex]["unstable"] = 0;
				}
				if(insane && data.users[blackjackParse.challIndex]["unstable"] + Math.floor(parseInt(blackjackParse.wager) * 2) >= 100 && data.users[blackjackParse.challIndex]["unstable"] < 100){
					data.users[blackjackParse.challIndex]["suicide"] = 1;
					resultsOfGame += `You come to your senses.\n`;
					console.log(data.users[blackjackParse.challIndex].name + " has calmed down");
				}
				if(isNaN(data.users[blackjackParse.challIndex]["CHR"])){
					data.users[blackjackParse.challIndex]["CHR"] = 0;
				}
				if(isNaN(data.users[blackjackParse.challIndex]["chrExp"])){
					data.users[blackjackParse.challIndex]["chrExp"] = 0;
				}
				data.users[blackjackParse.challIndex]["chrExp"] += Math.floor(parseInt(blackjackParse.wager) * 2);
				if(data.users[blackjackParse.challIndex]["CHR"] * 2 + 20 < data.users[blackjackParse.challIndex]["chrExp"]){
					data.users[blackjackParse.challIndex]["CHR"] += 1;
					data.users[blackjackParse.challIndex]["chrExp"] = 0;
					resultsOfGame += `Winning blackjack made you more slick, your CHR increased!`;
				}
				let playerValueBust = 0;
				let playerAceBust = false;
				for(let i=0;i<blackjackParse.playerCards.playerCards.length;i++){
					let currentCardValue = cardValue[blackjackParse.playerCards.playerCards[i]%13];
					if(currentCardValue == 1){
						playerAceBust = true;
					}
					playerValueBust += currentCardValue;
				}
				if(playerAceBust && playerValueBust + 10 <= 21){
					playerValueBust += 10;
				}
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				drawBoard(message.channel, false, resultsOfGame, blackjackParse.playerCards.playerCards, blackjackParse.dealerCards.dealerCards,false,true,playerValueBust,blackjackParse.name,dealerTotal,message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
			}
			else{
				let playerValue = 0;
				let playerAce = false;
				for(let i=0;i<blackjackParse.playerCards.playerCards.length;i++){
					let currentCardValue = cardValue[blackjackParse.playerCards.playerCards[i]%13];
					if(currentCardValue == 1){
						playerAce = true;
					}
					playerValue += currentCardValue;
				}
				if(playerAce && playerValue + 10 <= 21){
					playerValue += 10;
				}
				if(playerValue > dealerTotal){
					//player wins
					let resultsOfGame = `${blackjackParse.name}, you have ${playerValue}, Dealer has ${dealerTotal}. You've won!\nYou:${playerViewer}. Dealer:${cardViewer}\n`;
					console.log(blackjackParse.name + ' won in blackjack');
					data.users[blackjackParse.challIndex].balance += Math.floor(parseInt(blackjackParse.wager) * 2);
					data.blackjack -= Math.floor(parseInt(blackjackParse.wager) * 2);
					data.users[blackjackParse.challIndex]["activity"] = Date.now();
					
					//instability counter
					let insane = false;
					if(data.users[blackjackParse.challIndex]["unstable"] >= 100){
						insane = true;
					}
					data.users[blackjackParse.challIndex]["unstable"] -= Math.floor(parseInt(blackjackParse.wager) * 2);
					if(isNaN(data.users[blackjackParse.challIndex]["unstable"]) || data.users[blackjackParse.challIndex]["unstable"] < 0){
						data.users[blackjackParse.challIndex]["unstable"] = 0;
					}
					if(insane && data.users[blackjackParse.challIndex]["unstable"] + Math.floor(parseInt(blackjackParse.wager) * 2) >= 100 && data.users[blackjackParse.challIndex]["unstable"] < 100){
						data.users[blackjackParse.challIndex]["suicide"] = 1;
						resultsOfGame += `You come to your senses.\n`;
						console.log(data.users[blackjackParse.challIndex].name + " has calmed down");
					}
					if(isNaN(data.users[blackjackParse.challIndex]["CHR"])){
						data.users[blackjackParse.challIndex]["CHR"] = 0;
					}
					if(isNaN(data.users[blackjackParse.challIndex]["chrExp"])){
						data.users[blackjackParse.challIndex]["chrExp"] = 0;
					}
					data.users[blackjackParse.challIndex]["chrExp"] += Math.floor(parseInt(blackjackParse.wager) * 2);
					if(data.users[blackjackParse.challIndex]["CHR"] * 2 + 20 < data.users[blackjackParse.challIndex]["chrExp"]){
						data.users[blackjackParse.challIndex]["CHR"] += 1;
						data.users[blackjackParse.challIndex]["chrExp"] = 0;
						resultsOfGame += `Winning blackjack made you more slick, your CHR increased!`;
					}
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					drawBoard(message.channel, false, resultsOfGame, blackjackParse.playerCards.playerCards, blackjackParse.dealerCards.dealerCards,false,true,playerValue,blackjackParse.name,dealerTotal,message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
				}
				else if(dealerTotal > playerValue){
					//player lose
					let resultsOfGame = `${blackjackParse.name}, you have ${playerValue}, Dealer has ${dealerTotal}. You've lost!\nYou:${playerViewer}. Dealer:${cardViewer}\n`;
					console.log(blackjackParse.name + ' lost in blackjack');
					data.users[blackjackParse.challIndex]["activity"] = Date.now();
					let wisdomChance = Math.random();
					if(isNaN(data.users[blackjackParse.challIndex]["WIS"])){
						data.users[blackjackParse.challIndex]["WIS"] = 0;
					}
					let wisBonus = data.users[blackjackParse.challIndex]["WIS"] * .01;
					if(wisBonus > .1){
						wisBonus = .1;
					}
					if(1 - wisdomChance < wisBonus){
						resultsOfGame += `...But it didn't happen, you had enough WIS to know this game would have been a loss, so you never played\n`;
						data.users[blackjackParse.challIndex].balance += parseInt(blackjackParse.wager);
						data.blackjack -= parseInt(blackjackParse.wager);
					}
					else{
						//seduce dealer
						let seduceChance = Math.random();
						if(isNaN(data.users[blackjackParse.challIndex]["CHR"])){
							data.users[blackjackParse.challIndex]["CHR"] = 0;
						}
						let chrBonus = data.users[blackjackParse.challIndex]["CHR"] * .01;
						if(chrBonus > .25){
							chrBonus = .25;
						}
						if(1 - seduceChance < chrBonus){
							let wagerHalf = Math.floor(parseInt(blackjackParse.wager) / 2);
							blackjackParse.wager = parseInt(blackjackParse.wager) - wagerHalf;
							data.users[blackjackParse.challIndex].balance += wagerHalf;
							data.blackjack -= wagerHalf;
							resultsOfGame += `You wink at the dealer, because of your CHR he blushes and averts his eyes.... You sneak back half your bet!\n`;
						}
						//instability counter
						data.users[blackjackParse.challIndex]["unstable"] += parseInt(blackjackParse.wager);
						if(isNaN(data.users[blackjackParse.challIndex]["unstable"])){
							data.users[blackjackParse.challIndex]["unstable"] = parseInt(blackjackParse.wager);
						}
						if(isNaN(data.users[blackjackParse.challIndex]["suicide"])){
							data.users[blackjackParse.challIndex]["suicide"] = 1;
						}
						if(data.users[blackjackParse.challIndex]["unstable"] >= 100 && data.users[blackjackParse.challIndex]["unstable"] - parseInt(blackjackParse.wager) < 100){
							data.users[blackjackParse.challIndex]["suicide"] = 0;
							resultsOfGame += `You are starting to feel irrational.\n`;
							console.log(data.users[blackjackParse.challIndex].name + " has become irrational");
						}
						if(data.users[blackjackParse.challIndex]["unstable"] > 250){
							resultsOfGame += `You are completely unstable`;
							console.log(data.users[blackjackParse.challIndex].name + " has become unstable");
							data.users[blackjackParse.challIndex]["unstable"] = 250
						}
					}
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					drawBoard(message.channel, false, resultsOfGame, blackjackParse.playerCards.playerCards, blackjackParse.dealerCards.dealerCards,false,true,playerValue,blackjackParse.name,dealerTotal,message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
				}
				else{
					//draw
					let resultsOfGame = `${blackjackParse.name}, you have ${playerValue}, Dealer has ${dealerTotal}. It's a draw!\nYou:${playerViewer}. Dealer:${cardViewer}`;
					console.log(blackjackParse.name + ' drew in blackjack');
					drawBoard(message.channel, false, resultsOfGame, blackjackParse.playerCards.playerCards, blackjackParse.dealerCards.dealerCards,false,true,playerValue,blackjackParse.name,dealerTotal,message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
					data.users[blackjackParse.challIndex].balance += parseInt(blackjackParse.wager);
					data.blackjack -= parseInt(blackjackParse.wager);
					data.users[blackjackParse.challIndex]["activity"] = Date.now();
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
				}
			}
		}
	}
}

//create board for blackjack
	async function drawBoard(channel, hiddenDealer, gameMessage, playerCards, dealerCards, unstable, ender, playerVal, playerName, dealerVal,userIcon){
	const canvas = Canvas.createCanvas(496,288);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('/home/mattguy/carlcoin/cardImages/pokertable.jpg');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#358a54';
	ctx.strokeRect(0,0,canvas.width,canvas.height);
	
	const avatar = await Canvas.loadImage(userIcon);
	ctx.drawImage(avatar,0,105,75,75);
	ctx.strokeStyle = '#358a54';
	ctx.strokeRect(0,105,75,75);
	
	const carlCoinImage = await Canvas.loadImage(`/home/mattguy/carlcoin/cardImages/carlcoin2.png`);
	ctx.drawImage(carlCoinImage,421,105,75,75);
	ctx.strokeStyle = '#358a54';
	ctx.strokeRect(421,105,75,75);
	//player name and val
	ctx.font = 'bold 20px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(playerName, 80, 135);
	ctx.font = 'bold 20px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(playerVal, 80, 160);
	//carl name and val
	ctx.font = 'bold 20px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText('CarlCoin', 320, 160);
	ctx.font = 'bold 20px sans-serif';
	ctx.fillStyle = '#ffffff';
	ctx.fillText(dealerVal, 390, 135);
	for(let i=0;i<playerCards.length;i++){
		let currentCard = await Canvas.loadImage(`/home/mattguy/carlcoin/cardImages/${blackjackCardsImages[playerCards[i]]}`);
		ctx.drawImage(currentCard,25 + (i * 25) ,188,130,200);
		if(unstable){
			let currentCard = await Canvas.loadImage(`/home/mattguy/carlcoin/cardImages/purple_back.png`);
			ctx.drawImage(currentCard,25 + ((i+1) * 25) ,188,130,200);
			break;
		}
	}
	for(let i=0;i<dealerCards.length;i++){
		let dealerCard = await Canvas.loadImage(`/home/mattguy/carlcoin/cardImages/${blackjackCardsImages[dealerCards[i]]}`);
		ctx.drawImage(dealerCard,340 - (i * 25) ,-100,130,200);
		if(hiddenDealer){
			dealerCard = await Canvas.loadImage(`/home/mattguy/carlcoin/cardImages/purple_back.png`);
			ctx.drawImage(dealerCard,340 - ((i+1) * 25) ,-100,130,200);
			break;
		}
	}
	
	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'board.png');
	if(!ender){
		channel.send(`${gameMessage}`,attachment).then(msg => msg.delete({timeout:60000})).catch(error => {console.log(error)});
	}
	else{
		channel.send(`${gameMessage}`,attachment);
	}
}

//export functions
module.exports = {
	blackjackStart,
	blackjackHit,
	blackjackStand
};