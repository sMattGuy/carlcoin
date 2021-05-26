const Discord = require('discord.js');
const fs = require('fs');

const colors = ['Appaloosa','Bay','Black','Brown','Buckskin','Chestnut','Cremello','Dun','Grey','Overo','Palomino','Piebald','Roan','Skewbald','Spotted','Tobiano'];
const genderType = ['Male','Female'];
const specialType = ['Speed Boost','Stamina Boost','Slipstream','Full Force','Vicious'];

const firstPartName = ['Special','Silence','Tokai','Air','Condor','Oguri','Grass','Gold','Symboli','Taiki','Daiwa','T.M.','Narita','Hishi','Fuji','Mejiro','Seiun','Yukino','Manhattan','Tosen','Haru','Kawakami','Mejiro','Fine','Smart','Narita','Super','Inari','Nishino','Biko','Bamboo','Marvelous','Mihono','Sweep','Ines','Biwa','Sakura','Shinko','Agnes','Zenno','Meisho','Rice','Admire','Curren','Eishin','Nakayama','Mayano','Nice','King','Matikane','Ikuno','Daitaku','Twin','Seeking','Tamamo'];
const secondPartName = ['Week','Suzuka','Teio','Vodka','Groove','Pasa','Cap','Wonder','Ship','Rudolf','Shuttle','Scarlet','Opera','Brian','Amazon','Kiseki','Maruzensky','McQueen','Sky','Bijin','Ticket','Cross','Pearl','Cafe','Jordan','Urara','Princess','Ryan','Matikanefukukitaru','Motion','Falcon','Taishin','Shakur','City','Creek','One','Flower','Pegasus','Akebono','Memory','Sunday','Bourbon','Tosho','Fujin','Hayahide','Bakushin','Windy','Tachyon','Rob Roy','Doto','Shower','Vega','Chan','Digital','Flash','Festa','Top Gun','Dober','Nature','Halo','Tannhauser','Dictus','Helios','Turbo'];

//horse value definition
const horsePrice = 750;

function purchaseHorse(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			if(data.users[i].balance < horsePrice){
				message.channel.send(`You do not have enough CC! (Costs 750CC)`);
				return;
			}
			else{
				let newHorse = createHorse();
				if(isNaN(data.users[i].horses)){
					data.users[i].horses = [newHorse];
				}
				else{
					data.users[i].horses.push(newHorse);
				}
				const playercardEmbed = makeHorseEmbed(newHorse,data.users[i].name,message)
				message.channel.send(playercardEmbed);
				message.channel.send(`You have purchased ${newHorse.name}!`);
				data.users[i].balance -= horsePrice;
				data.econ -=  horsePrice;
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			}
			break;
		}
	}
}

function raceHorse(client,message){
	
}

function trainHorse(client,message){
	
}

function breedHorse(client,message){
	
}
//!cc horseSell user index price
function horseSell(client,message){
	let chop = message.content.split(" ");
	if(chop.length != 5){
		message.channel.send('Command arguments incorrect!');
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
			if(fs.existsSync(`/home/mattguy/carlcoin/cache/${buyer}horseSell`)){
				let sellFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${buyer}horseSell`);
				let sellParse = JSON.parse(sellFile);
				if(sellParse.sellEnder < Date.now()){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${buyer}horseSell`);
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
							if(!data.users[i].hasOwnProperty("horses")){
								message.channel.send('You dont own any horses!');
								return;
							}
							for(let j=0;j<data.users.length;j++){
								if(data.users[j].id == buyer){
									let horseIndex = parseInt(chop[chop.length-2]);
									//check if house
									if(horseIndex < 0 || horseIndex >= data.users[i].horses.length){
										message.channel.send('Invalid horse selected!');
									}
									else if(data.users[j].balance - price < 0){
										message.channel.send('Buyer doesnt have enough CC!');
									}
									else{
										let sellEnder = Date.now() + 60000;
										let sellInfo = {"seller":`${seller}`,"sellerIndex":`${i}`,"buyer":`${buyer}`,"buyerIndex":`${j}`,"price":`${price}`,"sellEnder":`${sellEnder}`,"type":`${horseIndex}`};
										let jsonBattle = JSON.stringify(sellInfo);
										fs.writeFileSync(`/home/mattguy/carlcoin/cache/${buyer}horseSell`,jsonBattle);
										message.channel.send(`${data.users[j].name}! Type !cc horseAccept to accept ${data.users[i].name}'s offer or type !cc horseDeny to reject the offer. You have 1 minute to respond.`);
										console.log(data.users[i].name + " trying to sell to " + data.users[j].name);
									}
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

function acceptDenyHorse(client,message){
	let personsId = message.author.id;
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}horseSell`)){
		let sellFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}horseSell`);
		let sellParse = JSON.parse(sellFile);
		if(sellParse.sellEnder < Date.now()){
			fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}horseSell`);
			message.channel.send('Time has expired to accept the offer');
		}
		else{
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			if(message.content.startsWith('!cc denyPurchase')){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}horseSell`);
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
					let horse = data.users[sellParse.sellerIndex].horse[parseInt(sellParse.type)];
					data.users[sellParse.sellerIndex].horse.splice(parseInt(sellParse.type),1);
					if(data.users[sellParse.buyerIndex].hasOwnProperty("horses")){
						data.users[sellParse.buyerIndex].horses.push(horse);
					}
					else{
						data.users[sellParse.buyerIndex].horses = [horse];
					}
					data.users[sellParse.sellerIndex]["activity"] = Date.now();
					data.users[sellParse.buyerIndex]["activity"] = Date.now();
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}horseSell`);
					message.channel.send('You have accepted the offer!');
					console.log(data.users[sellParse.sellerIndex].name + " has sold to " + data.users[sellParse.buyerIndex]);
				}
			}
		}
	}
}

function horseList(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			if(!data.users[i].hasOwnProperty("horses")){
				data.users[i].horses = [];
			}
			if(data.users[i].horses.length == 0){
				message.channel.send(`You do not own any horses!`);
			}
			else{
				let horseList = "";
				for(let j=0;j<data.users[i].horses.length;j++){
					horseList += `${j}. ${data.users[i].horses[j].name}\n`;
				}
				const playercardEmbed = new Discord.MessageEmbed()
					.setColor('#F7931A')
					.setTitle(`${data.users[i].name}'s horses`)
					.setAuthor(`${data.users[i].name}`, `${message.author.displayAvatarURL()}`)
					.addFields(
						{ name: 'Horses', value: `${horseList}`}
					)
				message.channel.send(playercardEmbed);
			}
			break;
		}
	}
}

