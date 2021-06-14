const Discord = require('discord.js');
const fs = require('fs');
/*
realty structure
	list:[
		{
			id:000000								find seller in datafile
			type:house/apartment/skyscraper			building will be subtracted at buying time
			price:100								sell price
			name:mattguy							only for display purposes
		}
	]
	
realty history
	house:[0]
	apartment:[0]
	skyscraper:[0]
*/
function realtyList(client,message){
	// !cc realtyList <type> <price>
	let chop = message.content.split(" ");
	if(chop.length != 4){
		message.channel.send('Usage: !cc realtyList <type> <price>');
		return;
	}
	//check amount is valid
	let price = parseInt(chop[chop.length-1]);
	if(isNaN(price) || price < 0){
		message.channel.send('Invalid price entered!');
		return;
	}
	//check type is valid
	let type = chop[chop.length-2];
	if(type != 'house' && type != 'apartment' && type != 'skyscraper'){
		message.channel.send('Invalid type entered!');
		return;
	}
	//price and type checkout, start gathering files
	if(!fs.existsSync(`/home/mattguy/carlcoin/realty.json`)){
		//create file if it isnt real
		let realty = {list:[]};
		let realtyFileSave = JSON.stringify(realty);
		fs.writeFileSync('/home/mattguy/carlcoin/realty.json',realtyFileSave);
	}
	//read realty and database file
	let realtyFile = fs.readFileSync('/home/mattguy/carlcoin/realty.json');
	let realty = JSON.parse(realtyFile);
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			//user found
			if(type == 'house'){
				if(data.users[i].house <= 0){
					message.channel.send(`You do not have any houses!`);
					return;
				}
				else{
					//take building
					data.users[i].house -= 1;
				}
			}
			else if(type == 'apartment'){
				if(data.users[i].apartment <= 0){
					message.channel.send(`You do not have any apartments!`);
					return;
				}
				else{
					//take building
					data.users[i].apartment -= 1;
				}
			}
			else if(type == 'skyscraper'){
				if(data.users[i].skyscraper <= 0){
					message.channel.send(`You do not have any skyscrapers!`);
					return;
				}
				else{
					//take building
					data.users[i].skyscraper -= 1;
				}
			}
			else{
				//failsafe if type isnt correctly found
				message.channel.send(`Invalid type selected!`);
				return;
			}
			//create listing
			let newListing = {"id":data.users[i].id,"type":type,"price":price,"name":data.users[i].name};
			realty.list.push(newListing);
			//write to files
			let realtyFileSave = JSON.stringify(realty);
			fs.writeFileSync('/home/mattguy/carlcoin/realty.json',realtyFileSave);
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			//alert player
			message.channel.send(`You have put up a listing for a ${type}, priced at ${price}CC! You can cancel this at anytime with !cc realtyCancel <index>. You will be DM'd when the listing is sold!`);
			return;
		}
	}
	message.channel.send(`You are not registered for Carl Coin!`);
}

