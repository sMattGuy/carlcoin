const Discord = require('discord.js');
const fs = require('fs');

function doctorVisit(client,message){
	//fetch and store data
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//checks for name
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id && !isNaN(data.users[i]["unstable"])){
			if(data.users[i].balance - 2 < 0){
				message.channel.send(`You don't have enough CC! (Costs 2)`);
			}
			else{
				let insane = false;
				if(data.users[i]["unstable"] >= 100){
					insane = true;
				}
				data.users[i]["unstable"] -= 50;
				data.users[i].balance -= 2;
				data.welfare += 2;
				if(data.users[i]["unstable"] < 0){
					data.users[i]["unstable"] = 0;
				}
				message.channel.send(`The doctor gave you some medicine; You feel a bit better.`);
				console.log(data.users[i].name + ' used the doctor');
				if(insane && data.users[i]["unstable"] + 50 >= 100 && data.users[i]["unstable"] < 100){
					message.channel.send(`You have come to your senses`);
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
	doctorVisit
};