'use strict';
// Import the discord.js module and others
const Discord = require('discord.js');
const fs = require('fs');
const md5 = require('md5');
const Canvas = require('canvas');
//additional files holding each feature
const playerBattle = require('./js/playerBattle.js');
const guessingGame = require('./js/guessGame.js');
const dailyEvents = require('./js/daily.js');
const joinCarl = require('./js/joinCarl.js');
const audit = require('./js/audit.js');
const balance = require('./js/balance.js');
const pay = require('./js/payUser.js');
const chance = require('./js/chance.js');
const work = require('./js/work.js');
const purchase = require('./js/purchase.js');
// Create an instance of a Discord client
const client = new Discord.Client();
// import token and database
const credentials = require('./auth.json');
//raffle variables
let startupDay = new Date();
let raffleRNG = Math.floor(Math.random() * (300 - 250 + 1)) + 250;
let messageCounter = 0;
let raffleStart = false;
let mysteryNumber = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
let md5Val = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
console.log("rafflerng",raffleRNG);
//new day checking variables
let prevDate = startupDay.getDay();
//anti spam stuff
let recentId;
//cards
const blackjackCards = ['♠A','♠2','♠3','♠4','♠5','♠6','♠7','♠8','♠9','♠10','♠J','♠Q','♠K','♥A','♥2','♥3','♥4','♥5','♥6','♥7','♥8','♥9','♥10','♥J','♥Q','♥K','♦A','♦2','♦3','♦4','♦5','♦6','♦7','♦8','♦9','♦10','♦J','♦Q','♦K','♣A','♣2','♣3','♣4','♣5','♣6','♣7','♣8','♣9','♣10','♣J','♣Q','♣K'];
const blackjackCardsImages = ['AS.png','2S.png','3S.png','4S.png','5S.png','6S.png','7S.png','8S.png','9S.png','10S.png','JS.png','QS.png','KS.png','AH.png','2H.png','3H.png','4H.png','5H.png','6H.png','7H.png','8H.png','9H.png','10H.png','JH.png','QH.png','KH.png','AD.png','2D.png','3D.png','4D.png','5D.png','6D.png','7D.png','8D.png','9D.png','10D.png','JD.png','QD.png','KD.png','AC.png','2C.png','3C.png','4C.png','5C.png','6C.png','7C.png','8C.png','9C.png','10C.png','JC.png','QC.png','KC.png'];

