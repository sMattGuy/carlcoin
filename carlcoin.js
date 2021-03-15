'use strict';
// Import the discord.js module and others
const Discord = require('discord.js');
const fs = require('fs');
const md5 = require('md5');
// Create an instance of a Discord client
const client = new Discord.Client();

// import token and database
const credentials = require('./auth.json');

//raffle variables
let startupDay = new Date();
let raffleRNG = Math.floor(Math.random() * (500 - 400 + 1)) + 400;
let messageCounter = 0;
let raffleStart = false;
let mysteryNumber = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
let md5Val = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
console.log("rafflerng",raffleRNG);
let prevDate = startupDay.getDay();
let prevDate2 = startupDay.getDay();
//anti spam stuff
let recentId;
//cards
const blackjackCards = ['♠A','♠2','♠3','♠4','♠5','♠6','♠7','♠8','♠9','♠10','♠J','♠Q','♠K','♥A','♥2','♥3','♥4','♥5','♥6','♥7','♥8','♥9','♥10','♥J','♥Q','♥K','♦A','♦2','♦3','♦4','♦5','♦6','♦7','♦8','♦9','♦10','♦J','♦Q','♦K','♣A','♣2','♣3','♣4','♣5','♣6','♣7','♣8','♣9','♣10','♣J','♣Q','♣K'];
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
	let universalDate = new Date();
	let timeRightNow = universalDate.getMinutes();
	let today = universalDate.getDay();
	//increment message counter
	if(!raffleStart && (recentId !== message.author.id || message.author.id != 816853972690141205)){
		messageCounter += 1;
		recentId = message.author.id;
	}
	//set presence
   client.user.setPresence({
      status: 'online',
		activity: {
         name: 'for !cc help',
         type: "WATCHING"
      }
   });
	
	//raffle functionality
	//message failsafe
	if(messageCounter > raffleRNG){
		messageCounter = 0;
	}
	//detects when md5 raffle should begin
	if(messageCounter == raffleRNG && !raffleStart){
		raffleRNG = Math.floor(Math.random() * (500 - 400 + 1)) + 400;
		console.log("rafflerng",raffleRNG);
		mysteryNumber = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
		console.log("mystery",mysteryNumber);
		raffleStart = true;
		md5Val = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
		messageCounter = 0;
		message.channel.send(`https://i.imgur.com/0aDFif9.png`);
		let mysteryMD5 = md5(mysteryNumber);
		console.log("md5",mysteryMD5);
		message.channel.send((`${md5Val} Carl Coin has appeared! the MD5 is ${mysteryMD5}\nType !cc guess <number> to try to crack the hash! (between 1 and 100)`));
	}
	//guess command
	if(raffleStart && message.content.startsWith('!cc guess')){
		let chop = message.content.split(" ");
		//if too many arguments
		if(chop.length > 3){
			message.channel.send(`Too many arguments supplied!`);
		}
		let guess = parseInt(chop[chop.length-1]);
		let user = message.author.username;
		let id = message.author.id;
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id){
				if(guess < 1 || isNaN(guess)){	
					message.channel.send(`Invalid amount entered!`);
				}
				else{
					if(mysteryNumber == guess){
						data.users[i].balance += md5Val;
						data.econ += md5Val;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send((`${data.users[i].name} has won! ${data.users[i].name} now has ${data.users[i].balance}CC. The mining game is over.`));
						raffleStart = false;
					}
					else if(mysteryNumber > guess){
						message.channel.send(`Incorrect, try a higher number!`)
					}
					else{
						message.channel.send(`Incorrect, try a lower number!`);
					}
				}
				break;
			}
		}
	}
	//battle
	else if(message.content.startsWith('!cc challenge')){
		let chop = message.content.split(" ");
		if(chop.length != 4){
			message.channel.send('Command arguments incorrect!');
		}
		else{
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			let challenger = message.author.id;
			let mentionOK = true;
			let opponent = 0;
			try{
				opponent = getUserFromMention(chop[chop.length-2]).id;
			}
			catch(err){
				message.channel.send('Invalid user selected!');
				mentionOK = false;
			}
			if(mentionOK){
				let rebattle = true;
				if(fs.existsSync(`/home/mattguy/carlcoin/cache/${opponent}battle`)){
					let battleFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${opponent}battle`);
					let battleParse = JSON.parse(battleFile);
					if(battleParse.battleEnder < Date.now()){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${opponent}battle`);
					}
					else{
						rebattle = false;
						message.channel.send('That person is already in battle!');
					}
				}
				if(rebattle){
					let wager = parseInt(chop[chop.length-1]);
					if(opponent == challenger){
						message.channel.send('Go fight your inner demons elsewhere');
					}
					else if(isNaN(wager) || wager <= 0){
						message.channel.send('Invalid amount entered!');
					}
					else{
						let noUser = true;
						for(let i=0;i<data.users.length;i++){
							if(data.users[i].id == challenger){
								if(data.users[i].balance - wager < 0){
									message.channel.send('You dont have enough CC!');
								}
								else{
									let noOpp = true;
									for(let j=0;j<data.users.length;j++){
										if(data.users[j].id == opponent){
											if(data.users[j].balance - wager < 0){
												message.channel.send('Opponent doesnt have enough CC!');
											}
											else{
												let battleEnder = Date.now() + 60000;
												let battleInfo = {"challenger":`${challenger}`,"challIndex":`${i}`,"opponent":`${opponent}`,"oppIndex":`${j}`,"wager":`${wager}`,"battleEnder":`${battleEnder}`};
												let jsonBattle = JSON.stringify(battleInfo);
												fs.writeFileSync(`/home/mattguy/carlcoin/cache/${opponent}battle`,jsonBattle);
												message.channel.send(`${data.users[j].name}! Type !cc acceptBattle to accept ${data.users[i].name}'s challenge or type !cc denyBattle to reject the challenge. You have 1 minute to respond.`);
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
	//accept battle
	else if((message.content.startsWith('!cc denyBattle') || message.content.startsWith('!cc acceptBattle'))){
		let personsId = message.author.id;
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}battle`)){
			let battleFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
			let battleParse = JSON.parse(battleFile);
			if(battleParse.battleEnder < Date.now()){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
				message.channel.send('Time has expired to accept the battle');
			}
			else{
				if(message.content.startsWith('!cc denyBattle')){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
					message.channel.send('Coward');
				}
				else if(message.content.startsWith('!cc acceptBattle')){
					let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					let data = JSON.parse(database);
					let wager = parseInt(battleParse.wager);
					if(data.users[battleParse.challIndex].balance - wager < 0){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
						message.channel.send(`The challenger doesn't have enough money!`);
					}
					else if(data.users[battleParse.oppIndex].balance - wager < 0){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
						message.channel.send(`You don't have enough money!`);
					}
					else{
						let winnerAmount = wager * 2;
						data.users[battleParse.challIndex].balance -= wager;
						data.users[battleParse.oppIndex].balance -= wager;
						let ChallengerRandom = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
						let OpponentRandom = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
						if(ChallengerRandom > OpponentRandom){
							data.users[battleParse.challIndex].balance += winnerAmount;
							message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n| \\o   |  o   |\n|  |\\  | /|\\  |\n| / \\  | / \\  |\n|      |      |\n+--${ChallengerRandom}---+--${OpponentRandom}---+`,{"code":true});
							message.channel.send(`${data.users[battleParse.challIndex].name} has won! They now have ${data.users[battleParse.challIndex].balance}CC!`);
						}
						else if(ChallengerRandom < OpponentRandom){
							data.users[battleParse.oppIndex].balance += winnerAmount;
							message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n|  o   |  o/  |\n| /|\\  | /|   |\n| / \\  | / \\  |\n|      |      |\n+--${ChallengerRandom}---+--${OpponentRandom}---+`,{"code":true});
							message.channel.send(`${data.users[battleParse.oppIndex].name} has won! They now have ${data.users[battleParse.oppIndex].balance}CC!`);
						}
						else{
							data.users[battleParse.challIndex].balance += wager;
							data.users[battleParse.oppIndex].balance += wager;
							message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n|  o   |  o   |\n| /|\\  | /|\\  |\n| / \\  | / \\  |\n|      |      |\n+--${ChallengerRandom}---+--${OpponentRandom}---+`,{"code":true});
							message.channel.send(`A draw?! How lame!`);
						}
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
					}
				}
			}
		}
	}
   //commands
	else if (message.content.startsWith('!cc join')) {
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		//stores user
		let user = message.author.username;
		let id = message.author.id;
		//bool to add user
		let addUser = true;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id){
				message.channel.send('You are already registered!');
				addUser = false;
				break;
			}
		}
		//add user
		if(addUser){
			data.users.push({"id":`${id}`,"name":`${user}`,"balance":10,"chanceTime":0,"house":0,"apartment":0});
			data.econ += 10;
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			message.channel.send('You have been registered and recieved 10CC!');
		}
	}
	//check balance
	else if(message.content.startsWith('!cc balance')){
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
				let balance = data.users[i].balance;
				let perc = (balance / data.econ) * 100;
				let homes = data.users[i]["house"];
				if(isNaN(homes)){
					homes = 0;
				}
				let apartments = data.users[i]["apartment"];
				if(isNaN(apartments)){
					apartments = 0;
				}
				perc = perc.toFixed(2);
				message.channel.send(`You have ${balance}CC and own ${homes} homes and ${apartments} apartments!\nYou control ${perc}% of the economy!`);
				notFound = false;
				break;
			}
		}
		if(notFound){
			message.channel.send('You are not registered for CC!');
		}
	}
	//pay user
	else if(message.content.startsWith('!cc pay')){
		let chop = message.content.split(" ");
		let corrUser = true;
		//if too many arguments
		if(chop.length != 4){
			message.channel.send(`Too many arguments supplied!`);
		}
		else{
			let recipient = "";
			let recpid = "";
			//attempts to get username
			try{
				recipient = getUserFromMention(chop[chop.length-2]).username;
				recpid = getUserFromMention(chop[chop.length-2]).id;
			}
			//if username cannot be gotten
			catch(err){
				message.channel.send(`Invalid recipient`);
				corrUser = false;
			}
			//if username works
			if(corrUser){
				let amount = parseInt(chop[chop.length-1]);
				//checks valid money
				if(amount <= 0 || isNaN(amount)){
					
					message.channel.send(`Invalid amount entered!`);
				}
				else{
					//fetch and store data
					let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					let data = JSON.parse(database);
					//store user
					let user = message.author.username;
					let id = message.author.id;
					//flag
					let notFound = true;
					//finds payer
					for(let i=0;i<data.users.length;i++){
						//if username found
						if(data.users[i].id == id){
							let balance = data.users[i].balance;
							if(balance - amount < 0){
								message.channel.send(`You don't have enough CC!`);
							}
							else{
								let noRecp = true;
								//finds other user
								for(let j=0;j<data.users.length;j++){
									//starts paying
									if(data.users[j].id == recpid){
										noRecp = false;
										data.users[i].balance -= amount;
										data.users[j].balance += amount;
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You have paid ${recipient} ${amount} CC!\n${recipient}'s Balance ${data.users[j].balance}\n${user}'s Balance ${data.users[i].balance}`);
									}
								}
								//other user not found
								if(noRecp){
									message.channel.send('Recipient not found!');
								}
							}
							notFound = false;
							break;
						}
					}
					if(notFound){
						message.channel.send('You are not registered for CC!');
					}
				}
			}
		}
	}
	//lottery game
	else if(message.content.startsWith('!cc roll')){
		let chop = message.content.split(" ");
		if(chop.length > 3){
			message.channel.send(`Too many arguments supplied!`);
		}
		else{
			let strats = ["alwaysA", "alwaysB", "random"];
			let type = chop[chop.length-1];
			let amount = 5;
			let noStrat = true;
			for(let i=0;i<strats.length;i++){
				//if strat found
				if(type == strats[i]){
					let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					let data = JSON.parse(database);
					let noUser = true;
					//store user
					let user = message.author.username;
					let id = message.author.id;
					if(data.pot+3 < 10){
						message.channel.send(`Pot is empty, try again later!`);
						noUser = false;
					}
					else{
						//find user and check amount
						for(let j=0;j<data.users.length;j++){
							//if username found
							if(data.users[j].id == id){
								let balance = data.users[j].balance;
								//if balance would go negative
								if(balance - amount < 0){
									message.channel.send(`You don't have enough CC! (costs 5)`);
								}
								else{
									//starts gambling
									let optA = Math.floor(Math.random() * 10); 
									let optB = Math.floor(Math.random() * 10);
									let random = Math.floor(Math.random() * 2);
									data.pot += amount - 2;
									data.welfare += 2;
									data.users[j].balance -= amount;
									message.channel.send(`Higher Value Wins\n+----A----+----B----+\n|    ${optA}    |    ${optB}    |\n+---------+---------+\n`,{"code":true});
									//if lottery win
									if((type == "alwaysA" || (type == "random" && random == 0))&& optA > optB){
										let pot = 10;
										data.users[j].balance += pot;
										data.pot -= pot;
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You've won! you got ${pot}CC! You now have ${data.users[j].balance}CC!`);
									}
									//if lottery win
									else if((type == "alwaysB" || (type == "random" && random == 1))&& optA < optB){
										let pot = 10;
										data.users[j].balance += pot;
										data.pot -= pot;
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You've won! you got ${pot}CC! You now have ${data.users[j].balance}CC!`);
									}
									//if lottery lose
									else{
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You've lost! The pot is now ${data.pot}CC. You have ${data.users[j].balance}CC.`);
									}
								}
								//user found, flag triggered
								noUser = false;
								break;
							}
						}
					}
					//if no user found
					if(noUser){
						message.channel.send(`You are not registered for CC!`);
					}
					noStrat = false;
					break;
				}
			}
			//if strat not found
			if(noStrat){
				message.channel.send(`Invalid strat (try alwaysA, alwaysB or random)`);
			}
		}
	}
	//chance game
	else if(message.content.startsWith('!cc chance')){ /*!cc chance*/ 
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let noUser = true;
		//store user
		let user = message.author.username;
		let id = message.author.id;
		//find user and check amount
		for(let j=0;j<data.users.length;j++){
			//if user name found
			if(data.users[j].id == id){
				let balance = data.users[j].balance;
				let amount = Math.floor(balance/2);
				let currentTime = new Date();
				if(amount == 0) amount += 1;
				//if user has no money
				if(balance - amount <= 0){
					message.channel.send(`You don't have enough CC!`);
				}
				//if user has already played
				else if(data.users[j].chanceTime == currentTime.getDate()){
					message.channel.send(`You've already played today! Try tomorrow`);
				}
				else{
					//starts chance time
					let random = Math.floor(Math.random() * 4);
					data.users[j].balance -= amount;
					message.channel.send(`Quad. 0 wins\n+-0-+-1-+\n| W | L |\n+---+---+\n| L | L |\n+-2-+-3-+\nYou rolled Quad. ${random}`,{"code":true});
					//if victory
					if(random == 0){
						let doubleMoney = amount * 2;
						data.users[j].balance += doubleMoney;
						data.users[j].chanceTime = currentTime.getDate();
						data.econ += amount;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You've won! You now have ${data.users[j].balance}CC`);
					}
					//lose chance time
					else{
						let welfPot = Math.floor(amount / 2);
						amount = amount - welfPot;
						data.pot += amount;
						data.welfare += welfPot;
						data.users[j].chanceTime = currentTime.getDate();
						message.channel.send(`You've lost! You now have ${data.users[j].balance}CC`);
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					}
				}
				noUser = false;
				break;
			}
		}
		//if user not found
		if(noUser){
			message.channel.send(`You are not registered for CC!`);
		}
	}
	//claim
	else if(message.content.startsWith('!cc welfare')){
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let noUser = true;
		//store user
		let user = message.author.username;
		let id = message.author.id;
		//find user and check amount
		for(let j=0;j<data.users.length;j++){
			//if user name found
			if(data.users[j].id == id){
				let currentTime = new Date();
				if(data.users[j].balance >= 25){
					message.channel.send('You already have enough CC! This is for poor people!');
				}
				else{
					//if user has already played
					try{
						if(data.users[j].claim == currentTime.getDate()){
							message.channel.send(`You've already claimed today! Come back tomorrow`);
						}
						else if(data.welfare < 5){
							message.channel.send(`The welfare fund has dried up! Come back soon!`);
						}
						else{
							data.users[j].balance += 5;
							data.users[j].claim = currentTime.getDate();
							data.welfare -= 5;
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You've claimed 5CC. You now have ${data.users[j].balance}CC`);
						}
					}
					catch(err){
						if(data.welfare < 5){
							message.channel.send(`The welfare fund has dried up! Come back soon!`);
						}
						else{
							data.users[j]["claim"] = currentTime.getDate();
							data.users[j].balance += 5;
							data.users[j].claim = currentTime.getDate();
							data.welfare -= 5;
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You've claimed 5CC. You now have ${data.users[j].balance}CC`);
						}
					}
				}
				noUser = false;
				break;
			}
		}
		//if user not found
		if(noUser){
			message.channel.send(`You are not registered for CC!`);
		}
	}
	//purchase home
	else if(message.content.startsWith('!cc purchase')){ /* !cc purchase home/apartment */
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
						if(data.users[i].balance - 100 < 0){
							message.channel.send('You do not have enough CC! (Costs 100)');
						}
						else{
							data.users[i]["house"] += 1;
							if(isNaN(data.users[i].house)){
								data.users[i].house = 1;
							}
							data.users[i].balance -= 100;
							data.pot += 25;
							data.welfare += 25;
							data.econ -= 50;
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have purchased a home! You now own ${data.users[i].house}\nEvery day you will get some rent payments!`);
						}
					}
					else if(type == "apartment"){
						if(data.users[i].balance - 250 < 0){
							message.channel.send('You do not have enough CC! (Costs 250)');
						}
						else{
							data.users[i]["apartment"] += 1;
							if(isNaN(data.users[i].apartment)){
								data.users[i].apartment = 1;
							}
							data.users[i].balance -= 250;
							data.pot += 50;
							data.econ -= 150;
							data.welfare += 50;
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have purchased an apartment! You now own ${data.users[i].apartment}\nEvery day you will get some rent payments!`);
						}
					}
					else{
						message.channel.send('Invalid purchase! Try house or apartment');
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
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have sold a home! You now own ${data.users[i].house} homes`);
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
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have sold an apartment! You now own ${data.users[i].apartment} apartment`);
						}
					}
					else{
						message.channel.send('Invalid sell! Try house or apartment');
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
	//home payouts
	else if(today != prevDate){
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		prevDate = universalDate.getDay();
		for(let i=0;i<data.users.length;i++){
			let homePrice = data.users[i]["house"] * 10;
			let taxAmount = 0;
			if(isNaN(homePrice)){
				homePrice = 0;
			}
			taxAmount = (homePrice/10) * 2;
			let apartPrice = data.users[i]["apartment"] * 25;
			if(isNaN(apartPrice)){
				apartPrice = 0;
			}
			taxAmount += (apartPrice/25) * 2;
			let amount = homePrice + apartPrice;
			amount -= taxAmount;
			data.users[i].balance += amount;
			data.welfare += taxAmount;
			data.econ += taxAmount;
			data.econ += amount;
		}
		let newData = JSON.stringify(data);
		fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
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
					else if(isNaN(price) || price <= 0){
						message.channel.send('Invalid amount entered!');
					}
					else{
						let noUser = true;
						for(let i=0;i<data.users.length;i++){
							if(data.users[i].id == seller){
								if(data.users[i].balance - price < 0){
									message.channel.send('You dont have enough CC!');
								}
								else{
									let noBuy = true;
									for(let j=0;j<data.users.length;j++){
										if(data.users[j].id == buyer){
											let offerType = chop[chop.length-2]
											//check if house
											if(offerType == "house" || offerType == "apartment"){
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
	else if((message.content.startsWith('!cc acceptPurchase') || message.content.startsWith('!cc denyPurchase'))){
		let personsId = message.author.id;
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`)){
			let sellFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
			let sellParse = JSON.parse(sellFile);
			if(sellParse.sellEnder < Date.now()){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
				message.channel.send('Time has expired to accept the offer');
			}
			else{
				if(message.content.startsWith('!cc denyPurchase')){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
					message.channel.send('You have declined the offer');
				}
				else if(message.content.startsWith('!cc acceptPurchase')){
					let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					let data = JSON.parse(database);
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
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
					message.channel.send('You have accepted the offer!');
				}
			}
		}
	}
	//economy function
	else if(message.content.startsWith('!cc econ')){
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let highestEarnerName = "";
		let highestEarnerAmount = 0;
		let lowestEarnerName = "";
		let lowestEarnerAmount = 99999;
		let poorPeople = 0;
		let houseCount = 0;
		let apartmentCount = 0;
		let carlball = data.carlball;
		//searches for highest and lowest earner
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].balance > highestEarnerAmount){
				highestEarnerName = data.users[i].name;
				highestEarnerAmount = data.users[i].balance;
			}
			if(data.users[i].balance < lowestEarnerAmount){
				lowestEarnerName = data.users[i].name;
				lowestEarnerAmount = data.users[i].balance;
			}
			if(data.users[i].balance == 0){
				poorPeople += 1;
			}
			if(data.users[i]["house"] > 0 && !isNaN(data.users[i]["house"])){
				houseCount += 1;
			}
			if(data.users[i]["apartment"] > 0 && !isNaN(data.users[i]["apartment"])){
				apartmentCount += 1;
			}
		}
		message.channel.send(`There are currently ${data.econ} CC circulating\nThere is currently ${data.users.length} users registered for CC\nThe roll pot is currently ${data.pot}CC\nThe CarlBall Jackpot is ${carlball}CC!\nThe Blackjack pot is currently ${data.blackjack}\nThe welfare fund is currently ${data.welfare}CC\nThere are currently ${houseCount} homes and ${apartmentCount} apartments\n${highestEarnerName} has the most CC with ${highestEarnerAmount}CC\n${lowestEarnerName} has the least CC with ${lowestEarnerAmount}CC\nCurrently, ${poorPeople} people have absolutely no CC!`);
	}
	//lottery payout
	else if(today != prevDate2){
		prevDate2 = today;
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`)){
			let lotteryRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`);
			let lotteryFile = JSON.parse(lotteryRead);
			let closestId = 0;
			let value = lotteryFile.value;
			for(let i=0;i<lotteryFile.users.length;i++){
				if(parseInt(lotteryFile.users[i].guess) == value){
					closestId = lotteryFile.users[i].id;
					break;
				}
			}
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			if(closestId == 0){
				message.channel.send(`The number was ${value}\nNo one has won the lottery today!`);
			}
			else{
				for(let i=0;i<data.users.length;i++){
					if(data.users[i].id == closestId){
						data.users[i].balance += data.carlball;
						data.carlball = 0;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`The number was ${value}\nCongradulations ${data.users[i].name}! You have won ${data.carlball}CC in todays lottery!`);
					}
				}
			}
			fs.unlinkSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`);
		}
	}
	//lottery
	else if(message.content.startsWith('!cc lottery')){ /* !cc lottery 1-500 */
		let personsId = message.author.id;
		let chop = message.content.split(" ");
		if(chop.length != 3){
			message.channel.send('Command arguments incorrect!');
		}
		else if(fs.existsSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`)){
			let lotteryRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`);
			let lotteryFile = JSON.parse(lotteryRead);
			let lotteryGuess = parseInt(chop[chop.length-1]);
			if(lotteryGuess < 1 || lotteryGuess > 500 || isNaN(lotteryGuess)){
				message.channel.send(`Invalid guess!`);
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
							let play = true;
							for(let j=0;j<lotteryFile.users.length;j++){
								if(lotteryFile.users[j].id == personsId){
									message.channel.send('You already played today!');
									play = false;
									break;
								}
								if(lotteryFile.users[j].guess == lotteryGuess){
									message.channel.send('Someone already guessed that number!');
									play = false;
									break;
								}
							}
							if(play){
								data.users[i].balance -= 5;
								lotteryFile.users.push({"id":`${personsId}`,"guess":`${lotteryGuess}`});
								data["carlball"] += 5;
								let newLottery = JSON.stringify(lotteryFile);
								fs.writeFileSync('/home/mattguy/carlcoin/cache/dailyLottery.json',newLottery);
								let newData = JSON.stringify(data);
								fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
								message.channel.send(`You have been added to the lottery! Drawing happens at midnight!`);
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
		}
		else{
			let lotteryGuess = parseInt(chop[chop.length-1]);
			if(lotteryGuess < 1 || lotteryGuess > 500 || isNaN(lotteryGuess)){
				message.channel.send(`Invalid guess!`);
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
							lotteryFile.users.push({"id":`${personsId}`,"guess":`${lotteryGuess}`});
							lotteryFile["value"] = Math.floor(Math.random() * (500 - 1 + 1)) + 1;
							data["carlball"] += 5;
							let newLottery = JSON.stringify(lotteryFile);
							fs.writeFileSync('/home/mattguy/carlcoin/cache/dailyLottery.json',newLottery);
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have been added to the lottery!`);
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
	}

	//blackjack
	else if(message.content.startsWith('!cc blackjack')){
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
				if(isNaN(wager) || wager < 2){ //CHANGE LATER MATT DONT FORGET CHANGE BACK TO GREATER THAN 1
					message.channel.send('Invalid amount entered!');
				}
				else if(Math.floor(wager * 2) > data.blackjack){
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
								data.blackjack += wager;
								data.users[i].balance -= wager;
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
								if(((playerCard1%13 == 0)&&(playerCard2%13 == 10 || playerCard2%13 == 11 || playerCard2%13 == 12))|| ((playerCard2%13 == 0)&&(playerCard1%13 == 10 || playerCard1%13 == 11 || playerCard1%13 == 12))){
									if(((dealerCard1%13 == 0)&&(dealerCard2%13 == 10 || dealerCard2%13 == 11 || dealerCard2%13 == 12)) || ((dealerCard2%13 == 0)&&(dealerCard1%13 == 10 || dealerCard1%13 == 11 || dealerCard1%13 == 12))){
										data.users[i].balance += wager;
										data.blackjack -= wager;
										message.channel.send(`You and the dealer both got a natural..... you get back your CC`);
									}
									else{
										data.users[i].balance += Math.floor(wager * 2);
										data.blackjack -= Math.floor(wager * 2);
										message.channel.send(`You got a natural! You win!`);
									}
									let newData = JSON.stringify(data);
									fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
								}
								else if(((dealerCard1%13 == 0)&&(dealerCard2%13 == 10 || dealerCard2%13 == 11 || dealerCard2%13 == 12)) || ((dealerCard2%13 == 0)&&(dealerCard1%13 == 10 || dealerCard1%13 == 11 || dealerCard1%13 == 12))){
									message.channel.send(`Dealer got a natural! You lose!`);
									let newData = JSON.stringify(data);
									fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
								}
								else{
									let blackjackInfo = {"challenger":`${challenger}`,"challIndex":`${i}`,"wager":`${wager}`,"blackjackEnder":`${blackjackEnder}`,usedCards,playerCards,dealerCards};
									let jsonBlackjack = JSON.stringify(blackjackInfo);
									fs.writeFileSync(`/home/mattguy/carlcoin/cache/${challenger}blackjack`,jsonBlackjack);
									message.channel.send(`${data.users[i].name}, you currently have ${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. The dealer has ${blackjackCards[dealerCard1]},XX.\nType !cc hit or !cc stay, you have 1 min to respond.`);
								}
								let newData = JSON.stringify(data);
								fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);

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
	//hit
	else if(message.content.startsWith('!cc hit')){
		let personsId = message.author.id;
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`)){
			let blackjackFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
			let blackjackParse = JSON.parse(blackjackFile);
			if(blackjackParse.blackjackEnder < Date.now()){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
				message.channel.send('Time has expired to play blackjack, you lost the money you bet!');
			}
			else{
				blackjackParse.blackjackEnder = parseInt(blackjackParse.blackjackEnder) + 60000;
				let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
				let data = JSON.parse(database);
				let cardValue = [1,2,3,4,5,6,7,8,9,10,10,10,10];
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
					message.channel.send(`Bust! You drew a ${blackjackCards[newCard]}\n${cardViewer}`);
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
				}
				else if(ace && currentTotal + 10 <= 21){
					let jsonBlackjack = JSON.stringify(blackjackParse);
					fs.writeFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`,jsonBlackjack);
					message.channel.send(`You drew a ${blackjackCards[newCard]} you now have ${currentTotal} (or ${currentTotal + 10} since you have an ace)\n${cardViewer}`);
				}
				else{
					let jsonBlackjack = JSON.stringify(blackjackParse);
					fs.writeFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`,jsonBlackjack);
					message.channel.send(`You drew a ${blackjackCards[newCard]} you now have ${currentTotal}\n${cardViewer}`);
				}
			}
		}
	}
	//stay
	else if(message.content.startsWith('!cc stay')){
		let personsId = message.author.id;
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`)){
			let blackjackFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
			let blackjackParse = JSON.parse(blackjackFile);
			if(blackjackParse.blackjackEnder < Date.now()){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
				message.channel.send('Time has expired to play blackjack, you lost the money you bet!');
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
				if(dealerTotal > 21){
					message.channel.send(`Bust! Dealer loses!\n${cardViewer}`);
					data.users[blackjackParse.challIndex].balance += Math.floor(blackjackParse.wager * 2);
					data.blackjack -= Math.floor(blackjackParse.wager * 2);
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
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
						message.channel.send(`You have ${playerValue}, Dealer has ${dealerTotal}. You've won!`);
						data.users[blackjackParse.challIndex].balance += Math.floor(blackjackParse.wager * 2);
						data.blackjack -= Math.floor(blackjackParse.wager * 2);
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
					}
					else if(dealerTotal > playerValue){
						//player lose
						message.channel.send(`You have ${playerValue}, Dealer has ${dealerTotal}. You've lost!`);
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
					}
					else{
						//draw
						message.channel.send(`You have ${playerValue}, Dealer has ${dealerTotal}. It's a draw!`);
						data.users[blackjackParse.challIndex].balance += parseInt(blackjackParse.wager);
						data.blackjack -= blackjackParse.wager;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
					}
				}
			}
		}
	}

	//help menu
	else if(message.content.startsWith('!cc help')){
		message.channel.send(`use !cc join to join Carl Coin!\nuse !cc balance to see your balance\nuse !cc welfare to claim 5 CC daily if youre poor!\nuse !cc pay <@user> <amount> to pay another user\nuse !cc econ to see the current economy\nuse !cc roll <type> to play the Game. types: alwaysA, alwaysB, random\nuse !cc chance to maybe double your money!\nuse !cc guess <number> when theres a solve chance! numbers are between 1 and 100\nuse !cc purchase <type> to purchase a (house) or (apartment)! It pays out every day!\nuse !cc challenge <@user> <amount> to challenge someone for some CC!\nuse !cc sell <type> to sell a house or apartment!\nuse !cc userSell <@user> <type> <amount> to sell to another person\nuse !cc lottery <guess> to guess a number between 1 and 500, winner gets the pot!\nuse !cc blackjack <amount> to play blackjack\nCheck out this link for more detailed info https://tinyurl.com/carlcoin`);
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
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
