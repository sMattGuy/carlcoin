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
//new day checking variables
let prevDate = startupDay.getDay();
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
		//create new raffle rng
		raffleRNG = Math.floor(Math.random() * (500 - 400 + 1)) + 400;
		console.log("rafflerng",raffleRNG);
		//create new mystery number for people to guess
		mysteryNumber = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
		console.log("mystery",mysteryNumber);
		//set start flag to true
		raffleStart = true;
		//sets the value of the coin to claim
		md5Val = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
		//reset message counter
		messageCounter = 0;
		//hash number
		let mysteryMD5 = md5(mysteryNumber);
		console.log("md5",mysteryMD5);
		//send to all general chats
		client.guilds.cache.forEach((guild) => {
			try{
				guild.channels.cache.find((x) => x.name == 'general').send(`https://i.imgur.com/0aDFif9.png`);
				guild.channels.cache.find((x) => x.name == 'general').send(`${md5Val} Carl Coin has appeared! the MD5 is ${mysteryMD5}\nType !cc guess <number> to try to crack the hash! (between 1 and 100)`);
			}
			catch(err){
				console.log("no general chat in "+guild.name);
			}
		});
	}
	//daily events
	if(today != prevDate){
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
			let skyPrice = data.users[i]["apartment"] * 50;
			if(isNaN(skyPrice)){
				skyPrice = 0;
			}
			taxAmount += (skyPrice/50) * 2;
			let amount = homePrice + apartPrice + skyPrice;
			amount -= taxAmount;
			data.users[i].balance += amount;
			data.welfare += taxAmount;
			data.econ += taxAmount;
			data.econ += amount;
			if(amount != 0){
				console.log(data.users[i].name + " has gotten " + amount + " in realty payments");
			}
			if(isNaN(data.users[i]["unstable"])){
				data.users[i]["unstable"] = 0;
			}
			else{
				data.users[i]["unstable"] -= 10;
				if(data.users[i]["unstable"] < 0){
					data.users[i]["unstable"] = 0;
				}
			}
		}
		let newData = JSON.stringify(data);
		fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);

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
			database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			data = JSON.parse(database);
			if(closestId == 0){
				client.guilds.cache.forEach((guild) => {
					try{
						guild.channels.cache.find((x) => x.name == 'general').send(`The number was ${value}\nNo one has won the lottery today!`);
					}
					catch(err){
						console.log("no general chat in "+guild.name);
					}
				});
			}
			else{
				for(let i=0;i<data.users.length;i++){
					if(data.users[i].id == closestId){
						data.users[i].balance += data.carlball;
						data.carlball = 0;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						client.guilds.cache.forEach((guild) => {
							try{
								guild.channels.cache.find((x) => x.name == 'general').send(`The number was ${value}\nCongradulations ${data.users[i].name}! You have won ${data.carlball}CC in todays lottery!`);
							}
							catch(err){
								console.log("no general chat in "+guild.name);
							}
						});
					}
				}
			}
			fs.unlinkSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`);
		}
	}
	/* START OF USER COMMANDS, MAKE SURE ALL COMMANDS BELOW ARE MEANT TO BE RUN ONLY ONCE */
	//guess command
	if(raffleStart && message.content.startsWith('!cc guess')){ /* !cc guess amount */
		message.delete({timeout:60000}).catch(error => {console.log(error)});
		//chop message to parse
		let chop = message.content.split(" ");
		//if too many arguments
		if(chop.length != 3){
			message.channel.send(`Too many arguments supplied!`);
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
				for(let i=0;i<data.users.length;i++){
					if(data.users[i].id == id){
						console.log(data.users[i].name + " " + guess);
						if(mysteryNumber == guess){
							data.users[i].balance += md5Val;
							data.econ += md5Val;
							data.users[i]["activity"] = Date.now();
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
							raffleStart = false;
						}
						else if(mysteryNumber > guess){
							message.channel.send(`Incorrect, try a higher number!`).then(msg => msg.delete({timeout:60000})).catch(error => {console.log(error)});
						}
						else{
							message.channel.send(`Incorrect, try a lower number!`).then(msg => msg.delete({timeout:60000})).catch(error => {console.log(error)});
						}
						break;
					}
				}
			}
		}
	}
	//end of raffle functionality
	//start of battle functionality
	//battle start command
	else if(message.content.startsWith('!cc challenge')){ /* !cc challenge @user amount */
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
				if(fs.existsSync(`/home/mattguy/carlcoin/cache/${opponent}battle`)){
					//if opponent file exists, parse data
					let battleFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${opponent}battle`);
					let battleParse = JSON.parse(battleFile);
					//time expired for battle, delete old file
					if(battleParse.battleEnder < Date.now()){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${opponent}battle`);
					}
					//if person is already in battle
					else{
						rebattle = false;
						message.channel.send('That person is already in battle!');
					}
				}
				//begin finding battle
				if(rebattle){
					//parse wager and check if valid
					let wager = parseInt(chop[chop.length-1]);
					//check if trying to battle self
					if(opponent == challenger){
						message.channel.send('Go fight your inner demons elsewhere');
					}
					//check that wager is valid
					else if(isNaN(wager) || wager <= 0){
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
												console.log("battle:" + data.users[i].name + " vs " + data.users[j].name + " for " + wager);
												//begin setting up battle variables
												let battleEnder = Date.now() + 60000;
												let battleInfo = {"challenger":`${challenger}`,"challIndex":`${i}`,"opponent":`${opponent}`,"oppIndex":`${j}`,"wager":`${wager}`,"battleEnder":`${battleEnder}`};
												let jsonBattle = JSON.stringify(battleInfo);
												//create battle cache file and alert opponent of their challenge
												fs.writeFileSync(`/home/mattguy/carlcoin/cache/${opponent}battle`,jsonBattle);
												data.users[i]["activity"] = Date.now();
												let newData = JSON.stringify(data);
												fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
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
	//accept or deny battle
	else if(message.content === '!cc denyBattle' || message.content === '!cc acceptBattle'){
		//save message author id
		let personsId = message.author.id;
		//find if opponent file exists
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}battle`)){
			//parse opponent cache file
			let battleFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
			let battleParse = JSON.parse(battleFile);
			//check if time has expired for this opponent
			if(battleParse.battleEnder < Date.now()){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
				message.channel.send('Time has expired to accept the battle');
			}
			else{
				//if deny battle, mock opponent and delete their cache file
				if(message.content == '!cc denyBattle'){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
					message.channel.send('Coward');
				}
				//accept battle protocol
				else if(message.content == '!cc acceptBattle'){
					//parse database
					let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					let data = JSON.parse(database);
					//parse wager from cache file
					let wager = parseInt(battleParse.wager);
					//checking to see if user suddenly doesnt have enough money
					if(data.users[battleParse.challIndex].balance - wager < 0){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
						message.channel.send(`The challenger doesn't have enough money!`);
					}
					else if(data.users[battleParse.oppIndex].balance - wager < 0){
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
						message.channel.send(`You don't have enough money!`);
					}
					//begin battle
					else{
						//set the winning amount
						let winnerAmount = wager * 2;
						//take money from both users
						data.users[battleParse.challIndex].balance -= wager;
						data.users[battleParse.oppIndex].balance -= wager;
						data.users[battleParse.challIndex]["activity"] = Date.now();
						data.users[battleParse.oppIndex]["activity"] = Date.now();
						//generate their random value
						let ChallengerRandom = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
						let OpponentRandom = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
						//check to see who wins
						//challenger wins
						if(ChallengerRandom > OpponentRandom){
							data.users[battleParse.challIndex].balance += winnerAmount;
							message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n| \\o   |  o   |\n|  |\\  | /|\\  |\n| / \\  | / \\  |\n|      |      |\n+--${ChallengerRandom}---+--${OpponentRandom}---+`,{"code":true});
							message.channel.send(`${data.users[battleParse.challIndex].name} has won! They now have ${data.users[battleParse.challIndex].balance}CC!`);
						}
						//opponent wins
						else if(ChallengerRandom < OpponentRandom){
							data.users[battleParse.oppIndex].balance += winnerAmount;
							message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n|  o   |  o/  |\n| /|\\  | /|   |\n| / \\  | / \\  |\n|      |      |\n+--${ChallengerRandom}---+--${OpponentRandom}---+`,{"code":true});
							message.channel.send(`${data.users[battleParse.oppIndex].name} has won! They now have ${data.users[battleParse.oppIndex].balance}CC!`);
						}
						//users tie
						else{
							data.users[battleParse.challIndex].balance += wager;
							data.users[battleParse.oppIndex].balance += wager;
							message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n|  o   |  o   |\n| /|\\  | /|\\  |\n| / \\  | / \\  |\n|      |      |\n+--${ChallengerRandom}---+--${OpponentRandom}---+`,{"code":true});
							message.channel.send(`A draw?! How lame!`);
						}
						//write new data to database and delete cache file
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
					}
				}
			}
		}
	}
	//end of battle functionality
   //join command
	else if (message.content === '!cc join' && !message.author.bot) {
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
			//create user variables
			data.users.push({"id":`${id}`,"name":`${user}`,"balance":0,"chanceTime":0,"claim":0,"house":0,"apartment":0,"activity":`${Date.now()}`,"suicide":1,"unstable":0});
			//write new data and alert new user
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			message.channel.send('You have been registered! Use !cc work to get some Carl Coin!');
			console.log(user + " has joined carlcoin");
		}
	}
	//check balance
	else if(message.content === '!cc balance'){
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
				if(isNaN(data.users[i]["unstable"])){
					data.users[i]["unstable"] = 0;
				}
				if(data.users[i]["unstable"] >= 100){
					let fakeBalance = Math.floor(Math.random() * 1001);
					let fakeHouses = Math.floor(Math.random() * 1001);
					let fakeApartments = Math.floor(Math.random() * 1001);
					let fakeSkys = Math.floor(Math.random() * 1001);
					let fakePercent = Math.floor(Math.random() * 1001);
					let fakeAssets = Math.floor(Math.random() * 1001);
					message.channel.send(`Something doesn't feel right\nYou have ${fakeBalance}CC and own ${fakeHouses} homes, ${fakeApartments} apartments and ${fakeSkys} skyscrapers! Your assets equal ${fakeAssets}CC!\nYou control ${fakePercent}% of the economy!\n...maybe you need to relax`);
					notFound = false;
					break;
				}
				else{
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
					let skyscrapers = data.users[i]["skyscraper"];
					if(isNaN(skyscrapers)){
						skyscrapers = 0;
					}
					let assets = (homes * 50) + (apartments * 150) + (skyscrapers * 250);
					perc = perc.toFixed(2);
					message.channel.send(`You have ${balance}CC and own ${homes} homes, ${apartments} apartments and ${skyscrapers} skyscrapers! Your assets equal ${assets}CC!\nYou control ${perc}% of the economy!`);
					notFound = false;
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					break;	
				}
			}
		}
		if(notFound){
			message.channel.send('You are not registered for CC!');
		}
	}
	//audit user
	else if(message.content.startsWith('!cc audit')){
		let chop = message.content.split(" ");
		//if too many arguments
		if(chop.length != 3){
			message.channel.send(`Invalid arguments supplied!`);
		}
		else{
			//fetch and store data
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			//stores user
			let user = "";
			let id = 0;
			let corrUser = true;
			let notFound = true;
			try{
				user = getUserFromMention(chop[chop.length-1]).username;
				id = getUserFromMention(chop[chop.length-1]).id;
			}
			//if username cannot be gotten
			catch(err){
				message.channel.send(`Invalid recipient`);
				corrUser = false;
			}
			if(corrUser && id != message.author.id){
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
						let skyscrapers = data.users[i]["skyscraper"];
						if(isNaN(skyscrapers)){
							skyscrapers = 0;
						}
						let assets = (homes * 50) + (apartments * 150) + (skyscrapers * 250);
						perc = perc.toFixed(2);
						message.channel.send(`${user} has ${balance}CC and own ${homes} homes, ${apartments} apartments and ${skyscrapers} skyscrapers! Their assets are equal to ${assets}CC!\nThey control ${perc}% of the economy!`);
						notFound = false;
						break;	
					}
				}
				if(notFound){
					message.channel.send('User is not registered for CC!');
				}
			}
		}
	}
	//player card
	else if(message.content === '!cc playercard'){
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
				//crazy stats
				if(data.users[i]["unstable"] >= 100){
					let fakeBalance = Math.floor(Math.random() * 1001);
					let fakeBuildings = Math.floor(Math.random() * 1001);
					let fakeStr = Math.floor(Math.random() * 1001);
					let fakeDex = Math.floor(Math.random() * 1001);
					let fakeCon = -1 * Math.floor(Math.random() * 1001);
					let fakeInt = -1 * Math.floor(Math.random() * 1001);
					let fakeWis = -1 * Math.floor(Math.random() * 1001);
					let fakeChr = -1 * Math.floor(Math.random() * 1001);
					message.channel.send(`Something doesn't feel right...`);
					message.channel.send(`+----------------------------\n| ${data.users[i].name}\n|   o     balance: ${fakeBalance}\n|  /|\\    buildings: ${fakeBuildings}\n|  / \\    sanity: ${sanity}\n+----------------------------\n| stats\n| STR: ${fakeStr}\tCON: ${fakeCon}\tWIS: ${fakeWis}\n| DEX: ${fakeDex}\tINT: ${fakeInt}\tCHR: ${fakeChr}\n+----------------------------`,{"code":true});
					message.channel.send(`...Maybe you need to relax`);
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
					message.channel.send(`+----------------------------\n| ${data.users[i].name}\n|   o     balance: ${balance}\n|  /|\\    buildings: ${buildings}\n|  / \\    sanity: ${sanity}\n+----------------------------\n| stats\n| STR: ${str}\tCON: ${con}\tWIS: ${wis}\n| DEX: ${dex}\tINT: ${inte}\tCHR: ${chr}\n+----------------------------`,{"code":true});
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
	//pay user
	else if(message.content.startsWith('!cc pay')){
		let chop = message.content.split(" ");
		let corrUser = true;
		//if too many arguments
		if(chop.length != 4){
			message.channel.send(`Invalid arguments supplied!`);
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
							let currentDate = new Date();
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
										console.log(data.users[i].name + " has paid " + data.users[j].name + " " + amount + "CC");
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
		if(chop.length != 3){
			message.channel.send(`Invalid arguments supplied!`);
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
									data.welfare += 1;
									data.blackjack += 1;
									data.users[j].balance -= amount;
									message.channel.send(`Higher Value Wins\n+----A----+----B----+\n|    ${optA}    |    ${optB}    |\n+---------+---------+\n`,{"code":true});
									
									//if lottery win
									if(isNaN(data.users[j]["unstable"])){
										data.users[j]["unstable"] = 0;
									}
									if(data.users[j]["unstable"] > 100){
										type = "random";
										message.channel.send(`Something doesn't feel right... you can't remember what strategy you picked...`);
									}
									if((type == "alwaysA" || (type == "random" && random == 0))&& optA > optB){
										let pot = 10;
										data.users[j].balance += pot;
										data.pot -= pot;
										message.channel.send(`You've won! you got ${pot}CC! You now have ${data.users[j].balance}CC!`);
										//instability counter
										data.users[j]["unstable"] -= amount;
										if(isNaN(data.users[j]["unstable"]) || data.users[j]["unstable"] < 0){
											data.users[j]["unstable"] = 0;
										}
										if(data.users[j]["unstable"] + amount >= 100 && data.users[j]["unstable"] < 100){
											data.users[j]["suicide"] = 1;
											message.channel.send(`You come to your senses.`);
											console.log(data.users[j].name + " has calmed down");
										}
									}
									//if lottery win
									else if((type == "alwaysB" || (type == "random" && random == 1))&& optA < optB){
										let pot = 10;
										data.users[j].balance += pot;
										data.pot -= pot;
										message.channel.send(`You've won! you got ${pot}CC! You now have ${data.users[j].balance}CC!`);
										//instability counter
										data.users[j]["unstable"] -= amount;
										if(isNaN(data.users[j]["unstable"]) || data.users[j]["unstable"] < 0){
											data.users[j]["unstable"] = 0;
										}
										if(data.users[j]["unstable"] + amount >= 100 && data.users[j]["unstable"] < 100){
											data.users[j]["suicide"] = 1;
											message.channel.send(`You come to your senses.`);
											console.log(data.users[j].name + " has calmed down");
										}
									}
									//if lottery lose
									else{
										message.channel.send(`You've lost! The pot is now ${data.pot}CC. You have ${data.users[j].balance}CC.`);
										//instability counter
										data.users[j]["unstable"] += amount;
										if(isNaN(data.users[j]["unstable"])){
											data.users[j]["unstable"] = amount;
										}
										if(isNaN(data.users[j]["suicide"])){
											data.users[j]["suicide"] = 0;
										}
										if(data.users[j]["unstable"] >= 100 && data.users[j]["unstable"] - amount < 100){
											data.users[j]["suicide"] = 0;
											message.channel.send(`You are starting to feel irrational.`);
											console.log(data.users[j].name + " has become irrational");
										}
										if(data.users[j]["unstable"] >= 250){
											message.channel.send(`You are completely unstable`);
											console.log(data.users[j].name + " has become unstable");
											data.users[j]["unstable"] = 250
										}
									}
									data.users[j]["activity"] = Date.now();
									let newData = JSON.stringify(data);
									fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
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
	else if(message.content === '!cc chance'){ /*!cc chance*/ 
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
					
					if(isNaN(data.users[j]["unstable"])){
						data.users[j]["unstable"] = 0;
					}
					if(data.users[j]["unstable"] >= 100){
						amount = data.users[j].balance;
						message.channel.send(`Something doesn't feel right... I think you bet too much money....`);
					}
					data.users[j].balance -= amount;
					message.channel.send(`Quad. 0 wins\n+-0-+-1-+\n| W | L |\n+---+---+\n| L | L |\n+-2-+-3-+\nYou rolled Quad. ${random}`,{"code":true});
					//if victory
					if(random == 0){
						let doubleMoney = amount * 2;
						data.users[j].balance += doubleMoney;
						data.users[j].chanceTime = currentTime.getDate();
						data.econ += amount;
						message.channel.send(`You've won! You now have ${data.users[j].balance}CC`);
						//instability counter
						data.users[j]["unstable"] -= amount;
						if(isNaN(data.users[j]["unstable"]) || data.users[j]["unstable"] < 0){
							data.users[j]["unstable"] = 0;
						}
						if(data.users[j]["unstable"] + amount >= 100 && data.users[j]["unstable"] < 100){
							data.users[j]["suicide"] = 1;
							message.channel.send(`You come to your senses.`);
							console.log(data.users[j].name + " has calmed down");
						}
					}
					//lose chance time
					else{
						let welfPot = Math.floor(amount / 2);
						let blackPot = Math.floor(welfPot / 2);
						welfPot = welfPot - blackPot;
						amount = amount - welfPot;
						amount = amount - blackPot
						data.blackjack += blackPot;
						data.pot += amount;
						data.welfare += welfPot;
						data.users[j].chanceTime = currentTime.getDate();
						message.channel.send(`You've lost! You now have ${data.users[j].balance}CC`);
						//instability counter
						data.users[j]["unstable"] += amount;
						if(isNaN(data.users[j]["unstable"])){
							data.users[j]["unstable"] = amount;
						}
						if(isNaN(data.users[j]["suicide"])){
							data.users[j]["suicide"] = 0;
						}
						if(data.users[j]["unstable"] >= 100 && data.users[j]["unstable"] - amount < 100){
							data.users[j]["suicide"] = 0;
							message.channel.send(`You are starting to feel irrational.`);
							console.log(data.users[j].name + " has become irrational");
						}
						if(data.users[j]["unstable"] >= 250){
							data.users[j]["unstable"] = 250;
							message.channel.send(`You are completely unstable`);
							console.log(data.users[j].name + " has become unstable");
						}
					}
				}
				data.users[j]["activity"] = Date.now();
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				noUser = false;
				break;
			}
		}
		//if user not found
		if(noUser){
			message.channel.send(`You are not registered for CC!`);
		}
	}
	//work
	else if(message.content === '!cc work'){
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
				let currentTime = Date.now();
				let randomAmount = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
				//if user has already played
				try{
					if(data.users[j].claim > currentTime){
						let returnToWork = data.users[j].claim - currentTime;
						returnToWork = Math.floor(returnToWork / 1000); //seconds
						returnToWork = Math.floor(returnToWork / 60); //mins
						message.channel.send(`You've worked recently, Come back in ${returnToWork} mins!`);
					}
					else if(data.welfare < randomAmount){
						message.channel.send(`The mine has dried up! Come back soon!`);
					}
					else{
						if(isNaN(data.users[j]["unstable"])){
							data.users[j]["unstable"] = 0;
						}
						if(data.users[j]["unstable"] >= 100){
							randomAmount = 1;
							message.channel.send(`Something doesn't feel right... You can't focus on work today...`);
						}
						data.users[j].balance += randomAmount;
						data.users[j].claim = currentTime + 21600000;
						data.welfare -= randomAmount;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You worked hard in the carl mines.... and found ${randomAmount}CC! You now have ${data.users[j].balance}CC`);
						console.log(data.users[j].name + " mined CC");
					}
				}
				catch(err){
					if(data.welfare < randomAmount){
						message.channel.send(`The mine has dried up! Come back soon!`);
					}
					else{
						data.users[j]["claim"] = currentTime + 21600000;
						data.users[j].balance += randomAmount;
						data.welfare -= randomAmount;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You worked hard in the carl mines.... and found ${randomAmount}CC! You now have ${data.users[j].balance}CC`);
						console.log(data.users[j].name + " mined CC");
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
	else if(message.content.startsWith('!cc purchase')){ /* !cc purchase home/apartment/skyscraper */
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
							data.welfare += 13;
							data.blackjack += 12
							data.econ -= 50;
							data.users[i]["activity"] = Date.now();
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have purchased a home! You now own ${data.users[i].house}\nEvery day you will get some rent payments!`);
							console.log(data.users[i].name + " bought a home");
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
							data.welfare += 25;
							data.blackjack += 25;
							data.users[i]["activity"] = Date.now();
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have purchased an apartment! You now own ${data.users[i].apartment}\nEvery day you will get some rent payments!`);
							console.log(data.users[i].name + " bought an apartment");
						}
					}
					else if(type == "skyscraper"){
						if(data.users[i].balance - 500 < 0){
							message.channel.send('You do not have enough CC! (Costs 500)');
						}
						else{
							data.users[i]["skyscraper"] += 1;
							if(isNaN(data.users[i].skyscraper)){
								data.users[i].skyscraper = 1;
							}
							data.users[i].balance -= 500;
							data.pot += 50;
							data.econ -= 250;
							data.welfare += 100;
							data.blackjack += 100;
							data.users[i]["activity"] = Date.now();
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have purchased a skyscraper! You now own ${data.users[i].skyscraper}\nEvery day you will get some rent payments!`);
							console.log(data.users[i].name + " bought a skyscraper");
						}
					}
					else{
						message.channel.send('Invalid purchase! !cc purchaseList to see all items');
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
	//purchase items
	else if(message.content === '!cc catalog'){
		message.channel.send(`Purchase List:\n1. house (100CC)\n2. apartment (250CC)\n3. skyscraper (500CC)`);
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
				houseCount += 1;
			}
			if(data.users[i]["apartment"] > 0 && !isNaN(data.users[i]["apartment"])){
				apartmentCount += 1;
			}
			if(data.users[i]["skyscraper"] > 0 && !isNaN(data.users[i]["skyscraper"])){
				skyCount += 1;
			}
		}
		message.channel.send(`There are currently ${data.econ} CC circulating\nThere is currently ${data.users.length} users registered for CC\nThe roll pot is currently ${data.pot}CC\nThe CarlBall Jackpot is ${carlball}CC!\nThe Blackjack pot is currently ${data.blackjack}CC\nThe mines have an estimated ${data.welfare}CC in them\nThere are currently ${houseCount} homes, ${apartmentCount} apartments and ${skyCount} skyscrapers\n${highestEarnerName} has the most CC with ${highestEarnerAmount}CC\nCurrently, ${poorPeople} people have absolutely no CC!`);
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
								data.users[i]["activity"] = Date.now();
								let newData = JSON.stringify(data);
								fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
								message.channel.send(`You have been added to the lottery! Drawing happens at midnight!`);
								console.log(data.users[i].name + " has guessed " + lotteryGuess);
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
							data.users[i]["activity"] = Date.now();
							let newLottery = JSON.stringify(lotteryFile);
							fs.writeFileSync('/home/mattguy/carlcoin/cache/dailyLottery.json',newLottery);
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							message.channel.send(`You have been added to the lottery!`);
							console.log(data.users[i].name + " has guessed " + lotteryGuess);
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
	else if(message.content.startsWith('!cc blackjack')){ /* !cc blackjack amount */	
		let chop = message.content.split(" ");
		if(chop.length != 3){
			message.channel.send('Command arguments incorrect!').then(msg => msg.delete({timeout:5000})).catch(error => {console.log(error)});
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
					message.channel.send('You are already playing BlackJack!').then(msg => msg.delete({timeout:5000})).catch(error => {console.log(error)});
				}
			}
			if(playing){
				let wager = parseInt(chop[chop.length-1]);
				if(isNaN(wager) || wager < 2){
					message.channel.send('Invalid amount entered!').then(msg => msg.delete({timeout:5000})).catch(error => {console.log(error)});
				}
				else if(Math.floor((wager * .25) * 2.5) > data.blackjack){
					message.channel.send('The blackjack pot doesnt have enough CC!').then(msg => msg.delete({timeout:5000})).catch(error => {console.log(error)});
				}
				else{
					let noUser = true;
					for(let i=0;i<data.users.length;i++){
						if(data.users[i].id == challenger){
							if(data.users[i].balance - wager < 0){
								message.channel.send('You dont have enough CC!').then(msg => msg.delete({timeout:5000})).catch(error => {console.log(error)});
							}
							else{
								let welfareSupport = Math.floor(wager * .25);
								let blackjackSupport = wager - welfareSupport;
								data.blackjack += blackjackSupport;
								data.welfare += welfareSupport;
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
								if(((playerCard1%13 == 0)&&(playerCard2%13 == 9 || playerCard2%13 == 10 || playerCard2%13 == 11 || playerCard2%13 == 12))|| ((playerCard2%13 == 0)&&(playerCard1%13 == 9 || playerCard1%13 == 10 || playerCard1%13 == 11 || playerCard1%13 == 12))){
									if(((dealerCard1%13 == 0)&&(dealerCard2%13 == 9 || dealerCard2%13 == 10 || dealerCard2%13 == 11 || dealerCard2%13 == 12)) || ((dealerCard2%13 == 0)&&(dealerCard1%13 == 9 || dealerCard1%13 == 10 || dealerCard1%13 == 11 || dealerCard1%13 == 12))){
										data.users[i].balance += wager;
										data.blackjack -= wager;
										message.channel.send(`You and the dealer both got a natural..... you get back your CC\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.`);
									}
									else{
										data.users[i].balance += Math.floor(wager * 2.5);
										data.blackjack -= Math.floor(wager * 2.5);
										message.channel.send(`You got a natural! You win!\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.`);
										
										//instability counter
										data.users[i]["unstable"] -= Math.floor(wager * 2.5);
										if(isNaN(data.users[i]["unstable"]) || data.users[i]["unstable"] < 0){
											data.users[i]["unstable"] = 0;
										}
										if(data.users[i]["unstable"] + Math.floor(wager * 2.5) >= 100 && data.users[i]["unstable"] < 100){
											data.users[i]["suicide"] = 1;
											message.channel.send(`You come to your senses.`);
											console.log(data.users[i].name + " has calmed down");
										}
									}
									let newData = JSON.stringify(data);
									fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
								}
								else if(((dealerCard1%13 == 0)&&(dealerCard2%13 == 9 || dealerCard2%13 == 10 || dealerCard2%13 == 11 || dealerCard2%13 == 12)) || ((dealerCard2%13 == 0)&&(dealerCard1%13 == 9 || dealerCard1%13 == 10 || dealerCard1%13 == 11 || dealerCard1%13 == 12))){
									message.channel.send(`Dealer got a natural! You lose!\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},${blackjackCards[dealerCard2]}.`);
									
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
										message.channel.send(`You are starting to feel irrational.`);
										console.log(data.users[i].name + " has become irrational");
									}
									if(data.users[i]["unstable"] > 250){
										message.channel.send(`You are completely unstable`);
										console.log(data.users[i].name + " has become unstable");
										data.users[i]["unstable"] = 250;
									}
									let newData = JSON.stringify(data);
									fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
								}
								else{
									let blackjackInfo = {"challenger":`${challenger}`,"challIndex":`${i}`,"wager":`${wager}`,"blackjackEnder":`${blackjackEnder}`,usedCards,playerCards,dealerCards};
									let jsonBlackjack = JSON.stringify(blackjackInfo);
									fs.writeFileSync(`/home/mattguy/carlcoin/cache/${challenger}blackjack`,jsonBlackjack);
									
									if(isNaN(data.users[i]["unstable"])){
										data.users[i]["unstable"] = 0;
									}
									if(data.users[i]["unstable"] >= 100){
										message.channel.send(`Something doesn't feel right... You can't comprehend the cards\n${data.users[i].name}, Type !cc hit or !cc stand, you have 1 min to respond.\nYou:${blackjackCards[playerCard1]},??. Dealer:${blackjackCards[dealerCard1]},??.`).then(msg => msg.delete({timeout:60000})).catch(error => {console.log(error)});
									}
									else{
										message.channel.send(`${data.users[i].name}, Type !cc hit or !cc stand, you have 1 min to respond.\nYou:${blackjackCards[playerCard1]},${blackjackCards[playerCard2]}. Dealer:${blackjackCards[dealerCard1]},??.`).then(msg => msg.delete({timeout:60000})).catch(error => {console.log(error)});
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
					message.channel.send(`Bust! You drew a ${blackjackCards[newCard]}, You lose!\nYou:${cardViewer}`);
					
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
						message.channel.send(`You are starting to feel irrational.`);
						console.log(data.users[blackjackParse.challIndex].name + " has become irrational");

					}
					if(data.users[blackjackParse.challIndex]["unstable"] > 250){
						message.channel.send(`You are completely unstable`);
						console.log(data.users[blackjackParse.challIndex].name + " has become unstable");
						data.users[blackjackParse.challIndex]["unstable"] = 250
					}
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
				}
				else if(ace && currentTotal + 10 <= 21){
					let jsonBlackjack = JSON.stringify(blackjackParse);
					fs.writeFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`,jsonBlackjack);
					message.channel.send(`You drew a ${blackjackCards[newCard]} you now have ${currentTotal} (or ${currentTotal + 10} since you have an ace)\nYou:${cardViewer}`).then(msg => msg.delete({timeout:60000})).catch(error => {console.log(error)});
				}
				else{
					let jsonBlackjack = JSON.stringify(blackjackParse);
					fs.writeFileSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`,jsonBlackjack);
					message.channel.send(`You drew a ${blackjackCards[newCard]} you now have ${currentTotal}\nYou:${cardViewer}`).then(msg => msg.delete({timeout:60000})).catch(error => {console.log(error)});
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
					message.channel.send(`Bust! Dealer loses, You've won!\nYou:${playerViewer}. Dealer:${cardViewer}`);
					data.users[blackjackParse.challIndex].balance += Math.floor(blackjackParse.wager * 2);
					data.blackjack -= Math.floor(blackjackParse.wager * 2);
					data.users[blackjackParse.challIndex]["activity"] = Date.now();
					
					//instability counter
					data.users[blackjackParse.challIndex]["unstable"] -= Math.floor(blackjackParse.wager * 2);
					if(isNaN(data.users[blackjackParse.challIndex]["unstable"]) || data.users[blackjackParse.challIndex]["unstable"] < 0){
						data.users[blackjackParse.challIndex]["unstable"] = 0;
					}
					if(data.users[blackjackParse.challIndex]["unstable"] + Math.floor(blackjackParse.wager * 2) >= 100 && data.users[blackjackParse.challIndex]["unstable"] < 100){
						data.users[blackjackParse.challIndex]["suicide"] = 1;
						message.channel.send(`You come to your senses.`);
						console.log(data.users[blackjackParse.challIndex].name + " has calmed down");
					}
					
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
						message.channel.send(`You have ${playerValue}, Dealer has ${dealerTotal}. You've won!\nYou:${playerViewer}. Dealer:${cardViewer}`);
						data.users[blackjackParse.challIndex].balance += Math.floor(blackjackParse.wager * 2);
						data.blackjack -= Math.floor(blackjackParse.wager * 2);
						data.users[blackjackParse.challIndex]["activity"] = Date.now();
						
						//instability counter
						data.users[blackjackParse.challIndex]["unstable"] -= Math.floor(blackjackParse.wager * 2);
						if(isNaN(data.users[blackjackParse.challIndex]["unstable"]) || data.users[blackjackParse.challIndex]["unstable"] < 0){
							data.users[blackjackParse.challIndex]["unstable"] = 0;
						}
						if(data.users[blackjackParse.challIndex]["unstable"] + Math.floor(blackjackParse.wager * 2) >= 100 && data.users[blackjackParse.challIndex]["unstable"] < 100){
							data.users[blackjackParse.challIndex]["suicide"] = 1;
							message.channel.send(`You come to your senses.`);
							console.log(data.users[blackjackParse.challIndex].name + " has calmed down");
						}
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
					}
					else if(dealerTotal > playerValue){
						//player lose
						message.channel.send(`You have ${playerValue}, Dealer has ${dealerTotal}. You've lost!\nYou:${playerViewer}. Dealer:${cardViewer}`);
						data.users[blackjackParse.challIndex]["activity"] = Date.now();
						
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
							message.channel.send(`You are starting to feel irrational.`);
							console.log(data.users[blackjackParse.challIndex].name + " has become irrational");
						}
						if(data.users[blackjackParse.challIndex]["unstable"] > 250){
							message.channel.send(`You are completely unstable`);
							console.log(data.users[blackjackParse.challIndex].name + " has become unstable");
							data.users[blackjackParse.challIndex]["unstable"] = 250
						}
						
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}blackjack`);
					}
					else{
						//draw
						message.channel.send(`You have ${playerValue}, Dealer has ${dealerTotal}. It's a draw!\nYou:${playerViewer}. Dealer:${cardViewer}`);
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
						data.users[i]["unstable"] -= 25;
						if(data.users[i]["unstable"] < 0){
							data.users[i]["unstable"] = 0;
						}
						message.channel.send(`You managed to relax a bit`);
						if(data.users[i]["unstable"] + 25 >= 100 && data.users[i]["unstable"] < 100){
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
							data.users[i]["unstable"] -= 25;
							if(data.users[i]["unstable"] < 0){
								data.users[i]["unstable"] = 0;
							}
							message.channel.send(`You managed to relax a bit`);
							if(data.users[i]["unstable"] + 25 >= 100 && data.users[i]["unstable"] < 100){
								message.channel.send(`You have come to your senses`);
							}

						}
						else{
							message.channel.send(`You couldn't relax at all`);
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
		let formatedNames = "";
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].balance != 0){
				let balance = data.users[i].balance.toString();
				let user = data.users[i].name + ":" + balance + "\n";
				formatedNames += user;
			}
		}
		message.channel.send(`${formatedNames}`,{"code":true});
	}
	//help menu
	else if(message.content === '!cc help'){
		message.channel.send(`use !cc gameHelp to see information on games\nuse !cc userHelp to see user commands`);
	}
	//gamble help
	else if(message.content === '!cc gameHelp'){
		message.channel.send(`use !cc roll <type> to play the Game. types: alwaysA, alwaysB, random\nuse !cc chance to maybe double your money!\nuse !cc guess <number> when theres a solve chance! numbers are between 1 and 100\nuse !cc challenge <@user> <amount> to challenge someone for some CC!\nuse !cc lottery <guess> to guess a number between 1 and 500, winner gets the pot!\nuse !cc blackjack <amount> to play blackjack`);
	}
	//user help
	else if(message.content === '!cc userHelp'){
		message.channel.send(`use !cc join to join Carl Coin!\nuse !cc balance to see your balance\nuse !cc pay <@user> <amount> to pay another user\nuse !cc work to go to the carl mines!\nuse !cc econ to see the current economy\nuse !cc purchase <type> to purchase something\nuse !cc catalog to see all things for sale\nuse !cc sell <type> to sell a house, apartment or skyscraper!\nuse !cc userSell <@user> <type> <amount> to sell to another person\nuse !cc relax to unwind some stress from gambling\nuse !cc sanity to see how you are feeling\nuse !cc leaderboard to see everyones balance\nuse !cc audit <@user> to see their balance\nuse !cc playercard to see your characters player information`);
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
