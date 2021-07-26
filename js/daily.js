const Discord = require('discord.js');
const fs = require('fs');
const horse = require('./horse.js');
const bank = require('./bank.js');

function dailyEvents(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
	let bankJSON = JSON.parse(bankFile);
	let totalAdded = 0;
	let totalTax = 0;
	let totalRemoved = 0;
	for(let i=0;i<data.users.length;i++){
		let bankValue = 0;
		for(let j=0;j<bankJSON.users.length;j++){
			if(data.users[i].id == bankJSON.users[j].id){
				bankValue = bankJSON.users[j].balance;
				break;
			}
		}
		bankValue = Math.floor(bankValue / 2);
		let personalTax = Math.floor(((data.users[i].balance + bankValue) / data.econ) * 100) + 1;
		console.log(data.users[i].name + ' has a personal tax of ' + personalTax);
		let taxAmount = 0;
		let blackjackAmount = 0;
		
		let homes = data.users[i]["house"];
		if(isNaN(homes)){
			homes = 0;
		}
		let apartments = data.users[i]["apartment"];
		if(isNaN(apartments)){
			apartments = 0;
		}
		let skyscrapers = data.users[i]["skyscraper"];
		if(isNaN(skyscrapers)){
			skyscrapers = 0;
		}
		
		let cities = data.users[i]["city"];
		if(isNaN(cities)){
			cities = 0;
		}
		let countries = data.users[i]["country"];
		if(isNaN(countries)){
			countries = 0;
		}
		let stations = data.users[i]["station"];
		if(isNaN(stations)){
			stations = 0;
		}
		
		let homePrice = homes * 10;
		taxAmount = Math.floor(homes * personalTax) * 2;
		let apartPrice = apartments * 25;
		taxAmount += Math.floor(apartments * personalTax) * 4;
		let skyPrice = skyscrapers * 50;
		taxAmount += Math.floor(skyscrapers * personalTax) * 8;
		let cityPrice = cities * 100;
		taxAmount += Math.floor(cities * personalTax) * 16;
		let countryPrice = countries * 200;
		taxAmount += Math.floor(countries * personalTax) * 32;
		let stationPrice = stations * 400;
		taxAmount += Math.floor(stations * personalTax) * 64;
		let amount = homePrice + apartPrice + skyPrice + cityPrice + countryPrice + stationPrice;
		console.log(data.users[i].name + " tax amount " + taxAmount);
		console.log(data.users[i].name + " amount before tax " + amount);
		amount -= taxAmount;
		console.log(data.users[i].name + " amount after tax " + amount);
		console.log(data.users[i].name + " balance before " + data.users[i].balance);
		data.users[i].balance += amount;
		console.log(data.users[i].name + " balance after " + data.users[i].balance);
		if(data.users[i].balance < 0){
			let moneyOver = data.users[i].balance
			data.users[i].balance = 0;
			for(let b = 0;b < bankJSON.users.length;b++){
				if(data.users[i].id == bankJSON.users[b].id){
					bankJSON.users[b].balance += moneyOver;
					break;
				}
			}
		}
		console.log(data.users[i].name + " final balance " + data.users[i].balance);
		totalAdded += amount;
		totalTax += taxAmount;
		blackjackAmount = Math.floor(taxAmount/2);
		taxAmount -= blackjackAmount;
		data.welfare += taxAmount;
		data.blackjack += blackjackAmount;
		data.econ += taxAmount;
		data.econ += amount;
		data.econ += blackjackAmount;
		//limit pots
		if(data.welfare >= 5000){
			let removeAmount = data.welfare - 5000;
			data.welfare = data.welfare - removeAmount;
			data.blackjack = data.blackjack + removeAmount;
		}
		if(data.blackjack >= 10000){
			let removeAmount = data.blackjack - 10000;
			data.blackjack = data.blackjack - removeAmount;
			data.econ = data.econ - removeAmount;
			totalRemoved += removeAmount;
		}
		console.log(data.users[i].name + " has gotten " + amount + " in realty payments");
		if(isNaN(data.users[i]["unstable"])){
			data.users[i]["unstable"] = 0;
		}
		else{
			data.users[i]["unstable"] -= 100;
			if(data.users[i]["unstable"] < 100){
				data.users[i]["suicide"] = 1;
			}
			if(data.users[i]["unstable"] < 0){
				data.users[i]["unstable"] = 0;
			}
		}
	}
	console.log('users got ' + totalAdded + ' carl coin from realty');
	console.log(totalTax + ' was collected from taxes');
	console.log(totalRemoved + ' was removed from the econ');
	let newData = JSON.stringify(data);
	fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
	let newBank = JSON.stringify(bankJSON);
	fs.writeFileSync('/home/mattguy/carlcoin/bank.json',newBank);
	//horse race
	horse.actualRace(client,message);
	//horse handler
	database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	data = JSON.parse(database);
	let today = new Date();
	let horseDeath = '';
	let horseHasDied = false;
	for(let i=0;i<data.users.length;i++){
		if(!data.users[i].hasOwnProperty("horses")){
			data.users[i].horses = [];
		}
		else{
			for(let j=0;j<data.users[i].horses.length;j++){
				if(data.users[i].horses[j].birthday == today.getDate()){
					horseHasDied = true;
					console.log(data.users[i].horses[j].name + ' has died of old age');
					horseDeath += `${data.users[i].horses[j].name}, owned by ${data.users[i].name}, has died of old age...\n`;
					data.users[i].horses.splice(j,1);
				}
			}
		}
	}
	if(horseHasDied){
		client.guilds.cache.forEach((guild) => {
			try{
				guild.channels.cache.find((x) => x.name == 'general').send(horseDeath);
			}
			catch(err){
				console.log("no general chat in "+guild.name);
			}
		});
	}
	newData = JSON.stringify(data);
	fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
	bank.bankDaily(client,message);
}

//export functions
module.exports = {
	dailyEvents
};
