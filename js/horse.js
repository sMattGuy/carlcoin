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
// !cc horseRace index bet
function raceHorse(client,message){
	let chop = message.content.split(" ");
	//if too many arguments
	if(chop.length != 4){
		message.channel.send(`Invalid arguments supplied!`);
		return;
	}
	let bet = parseInt(chop[chop.length-1]);
	if(isNaN(bet) || bet < 0){
		message.channel.send('Invalid amount entered!');
		return;
	}
	else{
		let horseIndex = 0;
		try{
			horseIndex = parseInt(chop[chop.length-2]);
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
				else if(data.users[i].balance - bet < 0){
					message.channel.send(`You do not have enough CC!`);
					return;
				}
				if(horseIndex >= data.users[i].horses.length){
					message.channel.send(`Invalid horse selected! Use !cc horseList to see your horses!`);
					return;
				}
				else{
					let horse = data.users[i].horses[horseIndex];
					let userID = data.users[i].id;
					let total = bet;
					let userPacket = {"id":`${userID}`,"horse":horse,"bet":`${bet}`};
					if(fs.existsSync(`/home/mattguy/carlcoin/cache/horseRace.json`)){
						let raceRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/horseRace.json`);
						let raceFile = JSON.parse(raceRead);
						for(let j=0;j<raceFile.racers.length;j++){
							if(userID == raceFile.racers[j].id){
								message.channel.send(`You are already enrolled for the race!`);
								return;
							}
						}
						raceFile.total += bet;
						raceFile.racers.push(userPacket);
						let raceFileSave = JSON.stringify(raceFile);
						fs.writeFileSync('/home/mattguy/carlcoin/cache/horseRace.json',raceFileSave);
					}
					else{
						let horseRace = {"total":`${total}`,"racers":[]};
						horseRace.racers.push(userPacket);
						let raceFile = JSON.stringify(horseRace);
						fs.writeFileSync('/home/mattguy/carlcoin/cache/horseRace.json',raceFile);
					}
					message.channel.send(`You have been enrolled for the race! The results will be in general at midnight!`);
				}
				return;
			}
		}
	}
}

function actualRace(client,message){
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/horseRace.json`)){
		let raceRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/horseRace.json`);
		let raceFile = JSON.parse(raceRead);
		let total = raceFile.total;
		let horses = [];
		let raceEvents = "";
		for(let i=0;i<raceFile.racers.length;i++){
			let id = raceFile.racers[i].id;
			let horse = raceFile.racers[i].horse;
			let currentHorse = {"id":`${id}`,"horse":horse};
			horses.push(currentHorse);
		}
		if(horses.length < 10){
			let i = 10-horses.length;
			for(i;i!=0;i--){
				let AIHorse = createHorse();
				total += 10;
				let owner = `AI${i}`;
				let airacer = {"id":`${owner}`,"horse":AIHorse};
				horses.push(airacer);
			}
		}
		let racePos = [];
		for(let i=0;i<horses.length;i++){
			//pushes horseID onto race position
			console.log(i + '. ' + horses[i].horse.name);
			racePos.push(i);
		}
		raceEvents += `Welcome to todays race of ${horses.length} horses\n`;
		for(let raceSize=100;raceSize!=0;raceSize--){
			raceEvents += `Current standings:\n`;
			for(let places = 0;places < racePos.length;places++){
				raceEvents += `${places + 1}. ${horses[racePos[places]].horse.name}\n`;
			}
			raceEvents += `SPRINTS LEFT: ${raceSize}\n`;
			//each frame will go through every horses decision
			for(let frame = 0;frame<horses.length;frame++){
				let pos = 0;
				let newPos = 0;
				let horseBehind = {"id":"noPerson"};
				let horseInFront = {"id":"noPerson"};
				//get horses position
				for(pos;pos < racePos.length;pos++){
					if(racePos[pos] == frame){
						break;
					}
				}
				//get horse behinds info
				if(pos - 1 > 0){
					horseInFront = horses[racePos[pos-1]];
				}
				//get horse infront
				if(pos + 1 < racePos.length){
					horseBehind = horses[racePos[pos+1]];
				}
				if(horseInFront.id != 'noPerson'){
					if(horses[racePos[pos]].horse.speed > horseInFront.horse.speed){
						//current horse
						let overtakerHorse = racePos[pos];
						//horse being overtaken
						racePos[pos] = racePos[pos-1];
						//changing who's in front
						racePos[pos-1] = overtakerHorse;
						newPos = pos-1;
						raceEvents += `${horses[racePos[newPos]].horse.name} has overtaken ${horses[racePos[pos]].horse.name}!\n`;
					}
					else if(horses[racePos[pos]].horse.speed == horseInFront.horse.speed){
						let passChance = Math.random();
						if(passChance > 0.5){
							//current horse
							let overtakerHorse = racePos[pos];
							//horse being overtaken
							racePos[pos] = racePos[pos-1];
							//changing who's in front
							racePos[pos-1] = overtakerHorse;
							newPos = pos-1;
							raceEvents += `${horses[racePos[newPos]].horse.name} has overtaken ${horses[racePos[pos]].horse.name}!\n`;
						}
						else{
							raceEvents += `${horses[racePos[pos]].horse.name} couldn't overtake ${horses[racePos[pos-1]].horse.name}!\n`;
							newPos = pos;
						}
					}
					else{
						raceEvents += `${horses[racePos[pos]].horse.name} couldn't overtake ${horses[racePos[pos-1]].horse.name}!\n`;
						newPos = pos;
					}
				}
				else{
					raceEvents += `${horses[racePos[pos]].horse.name} is in first!\n`;
				}
				//special ability
				let specialChance = Math.random();
				if(horses[racePos[newPos]].horse.special == 'Speed Boost' && specialChance >= 0.80){
					raceEvents += `${horses[racePos[newPos]].horse.name} activated ${horses[racePos[newPos]].horse.special}!\n`;
					horses[racePos[newPos]].horse.speed += 10;
				}
				else if(horses[racePos[newPos]].horse.special == 'Stamina Boost' && specialChance >= 0.80){
					raceEvents += `${horses[racePos[newPos]].horse.name} activated ${horses[racePos[newPos]].horse.special}!\n`;
					horses[racePos[newPos]].horse.stamina += 10;
				}
				else if(horses[racePos[newPos]].horse.special == 'Full Force' && specialChance >= 0.90){
					raceEvents += `${horses[racePos[newPos]].horse.name} activated ${horses[racePos[newPos]].horse.special}!\n`;
					horses[racePos[newPos]].horse.stamina += 10;
					horses[racePos[newPos]].horse.speed += 10;
				}
				else if(horses[racePos[newPos]].horse.special == 'Slipstream' && specialChance >= 0.85){
					raceEvents += `${horses[racePos[newPos]].horse.name} activated ${horses[racePos[newPos]].horse.special}!\n`;
					horseInFront = {"id":"noPerson"};
					if(newPos - 1 > 0){
						horseInFront = horses[racePos[newPos-1]];
					}
					if(horseInFront.id != 'noPerson'){
						//current horse
						let tempPos = racePos[newPos];
						//horse being overtaken
						racePos[newPos] = racePos[newPos-1];
						//changing who's in front
						racePos[newPos-1] = tempPos;
						newPos = newPos-1;
						raceEvents += `${horses[racePos[newPos]].horse.name} has overtaken ${horses[racePos[newPos+1]].horse.name}!\n`;
					}
					else{
						raceEvents += `${horses[racePos[newPos]].horse.name} is already in first!\n`;
					}
				}
				else if(horses[racePos[newPos]].horse.specialAbility == 'Vicious' && specialChance >= 0.90){
					raceEvents += `${horses[racePos[newPos]].horse.name} activated ${horses[racePos[newPos]].horse.specialAbility}!\n`;
					horseBehind = {"id":"noPerson"};
					if(newPos + 1 < racePos.length){
						horseBehind = horses[racePos[newPos+1]];
					}
					if(horseBehind.id != 'noPerson'){
						horses[racePos[newPos+1]].horse.stamina -= 10;
						horses[racePos[newPos+1]].horse.speed -= 5;
						raceEvents += `${horses[racePos[newPos]].horse.name} has kicked up rocks onto ${horses[racePos[newPos+1]].horse.name}!\n`;
					}
					else{
						raceEvents += `${horses[racePos[newPos]].horse.name} has no one behind them!\n`;
					}
				}
				horses[racePos[newPos]].horse.stamina -= 1;
				if(horses[racePos[newPos]].horse.stamina < 0){
					raceEvents += `${horses[racePos[newPos]].horse.name} looks tired!\n`;
					horses[racePos[newPos]].horse.stamina = 0;
					horses[racePos[newPos]].horse.speed -= 5;
					if(horses[racePos[newPos]].horse.speed < 0){
						raceEvents += `${horses[racePos[newPos]].horse.name} is exhasted!\n`;
						horses[racePos[newPos]].horse.speed = 0;
					}
				}
			}
		}
		fs.writeFileSync('/home/mattguy/carlcoin/cache/horseRaceEvents.txt',raceEvents);
		fs.unlinkSync(`/home/mattguy/carlcoin/cache/horseRace.json`);
	}
	else{
		console.log('No horse race occured');
	}
}