//sets ready presense
client.on('ready', () => {
  client.user.setPresence({
    status: 'online',
    activity: {
        name: 'for !cc help',
        type: "WATCHING"
    }
  });
  //list server
  client.guilds.cache.forEach(guild => {
    console.log(`${guild.name} | ${guild.id}`);
  });
  console.log('I am ready!');
});
// Create an event listener for messages
client.on('message', message => {
	//set presence
   client.user.setPresence({
      status: 'online',
		activity: {
         name: 'for !cc help',
         type: "WATCHING"
      }
   });
	//defines the date and time for certain aspects of the bot
	let universalDate = new Date();
	let timeRightNow = universalDate.getMinutes();
	let today = universalDate.getDay();	
	//increment message counter with spam protection
	if(!raffleStart && (recentId !== message.author.id && !message.author.bot)){
		messageCounter += 1;
		recentId = message.author.id;
	}
	//raffle functionality
	//message failsafe incase countery somehow goes past value
	if(messageCounter > raffleRNG){
		messageCounter = 0;
	}
	//detects when md5 raffle should begin
	if(messageCounter == raffleRNG && !raffleStart){
		guessingGame.startGuessGame(message);
	}
	//daily events
	if(today != prevDate){
		dailyEvents.dailyEvents(message);
	}
	/* START OF USER COMMANDS, MAKE SURE ALL COMMANDS BELOW ARE MEANT TO BE RUN ONLY ONCE */
	//guess command
	if(raffleStart && message.content.startsWith('!cc guess')){ /* !cc guess amount */
		guessingGame.guessNumber(message);
	}
	//battle start command
	else if(message.content.startsWith('!cc challenge')){ /* !cc challenge @user amount */
		playerBattle.battlePlayer(message);
	}
	//accept or deny battle
	else if(message.content === '!cc denyBattle' || message.content === '!cc acceptBattle'){
		playerBattle.acceptDenyBattle(message);
	}
   //join command
	else if (message.content === '!cc join' && !message.author.bot) {
		joinCarl.joinCarlCoin(message);
	}
	//audit user
	else if(message.content.startsWith('!cc audit')){
		audit.auditUser(message);
	}
	//player card
	else if(message.content === '!cc balance'){
		balance.checkBalance(message);
	}
	//pay user
	else if(message.content.startsWith('!cc pay')){
		pay.payUser(message);
	}
	//chance game
	else if(message.content === '!cc chance'){ /*!cc chance*/ 
		chance.chanceGame(message);
	}
	//work
	else if(message.content === '!cc work'){
		work.workPlayer(message);
	}
	//purchase home
	else if(message.content.startsWith('!cc purchase')){ /* !cc purchase home/apartment/skyscraper */
		purchase.purchaseItem(message);
	}
	//purchase items
	else if(message.content === '!cc catalog'){
		purchase.purchaseList(message);
	}
	//sell house
	else if(message.content.startsWith('!cc sell')){ /* !cc sell house/apartment */
		let chop = message.content.split(" ");
		if(chop.length > 3){
			message.channel.send('Too many arguments supplied!');
		}
		else{
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			let noUser = true;
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == message.author.id){
					let type = chop[chop.length-1];
					if(type == "house"){
						if(data.users[i]["house"] - 1 < 0 || isNaN(data.users[i]["house"])){
							message.channel.send('You do not have any homes!');
						}
						else{
							data.users[i]["house"] -= 1;
							data.users[i].balance += 50;
							data.econ += 50;
							data.users[i]["activity"] = Date.now();
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have sold a home! You now own ${data.users[i].house} homes`);
							console.log(data.users[i].name + " sold a home");
						}
					}
					else if(type == "apartment"){
						if(data.users[i]["apartment"] - 1 < 0 || isNaN(data.users[i]["apartment"])){
							message.channel.send('You do not have any apartments!');
						}
						else{
							data.users[i]["apartment"] -= 1;
							data.users[i].balance += 150;
							data.econ += 150;
							data.users[i]["activity"] = Date.now();
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have sold an apartment! You now own ${data.users[i].apartment} apartment`);
							console.log(data.users[i].name + " sold an apartment");
						}
					}
					else if(type == "skyscraper"){
						if(data.users[i]["skyscraper"] - 1 < 0 || isNaN(data.users[i]["skyscraper"])){
							message.channel.send('You do not have any skyscrapers!');
						}
						else{
							data.users[i]["skyscraper"] -= 1;
							data.users[i].balance += 250;
							data.econ += 250;
							data.users[i]["activity"] = Date.now();
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have sold a skyscraper! You now own ${data.users[i].skyscraper} skyscrapers`);
							console.log(data.users[i].name + " sold a skyscraper");
						}
					}
					else{
						message.channel.send('Invalid sell! Try house, apartment or skyscraper');
					}
					noUser = false;
					break;
				}
			}
			if(noUser){
				message.channel.send('You are not registered for Carl Coin!');
			}
		}
	}
	//sell to someone
	else if(message.content.startsWith('!cc userSell')){ /* !cc sellTo person offer amount*/
		let chop = message.content.split(" ");
		if(chop.length != 5){
			message.channel.send('Command arguments incorrect!');
		}
		else{
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			let seller = message.author.id;
			let mentionOK = true;
			let buyer = 0;
			try{
				buyer = getUserFromMention(chop[chop.length-3]).id;
			}
			catch(err){
				message.channel.send('Invalid user selected!');
				mentionOK = false;
			}
			if(mentionOK){
				let resell = true;
				if(fs.existsSync(`/home/mattguy/carlcoin/cache/${buyer}houseSell`)){
					let sellFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${buyer}houseSell`);
					let sellParse = JSON.parse(sellFile);
					if(sellParse.sellEnder < Date.now()){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${buyer}houseSell`);
					}
					else{
						resell = false;
						message.channel.send('That person is already in an offer!');
					}
				}
				if(resell){
					let price = parseInt(chop[chop.length-1]);
					if(buyer == seller){
						message.channel.send('You cannot sell to yourself!');
					}
					else if(isNaN(price) || price < 0){
						message.channel.send('Invalid amount entered!');
					}
					else{
						let noUser = true;
						for(let i=0;i<data.users.length;i++){
							if(data.users[i].id == seller){
								let noBuy = true;
								for(let j=0;j<data.users.length;j++){
									if(data.users[j].id == buyer){
										let offerType = chop[chop.length-2];
										//check if house
										if(offerType == "house" || offerType == "apartment" || offerType == "skyscraper"){
											if(data.users[j].balance - price < 0){
												message.channel.send('Buyer doesnt have enough CC!');
											}
											else if(data.users[i][`${offerType}`] < 0 || isNaN(data.users[i][`${offerType}`])){
												message.channel.send(`You dont have a ${offerType}`);
											}
											else{
												let sellEnder = Date.now() + 60000;
												let sellInfo = {"seller":`${seller}`,"sellerIndex":`${i}`,"buyer":`${buyer}`,"buyerIndex":`${j}`,"price":`${price}`,"sellEnder":`${sellEnder}`,"type":`${offerType}`};
												let jsonBattle = JSON.stringify(sellInfo);
												fs.writeFileSync(`/home/mattguy/carlcoin/cache/${buyer}houseSell`,jsonBattle);
												message.channel.send(`${data.users[j].name}! Type !cc acceptPurchase to accept ${data.users[i].name}'s offer or type !cc denyPurchase to reject the offer. You have 1 minute to respond.`);
												console.log(data.users[i].name + " trying to sell to " + data.users[j].name);
											}
										}
										else{
											message.channel.send('Buyer doesnt have enough CC!');
										}
										noBuy = false;
										break;
									}
								}
								if(noBuy){
									message.channel.send('Buyer doesnt exist!');
								}
								noUser = false;
								break;
							}
						}
						if(noUser){
							message.channel.send('You are not registered for CC!');
						}
					}
				}
			}
		}			
	}
	//accept offer
	else if(message.content === '!cc acceptPurchase' || message.content === '!cc denyPurchase'){
		let personsId = message.author.id;
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`)){
			let sellFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
			let sellParse = JSON.parse(sellFile);
			if(sellParse.sellEnder < Date.now()){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
				message.channel.send('Time has expired to accept the offer');
			}
			else{
				let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
				let data = JSON.parse(database);
				if(message.content.startsWith('!cc denyPurchase')){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
					message.channel.send('You have declined the offer');
				}
				else if(message.content.startsWith('!cc acceptPurchase')){
					if(data.users[sellParse.buyerIndex].balance - sellParse.price < 0){
						message.channel.send(`You don't have enough CC!`);
					}
					else{
						let price = parseInt(sellParse.price);
						data.users[sellParse.sellerIndex].balance += price;
						data.users[sellParse.buyerIndex].balance -= price;
						if(sellParse.type == "house"){
							data.users[sellParse.sellerIndex]["house"] -= 1;
							data.users[sellParse.buyerIndex]["house"] += 1;
							if(isNaN(data.users[sellParse.buyerIndex]["house"])){
								data.users[sellParse.buyerIndex]["house"] = 1;
							}
						}
						else if(sellParse.type == "apartment"){
							data.users[sellParse.sellerIndex]["apartment"] -= 1;
							data.users[sellParse.buyerIndex]["apartment"] += 1;
							if(isNaN(data.users[sellParse.buyerIndex]["apartment"])){
								data.users[sellParse.buyerIndex]["apartment"] = 1;
							}
						}
						else if(sellParse.type == "skyscraper"){
							data.users[sellParse.sellerIndex]["skyscraper"] -= 1;
							data.users[sellParse.buyerIndex]["skyscraper"] += 1;
							if(isNaN(data.users[sellParse.buyerIndex]["skyscraper"])){
								data.users[sellParse.buyerIndex]["skyscraper"] = 1;
							}
						}
						data.users[sellParse.sellerIndex]["activity"] = Date.now();
						data.users[sellParse.buyerIndex]["activity"] = Date.now();
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
						message.channel.send('You have accepted the offer!');
						console.log(data.users[sellParse.sellerIndex].name + " has sold to " + data.users[sellParse.buyerIndex]);
					}
				}
			}
		}
	}
	//economy function
	else if(message.content === '!cc econ'){
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let highestEarnerName = "";
		let highestEarnerAmount = 0;
		let poorPeople = 0;
		let houseCount = 0;
		let apartmentCount = 0;
		let skyCount = 0;
		let carlball = data.carlball;
		//searches for highest and lowest earner
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].balance > highestEarnerAmount){
				highestEarnerName = data.users[i].name;
				highestEarnerAmount = data.users[i].balance;
			}
			if(data.users[i].balance == 0){
				poorPeople += 1;
			}
			if(data.users[i]["house"] > 0 && !isNaN(data.users[i]["house"])){
				houseCount += data.users[i]["house"];
			}
			if(data.users[i]["apartment"] > 0 && !isNaN(data.users[i]["apartment"])){
				apartmentCount += data.users[i]["apartment"];
			}
			if(data.users[i]["skyscraper"] > 0 && !isNaN(data.users[i]["skyscraper"])){
				skyCount += data.users[i]["skyscraper"];
			}
		}
		const econEmbed = new Discord.MessageEmbed()
			.setColor('#F7931A')
			.setTitle(`The Carl Coin Economy`)
			.setDescription(`Highest earner: ${highestEarnerName} with ${highestEarnerAmount}CC`)
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
				{ name: 'Poor People', value: `${poorPeople}`},
			)
		message.channel.send(econEmbed);
	}
	//lottery
	else if(message.content === '!cc lottery'){
		let personsId = message.author.id;
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`)){
			let lotteryRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`);
			let lotteryFile = JSON.parse(lotteryRead);
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			let noUser = true;
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id ==  personsId){
					if(data.users[i].balance - 5 < 0){
						message.channel.send(`You don't have enough CC!`);
					}
					else{
						let play = true;
						for(let j=0;j<lotteryFile.users.length;j++){
							if(lotteryFile.users[j].id == personsId){
								message.channel.send('You already played today!');
								play = false;
								break;
							}
						}
						if(play){
							data.users[i].balance -= 5;
							lotteryFile.users.push({"id":`${personsId}`});
							data["carlball"] += 5;
							let newLottery = JSON.stringify(lotteryFile);
							fs.writeFileSync('/home/mattguy/carlcoin/cache/dailyLottery.json',newLottery);
							data.users[i]["activity"] = Date.now();
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have been added to the lottery! Drawing happens at midnight!`);
							console.log(data.users[i].name + " has entered the lottery");
						}
					}
					noUser = false;
					break;
				}
			}
			if(noUser){
				message.channel.send(`You are not registered for CarlCoin!`);
			}
		}
		else{
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			let noUser = true;
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id ==  personsId){
					if(data.users[i].balance - 5 < 0){
						message.channel.send(`You don't have enough CC!`);
					}
					else{
						data.users[i].balance -= 5;
						let lotteryFile = {"users":[]};
						lotteryFile.users.push({"id":`${personsId}`});
						data["carlball"] += 5;
						data.users[i]["activity"] = Date.now();
						let newLottery = JSON.stringify(lotteryFile);
						fs.writeFileSync('/home/mattguy/carlcoin/cache/dailyLottery.json',newLottery);
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have been added to the lottery!`);
						console.log(data.users[i].name + " has entered the lottery");
					}
					noUser = false;
					break;
				}
			}
			if(noUser){
				message.channel.send(`You are not registered for CarlCoin!`);
			}
		}
	}
	//blackjack
	else if(message.content.startsWith('!cc blackjack')){ /* !cc blackjack amount */	
		let chop = message.content.split(" ");
		if(chop.length != 3){
			message.channel.send('Command arguments incorrect!');
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
								console.log(data.users[i].name + ' has started blackjack');	
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
									}
									else{
										data.users[i].balance += Math.floor(wager * 2.5);
										data.blackjack -= Math.floor(wager * 2.5);
										let resultsOfGame = `You got a natural! You win!\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.\n`;
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
									if(data.users[i]["unstable"] >= 100){
										let resultsOfGame = `Something doesn't feel right... You can't comprehend the cards\n${data.users[i].name}, Type !cc hit or !cc stand, you have 1 min to respond.\nYou:${blackjackCards[playerCard1]},??. Dealer:${blackjackCards[dealerCard1]},??.`;
										drawBoard(message.channel, true, resultsOfGame, playerCards.playerCards, dealerCards.dealerCards,true,false,cardValue[playerCards.playerCards[0]%13],message.author.username,cardValue[dealerCards.dealerCards[0]%13],message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
									}
									else if(intChanceSuccess){
										let resultsOfGame = `Your INT helps you count the cards... You're sure the dealer has this hand\n${data.users[i].name}, Type !cc hit or !cc stand, you have 1 min to respond.\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},??.`;
										drawBoard(message.channel, false, resultsOfGame, playerCards.playerCards, dealerCards.dealerCards,false,false,cardValue[playerCards.playerCards[0]%13]+cardValue[playerCards.playerCards[1]%13],message.author.username,cardValue[dealerCards.dealerCards[0]%13]+cardValue[dealerCards.dealerCards[1]%13],message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
									}
									else{
										let resultsOfGame = `${data.users[i].name}, Type !cc hit or !cc stand, you have 1 min to respond.\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},??.`;
										drawBoard(message.channel, true, resultsOfGame, playerCards.playerCards, dealerCards.dealerCards,false,false,cardValue[playerCards.playerCards[0]%13]+cardValue[playerCards.playerCards[1]%13],message.author.username,cardValue[dealerCards.dealerCards[0]%13],message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
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
	//hit
	else if(message.content === '!cc hit'){
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
							let wagerHalf = Math.floor(blackjackParse.wager / 2);
							blackjackParse.wager = blackjackParse.wager - wagerHalf;
							data.users[blackjackParse.challIndex].balance += wagerHalf;
							data.blackjack -= wagerHalf;
							resultsOfGame += `${blackjackParse.name}, you wink at the dealer, because of your CHR he blushes and averts his eyes.... You sneak back half your bet!\n`;
						}
						//instability counter
						data.users[blackjackParse.challIndex]["unstable"] += Math.floor(blackjackParse.wager * 2);
						if(isNaN(data.users[blackjackParse.challIndex]["unstable"])){
							data.users[blackjackParse.challIndex]["unstable"] = Math.floor(blackjackParse.wager * 2);
						}
						if(isNaN(data.users[blackjackParse.challIndex]["suicide"])){
							data.users[blackjackParse.challIndex]["suicide"] = 1;
						}
						if(data.users[blackjackParse.challIndex]["unstable"] >= 100 && data.users[blackjackParse.challIndex]["unstable"] - Math.floor(blackjackParse.wager * 2) < 100){
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
	//stay
	else if(message.content === '!cc stand'){
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
					data.users[blackjackParse.challIndex].balance += Math.floor(blackjackParse.wager * 2);
					data.blackjack -= Math.floor(blackjackParse.wager * 2);
					data.users[blackjackParse.challIndex]["activity"] = Date.now();
					
					//instability counter
					let insane = false;
					if(data.users[blackjackParse.challIndex]["unstable"] >= 100){
						insane = true;
					}
					data.users[blackjackParse.challIndex]["unstable"] -= Math.floor(blackjackParse.wager * 2);
					if(isNaN(data.users[blackjackParse.challIndex]["unstable"]) || data.users[blackjackParse.challIndex]["unstable"] < 0){
						data.users[blackjackParse.challIndex]["unstable"] = 0;
					}
					if(insane && data.users[blackjackParse.challIndex]["unstable"] + Math.floor(blackjackParse.wager * 2) >= 100 && data.users[blackjackParse.challIndex]["unstable"] < 100){
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
					data.users[blackjackParse.challIndex]["chrExp"] += Math.floor(blackjackParse.wager * 2);
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
						data.users[blackjackParse.challIndex].balance += Math.floor(blackjackParse.wager * 2);
						data.blackjack -= Math.floor(blackjackParse.wager * 2);
						data.users[blackjackParse.challIndex]["activity"] = Date.now();
						
						//instability counter
						let insane = false;
						if(data.users[blackjackParse.challIndex]["unstable"] >= 100){
							insane = true;
						}
						data.users[blackjackParse.challIndex]["unstable"] -= Math.floor(blackjackParse.wager * 2);
						if(isNaN(data.users[blackjackParse.challIndex]["unstable"]) || data.users[blackjackParse.challIndex]["unstable"] < 0){
							data.users[blackjackParse.challIndex]["unstable"] = 0;
						}
						if(insane && data.users[blackjackParse.challIndex]["unstable"] + Math.floor(blackjackParse.wager * 2) >= 100 && data.users[blackjackParse.challIndex]["unstable"] < 100){
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
						data.users[blackjackParse.challIndex]["chrExp"] += Math.floor(blackjackParse.wager * 2);
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
								let wagerHalf = Math.floor(blackjackParse.wager / 2);
								blackjackParse.wager = blackjackParse.wager - wagerHalf;
								data.users[blackjackParse.challIndex].balance += wagerHalf;
								data.blackjack -= wagerHalf;
								resultsOfGame += `You wink at the dealer, because of your CHR he blushes and averts his eyes.... You sneak back half your bet!\n`;
							}
							//instability counter
							data.users[blackjackParse.challIndex]["unstable"] += Math.floor(blackjackParse.wager * 2);
							if(isNaN(data.users[blackjackParse.challIndex]["unstable"])){
								data.users[blackjackParse.challIndex]["unstable"] = Math.floor(blackjackParse.wager * 2);
							}
							if(isNaN(data.users[blackjackParse.challIndex]["suicide"])){
								data.users[blackjackParse.challIndex]["suicide"] = 1;
							}
							if(data.users[blackjackParse.challIndex]["unstable"] >= 100 && data.users[blackjackParse.challIndex]["unstable"] - Math.floor(blackjackParse.wager * 2) < 100){
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
						drawBoard(message.channel, false, resultsOfGame, blackjackParse.playerCards.playerCards, blackjackParse.dealerCards.dealerCards,false,true,playerValue,blackjackParse.name,dealerTotal,message.author.displayAvatarURL({format:'png'})).catch(error => {console.log(error); message.channel.send(resultsOfGame);});
						data.users[blackjackParse.challIndex].balance += parseInt(blackjackParse.wager);
						data.blackjack -= blackjackParse.wager;
						data.users[blackjackParse.challIndex]["activity"] = Date.now();
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
					}
				}
			}
		}
	}
	//uh oh
	else if(message.content === '!cc suicide'){
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id){
				let bullet = Math.floor(Math.random() * 6);
				let balance = data.users[i].balance;
				let canDie = data.users[i]["suicide"];
				if(isNaN(canDie)){
					data.users[i]["suicide"] = 1;
					canDie = data.users[i]["suicide"];
				}
				if(canDie == 1){
					message.channel.send(`You're too scared to try.`);
				}
				else if(bullet == 0){
					console.log("suicide " + data.users[i].name);
					data.users.splice(i,1);
					data.econ -= balance;
					message.channel.send(`You load in one bullet and spin the barrel.`);
					message.channel.send(`You pull the trigger... a click, a boom and darkness...\nWith this characters death, the thread of prophecy is severed. Rejoin CarlCoin to restore the weave of fate, or persist in the doomed world you have created.`);
				}
				else{
					data.users[i]["suicide"] = 1;
					data.users[i]["unstable"] = 0;
					console.log(data.users[i].name + " tried to commit suicide");
					message.channel.send(`You load in one bullet and spin the barrel.`);
					message.channel.send(`You pull the trigger... an empty click. You're too scared to try again.`);
				}
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				break;
			}
		}
	}
	//relax
	else if(message.content === '!cc relax'){
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id && !isNaN(data.users[i]["unstable"])){
				if(isNaN(data.users[i]["relax"])){
					data.users[i]["relax"] = Date.now() + 1800000;
					let relaxed = Math.random();
					if(relaxed >= 0.5){
						let insane = false;
						if(data.users[i]["unstable"] >= 100){
							insane = true;
						}
						data.users[i]["unstable"] -= 25;
						if(data.users[i]["unstable"] < 0){
							data.users[i]["unstable"] = 0;
						}
						message.channel.send(`You managed to relax a bit`);
						if(insane && data.users[i]["unstable"] + 25 >= 100 && data.users[i]["unstable"] < 100){
							message.channel.send(`You have come to your senses`);
						}

					}
					else{
						message.channel.send(`You couldn't relax at all`);
					}
				}
				else{
					if(data.users[i]["relax"] < Date.now()){
						data.users[i]["relax"] = Date.now() + 1800000;
						let relaxed = Math.random();
						if(relaxed >= 0.5){
							let insane = false;
							if(data.users[i]["unstable"] >= 100){
								insane = true;
							}
							data.users[i]["unstable"] -= 25;
							if(data.users[i]["unstable"] < 0){
								data.users[i]["unstable"] = 0;
							}
							message.channel.send(`You managed to relax a bit`);
							if(insane && data.users[i]["unstable"] + 25 >= 100 && data.users[i]["unstable"] < 100){
								message.channel.send(`You have come to your senses`);
							}
							if(isNaN(data.users[i]["CON"])){
								data.users[i]["CON"] = 0;
							}
							if(isNaN(data.users[i]["conExp"])){
								data.users[i]["conExp"] = 0;
							}
							data.users[i]["conExp"] += 1;
							if(data.users[i]["CON"]*2 +  5 < data.users[i]["conExp"]){
								data.users[i]["CON"] += 1;
								data.users[i]["conExp"] = 0;
								message.channel.send(`Relaxing helped clear your mind, your CON has increased!`);
							}
						}
						else{
							//con check
							let bonusChance = Math.random();
							if(isNaN(data.users[i]["CON"])){
								data.users[i]["CON"] = 0;
							}
							let conBonus = data.users[i]["CON"] * .01;
							if(conBonus > .1){
								conBonus = .1;
							}
							if(1 - bonusChance < conBonus){
								data.users[i]["unstable"] -= 10;
								if(data.users[i]["unstable"] < 0){
									data.users[i]["unstable"] = 0;
								}
								else if(data.users[i]["unstable"] + 10 >= 100 && data.users[i]["unstable"] < 100){
									message.channel.send(`You have come to your senses`);
								}
								message.channel.send(`Your CON helps you calm down despite everything`);
							}
							else{
								message.channel.send(`You couldn't relax at all`);
							}
						}
					}
					else{
						let timeLeft = data.users[i]["relax"] - Date.now();
						timeLeft = Math.floor(timeLeft / 1000);
						timeLeft = Math.floor(timeLeft / 60);
						message.channel.send(`You already tried relaxing, come back in ${timeLeft} mins.`);
					}
				}
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				break;
			}
		}
	}
	//doctor
	else if(message.content === '!cc doctor'){
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id && !isNaN(data.users[i]["unstable"])){
				if(data.users[i].balance - 2 < 0){
					message.channel.send(`You don't have enough CC! (Costs 2)`);
				}
				else{
					let insane = false;
					if(data.users[i]["unstable"] >= 100){
						insane = true;
					}
					data.users[i]["unstable"] -= 50;
					data.users[i].balance -= 2;
					data.welfare += 2;
					if(data.users[i]["unstable"] < 0){
						data.users[i]["unstable"] = 0;
					}
					message.channel.send(`The doctor gave you some medicine; You feel a bit better.`);
					if(insane && data.users[i]["unstable"] + 50 >= 100 && data.users[i]["unstable"] < 100){
						message.channel.send(`You have come to your senses`);
					}
				}
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				break;
			}
		}
	}
	//check sanity
	else if(message.content === '!cc sanity'){
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id && !isNaN(data.users[i]["unstable"])){
				if(data.users[i]["unstable"] < 10){
					message.channel.send(`You are fine`);
				}
				else if(data.users[i]["unstable"] >= 10 && data.users[i]["unstable"] < 25){
					message.channel.send(`You are feeling uneasy`);
				}
				else if(data.users[i]["unstable"] >= 25 && data.users[i]["unstable"] < 50){
					message.channel.send(`You are feeling awful`);
				}
				else if(data.users[i]["unstable"] >= 50 && data.users[i]["unstable"] < 75){
					message.channel.send(`You are feeling stressed`);
				}
				else if(data.users[i]["unstable"] >= 75 && data.users[i]["unstable"] < 100){
					message.channel.send(`You are feeling paranoid`);
				}
				else if(data.users[i]["unstable"] >= 100 && data.users[i]["unstable"] < 200){
					message.channel.send(`You are feeling irrational`);
				}
				else if(data.users[i]["unstable"] >= 200){
					message.channel.send(`You are completely unstable`);
					data.users[i]["suicide"] = 0;
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				}
				break;
			}
		}
	}
	//leaderboard
	else if(message.content === '!cc leaderboard'){
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let numberOneName = '';
		let numberTwoName = '';
		let numberThreeName = '';
		let numberOne = 0;
		let numberTwo = 0;
		let numberThree = 0;
		let userArray = [];
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].balance != 0){
				let balance = data.users[i].balance
				let user = data.users[i].name;
				let userObject = {name:`${user}`,balance:`${balance}`};
				userArray.push(userObject);
			}
		}
		userArray.sort(function (a,b){
			return b.balance - a.balance;
		});
		let messageBox = '';
		for(let i=0;i<userArray.length;i++){
			messageBox += `${i+1}. ${userArray[i].name}:${userArray[i].balance}\n`;
		}
		message.channel.send(`Leaderboard of Carl Coin\n${messageBox}`,{"code":true});
		//message.channel.send(`__Leaderboard: Top 3 Carl Coin Users__\n1. ${numberOneName} : ${numberOne}\n2. ${numberTwoName} : ${numberTwo}\n3. ${numberThreeName} : ${numberThree}`);
	}
	//update name
	else if(message.content === '!cc name'){
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id){
				data.users[i].name = message.author.username;
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				message.channel.send(`Your username has been updated`);
				break;
			}
		}
	}
	//cc sex
	else if(message.content.startsWith('!cc sex')){
		message.channel.send(`You have poggers sex`);
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		let chance = Math.random();
		if(chance >= 0.999){
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == id){
					let balance = data.users[i].balance;
					console.log("busted ultimate nut " + data.users[i].name);
					data.users.splice(i,1);
					data.econ -= balance;
					
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					message.channel.send(`You bust the ultimate nut, draining all of your life force\nWith this characters death, the thread of prophecy is severed. Rejoin CarlCoin to restore the weave of fate, or persist in the doomed world you have created.`);
					break;
				}
			}
		}
		else{
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == id){
					if(isNaN(data.users[i]["unstable"])){
						data.users[i]["unstable"] = 0;
					}
					data.users[i]["unstable"] -= 5;
					if(data.users[i]["unstable"] < 0){
						data.users[i]["unstable"] = 0;
					}
					if(data.users[i]["unstable"] + 5 >= 100 && data.users[i]["unstable"] < 100){
						message.channel.send(`You come to your senses`);
					}
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					message.channel.send(`It makes you feel a bit better`);
					break;
				}
			}
		}
	}
	//oh man dab lol
	else if(message.content === '!cc dab'){
		message.channel.send(`Oh man you are one funny guy! you did it! you hit that mf dab bruh holy shit you just fuckinnn were all like im gonna type !cc dab and see that it wont do anything! but suprise bitch! it fuckinnn dabbed LOL it did the dab! can you believe this??? it fucking dabbed!!! thats so crazy and quirky that the silly money bot had a dab feature built in! lol LOL LAMO I CANT BELIEVE IT ACTUALLY DABBED LOOL wow it dabbed you know what also dabs??? DAB PENS FOR $14.99 ON https://www.olivegarden.com`);
	}
	//f word
	else if(message.content === '!cc fuck'){
		message.channel.send(`Whoa whoa whoa whoa whoa there partner, that right there is a swear word in my Christian Carl Coin no sir I cannot let you be swearing in my CCC (Christian Carl Coin)`);
	}
	//robbery
	else if(message.content.startsWith('!cc rob')){
		let chop = message.content.split(" ");
		let corrUser = true;
		//if too many arguments
		if(chop.length != 3){
			message.channel.send(`Invalid arguments supplied!`);
		}
		else{
			let recipient = "";
			let recpid = "";
			//attempts to get username
			try{
				recipient = getUserFromMention(chop[chop.length-1]).username;
				recpid = getUserFromMention(chop[chop.length-1]).id;
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
	//rock paper scissors
	else if(message.content.startsWith('!cc rps')){ /* !cc challenge @user amount */
		//check command is correctly entered
		let chop = message.content.split(" ");
		if(chop.length != 4){
			message.channel.send('Command arguments incorrect!');
		}
		else{
			//read and parse database
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			//assign challenger
			let challenger = message.author.id;
			let mentionOK = true;
			let opponent = 0;
			//check if opponent exists or is correctly entered
			try{
				opponent = getUserFromMention(chop[chop.length-2]).id;
			}
			catch(err){
				message.channel.send('Invalid user selected!');
				mentionOK = false;
			}
			//run if opponent parse is okay
			if(mentionOK){
				let rebattle = true;
				//check if opponent is in battle
				if(fs.existsSync(`/home/mattguy/carlcoin/cache/${opponent}rps`)){
					//if opponent file exists, parse data
					let rpsFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${opponent}rps`);
					let rpsParse = JSON.parse(rpsFile);
					//time expired for battle, delete old file
					if(rpsParse.rpsEnder < Date.now()){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${opponent}rps`);
					}
					//if person is already in battle
					else{
						rebattle = false;
						message.channel.send('That person is already playing rock paper scissors!');
					}
				}
				//begin finding battle
				if(rebattle){
					//parse wager and check if valid
					let wager = parseInt(chop[chop.length-1]);
					//check if trying to battle self
					if(opponent == challenger){
						message.channel.send('You try to verse yourself and lost... how sad');
					}
					//check that wager is valid
					else if(isNaN(wager) || wager < 0){ //change later
						message.channel.send('Invalid amount entered!');
					}
					else{
						let noUser = true;
						//find challenger in database
						for(let i=0;i<data.users.length;i++){
							if(data.users[i].id == challenger){
								//if challenger doesnt have enough money
								if(data.users[i].balance - wager < 0){
									message.channel.send('You dont have enough CC!');
								}
								else{
									let noOpp = true;
									//find opponent in database
									for(let j=0;j<data.users.length;j++){
										if(data.users[j].id == opponent){
											//if opponent doesnt have enough money
											if(data.users[j].balance - wager < 0){
												message.channel.send('Opponent doesnt have enough CC!');
											}
											else{
												console.log("RPS:" + data.users[i].name + " vs " + data.users[j].name + " for " + wager);
												//begin setting up battle variables
												let rpsEnder = Date.now() + 60000;
												let rpsInfo = {"challenger":`${challenger}`,"challIndex":`${i}`,"opponent":`${opponent}`,"oppIndex":`${j}`,"wager":`${wager}`,"rpsEnder":`${rpsEnder}`};
												let jsonBattle = JSON.stringify(rpsInfo);
												//create battle cache file and alert opponent of their challenge
												fs.writeFileSync(`/home/mattguy/carlcoin/cache/${opponent}rps`,jsonBattle);
												data.users[i]["activity"] = Date.now();
												let newData = JSON.stringify(data);
												fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
												message.channel.send(`${data.users[j].name}! Type !cc acceptRps to accept ${data.users[i].name}'s rock paper scissors request or type !cc denyRps to reject the challenge. You have 1 minute to respond, make sure you can recieve DM's!`);
											}
											noOpp = false;
											break;
										}
									}
									if(noOpp){
										message.channel.send('Opponent doesnt exist!');
									}
								}
								noUser = false;
								break;
							}
						}
						if(noUser){
							message.channel.send('You are not registered for CC!');
						}
					}
				}
			}
		}	
	}
	//accept or deny battle
	else if(message.content === '!cc denyRps' || message.content === '!cc acceptRps'){
		//save message author id
		let personsId = message.author.id;
		//find if opponent file exists
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}rps`)){
			//parse opponent cache file
			let rpsFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
			let rpsParse = JSON.parse(rpsFile);
			//check if time has expired for this opponent
			if(rpsParse.rpsEnder < Date.now()){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
				message.channel.send('Time has expired to accept the rock paper scissors battle');
			}
			else{
				//if deny battle, mock opponent and delete their cache file
				if(message.content == '!cc denyRps'){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
					message.channel.send('You lose by default');
				}
				//accept battle protocol
				else if(message.content == '!cc acceptRps'){
					//parse database
					let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					let data = JSON.parse(database);
					//parse wager from cache file
					let wager = parseInt(rpsParse.wager);
					//checking to see if user suddenly doesnt have enough money
					if(data.users[rpsParse.challIndex].balance - wager < 0){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
						message.channel.send(`The challenger doesn't have enough money!`);
					}
					else if(data.users[rpsParse.oppIndex].balance - wager < 0){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
						message.channel.send(`You don't have enough money!`);
					}
					//begin battle
					else{
						message.channel.send(`Getting challengers throw, please wait!`);
						//set the winning amount
						let winnerAmount = wager * 2;
						const filter = m => {
							if((m.content !== 'rock' && m.content !== 'paper' && m.content !== 'scissors') && !m.author.bot){
								m.channel.send('Invalid choice, make sure you spelt it correctly!');
							}
							return (m.content === 'rock' || m.content === 'paper' || m.content === 'scissors')
						};
						//take money from both users
						client.users.cache.get(data.users[rpsParse.challIndex].id).send(`Type rock, paper, or scissors`).then(()=>{
							client.users.cache.get(data.users[rpsParse.challIndex].id).dmChannel.awaitMessages(filter, {max:1,time:20000,errors:['time']}).then(challChoice => {
								client.users.cache.get(data.users[rpsParse.challIndex].id).send(`Got it, going to get opponents choice now`);
								client.users.cache.get(data.users[rpsParse.oppIndex].id).send(`Type rock, paper, or scissors`).then(()=>{
									client.users.cache.get(data.users[rpsParse.oppIndex].id).dmChannel.awaitMessages(filter, {max:1,time:20000,errors:['time']}).then(oppChoice => {
										client.users.cache.get(data.users[rpsParse.challIndex].id).send(`Go back to the channel you were challenged to see who wins!`);
										client.users.cache.get(data.users[rpsParse.oppIndex].id).send(`Go back to the channel you were challenged to see who wins!`);
										let challThrow = challChoice.first().content;
										let oppThrow = oppChoice.first().content;
										
										if(challThrow != 'rock' && challThrow != 'scissors' && challThrow != 'paper' && oppThrow != 'rock' && oppThrow != 'scissors' && oppThrow != 'paper'){
											message.channel.send(`Someone didn't choose correctly, the match is cancelled!`)
										}
										else if(challThrow == 'rock' && oppThrow == 'scissors'){
											message.channel.send(`${data.users[rpsParse.challIndex].name} threw rock, ${data.users[rpsParse.oppIndex].name} threw scissors`);
											message.channel.send(`${data.users[rpsParse.challIndex].name} won!`);
											data.users[rpsParse.challIndex].balance += wager;
											data.users[rpsParse.oppIndex].balance -= wager;
										}
										else if(challThrow == 'scissors' && oppThrow == 'paper'){
											message.channel.send(`${data.users[rpsParse.challIndex].name} threw scissors, ${data.users[rpsParse.oppIndex].name} threw paper`);
											message.channel.send(`${data.users[rpsParse.challIndex].name} won!`);
											data.users[rpsParse.challIndex].balance += wager;
											data.users[rpsParse.oppIndex].balance -= wager;
										}
										else if(challThrow == 'paper' && oppThrow == 'rock'){
											message.channel.send(`${data.users[rpsParse.challIndex].name} threw paper, ${data.users[rpsParse.oppIndex].name} threw rock`);
											message.channel.send(`${data.users[rpsParse.challIndex].name} won!`);
											data.users[rpsParse.challIndex].balance += wager;
											data.users[rpsParse.oppIndex].balance -= wager;
										}
										else if(challThrow == oppThrow){
											message.channel.send(`${data.users[rpsParse.challIndex].name} threw ${challThrow}, ${data.users[rpsParse.oppIndex].name} threw ${oppThrow}`);
											message.channel.send(`It's a tie!`);
										}
										else{
											message.channel.send(`${data.users[rpsParse.challIndex].name} threw ${challThrow}, ${data.users[rpsParse.oppIndex].name} threw ${oppThrow}`);
											message.channel.send(`${data.users[rpsParse.oppIndex].name} won!`);
											data.users[rpsParse.challIndex].balance -= wager;
											data.users[rpsParse.oppIndex].balance += wager;
										}
										data.users[rpsParse.challIndex]["activity"] = Date.now();
										data.users[rpsParse.oppIndex]["activity"] = Date.now();
										data.users[rpsParse.challIndex]["bitterness"] = 0;
										data.users[rpsParse.oppIndex]["bitterness"] = 0;
										//write new data to database and delete cache file
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
									}).catch(oppChoice => {message.channel.send(`Opponent didn't type their response correctly or time expired to respond`);fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);});
								}).catch(() => {message.channel.send(`Failed to send DM to opponent (make sure you have DM's on for this server!)`);fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);});
							}).catch(challChoice => {message.channel.send(`Challenger didn't type their response correctly or time expired to respond`);fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);});
						}).catch(() => {message.channel.send(`Failed to send DM to challenger (make sure you have DM's on for this server!)`);fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);});
					}
				}
			}
		}
	}
	//slot machine
	else if(message.content.startsWith('!cc slots')){
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
	//help menu
	else if(message.content === '!cc help'){
		message.channel.send(`use !cc gameHelp to see information on games\nuse !cc userHelp to see user commands`);
	}
	//gamble help
	else if(message.content === '!cc gameHelp'){
		message.channel.send(`use !cc chance to maybe double your money!\nuse !cc guess <number> when theres a solve chance! numbers are between 1 and 100\nuse !cc challenge <@user> <amount> to challenge someone for some CC!\nuse !cc lottery to enroll in the lottery, winner gets the pot!\nuse !cc blackjack <amount> to play blackjack\nuse !cc rob <@user> to attempt to steal some coin from them!\nuse !cc rps <@user> <amount> to challenge someone to rock paper scissors, the bot will DM you!\nuse !cc slots <amount> to play some slot machine games!`);
	}
	//user help
	else if(message.content === '!cc userHelp'){
		message.channel.send(`use !cc join to join Carl Coin!\nuse !cc balance to see your balance\nuse !cc pay <@user> <amount> to pay another user\nuse !cc work to go to the carl mines!\nuse !cc econ to see the current economy\nuse !cc purchase <type> to purchase something\nuse !cc catalog to see all things for sale\nuse !cc sell <type> to sell a house, apartment or skyscraper!\nuse !cc userSell <@user> <type> <amount> to sell to another person\nuse !cc relax to unwind some stress from gambling\nuse !cc sanity to see how you are feeling\nuse !cc leaderboard to see everyones balance\nuse !cc audit <@user> to see their balance\nuse !cc doctor to get some medicine for your insanity\nuse !cc name to update to your current name`);
	}
	//caps lock
	else if(message.content.startsWith('!CC')){
		message.channel.send(`Stop yelling :|`);
	}
	//helper function to get user
	function getUserFromMention(mention) {
		if (!mention) return;
		if (mention.startsWith('<@') && mention.endsWith('>')) {
			mention = mention.slice(2, -1);

			if (mention.startsWith('!')) {
				mention = mention.slice(1);
			}

			return client.users.cache.get(mention);
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
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
