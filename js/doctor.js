const Discord = require('discord.js');
const fs = require('fs');

function doctorVisit(client,message){
	//fetch and store data
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
	let bank = JSON.parse(bankFile);
	//checks for name
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id && !isNaN(data.users[i]["unstable"])){
			let totalCost = data.users[i].balance;
			for(let b = 0;b<bank.users.length;b++){
				if(data.users[i].id == bank.users[b].id){
					totalCost += bank.users[b].balance;
					break;
				}
			}
			let price = Math.floor(totalCost / 6) + 10;
			if(data.users[i].balance - price < 0){
				message.channel.send(`You don't have enough CC! You might need to withdraw from your bank account! (Costs ${price})`);
			}
			else{
				let insane = false;
				if(data.users[i]["unstable"] >= 100){
					insane = true;
				}
				data.users[i]["unstable"] -= 250;
				data.users[i].balance -= price;
				data.welfare += price;
				if(data.users[i]["unstable"] < 0){
					data.users[i]["unstable"] = 0;
				}
				message.channel.send(`The doctor gave you some medicine; You feel a bit better.`);
				console.log(data.users[i].name + ' used the doctor');
				if(insane){
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