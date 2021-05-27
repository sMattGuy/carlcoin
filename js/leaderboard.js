const Discord = require('discord.js');
const fs = require('fs');

function checkLeaderboard(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let userArray = [];
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].balance != 0){
			let balance = data.users[i].balance
			let user = data.users[i].name;
			let houseValue = 50 * parseInt(data.users[i]["house"]);
			if(isNaN(houseValue)){
				houseValue = 0;
			}
			let apartmentValue = 150 * parseInt(data.users[i]["apartment"]);
			if(isNaN(apartmentValue)){
				apartmentValue = 0;
			}
			let skyscraperValue = 250 * parseInt(data.users[i]["skyscraper"]);
			if(isNaN(skyscraperValue)){
				skyscraperValue = 0;
			}
			let combinedAssests = houseValue + apartmentValue + skyscraperValue;
			let userObject = {name:`${user}`,balance:`${balance}`,assets:`${combinedAssests}`};
			userArray.push(userObject);
		}
	}
	userArray.sort(function (a,b){
		return (parseInt(b.balance) + parseInt(b.assets)) - (parseInt(a.balance) + parseInt(a.assets));
	});
	let messageBox = '';
	for(let i=0;i<userArray.length;i++){
		messageBox += `${i+1}.${userArray[i].name}:${userArray[i].balance} (assets:${userArray[i].assets}) total:${parseInt(userArray[i].balance)+parseInt(userArray[i].assets)}\n`;
	}
	message.channel.send(`Leaderboard of Carl Coin\n${messageBox}`,{"code":true});
}

//export functions
module.exports = {
	checkLeaderboard
};