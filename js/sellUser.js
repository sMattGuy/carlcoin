const Discord = require('discord.js');
const fs = require('fs');

function sellUser(client,message){
	let chop = message.content.split(" ");
	if(chop.length != 5){
		message.channel.send('Usage: !cc userSell <user> <type> <amount>');
	}
	else{
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let seller = message.author.id;
		let mentionOK = true;
		let buyer = 0;
		try{
			buyer = getUserFromMention(client,chop[chop.length-3]).id;
		}
		catch(err){
			message.channel.send('Invalid user selected!');
			mentionOK = false;
		}
		if(mentionOK){
			let resell = true;
			if(fs.existsSync(`/home/mattguy/carlcoin/cache/${buyer}houseSell`)){
				let sellFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${buyer}houseSell`);
				let sellParse = JSON.parse(sellFile);
				if(sellParse.sellEnder < Date.now()){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${buyer}houseSell`);
				}
				else{
					resell = false;
					message.channel.send('That person is already in an offer!');
				}
			}
			if(resell){
				let price = parseInt(chop[chop.length-1]);
				if(buyer == seller){
					message.channel.send('You cannot sell to yourself!');
				}
				else if(isNaN(price) || price < 0){
					message.channel.send('Invalid amount entered!');
				}
				else{
					let noUser = true;
					for(let i=0;i<data.users.length;i++){
						if(data.users[i].id == seller){
							let noBuy = true;
							for(let j=0;j<data.users.length;j++){
								if(data.users[j].id == buyer){
									let offerType = chop[chop.length-2];
									//check if house
									if(offerType == "house" || offerType == "apartment" || offerType == "skyscraper" || offerType == "city" || offerType == "country" || offerType == "station"){
										if(data.users[j].balance - price < 0){
											message.channel.send('Buyer doesnt have enough CC!');
										}
										else if(data.users[i][`${offerType}`] < 0 || isNaN(data.users[i][`${offerType}`])){
											message.channel.send(`You dont have a ${offerType}`);
										}
										else{
											let sellEnder = Date.now() + 60000;
											let sellInfo = {"seller":`${seller}`,"sellerIndex":`${i}`,"buyer":`${buyer}`,"buyerIndex":`${j}`,"price":`${price}`,"sellEnder":`${sellEnder}`,"type":`${offerType}`};
											let jsonBattle = JSON.stringify(sellInfo);
											fs.writeFileSync(`/home/mattguy/carlcoin/cache/${buyer}houseSell`,jsonBattle);
											message.channel.send(`${data.users[j].name}! Type !cc acceptPurchase to accept ${data.users[i].name}'s offer or type !cc denyPurchase to reject the offer. You have 1 minute to respond.`);
											console.log(data.users[i].name + " trying to sell to " + data.users[j].name);
										}
									}
									else{
										message.channel.send('Buyer doesnt have enough CC!');
									}
									noBuy = false;
									break;
								}
							}
							if(noBuy){
								message.channel.send('Buyer doesnt exist!');
							}
							noUser = false;
							break;
						}
					}
					if(noUser){
						message.channel.send('You are not registered for CC!');
					}
				}
			}
		}
	}
}

function acceptDenySale(client,message){
	let personsId = message.author.id;
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`)){
		let sellFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
		let sellParse = JSON.parse(sellFile);
		if(sellParse.sellEnder < Date.now()){
			fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
			message.channel.send('Time has expired to accept the offer');
		}
		else{
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			if(message.content.startsWith('!cc denyPurchase')){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
				message.channel.send('You have declined the offer');
			}
			else if(message.content.startsWith('!cc acceptPurchase')){
				if(data.users[sellParse.buyerIndex].balance - sellParse.price < 0){
					message.channel.send(`You don't have enough CC!`);
				}
				else{
					let price = parseInt(sellParse.price);
					data.users[sellParse.sellerIndex].balance += price;
					data.users[sellParse.buyerIndex].balance -= price;
					if(sellParse.type == "house"){
						data.users[sellParse.sellerIndex]["house"] -= 1;
						data.users[sellParse.buyerIndex]["house"] += 1;
						if(isNaN(data.users[sellParse.buyerIndex]["house"])){
							data.users[sellParse.buyerIndex]["house"] = 1;
						}
					}
					else if(sellParse.type == "apartment"){
						data.users[sellParse.sellerIndex]["apartment"] -= 1;
						data.users[sellParse.buyerIndex]["apartment"] += 1;
						if(isNaN(data.users[sellParse.buyerIndex]["apartment"])){
							data.users[sellParse.buyerIndex]["apartment"] = 1;
						}
					}
					else if(sellParse.type == "skyscraper"){
						data.users[sellParse.sellerIndex]["skyscraper"] -= 1;
						data.users[sellParse.buyerIndex]["skyscraper"] += 1;
						if(isNaN(data.users[sellParse.buyerIndex]["skyscraper"])){
							data.users[sellParse.buyerIndex]["skyscraper"] = 1;
						}
					}
					
					else if(sellParse.type == "city"){
						data.users[sellParse.sellerIndex]["city"] -= 1;
						data.users[sellParse.buyerIndex]["city"] += 1;
						if(isNaN(data.users[sellParse.buyerIndex]["city"])){
							data.users[sellParse.buyerIndex]["city"] = 1;
						}
					}
					else if(sellParse.type == "country"){
						data.users[sellParse.sellerIndex]["country"] -= 1;
						data.users[sellParse.buyerIndex]["country"] += 1;
						if(isNaN(data.users[sellParse.buyerIndex]["country"])){
							data.users[sellParse.buyerIndex]["country"] = 1;
						}
					}
					else if(sellParse.type == "station"){
						data.users[sellParse.sellerIndex]["station"] -= 1;
						data.users[sellParse.buyerIndex]["station"] += 1;
						if(isNaN(data.users[sellParse.buyerIndex]["station"])){
							data.users[sellParse.buyerIndex]["station"] = 1;
						}
					}
					
					data.users[sellParse.sellerIndex]["activity"] = Date.now();
					data.users[sellParse.buyerIndex]["activity"] = Date.now();
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}houseSell`);
					message.channel.send('You have accepted the offer!');
					console.log(data.users[sellParse.sellerIndex].name + " has sold to " + data.users[sellParse.buyerIndex].name);
				}
			}
		}
	}
}

//helper function to get user
function getUserFromMention(client,mention) {
	if (!mention) return;
	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}

module.exports = {
	sellUser,
	acceptDenySale
};