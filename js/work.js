const Discord = require('discord.js');
const fs = require('fs');

function workPlayer(client,message){
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
			let randomAmount = Math.floor((Math.floor(Math.random() * Math.floor(data.welfare / data.users.length)) + data.users.length) / 4);
			//if user has already played
			if(data.users[j].claim > currentTime){
				let returnToWork = data.users[j].claim - currentTime;
				returnToWork = Math.floor(returnToWork / 1000); //seconds
				returnToWork = Math.floor(returnToWork / 60); //mins
				message.channel.send(`You've worked recently, Come back in ${returnToWork} mins!`);
				return;
			}
			else if(data.welfare < randomAmount*(randomAmount/2)){
				message.channel.send(`The mine has dried up! Come back soon!`);
				return;
			}
			else{
				if(isNaN(data.users[j]["unstable"])){
					data.users[j]["unstable"] = 0;
				}
				if(isNaN(data.users[j]["strEXP"])){
					data.users[j]["strEXP"] = 0;
				}
				if(data.users[j]["unstable"] >= 100){
					randomAmount = 1;
					message.channel.send(`Something doesn't feel right... You can't focus on work today...`);
				}
				//str check
				let bonusChance = Math.random();
				if(isNaN(data.users[j]["STR"])){
					data.users[j]["STR"] = 0;
				}
				let strBonus = data.users[j]["STR"] * .01;
				if(strBonus > .1){
					strBonus = .1;
				}
				data.users[j].balance += randomAmount;
				data.welfare -= randomAmount;
				data.users[j]["strEXP"] += randomAmount;
				message.channel.send(`You worked hard in the carl mines.... and found ${randomAmount}CC! You now have ${data.users[j].balance}CC`);
				if(1 - bonusChance < strBonus && data.users[j]["unstable"] < 100){
					let bonusAmount = Math.floor(randomAmount/2);
					data.econ += bonusAmount;
					data.users[j].balance += bonusAmount;
					message.channel.send(`Your STR lets you work extra hard today, You earned an extra ${bonusAmount}CC!`);
				}
				if(Math.random() < 0.01){
					data.econ += 100;
					data.users[j].balance += 100;
					message.channel.send(`You notice a glimmer while mining.... Wow! A Diamond! You sold it for an additional 100CC!`);
				}
				console.log(data.users[j].name + " mined CC");
				if(data.users[j]["office"] === 1){
					if(data.users[j]["unstable"] >= 100){
						randomAmount = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
						data.users[j].balance += randomAmount;
						data.welfare -= randomAmount;
						message.channel.send(`Your office helps pick up some slack from today... You manage to get ${randomAmount}CC. You now have ${data.users[j].balance}CC`);
					}
					else{
						data.users[j].balance += Math.floor(randomAmount / 2);
						data.welfare -= Math.floor(randomAmount / 2);
						data.users[j]["strEXP"] += Math.floor(randomAmount / 2);
						message.channel.send(`You filed some paperwork in your office after mining, getting you some more CC! You now have ${data.users[j].balance}CC`);
						console.log(data.users[j].name + " used their office CC");
					}
				}
				if(isNaN(data.users[j]["STR"])){
					data.users[j]["STR"] = 0;
				}
				if(data.users[j]["STR"] * 2 + 10 < data.users[j]["strEXP"]){
					data.users[j]["STR"] += 1;
					data.users[j]["strEXP"] = 0;
					message.channel.send(`Your hard work paid off, your STR has increased!`);
				}
				data.users[j].claim = currentTime + 21600000;
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
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

//export functions
module.exports = {
	workPlayer
};