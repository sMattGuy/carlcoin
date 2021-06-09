const Discord = require('discord.js');
const fs = require('fs');

function createBankAccount(client,message){
	//parse message for initial amount
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !cc createBankAccount <init. amount>');
		return;
	}
	let amount = parseInt(chop[chop.length-1]);
	if(isNaN(amount) || amount < 100){
		message.channel.send('Invalid amount entered! Bank accounts must have a minimum initial deposit of 100CC.');
		return;
	}
	//at this point amount is okay, look for user in file
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//check if bank file exists, if it doesnt than this is the creation of it
	if(!fs.existsSync(`/home/mattguy/carlcoin/bank.json`)){
		console.log('Creating a new bank file');
		let bank = {"interest":0.05,"users":[]};
		let bankFileSave = JSON.stringify(bank);
		fs.writeFileSync('/home/mattguy/carlcoin/bank.json',bankFileSave);
	}
	//checks for name and has boolean for if found or not
	let foundUser = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			//user found
			foundUser = true;
			//next step is to look for them in the bank file
			let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
			let bank = JSON.parse(bankFile);
			for(let j=0;j<bank.users.length;j++){
				if(bank.users[j].id == id){
					message.channel.send('You already have a bank account!');
					return;
				}
			}
			//no account found, start making new account
			console.log('making new account for ' + data.users[i].name);
			data.users[i].balance -= amount;
			let newEntry = {"id":id,"balance":amount,"days":0};
			bank.users.push(newEntry);
			//write files
			let newBank = JSON.stringify(bank);
			fs.writeFileSync('/home/mattguy/carlcoin/bank.json',newBank);
			
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			//alert player
			message.channel.send(`You have enrolled in the bank! Every month you get interest for holding money!`);
			return;
		}
	}
	if(!foundUser){
		message.channel.send('You are not registed for Carl Coin!');
		return;
	}
}

function bankBalance(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//check if bank file exists, if it doesnt than this is the creation of it
	if(!fs.existsSync(`/home/mattguy/carlcoin/bank.json`)){
		console.log('Creating a new bank file');
		let bank = {"interest":0.05,"users":[]};
		let bankFileSave = JSON.stringify(bank);
		fs.writeFileSync('/home/mattguy/carlcoin/bank.json',bankFileSave);
	}
	//checks for name and has boolean for if found or not
	let foundUser = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			//user found
			foundUser = true;
			//next step is to look for them in the bank file
			let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
			let bank = JSON.parse(bankFile);
			for(let j=0;j<bank.users.length;j++){
				if(bank.users[j].id == id){
					//bank user found, display information
					const playercardEmbed = new Discord.MessageEmbed()
						.setColor('#F7931A')
						.setTitle(`${data.users[i].name}'s bank account`)
						.setAuthor(`${data.users[i].name}`, `${message.author.displayAvatarURL()}`)
						.addFields(
							{ name: 'Balance', value: `${bank.users[j].balance}`, inline: true },
							{ name: 'Current Period', value: `${bank.users[j].days} days`, inline: true },
						);
					message.channel.send(playercardEmbed);
					return;
				}
			}
			message.channel.send('You do not have a bank account!');
			return;
		}
	}
	if(!foundUser){
		message.channel.send('You are not registed for Carl Coin!');
		return;
	}
}

