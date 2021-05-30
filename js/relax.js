const Discord = require('discord.js');
const fs = require('fs');

function relaxUser(client,message){
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
						if(conBonus > .5){
							conBonus = .5;
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

//export functions
module.exports = {
	relaxUser
};