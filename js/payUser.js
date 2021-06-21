const Discord = require('discord.js');
const fs = require('fs');

function payUser(client,message){
	let chop = message.content.split(" ");
	let corrUser = true;
	//if too many arguments
	if(chop.length != 4){
		message.channel.send(`Usage: !cc pay <user>`);
	}
	else{
		let recipient = "";
		let recpid = "";
		//attempts to get username
		try{
			recipient = getUserFromMention(client,chop[chop.length-2]).username;
			recpid = getUserFromMention(client,chop[chop.length-2]).id;
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
						if(isNaN(data.users[i]["bitterness"])){
							data.users[i]["bitterness"] = 0;
						}
						if(data.users[i]["bitterness"] >= 100){
							message.channel.send(`You are too bitter to give away your money`);
						}
						else{
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
										if(data.users[i]["bitterness"] >= 100){
											message.channel.send(`Giving away all your money has made you bitter!`);
										}
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
//helper function to get user
function getUserFromMention(client,mention) {
	if (!mention) return;
	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

//export functions
module.exports = {
	payUser
};