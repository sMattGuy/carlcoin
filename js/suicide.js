const Discord = require('discord.js');
const fs = require('fs');

function attemptSuicide(client,message){
	//fetch and store data
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//checks for name
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			let bullet = Math.floor(Math.random() * 6);
			let balance = data.users[i].balance;
			let canDie = data.users[i]["suicide"];
			if(isNaN(canDie)){
				data.users[i]["suicide"] = 1;
				canDie = data.users[i]["suicide"];
			}
			if(canDie == 1){
				message.channel.send(`You're too scared to try.`);
			}
			else if(bullet == 0){
				die(client,message,data,i);
				message.channel.send(`You load in one bullet and spin the barrel.`);
				message.channel.send(`You pull the trigger... a click, a boom and darkness...\nWith this characters death, the thread of prophecy is severed. Rejoin CarlCoin to restore the weave of fate, or persist in the doomed world you have created.`);
			}
			else{
				data.users[i]["suicide"] = 1;
				data.users[i]["unstable"] = 0;
				console.log(data.users[i].name + " tried to commit suicide");
				message.channel.send(`You load in one bullet and spin the barrel.`);
				message.channel.send(`You pull the trigger... an empty click. You're too scared to try again.`);
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			}
			break;
		}
	}
}

function die(client,message,data,index){
	console.log("died " + data.users[index].name);
	//put stocks back;
	let stockFile = fs.readFileSync('/home/mattguy/carlcoin/stock.json');
	let stockJSON = JSON.parse(stockFile);
	let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
	let bankJSON = JSON.parse(bankFile);

	for(let j=0;j<bankJSON.users.length;j++){
		if(data.users[index].id == bankJSON.users[j].id){
			bankJSON.users.splice(j,1);
			break;
		}
	}

	for(let stockIndex = 0;stockIndex<stockJSON.stocklength;stockIndex++){
		if(data.users[index].hasOwnProperty("stock")){
			for(let j=0;j<data.users[index].stock.length;j++){
				if(stockJSON.stock[stockIndex].name == data.users[index].stock[j].name){
					stockJSON.stock[stockIndex].existing += data.users[index].stock[j].amount;
				}
			}
		}
	}
	
	data.econ -= data.users[index].balance
	data.users.splice(index,1);
	
	let newData = JSON.stringify(data);
	fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
	let newStockFile = JSON.stringify(stockJSON);
	fs.writeFileSync('/home/mattguy/carlcoin/stock.json',newStockFile);
	let bankFileSave = JSON.stringify(bankFile);
	fs.writeFileSync('/home/mattguy/carlcoin/bank.json',bankFileSave);
}

//export functions
module.exports = {
	attemptSuicide,
	die
};