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
//anti spam stuff
let recentId;
//sets ready presense
client.on('ready', () => {
  client.user.setPresence({
    status: 'online',
    activity: {
        name: 'for !cc help',
        type: "WATCHING"
    }
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
	if(messageCounter > raffleRNG){
		messageCounter = 0;
	}
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
					if(battleParse.battleEnder < universalDate.getMinutes()){
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
												let originalChannel = message.channel.id;
												let battleEnder = (universalDate.getMinutes() + 1) % 60;
												let battleInfo = {"challenger":`${challenger}`,"challIndex":`${i}`,"opponent":`${opponent}`,"oppIndex":`${j}`,"wager":`${wager}`,"battleEnder":`${battleEnder}`,"originalChannel":`${originalChannel}`};
												let jsonBattle = JSON.stringify(battleInfo);
												fs.writeFileSync(`/home/mattguy/carlcoin/cache/${opponent}battle`,jsonBattle);
												message.channel.send(`${data.users[j].name}! Type !cc accept to accept ${data.users[i].name}'s challenge or type !cc deny to reject the challenge. You have 1 minute to respond.`);
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
	else if(((message.content.startsWith('!cc deny') || message.content.startsWith('!cc accept'))){
		let personsId = message.author.id;
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}battle`)){
			let battleFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
			let battleParse = JSON.parse(battleFile);
			if(battleParse.battleEnder < universalDate.getMinutes()){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${opponent}battle`);
				client.channels.cache.get(originalChannel).send('Time has expired to accept the battle');
			}
			else{
				if(message.content.startsWith('!cc deny')){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${opponent}battle`);
					message.channel.send('Coward');
				}
				else if(message.content.startsWith('!cc accept')){
					let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					let data = JSON.parse(database);
					let winnerAmount = wager * 2;
					data.users[challIndex].balance -= battleParse.wager;
					data.users[oppIndex].balance -= battleParse.wager;
					let ChallengerRandom = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
					let OpponentRandom = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
					message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n|  o   |  o   |\n| /|\\  | /|\\  |\n| / \\  | / \\  |\n|      |      |\n+------+------+`,{"code":true});
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
						message.channel.send(`A draw?! How lame!`);
					}
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${opponent}battle`);
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
			data.users.push({"id":`${id}`,"name":`${user}`,"balance":10,"chanceTime":0});
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
							data.econ -= 150
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
	//economy function
	else if(message.content.startsWith('!cc econ')){
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let highestEarnerName = "";
		let highestEarnerAmount = 0;
		let lowestEarnerName = "";
		let lowestEarnerAmount = 99999;
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
		}
		message.channel.send(`There are currently ${data.econ} CC circulating\nThe pot is currently ${data.pot}CC\nThe welfare fund is currently ${data.welfare}CC\nThe highest earner is ${highestEarnerName} with ${highestEarnerAmount}CC\nThe lowest earner is ${lowestEarnerName} with ${lowestEarnerAmount}CC`);
	}
	//help menu
	else if(message.content.startsWith('!cc help')){
		message.channel.send(`use !cc join to join Carl Coin!\nuse !cc balance to see your balance\nuse !cc welfare to claim 5 CC daily if youre poor!\nuse !cc pay <@user> <amount> to pay another user\nuse !cc econ to see the current economy\nuse !cc roll <type> to play the Game. types: alwaysA, alwaysB, random\nuse !cc chance to maybe double your money!\nuse !cc guess <number> when theres a solve chance! numbers are between 1 and 100\nuse !cc purchase <type> to purchase a (house) or (apartment)! It pays out every day!\nuse !cc challenge <@user> <amount> to challenge someone for some CC!`);
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
