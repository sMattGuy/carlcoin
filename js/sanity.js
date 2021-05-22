const Discord = require('discord.js');
const fs = require('fs');

function checkSanity(client,message){
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

//export functions
module.exports = {
	checkSanity
};