function horseStats(client,message){
	let chop = message.content.split(" ");
	//if too many arguments
	if(chop.length != 3){
		message.channel.send(`Invalid arguments supplied!`);
	}
	else{
		let horseIndex = 0;
		try{
			horseIndex = parseInt(chop[chop.length-1]);
		}
		//if username cannot be gotten
		catch(err){
			message.channel.send(`Invalid index supplied`);
			return;
		}
		if(horseIndex < 0){
			message.channel.send(`Horse selection cannot be negative!`);
		}
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == id){
				if(!data.users[i].hasOwnProperty("horses")){
					data.users[i].horses = [];
				}
				if(data.users[i].horses.length == 0){
					message.channel.send(`You do not own any horses!`);
					return;
				}
				else{
					if(horseIndex >= data.users[i].horses.length){
						message.channel.send(`Invalid horse selected! Use !cc horseList to see your horses!`);
						return;
					}
					else{
						let horse = data.users[i].horses[horseIndex];
						const playercardEmbed = makeHorseEmbed(horse,data.users[i].name,message);
						message.channel.send(playercardEmbed);
					}
				}
				return;
			}
		}
	}
}

function horseHelp(client,message){
	message.channel.send(`Use !cc horsePurchase to buy a new horse for ${horsePrice}CC!\nUse !cc horseRace to enroll your horse in a race!\nUse !cc horseTrain to improve your horse's stats!\nUse !cc horseSell to sell your horse!\nUse !cc horseBreed to breed two of your horses!\nUse !cc horseList to see your horses!\nUse !cc horseStats to get a specific horses stats!`);
}

function makeHorseEmbed(newHorse,name,message){
	const playercardEmbed = new Discord.MessageEmbed()
		.setColor('#F7931A')
		.setTitle(`${newHorse.name}'s stats`)
		.setAuthor(`${name}`, `${message.author.displayAvatarURL()}`)
		.addFields(
			{ name: 'Stamina', value: `${newHorse.stamina}`, inline: true },
			{ name: 'Speed', value: `${newHorse.speed}`, inline: true },
			{ name: 'Color', value: `${newHorse.color}`, inline: true },
			{ name: 'Height', value: `${newHorse.height}`, inline: true },
			{ name: 'Weight', value: `${newHorse.weight}`, inline: true },
			{ name: 'Gender', value: `${newHorse.gender}`, inline: true },
			{ name: 'Age', value: `${newHorse.age}`, inline: true },
			{ name: 'Birthday', value: `${newHorse.birthday}`, inline: true },
			{ name: 'Special', value: `${newHorse.special}`, inline: true },
			{ name: 'Timeline', value: `${newHorse.timeline}`},
		)
	return playercardEmbed;
}

function createHorse(){
	//metaphorical stats
	let today = new Date();
	let stamina = Math.floor(Math.random() * 40) + 80;
	let speed = Math.floor(Math.random() * 40) + 80;
	//cosmetic stats
	let color = colors[Math.floor(Math.random() * colors.length)];
	let height = Math.random() + 1;
	height = height.toFixed(2);
	let weight = Math.floor(Math.random() * 620) + 380;
	let gender = genderType[Math.floor(Math.random() * genderType.length)];
	let specialAbility = specialType[Math.floor(Math.random() * specialType.length)];
	let name = firstPartName[Math.floor(Math.random()*firstPartName.length)] + ' ' + secondPartName[Math.floor(Math.random()*secondPartName.length)];
	let age = Math.floor(Math.random()*4)+2;
	let newHorse = {"name":`${name}`,"stamina":`${stamina}`,"speed":`${speed}`,"color":`${color}`,"height":`${height}`,"weight":`${weight}`,"gender":`${gender}`,"special":`${specialAbility}`,"age":`${age}`,"birthday":`${today.getDate()}`,"trainingCooldown":0,"raceCooldown":0,"timeline":"Parents:Unknown"};
	console.log(newHorse);
	return newHorse;
}

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

//export functions
module.exports = {
	purchaseHorse,
	//raceHorse,
	//trainHorse,
	//breedHorse,
	//horseSell,
	horseHelp,
	horseStats,
	horseList
};