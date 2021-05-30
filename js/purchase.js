const Discord = require('discord.js');
const fs = require('fs');

function purchaseItem(client,message){
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !cc purchase <item>');
	}
	else{
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let noUser = true;
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == message.author.id){
				let type = chop[chop.length-1];
				if(type == "house"){
					if(isNaN(data.users[i]["house"])){
						data.users[i]["house"] = 0;
					}
					let cost = 100 + (data.users[i]["house"] * 50);
					if(data.users[i].balance - cost < 0){
						message.channel.send(`You do not have enough CC! (Costs ${cost})`);
					}
					else{
						data.users[i]["house"] += 1;
						data.users[i].balance -= cost;
						data.welfare += 50;
						data.blackjack += cost - 100;
						data.econ -= 50;
						data.users[i]["activity"] = Date.now();
						if(isNaN(data.users[i]["INT"])){
							data.users[i]["INT"] = 0;
						}
						if(isNaN(data.users[i]["intExp"])){
							data.users[i]["intExp"] = 0;
						}
						data.users[i]["intExp"] += 1;
						if(data.users[i]["INT"] * 2 + 1 < data.users[i]["intExp"]){
							data.users[i]["intExp"] = 0;
							data.users[i]["INT"] += 1;
							message.channel.send(`Your purchase was a smart choice, your INT increased!`);
						}
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have purchased a home! You now own ${data.users[i].house}\nEvery day you will get some rent payments!`);
						console.log(data.users[i].name + " bought a home");
					}
				}
				else if(type == "apartment"){
					if(isNaN(data.users[i]["apartment"])){
						data.users[i]["apartment"] = 0;
					}
					let cost = 250 + (data.users[i]["apartment"] * 125);
					if(data.users[i].balance - cost < 0){
						message.channel.send(`You do not have enough CC! (Costs ${cost})`);
					}
					else{
						data.users[i]["apartment"] += 1;
						data.users[i].balance -= cost;
						data.econ -= 175;
						data.welfare += 75;
						data.blackjack += cost - 250;
						data.users[i]["activity"] = Date.now();
						if(isNaN(data.users[i]["INT"])){
							data.users[i]["INT"] = 0;
						}
						if(isNaN(data.users[i]["intExp"])){
							data.users[i]["intExp"] = 0;
						}
						data.users[i]["intExp"] += 2;
						if(data.users[i]["INT"] * 2 + 1 < data.users[i]["intExp"]){
							data.users[i]["intExp"] = 0;
							data.users[i]["INT"] += 1;
							message.channel.send(`Your purchase was a smart choice, your INT increased!`);
						}
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have purchased an apartment! You now own ${data.users[i].apartment}\nEvery day you will get some rent payments!`);
						console.log(data.users[i].name + " bought an apartment");
					}
				}
				else if(type == "skyscraper"){
					if(isNaN(data.users[i]["skyscraper"])){
						data.users[i]["skyscraper"] = 0;
					}
					let cost = 500 + (data.users[i]["skyscraper"] * 250);
					if(data.users[i].balance - cost < 0){
						message.channel.send(`You do not have enough CC! (Costs ${cost})`);
					}
					else{
						data.users[i]["skyscraper"] += 1;
						data.users[i].balance -= cost;
						data.econ -= 350;
						data.welfare += 150;
						data.blackjack += cost - 500;
						data.users[i]["activity"] = Date.now();
						if(isNaN(data.users[i]["INT"])){
							data.users[i]["INT"] = 0;
						}
						if(isNaN(data.users[i]["intExp"])){
							data.users[i]["intExp"] = 0;
						}
						data.users[i]["intExp"] += 4;
						if(data.users[i]["INT"] * 2 + 1 < data.users[i]["intExp"]){
							data.users[i]["intExp"] = 0;
							data.users[i]["INT"] += 1;
							message.channel.send(`Your purchase was a smart choice, your INT increased!`);
						}
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have purchased a skyscraper! You now own ${data.users[i].skyscraper}\nEvery day you will get some rent payments!`);
						console.log(data.users[i].name + " bought a skyscraper");
					}
				}
				else if(type == "office"){
					if(isNaN(data.users[i]["office"])){
						data.users[i]["office"] = 0;
					}
					if(data.users[i]["office"] == 1){
						message.channel.send(`You already own an office`);
					}
					else if(data.users[i].balance - 200 < 0){
						message.channel.send('You do not have enough CC! (Costs 200)');
					}
					else{
						data.users[i]["office"] = 1;
						data.users[i].balance -= 200;
						data.econ -= 50;
						data.welfare += 50;
						data.blackjack += 100;
						data.users[i]["activity"] = Date.now();
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have purchased an office! You can now file paperwork after working in the carl mines!`);
						console.log(data.users[i].name + " bought an office");
					}
				}
				else if(type == "sprinter"){
					if(isNaN(data.users[i]["sprinter"])){
						data.users[i]["sprinter"] = 0;
					}
					let cost = 4400 + (data.users[i]["sprinter"] * 2200);
					if(data.users[i].balance - cost < 0){
						message.channel.send(`You do not have enough CC! (Costs ${cost})`);
					}
					else{
						data.users[i]["sprinter"] += 1;
						data.users[i].balance -= cost;
						data.econ -= cost;
						data.users[i]["activity"] = Date.now();
						if(isNaN(data.users[i]["INT"])){
							data.users[i]["INT"] = 0;
						}
						if(isNaN(data.users[i]["intExp"])){
							data.users[i]["intExp"] = 0;
						}
						data.users[i]["intExp"] += 4;
						if(data.users[i]["INT"] * 2 + 1 < data.users[i]["intExp"]){
							data.users[i]["intExp"] = 0;
							data.users[i]["INT"] += 1;
							message.channel.send(`Your purchase was a smart choice, your INT increased!`);
						}
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have purchased a Mercedes-Benz:tm: 2021 Sprinter Cargo Van with 170" Wheelbase High Roof, 4 Cylinder Diesel engine with 2500 Horse Power, capable of holding over 4000 Lbs payload! You now own ${data.users[i].sprinter}`);
						console.log(data.users[i].name + " bought a skyscraper");
					}
				}
				else{
					message.channel.send('Invalid purchase! !cc catalog to see all items');
				}
				noUser = false;
				break;
			}
		}
		if(noUser){
			message.channel.send('You are not registered for Carl Coin!');
		}
	}
}

function purchaseList(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == message.author.id){
			if(isNaN(data.users[i]["house"])){
				data.users[i]["house"] = 0;
			}
			let housePrice = (data.users[i].house * 50) + 100;
			if(isNaN(data.users[i]["apartment"])){
				data.users[i]["apartment"] = 0;
			}
			let apartmentPrice = (data.users[i].apartment * 125) + 250;
			if(isNaN(data.users[i]["skyscraper"])){
				data.users[i]["skyscraper"] = 0;
			}
			let skyscraperPrice = (data.users[i].skyscraper * 250) + 500;
			if(isNaN(data.users[i]["sprinter"])){
				data.users[i]["sprinter"] = 0;
			}
			let sprinterPrice = (data.users[i].sprinter * 2200) + 4400;
			message.channel.send(`Purchase List:\n1. house (${housePrice}CC) pays 10 daily\n2. apartment (${apartmentPrice}CC) pays 25 daily\n3. skyscraper (${skyscraperPrice}CC) pays 50 daily\n4. Mercedes-Benz:tm: 2021 Sprinter Cargo Van (${sprinterPrice}CC)\n5. office (200CC) doubles work output`);
			return;
		}
	}
}

//export functions
module.exports = {
	purchaseItem,
	purchaseList
};