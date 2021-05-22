const Discord = require('discord.js');
const fs = require('fs');

function enrollInLottery(client,message){
	let personsId = message.author.id;
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`)){
		let lotteryRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/dailyLottery.json`);
		let lotteryFile = JSON.parse(lotteryRead);
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let noUser = true;
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id ==  personsId){
				if(data.users[i].balance - 5 < 0){
					message.channel.send(`You don't have enough CC!`);
				}
				else{
					let play = true;
					for(let j=0;j<lotteryFile.users.length;j++){
						if(lotteryFile.users[j].id == personsId){
							message.channel.send('You already played today!');
							play = false;
							break;
						}
					}
					if(play){
						data.users[i].balance -= 5;
						lotteryFile.users.push({"id":`${personsId}`});
						data["carlball"] += 5;
						let newLottery = JSON.stringify(lotteryFile);
						fs.writeFileSync('/home/mattguy/carlcoin/cache/dailyLottery.json',newLottery);
						data.users[i]["activity"] = Date.now();
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have been added to the lottery! Drawing happens at midnight!`);
						console.log(data.users[i].name + " has entered the lottery");
					}
				}
				noUser = false;
				break;
			}
		}
		if(noUser){
			message.channel.send(`You are not registered for CarlCoin!`);
		}
	}
	else{
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let noUser = true;
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id ==  personsId){
				if(data.users[i].balance - 5 < 0){
					message.channel.send(`You don't have enough CC!`);
				}
				else{
					data.users[i].balance -= 5;
					let lotteryFile = {"users":[]};
					lotteryFile.users.push({"id":`${personsId}`});
					data["carlball"] += 5;
					data.users[i]["activity"] = Date.now();
					let newLottery = JSON.stringify(lotteryFile);
					fs.writeFileSync('/home/mattguy/carlcoin/cache/dailyLottery.json',newLottery);
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					message.channel.send(`You have been added to the lottery!`);
					console.log(data.users[i].name + " has entered the lottery");
				}
				noUser = false;
				break;
			}
		}
		if(noUser){
			message.channel.send(`You are not registered for CarlCoin!`);
		}
	}
}

//export functions
module.exports = {
	enrollInLottery
};