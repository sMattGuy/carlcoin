const Discord = require('discord.js');
const fs = require('fs');

function checkLeaderboard(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let stockFile = fs.readFileSync('/home/mattguy/carlcoin/stock.json');
	let stockJSON = JSON.parse(stockFile);
	let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
	let bank = JSON.parse(bankFile);
	let userArray = [];
	for(let i=0;i<data.users.length;i++){
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
		let cityValue = 250 * parseInt(data.users[i]["city"]);
		if(isNaN(cityValue)){
			cityValue = 0;
		}
		let countryValue = 250 * parseInt(data.users[i]["country"]);
		if(isNaN(countryValue)){
			countryValue = 0;
		}
		let stationValue = 250 * parseInt(data.users[i]["station"]);
		if(isNaN(stationValue)){
			stationValue = 0;
		}
		let combinedAssests = houseValue + apartmentValue + skyscraperValue + cityValue + countryValue + stationValue;
		let bankVal = 0;
		for(let j=0;j<bank.users.length;j++){
			if(data.users[i].id == bank.users[j].id){
				bankVal = bank.users[j].balance;
			}
		}
		let stockValue = 0;
		for(let stockIndex = 0;stockIndex<stockJSON.stock.length;stockIndex++){
			if(data.users[i].hasOwnProperty("stock")){
				for(let j=0;j<data.users[i].stock.length;j++){
					if(stockJSON.stock[stockIndex].name == data.users[i].stock[j].name){
						stockValue += (data.users[i].stock[j].amount * stockJSON.stock[stockIndex].price);
					}
				}
			}
		}
		combinedAssests += bankVal
		combinedAssests += stockValue;
		let userObject = {name:`${user}`,balance:`${balance}`,assets:`${combinedAssests}`};
		userArray.push(userObject);
	}
	userArray.sort(function (a,b){
		return (parseInt(b.balance) + parseInt(b.assets)) - (parseInt(a.balance) + parseInt(a.assets));
	});
	let messageBox = '';
	for(let i=0;i<userArray.length;i++){
		let newMessage = `${i+1}.${userArray[i].name}:${userArray[i].balance} (assets:${userArray[i].assets}) total:${parseInt(userArray[i].balance)+parseInt(userArray[i].assets)}\n`;
		if(messageBox.length + newMessage.length < 1500){
			messageBox += newMessage;
		}
		else{
			break;
		}
	}
	message.channel.send(`Leaderboard of Carl Coin\n${messageBox}`,{"code":true});
	console.log(message.author.username + ' has checked the leaderboard');
}

//export functions
module.exports = {
	checkLeaderboard
};
