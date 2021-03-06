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
let raffleRNG = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
let messageCounter = 0;
let raffleStart = false;
let mysteryNumber = Math.floor(Math.random() * (100 - 1 + 1)) + 1;

console.log("rafflerng",raffleRNG);
//sets ready presense
client.on('ready', () => {
  client.user.setPresence({
    status: 'online',
    activity: {
        name: 'for ^message',
        type: "WATCHING"
    }
  });
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', message => {
	//increment message counter
	messageCounter += 1;
	//set presence
   client.user.setPresence({
      status: 'online',
		activity: {
         name: 'for !cc help',
         type: "WATCHING"
      }
   });
	console.log(messageCounter);
	//raffle functionality
	if(messageCounter > raffleRNG){
		messageCounter = 0;
	}
	if(messageCounter == raffleRNG && !raffleStart){
		raffleRNG = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
		console.log("rafflerng",raffleRNG);
		mysteryNumber = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
		console.log("mystery",mysteryNumber);
		messageCounter = 0;
		raffleStart = true;
		messageCounter = 0;
		message.channel.send(`https://i.imgur.com/0aDFif9.png`);
		let mysteryMD5 = md5(mysteryNumber);
		console.log("md5",mysteryMD5);
		let guildList = client.guilds;
		try{
			guildList.forEach(guild => guild.defaultChannel.send(`10 Carl Coin has appeared! the MD5 is ${mysteryMD5}\nType !cc guess <number> to try to crack the hash! (between 1 and 100)`));
		}
		catch(err){
			console.log("Could not send message to " + guild.name);
		}
		
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
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].name == user){
				if(guess < 1 || guess == 'NaN'){	
					message.channel.send(`Invalid amount entered!`);
				}
				else{
					if(mysteryNumber == guess){
						data.users[i].balance += 10;
						data.econ += 10;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						let guildList = client.guilds;
						try{
							guildList.forEach(guild => guild.defaultChannel.send(`${data.users[i].name} has won! The mining is over.`));
						}
						catch(err){
								console.log("couldnt send to" + guild.name);
						}
						raffleStart = false;
					}
					if(mysteryNumber > guess){
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
   //commands
	if (message.content.startsWith('!cc join')) {
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		//stores user
		let user = message.author.username;
		//bool to add user
		let addUser = true;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].name == user){
				message.channel.send('You are already registered!');
				addUser = false;
				break;
			}
		}
		//add user
		if(addUser){
			data.users.push({"name":`${user}`,"balance":10,"chanceTime":0});
			data.econ += 10;
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			message.channel.send('You have been registered and recieved 10CC!');
		}
	}
	else if(message.content.startsWith('!cc balance')){
		//fetch and store data
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		//stores user
		let user = message.author.username;
		//flag
		let notFound = true;
		//checks for name
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].name == user){
				let balance = data.users[i].balance;
				message.channel.send(`You have ${balance} CC`);
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
		console.log(chop);
		//if too many arguments
		if(chop.length > 4){
			message.channel.send(`Too many arguments supplied!`);
		}
		else{
			let recipient = "";
			//attempts to get username
			try{
				recipient = getUserFromMention(chop[chop.length-2]).username;
			}
			//if username cannot be gotten
			catch(err){
				message.channel.send(`Invalid recipient`);
				corrUser = false;
			}
			//if username works
			if(corrUser){
				console.log(recipient);
				let amount = parseInt(chop[chop.length-1]);
				//checks valid money
				if(amount <= 0 || amount == 'NaN'){
					
					message.channel.send(`Invalid amount entered!`);
				}
				else{
					//fetch and store data
					let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					let data = JSON.parse(database);
					//store user
					let user = message.author.username;
					//flag
					let notFound = true;
					//finds payer
					for(let i=0;i<data.users.length;i++){
						//if username found
						if(data.users[i].name == user){
							let balance = data.users[i].balance;
							if(balance - amount < 0){
								console.log("not enough coin")
								message.channel.send(`You don't have enough CC!`);
							}
							else{
								let noRecp = true;
								//finds other user
								for(let j=0;j<data.users.length;j++){
									//starts paying
									if(data.users[j].name == recipient){
										noRecp = false;
										console.log("paying",amount);
										data.users[i].balance -= amount;
										data.users[j].balance += amount;
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You have paid ${recipient} ${amount} CC!\n${recipient}'s Balance ${data.users[j].balance}\n${user}'s Balance ${data.users[i].balance}`);
									}
								}
								//other user not found
								if(noRecp){
									console.log("no user")
									message.channel.send('Recipient not found!');
								}
							}
							notFound = false;
							break;
						}
					}
					if(notFound){
						console.log("not registered");
						message.channel.send('You are not registered for CC!');
					}
				}
			}
		}
	}
	//lottery game
	else if(message.content.startsWith('!cc roll')){
		let chop = message.content.split(" ");
		console.log(chop);
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
					if(data.pot+5 < 10){
						message.channel.send(`Pot is empty, try again later!`);
						noUser = true;
					}
					else{
						//find user and check amount
						for(let j=0;j<data.users.length;j++){
							//if username found
							if(data.users[j].name == user){
								let balance = data.users[j].balance;
								//if balance would go negative
								if(balance - amount < 0){
									console.log("not enough coin")
									message.channel.send(`You don't have enough CC! (costs 5)`);
								}
								else{
									//starts gambling
									let optA = Math.floor(Math.random() * 10); 
									let optB = Math.floor(Math.random() * 10);
									let random = Math.floor(Math.random() * 2);
									data.pot += amount;
									data.users[j].balance -= amount;
									message.channel.send(`Higher Value Wins\n+----A----+----B----+\n|    ${optA}    |    ${optB}    |\n+---------+---------+\n`,{"code":true});
									//if lottery win
									if((type == "alwaysA" || (type == "random" && random == 0))&& optA >= optB){
										let pot = 10;
										data.users[j].balance += pot;
										data.pot -= pot;
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You've won! you got ${pot}CC!`);
									}
									//if lottery win
									else if((type == "alwaysB" || (type == "random" && random == 1))&& optA <= optB){
										let pot = 10;
										data.users[j].balance += pot;
										data.pot -= pot;
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You've won! you got ${pot}CC!`);
									}
									//if lottery lose
									else{
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You've lost! The pot is now ${data.pot}CC`);
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
		//find user and check amount
		for(let j=0;j<data.users.length;j++){
			//if user name found
			if(data.users[j].name == user){
				let balance = data.users[j].balance;
				let amount = Math.floor(balance/2);
				let currentTime = new Date();
				if(amount == 0) amount += 1;
				//if user has no money
				if(balance - amount <= 0){
					console.log("not enough coin")
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
						data.pot += amount;
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
		message.channel.send(`There are currently ${data.econ} CC circulating\nThe pot is currently ${data.pot}CC\nThe highest earner is ${highestEarnerName} with ${highestEarnerAmount}CC\nThe lowest earner is ${lowestEarnerName} with ${lowestEarnerAmount}CC`);
	}
	//help menu
	else if(message.content.startsWith('!cc help')){
		message.channel.send(`use !cc join to join Carl Coin!\nuse !cc balance to see your balance\nuse !cc pay <@user> <amount> to pay another user\nuse !cc econ to see the current economy\nuse !cc roll <type> to play the Game. types: alwaysA, alwaysB, random\nuse !cc chance to maybe double your money!\nuse !cc guess <number> when theres a solve chance! numbers are between 1 and 100`);
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
