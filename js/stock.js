const Discord = require('discord.js');
const fs = require('fs');
/*
stock structure
	name
	price
	volatility
	max movement
	min movement
	movement chance
	amount existing
	buy limit
	
users
	stocks
		name
		amount
		amount bought today
		buy limit
		average price of owned stocks
*/
function createStocks(client,message){
	if(!fs.existsSync(`/home/mattguy/carlcoin/stock.json`)){
		console.log('Creating a new stock file');
		let stock = {"stock":[{"name":"POG","price":50,"vol":"med","maxMove":0.13,"minMove":0.05,"moveChance":0.65,"existing":200,"total":200,"buyLimit":10,"boughtRecently":0},{"name":"AMC","price":25,"vol":"med","maxMove":0.13,"minMove":0.05,"moveChance":0.65,"existing":300,"total":300,"buyLimit":15,"boughtRecently":0},{"name":"COCK","price":100,"vol":"high","maxMove":0.18,"minMove":0.08,"moveChance":0.9,"existing":50,"total":50,"buyLimit":5,"boughtRecently":0},{"name":"SIMP","price":10,"vol":"low","maxMove":0.08,"minMove":0.02,"moveChance":0.4,"existing":500,"total":500,"buyLimit":25,"boughtRecently":0},{"name":"CORN","price":75,"vol":"low","maxMove":0.08,"minMove":0.02,"moveChance":0.4,"existing":225,"total":225,"buyLimit":20,"boughtRecently":0}]};
		let stockFileSave = JSON.stringify(stock);
		fs.writeFileSync('/home/mattguy/carlcoin/stock.json',stockFileSave);
	}
}

function updateStocks(client,message){
	if(!fs.existsSync(`/home/mattguy/carlcoin/stock.json`)){
		createStocks(client,message);
	}
	let stockFile = fs.readFileSync('/home/mattguy/carlcoin/stock.json');
	let stock = JSON.parse(stockFile);
	for(let i=0;i<stock.stock.length;i++){
		let changeDiff = Math.random() * (stock.stock[i].maxMove - stock.stock[i].minMove) + stock.stock[i].minMove;
		let changeChance = Math.random();
		let stockMove = stock.stock[i].moveChance;
		if(stock.stock[i].boughtRecently < 0){
			changeChance = 0;
		}
		else if(stock.stock[i].boughtRecently > 0 || stock.stock[i].existing <= stock.stock[i].total - (stock.stock[i].total * .7)){
			changeChance = 1;
		}
		if(Math.random() <= stockMove){
			//go down
			if(changeChance <= 0.33){
				console.log(stock.stock[i].name + ' is moving down');
				let newPrice = stock.stock[i].price - Math.ceil(stock.stock[i].price * changeDiff);
				if(newPrice <= 0){
					newPrice = 1;
				}
				stock.stock[i].price = newPrice;
			}
			//go up
			else if(changeChance >= 0.66){
				console.log(stock.stock[i].name + ' is moving up');
				let newPrice = stock.stock[i].price + Math.ceil(stock.stock[i].price * changeDiff);
				stock.stock[i].price = newPrice;
			}
			//no movement
			else{
				console.log(stock.stock[i].name + ' is not moving');
			}
		}
		stock.stock[i].boughtRecently = 0;
	}
	let newStock = JSON.stringify(stock);
	fs.writeFileSync('/home/mattguy/carlcoin/stock.json',newStock);
}

function showStocks(client,message){
	if(!fs.existsSync(`/home/mattguy/carlcoin/stock.json`)){
		createStocks(client,message);
	}
	let stockFile = fs.readFileSync('/home/mattguy/carlcoin/stock.json');
	let stock = JSON.parse(stockFile);
	let stockName = ``;
	let stockPrice = ``;
	let stockLeft = ``;
	for(let i=0;i<stock.stock.length;i++){
		stockName += `${stock.stock[i].name}\n`;
		stockPrice += `${stock.stock[i].price} | ${stock.stock[i].vol}\n`;
		stockLeft += `${stock.stock[i].existing} | ${stock.stock[i].buyLimit}\n`;
	}
	const playercardEmbed = new Discord.MessageEmbed()
		.setColor('#F7931A')
		.setTitle(`Carl Coin Stock Information`)
		.addFields(
			{ name: 'Name', value: `${stockName}`, inline: true },
			{ name: 'Price&Volt.', value: `${stockPrice}`, inline: true },
			{ name: 'Amt. Left&Limit', value: `${stockLeft}`, inline: true },
		);
	message.channel.send(playercardEmbed);
}

