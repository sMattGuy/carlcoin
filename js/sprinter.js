const Discord = require('discord.js');
const fs = require('fs');

function driveSprinter(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			if(isNaN(data.users[i]["sprinter"])){
				message.channel.send(`You don't have a Sprinter to drive`);
				return;
			}
			else if(data.users[i]["sprinter"] <= 0){
				message.channel.send(`You don't have a Sprinter to drive`);
				return;
			}
			else{
				message.channel.send(`You drive around your Sprinter, life feels good`);
				return;
			}
		}
	}
}

function moveCargo(client,message){
	/*
	!cc moveCargo <cargo type>
	cargo types
	bitches
	gildians stuff
	punchbars
	*/
	
}

//export functions
module.exports = {
	driveSprinter
};