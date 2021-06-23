const Discord = require('discord.js');
const die = require('./suicide.js');
const fs = require('fs');

function haveSex(client,message){
	message.channel.send(`You have poggers sex`);
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	let chance = Math.random();
	if(chance >= 0.999){
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id){
				die.die(message,client,data,i);
				message.channel.send(`You bust the ultimate nut, draining all of your life force\nWith this characters death, the thread of prophecy is severed. Rejoin CarlCoin to restore the weave of fate, or persist in the doomed world you have created.`);
				break;
			}
		}
	}
	else{
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id){
				if(isNaN(data.users[i]["unstable"])){
					data.users[i]["unstable"] = 0;
				}
				data.users[i]["unstable"] -= 5;
				if(data.users[i]["unstable"] < 0){
					data.users[i]["unstable"] = 0;
				}
				if(data.users[i]["unstable"] + 5 >= 100 && data.users[i]["unstable"] < 100){
					message.channel.send(`You come to your senses`);
				}
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				message.channel.send(`It makes you feel a bit better`);
				break;
			}
		}
	}
}

//export functions
module.exports = {
	haveSex
};