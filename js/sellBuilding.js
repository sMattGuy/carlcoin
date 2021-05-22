const Discord = require('discord.js');
const fs = require('fs');

function sellBuilding(client,message){
	let chop = message.content.split(" ");
	if(chop.length > 3){
		message.channel.send('Too many arguments supplied!');
	}
	else{
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let noUser = true;
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == message.author.id){
				let type = chop[chop.length-1];
				if(type == "house"){
					if(data.users[i]["house"] - 1 < 0 || isNaN(data.users[i]["house"])){
						message.channel.send('You do not have any homes!');
					}
					else{
						data.users[i]["house"] -= 1;
						data.users[i].balance += 50;
						data.econ += 50;
						data.users[i]["activity"] = Date.now();
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have sold a home! You now own ${data.users[i].house} homes`);
						console.log(data.users[i].name + " sold a home");
					}
				}
				else if(type == "apartment"){
					if(data.users[i]["apartment"] - 1 < 0 || isNaN(data.users[i]["apartment"])){
						message.channel.send('You do not have any apartments!');
					}
					else{
						data.users[i]["apartment"] -= 1;
						data.users[i].balance += 150;
						data.econ += 150;
						data.users[i]["activity"] = Date.now();
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have sold an apartment! You now own ${data.users[i].apartment} apartment`);
						console.log(data.users[i].name + " sold an apartment");
					}
				}
				else if(type == "skyscraper"){
					if(data.users[i]["skyscraper"] - 1 < 0 || isNaN(data.users[i]["skyscraper"])){
						message.channel.send('You do not have any skyscrapers!');
					}
					else{
						data.users[i]["skyscraper"] -= 1;
						data.users[i].balance += 250;
						data.econ += 250;
						data.users[i]["activity"] = Date.now();
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have sold a skyscraper! You now own ${data.users[i].skyscraper} skyscrapers`);
						console.log(data.users[i].name + " sold a skyscraper");
					}
				}
				else{
					message.channel.send('Invalid sell! Try house, apartment or skyscraper');
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

//export functions
module.exports = {
	sellBuilding
};