function bankDeposit(client,message){
	//parse message for initial amount
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !cc bankDeposit <amount>');
		return;
	}
	let amount = parseInt(chop[chop.length-1]);
	if(isNaN(amount) || amount < 0){
		message.channel.send('Invalid amount entered!');
		return;
	}
	//at this point amount is okay, look for user in file
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//check if bank file exists, if it doesnt than this is the creation of it
	if(!fs.existsSync(`/home/mattguy/carlcoin/bank.json`)){
		console.log('Creating a new bank file');
		let bank = {"interest":0.05,"users":[]};
		let bankFileSave = JSON.stringify(bank);
		fs.writeFileSync('/home/mattguy/carlcoin/bank.json',bankFileSave);
	}
	//checks for name and has boolean for if found or not
	let foundUser = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			//user found
			foundUser = true;
			//next step is to look for them in the bank file
			let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
			let bank = JSON.parse(bankFile);
			for(let j=0;j<bank.users.length;j++){
				if(bank.users[j].id == id){
					if(data.users[i].balance - amount < 0){
						message.channel.send(`You don't have enough money in your account! Your account currently has ${data.users[i].balance}CC!`);
					}
					else{
						bank.users[j].balance += amount;
						data.users[i].balance -= amount;
						let newBank = JSON.stringify(bank);
						fs.writeFileSync('/home/mattguy/carlcoin/bank.json',newBank);
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have deposited ${amount} into your bank account! Your account now has ${bank.users[j].balance}CC! You now have ${data.users[i].balance}CC!`);
					}
					return;
				}
			}
			//no account found, start making new account
			message.channel.send('You do not have a bank account!');
			return;
		}
	}
	if(!foundUser){
		message.channel.send('You are not registed for Carl Coin!');
		return;
	}
}

function bankWithdraw(client,message){
	//parse message for initial amount
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !cc bankWithdraw <amount>');
		return;
	}
	let amount = parseInt(chop[chop.length-1]);
	if(isNaN(amount) || amount < 0){
		message.channel.send('Invalid amount entered!');
		return;
	}
	//at this point amount is okay, look for user in file
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//check if bank file exists, if it doesnt than this is the creation of it
	if(!fs.existsSync(`/home/mattguy/carlcoin/bank.json`)){
		console.log('Creating a new bank file');
		let bank = {"interest":0.05,"users":[]};
		let bankFileSave = JSON.stringify(bank);
		fs.writeFileSync('/home/mattguy/carlcoin/bank.json',bankFileSave);
	}
	//checks for name and has boolean for if found or not
	let foundUser = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			//user found
			foundUser = true;
			//next step is to look for them in the bank file
			let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
			let bank = JSON.parse(bankFile);
			for(let j=0;j<bank.users.length;j++){
				if(bank.users[j].id == id){
					if(bank.users[j].balance - amount < 0){
						message.channel.send(`You don't have enough money in your account! Your account currently has ${bank.users[j].balance}CC!`);
					}
					else{
						bank.users[j].balance -= amount;
						data.users[i].balance += amount;
						let newBank = JSON.stringify(bank);
						fs.writeFileSync('/home/mattguy/carlcoin/bank.json',newBank);
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						message.channel.send(`You have withdrawn ${amount} into your bank account! Your account now has ${bank.users[j].balance}CC! You now have ${data.users[i].balance}CC!`);
					}
					return;
				}
			}
			//no account found, start making new account
			message.channel.send('You do not have a bank account!');
			return;
		}
	}
	if(!foundUser){
		message.channel.send('You are not registed for Carl Coin!');
		return;
	}
}

function bankDaily(client,message){
	let today = new Date();
	if(!fs.existsSync(`/home/mattguy/carlcoin/bank.json`)){
		console.log('Creating a new bank file');
		let bank = {"interest":0.05,"users":[]};
		let bankFileSave = JSON.stringify(bank);
		fs.writeFileSync('/home/mattguy/carlcoin/bank.json',bankFileSave);
	}
	let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
	let bank = JSON.parse(bankFile);
	let newInterest = 0.05;
	for(let j=0;j<bank.users.length;j++){
		if(today.getDate() == 1){
			newInterest = Math.random() * 0.1;
			//pay out users
			bank.users[j].balance += Math.floor(bank.users[j].balance * bank.interest * (bank.users[j].days / 31));
			bank.users[j].days = 1;
		}
		else{
			//increment day
			bank.users[j].days += 1;
		}
	}
	if(newInterest > 0.10){
		newInterest = 0.1
	}
	if(newInterest < 0.10){
		newInterest = 0.01
	}
	newInterest = newInterest.toFixed(2);
	bank.interest = newInterest;
	let newBank = JSON.stringify(bank);
	fs.writeFileSync('/home/mattguy/carlcoin/bank.json',newBank);
}

function bankInfo(client,message){
	if(!fs.existsSync(`/home/mattguy/carlcoin/bank.json`)){
		console.log('Creating a new bank file');
		let bank = {"interest":0.05,"users":[]};
		let bankFileSave = JSON.stringify(bank);
		fs.writeFileSync('/home/mattguy/carlcoin/bank.json',bankFileSave);
	}
	let bankFile = fs.readFileSync('/home/mattguy/carlcoin/bank.json');
	let bank = JSON.parse(bankFile);
	let usersRegistered = bank.users.length;
	let currentRate = bank.interest;
	let amountSaved = 0;
	for(let i=0;i<bank.users.length;i++){
		amountSaved += bank.users[i].balance;
	}
	const playercardEmbed = new Discord.MessageEmbed()
		.setColor('#F7931A')
		.setTitle(`Carl Coin Bank Information`)
		.addFields(
			{ name: 'Users Registered', value: `${usersRegistered}`, inline: true },
			{ name: 'Current Rate', value: `${currentRate}%`, inline: true },
			{ name: 'Amount in Bank', value: `${amountSaved}`, inline: true },
		);
	message.channel.send(playercardEmbed);
}

function bankHelp(client,message){
	message.channel.send(`Use !cc createBankAccount <init. deposit> to create a new bank account! The minimum deposit is 100CC.\nUse !cc bankBalance to see your bank balance.\nUse !cc bankDeposit <amount> to deposit some money from your account.\nUse !cc bankWithdraw <amount> to take funds out of your account.\nUse !cc bankInfo to see general information on the bank.`);
	return;
}
//export functions
module.exports = {
	createBankAccount,
	bankBalance,
	bankDeposit,
	bankWithdraw,
	bankDaily,
	bankHelp,
	bankInfo
};