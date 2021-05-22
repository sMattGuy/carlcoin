const Discord = require('discord.js');
const fs = require('fs');

function joinCarlCoin(){
	//fetch and store data
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	//stores user
	let user = message.author.username;
	let id = message.author.id;
	//bool to add user
	let addUser = true;
	//checks for name
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			message.channel.send('You are already registered!');
			addUser = false;
			break;
		}
	}
	//add user
	if(addUser){
		//create user variables
		data.users.push({"id":`${id}`,"name":`${user}`,"balance":0,"chanceTime":0,"claim":0,"house":0,"apartment":0,"activity":`${Date.now()}`,"suicide":1,"unstable":0});
		//write new data and alert new user
		let newData = JSON.stringify(data);
		fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
		message.channel.send('You have been registered! Use !cc work to get some Carl Coin!');
		console.log(user + " has joined carlcoin");
	}
}

//export functions
module.exports = {
	joinCarlCoin
};