function realtyBuy(client,message){
	// !cc realtyBuy <index>
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !cc realtyBuy <index>');
		return;
	}
	//check amount is valid
	let index = parseInt(chop[chop.length-1]);
	if(isNaN(index) || amount < 0){
		message.channel.send('Invalid index entered!');
		return;
	}
	//price and type checkout, start gathering files
	if(!fs.existsSync(`/home/mattguy/carlcoin/realty.json`)){
		message.channel.send(`There are no listings!`);
		return;
	}
	let realtyFile = fs.readFileSync('/home/mattguy/carlcoin/realty.json');
	let realty = JSON.parse(realtyFile);
	if(realty.list.length == 0){
		message.channel.send(`There are no listings!`);
		return;
	}
	//load in history file
	if(!fs.existsSync(`/home/mattguy/carlcoin/realtyHistory.json`)){
		let realtyHistory = {house:[0],apartment:[0],skyscraper:[0]};
		let realtyHistoryFileSave = JSON.stringify(realtyHistory);
		fs.writeFileSync('/home/mattguy/carlcoin/realtyHistory.json',realtyHistoryFileSave);
	}
	let realtyHistoryFile = fs.readFileSync('/home/mattguy/carlcoin/realtyHistory.json');
	let realtyHistory = JSON.parse(realtyHistoryFile);
	
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	
	if(index >= realty.list.length){
		message.channel.send('Invalid index entered!');
		return;
	}
	
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			if(data.users[i].id == realty.list[index].id){
				message.channel.send(`You cannot buy your own listing!`);
				return;
			}
			if(data.users[i].balance - realty.list[index].price < 0){
				message.channel.send(`You do not have enough CC!`);
				return;
			}
			//subtract balance
			data.users[i].balance -= realty.list[index].price
			//increase building
			if(realty.list[index].type == 'house'){
				data.users[i].house += 1;
				realtyHistory.house.push(realty.list[index].price);
			}
			else if(realty.list[index].type == 'apartment'){
				data.users[i].apartment += 1;
				realtyHistory.apartment.push(realty.list[index].price);
			}
			else if(realty.list[index].type == 'skyscraper'){
				data.users[i].skyscraper += 1;
				realtyHistory.skyscraper.push(realty.list[index].price);
			}
			else{
				message.channel.send(`Something is wrong with this listing, I'm sending a message to the seller now, Sorry!`);
				client.users.cache.get(realty.list[index].id).send(`Something is wrong with your listing (index ${index}) on the realty market, please check it!`).catch(() => {console.log('Failed to alert seller of their issue listing')});
				return;
			}
			for(let j=0;j<data.users.length;j++){
				if(data.users[j].id == realty.list[index].id){
					//pay seller
					data.users[j].balance += realty.list[index].price;
					client.users.cache.get(realty.list[index].id).send(`Your listing of a ${realty.list[index].type} for ${realty.list[index].price} has been sold to ${data.users[i].name}!`).catch(() => {console.log('Failed to alert seller of their listing being sold')});
					realty.list.splice(index,1);
					//begin writing files
					let realtyFileSave = JSON.stringify(realty);
					fs.writeFileSync('/home/mattguy/carlcoin/realty.json',realtyFileSave);
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					let realtyHistoryFileSave = JSON.stringify(realtyHistory);
					fs.writeFileSync('/home/mattguy/carlcoin/realtyHistory.json',realtyHistoryFileSave);
					message.channel.send(`Your purchase is complete!`);
					return;
				}
			}
			message.channel.send(`Failed to find seller in the database. Sorry, the transaction cannot be completed!`);
			return;
		}
	}
	message.channel.send(`You are not registered for Carl Coin!`);
}

function realtyListings(client, message){
	if(!fs.existsSync(`/home/mattguy/carlcoin/realty.json`)){
		message.channel.send(`There are no listings!`);
		return;
	}
	let realtyFile = fs.readFileSync('/home/mattguy/carlcoin/realty.json');
	let realty = JSON.parse(realtyFile);
	let messageList = `index. name, type, price\n`
	for(let i=0;i<realty.list.length;i++){
			messageList += `${i}. ${realty.list[i].name}, ${realty.list[i].type}, ${realty.list[i].price}\n`;
		}
	}
	message.channel.send(messageList,{"code":true});
}

function realtyCancel(client,message){
	// !cc realtyCancel <index>
	let chop = message.content.split(" ");
	if(chop.length != 3){
		message.channel.send('Usage: !cc realtyCancel <index>');
		return;
	}
	//check amount is valid
	let index = parseInt(chop[chop.length-1]);
	if(isNaN(index) || index < 0){
		message.channel.send('Invalid index entered!');
		return;
	}
	//price and type checkout, start gathering files
	if(!fs.existsSync(`/home/mattguy/carlcoin/realty.json`)){
		message.channel.send(`There are no listings!`);
		return;
	}
	let realtyFile = fs.readFileSync('/home/mattguy/carlcoin/realty.json');
	let realty = JSON.parse(realtyFile);
	if(realty.list.length == 0){
		message.channel.send(`There are no listings!`);
		return;
	}
	
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	
	if(index >= realty.list.length){
		message.channel.send('Invalid index entered!');
		return;
	}
	
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			if(data.users[i].id != realty.list[index].id){
				message.channel.send(`You cannot cancel someone elses listing!`);
				return;
			}
			//increase building
			if(realty.list[index].type == 'house'){
				data.users[i].house += 1;
			}
			else if(realty.list[index].type == 'apartment'){
				data.users[i].apartment += 1;
			}
			else if(realty.list[index].type == 'skyscraper'){
				data.users[i].skyscraper += 1;
			}
			else{
				message.channel.send(`Something is wrong with this listing, please contact MattGuy#4376`);
				return;
			}
			realty.list.splice(index,1);
			//begin writing files
			let realtyFileSave = JSON.stringify(realty);
			fs.writeFileSync('/home/mattguy/carlcoin/realty.json',realtyFileSave);
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
		
			message.channel.send(`Your listing has been canceled!`);
			return;
		}
	}
	message.channel.send(`You are not registered for Carl Coin!`);
}

