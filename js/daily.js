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
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].hasOwnProperty("stock")){
			for(let st=0;st<data.users[i].stock.length;st++){
				data.users[i].stock[st].today = 0;
			}
		}
		let bankValue = 0;
		for(let j=0;j<bankJSON.users.length;j++){
			if(data.users[i].id == bankJSON.users[j].id){
				bankValue = bankJSON.users[j].balance;
			}
		}
		bankValue = Math.floor(bankValue / 2);
		let homePrice = data.users[i]["house"] * 10;
		let taxAmount = 0;
		let blackjackAmount = 0;
		let personalTax = Math.floor(((data.users[i].balance + bankValue) / data.econ) * 100);
		console.log(data.users[i].name + ' has a personal tax of ' + personalTax);
		if(isNaN(homePrice)){
			homePrice = 0;
		}
		taxAmount = ((homePrice/10) * ((2 * personalTax)+ 2));
		let apartPrice = data.users[i]["apartment"] * 25;
		if(isNaN(apartPrice)){
			apartPrice = 0;
		}
		taxAmount += ((apartPrice/25) * ((3 * personalTax)+ 3));
		let skyPrice = data.users[i]["skyscraper"] * 50;
		if(isNaN(skyPrice)){
			skyPrice = 0;
		}
		taxAmount += ((skyPrice/50) * ((4 * personalTax) + 4));
		let amount = homePrice + apartPrice + skyPrice;
		amount -= taxAmount;
		if(amount < 0){
			amount = 0;
		}
		data.users[i].balance += amount;
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
		if(data.welfare >= 1000){
			let removeAmount = data.welfare - 1000;
			data.welfare = data.welfare - removeAmount;
			data.blackjack = data.blackjack + removeAmount;
		}
		if(data.blackjack >= 5000){
			let removeAmount = data.blackjack - 5000;
			data.blackjack = data.blackjack - removeAmount;
			data.econ = data.econ - removeAmount;
		}
		if(amount != 0){
			console.log(data.users[i].name + " has gotten " + amount + " in realty payments");
		}
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
	let newData = JSON.stringify(data);
	fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
	//lottery
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`)){
		let lotteryRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`);
		let lotteryFile = JSON.parse(lotteryRead);
		let winner = Math.floor(Math.random() * (lotteryFile.users.length));
		database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		data = JSON.parse(database);
		let winnerID = lotteryFile.users[winner].id;
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == winnerID){
				data.users[i].balance += data.carlball;
				let winnerAmount = data.carlball;
				data.carlball = 0;
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				client.guilds.cache.forEach((guild) => {
					try{
						guild.channels.cache.find((x) => x.name == 'general').send(`Congratulations ${data.users[i].name}! You have won ${winnerAmount}CC in todays lottery!`);
					}
					catch(err){
						console.log("no general chat in "+guild.name);
					}
				});
				break;
			}
		}
		fs.unlinkSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`);
	}
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