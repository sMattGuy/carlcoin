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
			data.users.push({"name":`${user}`,"balance":10});
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
		console.log(chop);
		if(chop.length > 4){
			message.channel.send(`Too many arguments supplied!`);
		}
		else{
			let recipient = getUserFromMention(chop[chop.length-2]).username;
			console.log(recipient);
			let amount = parseInt(chop[chop.length-1]);
			if(amount == 0 || amount == 'NaN'){
				
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
									message.channel.send(`You have paid ${recipient} ${amount} CC!`);
									message.channel.send(`${recipient}'s Balance ${data.users[j].balance}`);
									message.channel.send(`${user}'s Balance ${data.users[i].balance}`);
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
	else if(message.content.startsWith('!cc help')){
		message.channel.send(`use !cc join to join Carl Coin!`);
		message.channel.send(`use !cc balance to see your balance`);
		message.channel.send(`use !cc pay <@user> <amount> to pay another user`);
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
