'use strict';
// Import the discord.js module and others
const Discord = require('discord.js');
const fs = require('fs');
// Create an instance of a Discord client
const client = new Discord.Client();

// import token and database
const credentials = require('./auth.json');

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
   client.user.setPresence({
      status: 'online',
		activity: {
         name: 'for !cc help',
         type: "WATCHING"
      }
   });
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
	else if(message.content.startsWith('!cc pay')){
		let chop = message.content.split(" ");
		let corrUser = true;
		console.log(chop);
		if(chop.length > 4){
			message.channel.send(`Too many arguments supplied!`);
		}
		else{
			let recipient = "";
			try{
				recipient = getUserFromMention(chop[chop.length-2]).username;
			}
			catch(err){
				message.channel.send(`Invalid recipient`);
				corrUser = false;
			}
			if(corrUser){
				console.log(recipient);
				let amount = parseInt(chop[chop.length-1]);
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
						if(data.users[i].name == user){
							let balance = data.users[i].balance;
							if(balance - amount < 0){
								console.log("not enough coin")
								message.channel.send(`You don't have enough CC!`);
							}
							else{
								let noRecp = true;
								for(let j=0;j<data.users.length;j++){
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
							if(data.users[j].name == user){
								let balance = data.users[j].balance;
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
									if((type == "alwaysA" || (type == "random" && random == 0))&& optA >= optB){
										let pot = 10;
										data.users[j].balance += pot;
										data.pot -= pot;
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You've won! you got ${pot}CC!`);
									}
									else if((type == "alwaysB" || (type == "random" && random == 1))&& optA <= optB){
										let pot = 10;
										data.users[j].balance += pot;
										data.pot -= pot;
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You've won! you got ${pot}CC!`);
									}
									else{
										let newData = JSON.stringify(data);
										fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
										message.channel.send(`You've lost! The pot is now ${data.pot}CC`);
									}
								}
								noUser = false;
								break;
							}
						}
					}
					if(noUser){
						message.channel.send(`You are not registered for CC!`);
					}
					noStrat = false;
					break;
				}
			}
			if(noStrat){
				message.channel.send(`Invalid strat (try alwaysA, alwaysB or random)`);
			}
		}
	}
	else if(message.content.startsWith('!cc chance')){ /*!cc chance*/ 
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let noUser = true;
		//store user
		let user = message.author.username;
		//find user and check amount
		for(let j=0;j<data.users.length;j++){
			if(data.users[j].name == user){
				let balance = data.users[j].balance;
				let amount = Math.floor(balance/2);
				if(amount == 0) amount += 1;
				if(balance - amount <= 0){
					console.log("not enough coin")
					message.channel.send(`You don't have enough CC!`);
				}
				let currentTime = new Date();
				else if(data.users[j].chanceTime == currentTime.getDate()){
					message.channel.send(`You've already won today! Try tomorrow`);
				}
				else{
					//starts chance time
					let random = Math.floor(Math.random() * 4);
					data.users[j].balance -= amount;
					message.channel.send(`Quad. 0 wins\n+-0-+-1-+\n| W | L |\n+---+---+\n| L | L |\n+-2-+-3-+\nYou rolled Quad. ${random}`,{"code":true});
					if(random == 0){
						let doubleMoney = amount * 2;
						data.users[j].balance += doubleMoney;
						data.users[j].chanceTime = currentTime.getDate();
						data.econ += amount;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You've won! You now have ${data.users[j].balance}CC`);
					}
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
		if(noUser){
			message.channel.send(`You are not registered for CC!`);
		}
	}
	else if(message.content.startsWith('!cc econ')){
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let highestEarnerName = "";
		let highestEarnerAmount = 0;
		let lowestEarnerName = "";
		let lowestEarnerAmount = 99999;
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
	else if(message.content.startsWith('!cc help')){
		message.channel.send(`use !cc join to join Carl Coin!\nuse !cc balance to see your balance\nuse !cc pay <@user> <amount> to pay another user\nuse !cc econ to see the current economy\nuse !cc roll <type> to play the Game. types: alwaysA, alwaysB, random\nuse !cc chance to maybe double your money!`);
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