function realtyHelp(client,message){
	message.channel.send(`Use !cc realtyList <type> <price> to put up a new listing!\nUse !cc realtyBuy <index> to buy from a listing!\nUse !cc realtyListings to see all listings!\nUse !cc realtyCancel <index> to cancel a listing you put up!\nUse !cc realtyGraph to see a history of prices!`);
}

function realtyGraph(client,message){
	if(!fs.existsSync(`/home/mattguy/carlcoin/realtyHistory.json`)){
		message.channel.send(`No history has been recorded`);
		return;
	}
	let realtyHistoryFile = fs.readFileSync('/home/mattguy/carlcoin/realtyHistory.json');
	let realtyHistory = JSON.parse(realtyHistoryFile);
	
	let labels = [];
	let max = realtyHistory.house.length;
	if(max < realtyHistory.apartment.length){
		max = realtyHistory.apartment.length
	}
	if(max < realtyHistory.skyscraper.length){
		max = realtyHistory.skyscraper.length
	}
	
	for(let i=0;i<max;i++){
		labels.push(i);
	}
	let datasets = []
	
	let newData = {label:``,backgroundColor:`rgb(99,68,252)`,borderColor:`rgb(99,68,252)`,data:[]};
	newData.label = `house`;
	for(let j=0;j<realtyHistory.house.length;j++){
		newData.data.push(realtyHistory.house[i]);
	}
	datasets.push(newData);
	
	newData = {label:``,backgroundColor:`rgb(41,176,39)`,borderColor:`rgb(41,176,39)`,data:[]};
	newData.label = `apartment`;
	for(let j=0;j<realtyHistory.apartment.length;j++){
		newData.data.push(realtyHistory.apartment[i]);
	}
	datasets.push(newData);
	
	newData = {label:``,backgroundColor:`rgb(252,162,93)`,borderColor:`rgb(252,162,93)`,data:[]};
	newData.label = `skyscraper`;
	for(let j=0;j<realtyHistory.skyscraper.length;j++){
		newData.data.push(realtyHistory.skyscraper[i]);
	}
	datasets.push(newData);
	
	
	let data = {labels: labels,datasets: datasets};
	let config = {type:'line',data};
	data = JSON.stringify(data);
	config = JSON.stringify(config);
	let stockSite = `<!DOCTYPE html> <html> <head> <title> Realty History </title> <style> body, form{ margin: 0 auto; max-width:652px; overflow-x:hidden; background-color:#CCCCFF;}fieldset{ display: flex;}</style><script src="https://cdn.jsdelivr.net/npm/chart.js"></script></head><body><canvas id="myChart"></canvas><script>const data=${data};const config = ${config};var myChart = new Chart(document.getElementById("myChart"),config);</script></body></html>`;
	if(fs.existsSync(`/var/www/html/carlHorses/RealtyTimeline.html`)){
		fs.unlinkSync(`/var/www/html/carlHorses/RealtyTimeline.html`);
	}
	let stockWrite = stockSite;
	fs.writeFileSync(`/var/www/html/carlHorses/RealtyTimeline.html`,stockWrite);
	message.channel.send(`http://67.244.23.211:4377/carlHorses/RealtyTimeline.html`);
}

//export functions
module.exports = {
	realtyList,
	realtyBuy,
	realtyListings,
	realtyCancel,
	realtyHelp,
	realtyGraph
};