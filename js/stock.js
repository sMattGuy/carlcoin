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
function createNewStock(client,message){
	// !cc stockCreate name price vol total limit
	let stockFile = fs.readFileSync('/home/mattguy/carlcoin/stock.json');
	let stock = JSON.parse(stockFile);
	let chop = message.content.split(" ");
	if(chop.length != 6){
		message.channel.send('Usage: !cc createNewStock <name> <price> <vol> <total>');
		return;
	}
	let name = chop[chop.length-4];
	let price = parseInt(chop[chop.length-3]);
	let vol = chop[chop.length-2];
	let total = parseInt(chop[chop.length-1]);

	if(isNaN(total) || isNaN(price) || total < 0 || price < 0){
		message.channel.send('Invalid values entered!');
		return;
	}
	let maxMove = 0;
	let minMove = 0;
	let moveChance = 0;
	if(vol == 'low'){
		maxMove = 0.08;
		minMove = 0.02;
		moveChance = 0.04;
	}
	else if(vol == 'med'){
		maxMove = 0.13;
		minMove = 0.05;
		moveChance = 0.65;
	}
	else if(vol == 'high'){
		maxMove = 0.18;
		minMove = 0.08;
		moveChance = 0.9;
	}
	else{
		message.channel.send(`Invalid vol selected!`);
		return;
	}
	
	for(let i=0;i<stock.stock.length;i++){
		if(stock.stock[i].name == name){
			message.channel.send(`Stock with that name already exists!`);
			return;
		}
	}
	
	let newStock = {"name":name,"price":price,"vol":vol,"maxMove":maxMove,"minMove":minMove,"moveChance":moveChance,"existing":total,"total":total,"boughtRecently":0,"buyLimit":100};
	stock.stock.push(newStock);
	console.log(newStock);
	let stockFileSave = JSON.stringify(stock);
	fs.writeFileSync('/home/mattguy/carlcoin/stock.json',stockFileSave);
	message.channel.send(`A new stock has been created!`);
}

function createStocks(client,message){
	if(!fs.existsSync(`/home/mattguy/carlcoin/stock.json`)){
		console.log('Creating a new stock file');
		let stock = {"stock":[{"name":"POG","price":50,"vol":"med","maxMove":0.13,"minMove":0.05,"moveChance":0.65,"existing":200,"total":200,"buyLimit":10,"boughtRecently":0},{"name":"AMC","price":25,"vol":"med","maxMove":0.13,"minMove":0.05,"moveChance":0.65,"existing":300,"total":300,"buyLimit":15,"boughtRecently":0},{"name":"COCK","price":100,"vol":"high","maxMove":0.18,"minMove":0.08,"moveChance":0.9,"existing":50,"total":50,"buyLimit":5,"boughtRecently":0},{"name":"SIMP","price":10,"vol":"low","maxMove":0.08,"minMove":0.02,"moveChance":0.4,"existing":500,"total":500,"buyLimit":25,"boughtRecently":0},{"name":"CORN","price":75,"vol":"low","maxMove":0.08,"minMove":0.02,"moveChance":0.4,"existing":225,"total":225,"boughtRecently":0}]};
		let stockFileSave = JSON.stringify(stock);
		fs.writeFileSync('/home/mattguy/carlcoin/stock.json',stockFileSave);
	}
}