function trainHorse(client,message){
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
					else if(data.users[i].horses[horseIndex].trainingCooldown > Date.now()){
						let timeLeftClaim = data.users[i].horses[horseIndex].trainingCooldown - Date.now();
						timeLeftClaim = Math.floor(timeLeftClaim / 1000);
						timeLeftClaim = Math.floor(timeLeftClaim / 60);
						message.channel.send(`You trained ${data.users[i].horses[horseIndex].name} recently! Try again in ${timeLeftClaim} mins!`);
					}
					else{
						let staminaChance = Math.random();
						let speedChance = Math.random();
						let staminaAmount = Math.floor(Math.random()*5)+1;
						let speedAmount = Math.floor(Math.random()*5)+1;
						let results = `You start training ${data.users[i].horses[horseIndex].name}...\n`;
						if(staminaChance >= 0.25){
							data.users[i].horses[horseIndex].stamina += staminaAmount;
							if(data.users[i].horses[horseIndex].stamina > 150){
								data.users[i].horses[horseIndex].stamina = 150;
							}
							results += `${data.users[i].horses[horseIndex].name} improved their stamina by ${staminaAmount} points!\n`;
						}
						if(speedChance >= 0.75){
							data.users[i].horses[horseIndex].speed += speedAmount;
							if(data.users[i].horses[horseIndex].speed > 150){
								data.users[i].horses[horseIndex].speed = 150;
							}
							results += `${data.users[i].horses[horseIndex].name} improved their speed by ${speedAmount} points!\n`;
						}
						results += `Training complete!`;
						message.channel.send(results);
						data.users[i].horses[horseIndex].trainingCooldown = Date.now() + 21600000;
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					}
				}
				return;
			}
		}
	}
}

