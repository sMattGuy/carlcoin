const Discord = require('discord.js');
const fs = require('fs');

function chanceGame(){
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
					let insane = false;
					if(data.users[j]["unstable"] >= 100){
						insane = true;
					}
					data.users[j]["unstable"] -= amount;
					if(isNaN(data.users[j]["unstable"]) || data.users[j]["unstable"] < 0){
						data.users[j]["unstable"] = 0;
					}
					if(insane && data.users[j]["unstable"] + amount >= 100 && data.users[j]["unstable"] < 100){
						data.users[j]["suicide"] = 1;
						message.channel.send(`You come to your senses.`);
						console.log(data.users[j].name + " has calmed down");
					}
					if(isNaN(data.users[j]["WIS"])){
						data.users[j]["WIS"] = 0;
					}
					if(isNaN(data.users[j]["wisExp"])){
						data.users[j]["wisExp"] = 0;
					}
					data.users[j]["wisExp"] += amount;
					if(data.users[j]["WIS"] * 2 + 10 < data.users[j]["wisExp"]){
						data.users[j]["wisExp"] = 0;
						data.users[j]["WIS"] += 1;
						message.channel.send(`Chancing was a wise choice, your WIS increased!`);
					}
				}
				//lose chance time
				else{
					let welfPot = Math.floor(amount / 2);
					amount -= welfPot;
					let blackPot = Math.floor(welfPot / 2);
					welfPot -= blackPot;
					data.blackjack += blackPot + amount;
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
			data.users[j]["bitterness"] = 0;
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

//export functions
module.exports = {
	chanceGame
};