const Discord = require('discord.js');
const fs = require('fs');

function changeName(client,message){
	//fetch and store data
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//checks for name
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			data.users[i].name = message.author.username;
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			message.channel.send(`Your username has been updated`);
			break;
		}
	}
}

//export functions
module.exports = {
	changeName
};