function breedHorse(client,message){
	let chop = message.content.split(" ");
	if(chop.length != 4){
		message.channel.send('Command arguments incorrect!');
	}
	else{
		let horseIndex1 = 0;
		let horseIndex2 = 0;
		try{
			horseIndex1 = parseInt(chop[chop.length-2]);
			horseIndex2 = parseInt(chop[chop.length-1]);
		}
		catch(err){
			message.channel.send(`Invalid indexs supplied`);
			return;
		}
		if(horseIndex1 == horseIndex2){
			message.channel.send(`Horses cannot reproduce asexually`);
			return;
		}
		else if(horseIndex1 < 0 || horseIndex2 < 0){
			message.channel.send(`Index cannot be negative!`);
			return;
		}
		else{
			let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			let data = JSON.parse(database);
			let id = message.author.id;
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == id){
					if(!data.users[i].hasOwnProperty("horses")){
						data.users[i].horses = [];
					}
					if(data.users[i].horses.length < 2){
						message.channel.send(`You do not have enough horses!`);
						return;
					}
					else if(data.users[i].horses[horseIndex1].gender == data.users[i].horses[horseIndex2].gender){
						message.channel.send(`Only opposite gender horses can breed!`);
						return;
					}
					else{
						let newHorse = createHorse();
						newHorse.speed = Math.floor((newHorse.speed + data.users[i].horses[horseIndex1].speed + data.users[i].horses[horseIndex2].speed) / 3);
						newHorse.stamina = Math.floor((newHorse.stamina + data.users[i].horses[horseIndex1].stamina + data.users[i].horses[horseIndex2].stamina) / 3);
						newHorse.timeline = `${data.users[i].horses[horseIndex1].timeline}->${data.users[i].horses[horseIndex1].name}\n${data.users[i].horses[horseIndex2].timeline}->${data.users[i].horses[horseIndex2].name}\n${data.users[i].horses[horseIndex1].name}&${data.users[i].horses[horseIndex2].name}->${newHorse.name}\n`;
						let name = data.users[i].horses[horseIndex2].name;
						data.users[i].horses.splice(horseIndex1,1);
						for(let j=0;j<data.users[i].horses.length;j++){
							if(name == data.users[i].horses[j].name){
								horseIndex2 = j;
								break;
							}
						}
						data.users[i].horses.splice(horseIndex2,1);
						data.users[i].horses.push(newHorse);
						let horseEmbed = makeHorseEmbed(newHorse,data.users[i].name,message);
						message.channel.send(horseEmbed);
					}
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				}
			}
		}
	}
}

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
		console.log(buyer);
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
				console.log('horse sale ok');
				let price = parseInt(chop[chop.length-1]);
				if(buyer == seller){
					message.channel.send('You cannot sell to yourself!');
					return;
				}
				else if(isNaN(price) || price < 0){
					message.channel.send('Invalid amount entered!');
					return;
				}
				else{
					console.log('searching for user');
					let noUser = true;
					for(let i=0;i<data.users.length;i++){
						if(data.users[i].id == seller){
							console.log('seller found');
							let noBuy = true;
							if(!data.users[i].hasOwnProperty("horses")){
								message.channel.send('You dont own any horses!');
								return;
							}
							console.log('searching for buyer')
							for(let j=0;j<data.users.length;j++){
								if(data.users[j].id == buyer){
									console.log('horse buyer found');
									let horseIndex = parseInt(chop[chop.length-2]);
									//check if house
									if(horseIndex < 0 || horseIndex >= data.users[i].horses.length){
										message.channel.send('Invalid horse selected!');
										return;
									}
									else if(data.users[j].balance - price < 0){
										message.channel.send('Buyer doesnt have enough CC!');
										return;
									}
									else{
										let sellEnder = Date.now() + 60000;
										let sellInfo = {"seller":`${seller}`,"sellerIndex":`${i}`,"buyer":`${buyer}`,"buyerIndex":`${j}`,"price":`${price}`,"sellEnder":`${sellEnder}`,"type":`${horseIndex}`};
										let jsonBattle = JSON.stringify(sellInfo);
										fs.writeFileSync(`/home/mattguy/carlcoin/cache/${buyer}horseSell`,jsonBattle);
										message.channel.send(`${data.users[j].name}! Type !cc horseAccept to accept ${data.users[i].name}'s offer or type !cc horseDeny to reject the offer. You have 1 minute to respond.`);
										console.log(data.users[i].name + " trying to sell to " + data.users[j].name);
										return;
									}
									noBuy = false;
									break;
								}
							}
							if(noBuy){
								message.channel.send('Buyer doesnt exist!');
								return;
							}
						}
						noUser = false;
						break;
					}
					if(noUser){
						message.channel.send('You are not registered for CC!');
						return;
					}
				}
			}
		}
		console.log('something went wrong while selling horse');
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
			if(message.content.startsWith('!cc horseDeny')){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}horseSell`);
				message.channel.send('You have declined the offer');
			}
			else if(message.content.startsWith('!cc horseAccept')){
				if(data.users[sellParse.buyerIndex].balance - sellParse.price < 0){
					message.channel.send(`You don't have enough CC!`);
				}
				else{
					let price = parseInt(sellParse.price);
					data.users[sellParse.sellerIndex].balance += price;
					data.users[sellParse.buyerIndex].balance -= price;
					let horse = data.users[sellParse.sellerIndex].horses[parseInt(sellParse.type)];
					data.users[sellParse.sellerIndex].horses.splice(parseInt(sellParse.type),1);
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
					console.log(data.users[sellParse.sellerIndex].name + " has sold to " + data.users[sellParse.buyerIndex].name);
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
	message.channel.send(`Use !cc horsePurchase to buy a new horse for ${horsePrice}CC!\nUse !cc horseRace to enroll your horse in a race!\nUse !cc horseTrain to improve your horse's stats!\nUse !cc horseSell to sell your horse!\nUse !cc horseBreed to breed two of your horses! WARNING! THIS WILL RETIRE YOUR TWO HORSES!\nUse !cc horseList to see your horses!\nUse !cc horseStats to get a specific horses stats!\nUse !cc horseSell user horseIndex price to sell your horse!\nUse !cc horseAccept / !cc horseDeny to answer a purchase`);
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
	raceHorse,
	trainHorse,
	breedHorse,
	horseSell,
	acceptDenyHorse,
	horseHelp,
	horseStats,
	horseList,
	actualRace
};