function updateStocks(client,message){
	if(!fs.existsSync(`/home/mattguy/carlcoin/stock.json`)){
		createStocks(client,message);
	}
	if(!fs.existsSync(`/home/mattguy/carlcoin/stockHistory.json`)){
		let stockHistory = {"history":[]};
		let stockHistorySave = JSON.stringify(stockHistory);
		fs.writeFileSync('/home/mattguy/carlcoin/stockHistory.json',stockHistorySave);
	}
	let stockHistoryFile = fs.readFileSync('/home/mattguy/carlcoin/stockHistory.json');
	let stockHistory = JSON.parse(stockHistoryFile);
	let stockFile = fs.readFileSync('/home/mattguy/carlcoin/stock.json');
	let stock = JSON.parse(stockFile);
	let marketWideRed = false;
	if(Math.random() <= .15){
		console.log('A market wide red is occuring!');
		marketWideRed = true;
	}
	for(let i=0;i<stock.stock.length;i++){
		let changeDiff = Math.random() * (stock.stock[i].maxMove - stock.stock[i].minMove) + stock.stock[i].minMove;
		let changeChance = Math.random();
		let stockMove = stock.stock[i].moveChance;
		let foundHistory = false;
		let time = new Date();
		//check if over 90 percent is owned
		if(stock.stock[i].existing <= stock.stock[i].total - (stock.stock[i].total * .9)){
			console.log(stock.stock[i].name + ' will gain more shares at the end of the day');
			stock.stock[i].addMore = true;
		}
		//check if it is the right time
		if(time.getHours() == 0){
			if(isNaN(stock.stock[i].addMore)){
				stock.stock[i].addMore = false;
			}
			if(stock.stock[i].addMore){
				stock.stock[i].addMore = false;
				let newShares = Math.floor(stock.stock[i].total * .5);
				stock.stock[i].total += newShares;
				stock.stock[i].existing += newShares;
				console.log(stock.stock[i].name + ' has gained ' + newShares + ' shares');
			}
		}
		let ownershipUp = false;
		let willGoUp = false;
		//change stock value
		if(stock.stock[i].boughtRecently < 0){
			console.log(stock.stock[i].name + ' is going neg');
			willGoUp = false;
		}
		else if(stock.stock[i].boughtRecently > 0 || stock.stock[i].existing <= stock.stock[i].total - (stock.stock[i].total * .8)){
			console.log(stock.stock[i].name + ' is going positive');
			willGoUp = true;
			if(stock.stock[i].existing <= stock.stock[i].total - (stock.stock[i].total * .8)){
				ownershipUp = true;
			}
			changeChance += 0.33;
		}
		if(Math.random() <= stockMove || marketWideRed){
			//go down
			if((changeChance <= 0.33 && !willGoUp) || marketWideRed){
				console.log(stock.stock[i].name + ' is moving down');
				let newPrice = stock.stock[i].price - Math.ceil(stock.stock[i].price * changeDiff);
				if(newPrice <= 1){
					newPrice = 2;
				}
				stock.stock[i].price = newPrice;
			}
			//go up
			else if(changeChance >= 0.66 && willGoUp){
				console.log(stock.stock[i].name + ' is moving up');
				let newPrice = stock.stock[i].price + Math.ceil(stock.stock[i].price * changeDiff);
				if(ownershipUp){
					newPrice = Math.ceil(newPrice / 2) + 1;
				}
				stock.stock[i].price = newPrice;
			}
			//no movement
			else{
				console.log(stock.stock[i].name + ' is not moving');
			}
		}
		else{
			console.log(stock.stock[i].name + ' is not moving');
		}
		stock.stock[i].boughtRecently = 0;
		//add to stock history
		if(stockHistory.history.length > 0){
			for(let j=0;j<stockHistory.history.length;j++){
				
				if(stockHistory.history[j].name == stock.stock[i].name){
					foundHistory = true;
					stockHistory.history[j].priceHis.push(stock.stock[i].price);
					break;
				}
			}
		}
		if(!foundHistory){
			let newEntry = {"name":stock.stock[i].name,"priceHis":[]};
			for(let j=0;j<stockHistory.history[0].priceHis.length-1;j++){
				newEntry.priceHis.push(0);
			}
			newEntry.priceHis.push(stock.stock[i].price);
			stockHistory.history.push(newEntry);
		}
	}
	let newStock = JSON.stringify(stock);
	fs.writeFileSync('/home/mattguy/carlcoin/stock.json',newStock);
	let stockHistorySave = JSON.stringify(stockHistory);
	fs.writeFileSync('/home/mattguy/carlcoin/stockHistory.json',stockHistorySave);
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
		stockLeft += `${stock.stock[i].existing}/${stock.stock[i].total}\n`;
	}
	const playercardEmbed = new Discord.MessageEmbed()
		.setColor('#F7931A')
		.setTitle(`Carl Coin Stock Information`)
		.addFields(
			{ name: 'Name', value: `${stockName}`, inline: true },
			{ name: 'Price&Volt.', value: `${stockPrice}`, inline: true },
			{ name: 'Amt. Left/Total', value: `${stockLeft}`, inline: true },
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
					if(data.users[i].balance - (amount * stock.stock[stockIndex].price) < 0){
						message.channel.send('You do not have enough CC!');
						return;
					}
					if(stock.stock[stockIndex].existing - amount < 0){
						message.channel.send(`No more of that stock exists!`);
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
			if(data.users[i].balance - (amount * stock.stock[stockIndex].price) < 0){
				message.channel.send('You do not have enough CC!');
				return;
			}
			if(stock.stock[stockIndex].existing - amount < 0){
				message.channel.send(`No more of that stock exists!`);
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
					let netGain = (amount * stock.stock[stockIndex].price) - (data.users[i].stock[j].avgPrice * amount);
					if(data.users[i].stock[j].today < 0){
						data.users[i].stock[j].today = 0;
					}
					stock.stock[stockIndex].boughtRecently -= amount;
					stock.stock[stockIndex].existing += amount;
					let amountLeft = data.users[i].stock[j].amount;
					if(data.users[i].stock[j].amount == 0){
						data.users[i].stock.splice(j,1);
					}
					//update files
					let newStockFile = JSON.stringify(stock);
					fs.writeFileSync('/home/mattguy/carlcoin/stock.json',newStockFile);
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);message.channel.send(`You have sold ${amount} shares of ${stockName}! You now own ${amountLeft}. The net from this transaction was approx. ${netGain}CC!`);
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
			if(data.users[i].stock.length == 0){
				message.channel.send('You dont own any stocks!');
				return;
			}
			let stockName = ``;
			let stockAmt = ``;
			let stockAvg = ``;
			for(let j=0;j<data.users[i].stock.length;j++){
				stockName += `${data.users[i].stock[j].name}\n`;
				stockAmt += `${data.users[i].stock[j].amount}\n`;
				stockAvg += `${data.users[i].stock[j].avgPrice}\n`;
			}
			const playercardEmbed = new Discord.MessageEmbed()
				.setColor('#F7931A')
				.setTitle(`${data.users[i].name}'s Portfolio`)
				.addFields(
					{ name: 'Name', value: `${stockName}`, inline: true },
					{ name: 'Amt.', value: `${stockAmt}`, inline: true },
					{ name: 'Avg', value: `${stockAvg}`, inline: true },
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
	message.channel.send(`Use !cc showStocks to see the available stocks!\nUse !cc stockPort to see your portfolio!\nUse !cc stockBuy <name> <amount> to buy stocks!\nUse !cc stockSell <name> <amount> to sell your shares!\nUse !cc stockGraph to see the stock price history!\nUse !cc stockOwnership to see who owns what in the market!`);
}

function stockGraph(client,message){
	if(!fs.existsSync(`/home/mattguy/carlcoin/stockHistory.json`)){
		message.channel.send(`No history has been recorded`);
		return;
	}
	let stockHistoryFile = fs.readFileSync('/home/mattguy/carlcoin/stockHistory.json');
	let stockHistory = JSON.parse(stockHistoryFile);
	let labels = [];
	for(let i=0;i<stockHistory.history[0].priceHis.length;i++){
		labels.push(i);
	}
	let datasets = []
	for(let i=0;i<stockHistory.history.length;i++){
		let newData = {label:``,backgroundColor:`rgb(${(75*i)%255},${(192*i)%255},${(100*i)%255})`,borderColor:`rgb(${(75*i)%255},${(192*i)%255},${(100*i)%255})`,data:[]};
		newData.label = stockHistory.history[i].name;
		for(let j=0;j<stockHistory.history[i].priceHis.length;j++){
			newData.data.push(stockHistory.history[i].priceHis[j]);
		}
		datasets.push(newData);
	}
	let data = {labels: labels,datasets: datasets};
	let config = {type:'line',data,options:{scales:{x:{display:true,title:{display:true,text:'Hours'}},y:{display:true,title:{display:true,text:'Price'}}}}};
	data = JSON.stringify(data);
	config = JSON.stringify(config);
	let stockSite = `<!DOCTYPE html> <html> <head> <title> Stock History </title> <style> body, form{ margin: 0 auto; max-width:652px; overflow-x:hidden; background-color:#CCCCFF;}fieldset{ display: flex;}</style><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head><body><canvas id="myChart"></canvas><script>const data=${data};const config = ${config};var myChart = new Chart(document.getElementById("myChart"),config);</script></body></html>`;
	if(fs.existsSync(`/var/www/html/carlHorses/StockTimeline.html`)){
		fs.unlinkSync(`/var/www/html/carlHorses/StockTimeline.html`);
	}
	let stockWrite = stockSite;
	fs.writeFileSync(`/var/www/html/carlHorses/StockTimeline.html`,stockWrite);
	message.channel.send(`http://67.244.23.211:4377/carlHorses/StockTimeline.html`);
}

function stockOwnership(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let stockFile = fs.readFileSync('/home/mattguy/carlcoin/stock.json');
	let stock = JSON.parse(stockFile);
	
	let ownership = `Stock Ownership\n`;
	for(let i=0;i<stock.stock.length;i++){
		let CEO = `No one`;
		let amountOwned = 0;
		let totalOwned = 0;
		for(let j=0;j<data.users.length;j++){
			if(data.users[j].hasOwnProperty("stock")){
				for(let k=0;k<data.users[j].stock.length;k++){
					if(data.users[j].stock[k].name == stock.stock[i].name){
						totalOwned += data.users[j].stock[k].amount;
						if(data.users[j].stock[k].amount > amountOwned){
							amountOwned = data.users[j].stock[k].amount;
							CEO = data.users[j].name;
						}
					}
				}
			}
		}
		let percent = (totalOwned / stock.stock[i].total) * 100;
		percent = percent.toFixed(2);
		ownership += `${stock.stock[i].name}: ${percent}% is owned. ${CEO} is the CEO\n`;
	}
	message.channel.send(ownership,{"code":true});
}
//export functions
module.exports = {
	updateStocks,
	showStocks,
	buyStock,
	sellStock,
	showPort,
	stockHelp,
	stockGraph,
	createNewStock,
	stockOwnership
};