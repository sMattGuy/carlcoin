const Discord = require('discord.js');
const fs = require('fs');

function checkLeaderboard(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let numberOneName = '';
	let numberTwoName = '';
	let numberThreeName = '';
	let numberOne = 0;
	let numberTwo = 0;
	let numberThree = 0;
	let userArray = [];
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].balance != 0){
			let balance = data.users[i].balance
			let user = data.users[i].name;
			let userObject = {name:`${user}`,balance:`${balance}`};
			userArray.push(userObject);
		}
	}
	userArray.sort(function (a,b){
		return b.balance - a.balance;
	});
	let messageBox = '';
	for(let i=0;i<userArray.length;i++){
		messageBox += `${i+1}. ${userArray[i].name}:${userArray[i].balance}\n`;
	}
	message.channel.send(`Leaderboard of Carl Coin\n${messageBox}`,{"code":true});
}

//export functions
module.exports = {
	checkLeaderboard
};