function buyStock(client,message){
	// !cc stockBuy <name> <number>
	//check arguments
	let chop = message.content.split(" ");
	if(chop.length != 4){
		message.channel.send('Usage: !cc stockBuy <name> <amount>');
		return;
	}
	//check amount is valid
	let amount = parseInt(chop[chop.length-1]);
	if(isNaN(amount) || amount < 0){
		message.channel.send('Invalid amount entered!');
		return;
	}
	//get stock name
	let stockName = chop[chop.length-2];
	//get user data
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//check if stock file exists
	if(!fs.existsSync(`/home/mattguy/carlcoin/stock.json`)){
		createStocks(client,message);
	}
	//get stock information
	let stockFile = fs.readFileSync('/home/mattguy/carlcoin/stock.json');
	let stock = JSON.parse(stockFile);
	let stockIndex = -1;
	let stockFound = false;
	for(let i=0;i<stock.stock.length;i++){
		if(stockName == stock.stock[i].name){
			stockFound = true;
			stockIndex = i;
		}
	}
	if(!stockFound){
		message.channel.send('Stock could not be found! Use !cc showStocks to see the stocks that exist!');
		return;
	}
	//search for user
	let foundUser = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			foundUser = true;
			//check if user has bought the limit today
			if(!data.users[i].hasOwnProperty("stock")){
				data.users[i].stock = [];
			}
			//if stock exists
			for(let j=0;j<data.users[i].stock.length;j++){
				//find stock name
				if(data.users[i].stock[j].name == stockName){
					//update existing stock user owns
					if(data.users[i].stock[j].today + amount > stock.stock[stockIndex].buyLimit){
						message.channel.send('You cannot buy that many stocks, it exceeds the daily limit!');
						return;
					}
					if(data.users[i].balance - (amount * stock.stock[stockIndex].price) < 0){
						message.channel.send('You do not have enough CC!');
						return;
					}
					data.users[i].balance -= (amount * stock.stock[stockIndex].price);
					data.econ -= (amount * stock.stock[stockIndex].price);
					data.users[i].stock[j].amount += amount;
					data.users[i].stock[j].today += amount;
					data.users[i].stock[j].avgPrice = Math.floor((data.users[i].stock[j].avgPrice + stock.stock[stockIndex].price) / 2);
					stock.stock[stockIndex].boughtRecently += amount;
					stock.stock[stockIndex].existing -= amount;
					//update files
					let newStockFile = JSON.stringify(stock);
					fs.writeFileSync('/home/mattguy/carlcoin/stock.json',newStockFile);
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					message.channel.send(`You have purchased ${amount} shares of ${stockName}! You now own ${data.users[i].stock[j].amount}`);
					return;
				}
			}
			//stock not found in users portfolio
			if(amount > stock.stock[stockIndex].buyLimit){
				message.channel.send('You cannot buy that many stocks, it exceeds the daily limit!');
				return;
			}
			if(data.users[i].balance - (amount * stock.stock[stockIndex].price) < 0){
				message.channel.send('You do not have enough CC!');
				return;
			}
			let newStock = {"name":stock.stock[stockIndex].name,"amount":amount,"today":amount,"avgPrice":stock.stock[stockIndex].price};
			data.users[i].balance -= (amount * stock.stock[stockIndex].price);
			data.econ -= (amount * stock.stock[stockIndex].price);
			stock.stock[stockIndex].boughtRecently += amount;
			stock.stock[stockIndex].existing -= amount;
			data.users[i].stock.push(newStock);
			let newStockFile = JSON.stringify(stock);
			fs.writeFileSync('/home/mattguy/carlcoin/stock.json',newStockFile);
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			message.channel.send(`You have purchased ${amount} shares of ${stockName}! You now own ${amount}`);
			return;
		}
	}
	if(!foundUser){
		message.channel.send('You are not registed for Carl Coin!');
		return;
	}
}

function sellStock(client,message){
	// !cc stockSell <name> <number>
	//check arguments
	let chop = message.content.split(" ");
	if(chop.length != 4){
		message.channel.send('Usage: !cc stockSell <name> <amount>');
		return;
	}
	//check amount is valid
	let amount = parseInt(chop[chop.length-1]);
	if(isNaN(amount) || amount < 0){
		message.channel.send('Invalid amount entered!');
		return;
	}
	//get stock name
	let stockName = chop[chop.length-2];
	//get user data
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//check if stock file exists
	if(!fs.existsSync(`/home/mattguy/carlcoin/stock.json`)){
		createStocks(client,message);
	}
	//get stock information
	let stockFile = fs.readFileSync('/home/mattguy/carlcoin/stock.json');
	let stock = JSON.parse(stockFile);
	let stockIndex = -1;
	let stockFound = false;
	for(let i=0;i<stock.stock.length;i++){
		if(stockName == stock.stock[i].name){
			stockFound = true;
			stockIndex = i;
		}
	}
	if(!stockFound){
		message.channel.send('Stock could not be found! Use !cc showStocks to see the stocks that exist!');
		return;
	}
	//search for user
	let foundUser = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			foundUser = true;
			//check if user has bought the limit today
			if(!data.users[i].hasOwnProperty("stock")){
				data.users[i].stock = [];
			}
			//if stock exists
			for(let j=0;j<data.users[i].stock.length;j++){
				//find stock name
				if(data.users[i].stock[j].name == stockName){
					//update existing stock user owns
					if(data.users[i].stock[j].amount - amount < 0){
						message.channel.send('You do not own that many shares!');
						return;
					}
					data.users[i].balance += (amount * stock.stock[stockIndex].price);
					data.econ += (amount * stock.stock[stockIndex].price);
					data.users[i].stock[j].amount -= amount;
					data.users[i].stock[j].today -= amount;
					if(data.users[i].stock[j].today < 0){
						data.users[i].stock[j].today = 0;
					}
					stock.stock[stockIndex].boughtRecently -= amount;
					stock.stock[stockIndex].existing += amount;
					//update files
					let newStockFile = JSON.stringify(stock);
					fs.writeFileSync('/home/mattguy/carlcoin/stock.json',newStockFile);
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);message.channel.send(`You have sold ${amount} shares of ${stockName}! You now own ${data.users[i].stock[j].amount}`);
					return;
				}
			}
			message.channel.send(`You don't own any of that stock!`);
			return;
		}
	}
	if(!foundUser){
		message.channel.send('You are not registed for Carl Coin!');
		return;
	}
}

function showPort(client,message){
	// !cc stockPort
	//get user data
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//search for user
	let foundUser = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			foundUser = true;
			//check if user has bought the limit today
			if(!data.users[i].hasOwnProperty("stock")){
				message.channel.send('You dont own any stocks!');
				return;
			}
			let stockName = ``;
			let stockAmtAvg = ``;
			let stockToday = ``;
			for(let j=0;j<data.users[i].stock.length;j++){
				stockName += `${data.users[i].stock[j].name}\n`;
				stockAmtAvg += `${data.users[i].stock[j].amount} | ${data.users[i].stock[j].avgPrice}\n`;
				stockToday += `${data.users[i].stock[j].today}\n`;
			}
			const playercardEmbed = new Discord.MessageEmbed()
				.setColor('#F7931A')
				.setTitle(`Carl Coin Stock Information`)
				.addFields(
					{ name: 'Name', value: `${stockName}`, inline: true },
					{ name: 'Amt.&Avg.', value: `${stockAmtAvg}`, inline: true },
					{ name: 'Today', value: `${stockToday}`, inline: true },
				);
			message.channel.send(playercardEmbed);
			return;
		}
	}
	if(!foundUser){
		message.channel.send('You are not registed for Carl Coin!');
		return;
	}
}

function stockHelp(client,message){
	message.channel.send(`Use !cc showStocks to see the available stocks!\nUse !cc stockPort to see your portfolio!\nUse !cc stockBuy <name> <amount> to buy stocks!\nUse !cc stockSell <name> <amount> to sell your shares!`)
}

//export functions
module.exports = {
	updateStocks,
	showStocks,
	buyStock,
	sellStock,
	showPort,
	stockHelp
};