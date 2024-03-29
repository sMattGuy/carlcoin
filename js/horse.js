const Discord = require('discord.js');
const fs = require('fs');

const colors = ['Appaloosa','Bay','Black','Brown','Buckskin','Chestnut','Cremello','Dun','Grey','Overo','Palomino','Piebald','Roan','Skewbald','Spotted','Tobiano'];
const genderType = ['Male','Female'];
const specialType = ['Speed Boost','Stamina Boost','Slipstream','Full Force','Vicious','Enforcer','Scary'];
/*
bonus:
	speed boost: 	speed boost +10
	stamina boost: stamina boost +10
	full force: 	increase stamina +10 & speed +10
beneficial:
	slipstream: 	increase position by 1
adversarial:
	enforcer:		horse behind stamina -10
	scary: 			horse behind speed -5
	vicious: 		horse behind stamina -10 & speed -5
*/
const firstPartName = ['Special','Silence','Tokai','Air','Condor','Oguri','Grass','Gold','Symboli','Taiki','Daiwa','T.M.','Narita','Hishi','Fuji','Mejiro','Seiun','Yukino','Manhattan','Tosen','Haru','Kawakami','Mejiro','Fine','Smart','Narita','Super','Inari','Nishino','Biko','Bamboo','Marvelous','Mihono','Sweep','Ines','Biwa','Sakura','Shinko','Agnes','Zenno','Meisho','Rice','Admire','Curren','Eishin','Nakayama','Mayano','Nice','King','Matikane','Ikuno','Daitaku','Twin','Seeking','Tamamo'];
const secondPartName = ['Week','Suzuka','Teio','Vodka','Groove','Pasa','Cap','Wonder','Ship','Rudolf','Shuttle','Scarlet','Opera','Brian','Amazon','Kiseki','Maruzensky','McQueen','Sky','Bijin','Ticket','Cross','Pearl','Cafe','Jordan','Urara','Princess','Ryan','Matikanefukukitaru','Motion','Falcon','Taishin','Shakur','City','Creek','One','Flower','Pegasus','Akebono','Memory','Sunday','Bourbon','Tosho','Fujin','Hayahide','Bakushin','Windy','Tachyon','Rob Roy','Doto','Shower','Vega','Chan','Digital','Flash','Festa','Top Gun','Dober','Nature','Halo','Tannhauser','Dictus','Helios','Turbo'];

//horse value definition
const horsePrice = 750;
const racerNeededSize = 5;

function showJockeys(client,message){
	let jockFile = fs.readFileSync('/home/mattguy/carlcoin/jockeys.json');
	let jock = JSON.parse(jockFile);
	let jockList = '';
	for(let i=0;i<jock.jockey.length;i++){
		let available = jock.jockey[i].hired ? 'Hired':'Available';
		jockList += `${i}. ${jock.jockey[i].name}, ${jock.jockey[i].price}CC, ${jock.jockey[i].wins}W/${jock.jockey[i].loss}L: ${available}\n`;
	}
	jockList += `${jock.jockey.length}. Random Jockey, 300CC, ?W/?L: Always\n`;
	message.channel.send(jockList,{code:true});
}

function jockeyHire(client,message){
	let chop = message.content.split(" ");
	//if too many arguments
	if(chop.length != 3){
		message.channel.send(`Usage: !cc jockeyHire <index>`);
		return;
	}
	else{
		let jockIndex = 0;
		try{
			jockIndex = parseInt(chop[chop.length-1]);
		}
		//if username cannot be gotten
		catch(err){
			message.channel.send(`Invalid index supplied`);
			return;
		}
		if(jockIndex < 0 || isNaN(jockIndex)){
			message.channel.send(`Jockey selection cannot be negative!`);
			return;
		}
		//start getting files
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		let id = message.author.id;
		let jockFile = fs.readFileSync('/home/mattguy/carlcoin/jockeys.json');
		let jock = JSON.parse(jockFile);
		if(jockIndex > jock.jockey.length){
			message.channel.send(`Invalid index selected!`);
			return;
		}
		if(jockIndex != jock.jockey.length){
			if(jock.jockey[jockIndex].hired){
				message.channel.send(`That Jockey has already been hired!`);
				return;
			}
		}
		if(fs.existsSync(`/home/mattguy/carlcoin/cache/horseRace.json`)){
			let raceRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/horseRace.json`);
			let raceFile = JSON.parse(raceRead);
			for(let j=0;j<raceFile.racers.length;j++){
				if(id == raceFile.racers[j].id){
					if(raceFile.racers[j].jocky.name != 'none'){
						message.channel.send(`You already hired a jockey!`);
						return;
					}
					for(let userIndex = 0;userIndex<data.users.length;userIndex++){
						if(id == data.users[userIndex].id){
							//do userside checks
							let boughtJockey = {};
							if(jockIndex == jock.jockey.length){
								//generate random jockey
								let pointsLeft = 10;
								let stamina = Math.floor(Math.random() * pointsLeft);
								pointsLeft -= stamina;
								let speed = Math.floor(Math.random() * pointsLeft);
								pointsLeft -= speed;
								let activate = pointsLeft;
								boughtJockey = {"name":"Nobody Norman","statModifier":[stamina,speed,activate],"price":300,"wins":0,"loss":0,"hired":false}
							}
							else{
								boughtJockey = jock.jockey[jockIndex];
							}
							if(data.users[userIndex].balance - boughtJockey.price < 0){
								message.channel.send(`You don't have enough Carl Coin!`);
								return;
							}
							data.users[userIndex].balance -= boughtJockey.price;
							data.econ -= boughtJockey.price;
							boughtJockey.hired = true;
							raceFile.racers[j].jocky = boughtJockey;
							//start writing to files
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							let newJock = JSON.stringify(jock);
							fs.writeFileSync('/home/mattguy/carlcoin/jockeys.json',newJock);
							let newRace = JSON.stringify(raceFile);
							fs.writeFileSync('/home/mattguy/carlcoin/cache/horseRace.json',newRace);
							message.channel.send(`You have hired ${boughtJockey.name} to support your horse this race!`);
							return;
						}
					}
					message.channel.send(`You are not registered for carlcoin!`);
					return;
				}
			}
		}
		else{
			message.channel.send(`No one has enrolled in the race for tonight!`);
			return;
		}
	}
}

function nameHorse(client, message){
	let chop = message.content.split(" ");
	//if too many arguments
	if(chop.length < 4){
		message.channel.send(`Usage: !cc horseName <index> new name for the horse you selected`);
	}
	else{
		let horseIndex = 0;
		try{
			horseIndex = parseInt(chop[chop.length-(chop.length - 2)]);
		}
		//if username cannot be gotten
		catch(err){
			message.channel.send(`Invalid index supplied`);
			return;
		}
		if(horseIndex < 0 || isNaN(horseIndex)){
			message.channel.send(`Horse selection cannot be negative!`);
			return;
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
						let newName = '';
						let nameBuild = 0;
						for(nameBuild = chop.length - (chop.length - 3); nameBuild < chop.length-1; nameBuild++){
							newName += `${chop[nameBuild]} `;
						}
						newName += `${chop[nameBuild]}`;
						let oldName = data.users[i].horses[horseIndex].name;
						data.users[i].horses[horseIndex].name = newName;
						data.users[i].horses[horseIndex].timeline += `${oldName} has been renamed to ${newName}\n`;
						message.channel.send(`${oldName} has been renamed to ${newName}!`);
						console.log(data.users[i].name + ' has changed their horses name from ' + oldName + ' to ' + newName);
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					}
				}
				return;
			}
		}
	}
}
function purchaseHorse(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	let cost = horsePrice;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			if(!data.users[i].hasOwnProperty("horses")){
				cost = 100;
			}
			else if(data.users[i].horses.length == 0){
				cost = 100;
			}
			if(data.users[i].balance < cost){
				message.channel.send(`You do not have enough CC! (Costs ${cost}CC)`);
				return;
			}
			else{
				let newHorse = createHorse();
				if(!data.users[i].hasOwnProperty("horses")){
					data.users[i].horses = [newHorse];
				}
				else{
					data.users[i].horses.push(newHorse);
				}
				const playercardEmbed = makeHorseEmbed(newHorse,data.users[i].name,message);
				message.channel.send(playercardEmbed);
				message.channel.send(`You have purchased ${newHorse.name}!`);
				console.log(data.users[i].name + ' has bought a horse');
				data.users[i].balance -= cost;
				data.econ -=  cost;
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
		message.channel.send(`Usage: !cc horseRace <index> <bet>`);
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
		if(horseIndex < 0 || isNaN(horseIndex)){
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
					let horse = data.users[i].horses[horseIndex].id;
					let userID = data.users[i].id;
					let name = data.users[i].name;
					let total = bet;
					data.users[i].balance -= bet;
					data.econ -= bet;
					let userPacket = {"name":`${name}`,"id":`${userID}`,"horse":horse,"bet":bet,"jocky":{"name":"none","statModifier":[0,0,0],"price":0,"wins":0,"loss":0}};
					if(fs.existsSync(`/home/mattguy/carlcoin/cache/horseRace.json`)){
						let raceRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/horseRace.json`);
						let raceFile = JSON.parse(raceRead);
						for(let j=0;j<raceFile.racers.length;j++){
							if(userID == raceFile.racers[j].id){
								message.channel.send(`You are already enrolled for the race!`);
								return;
							}
						}
						raceFile.total = parseInt(raceFile.total) + bet;
						raceFile.racers.push(userPacket);
						let raceFileSave = JSON.stringify(raceFile);
						fs.writeFileSync('/home/mattguy/carlcoin/cache/horseRace.json',raceFileSave);
					}
					else{
						let horseRace = {"total":total,"racers":[]};
						horseRace.racers.push(userPacket);
						let raceFile = JSON.stringify(horseRace);
						fs.writeFileSync('/home/mattguy/carlcoin/cache/horseRace.json',raceFile);
					}
					console.log(name + ' has enrolled ' + data.users[i].horses[horseIndex].name + ' into the race betting ' + bet +'CC')
					message.channel.send(`You have been enrolled for the race! The results will be in general at midnight!`);
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				}
				return;
			}
		}
	}
}
function checkRace(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/horseRace.json`)){
		let raceRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/horseRace.json`);
		let raceFile = JSON.parse(raceRead);
		let total = raceFile.total;
		let raceEvents = "";
		raceEvents += `Tonights race pot is so far ${total}CC\n`;
		for(let i=0;i<raceFile.racers.length;i++){
			let id = raceFile.racers[i].id;
			for(let userFinder = 0;userFinder < data.users.length;userFinder++){
				if(data.users[userFinder].id == id){
					let horseFound = false;
					for(let horseFinder = 0; horseFinder < data.users[userFinder].horses.length; horseFinder++){
						if(data.users[userFinder].horses[horseFinder].id === raceFile.racers[i].horse){
							horseFound = true;
							let horse = JSON.parse(JSON.stringify(data.users[userFinder].horses[horseFinder]));
							raceEvents += `${horse.name} owned by ${raceFile.racers[i].name} who bet ${raceFile.racers[i].bet}CC`;
							if(raceFile.racers[i].jocky.name != "none"){
								raceEvents += ` who is supported by ${raceFile.racers[i].jocky.name}!`;
							}
							raceEvents += `\n`;
							break;
						}
					}
					if(!horseFound){
						raceEvents += `${raceFile.racers[i].name}'s horse could not be found!\n`;
					}
					break;
				}
			}
		}
		message.channel.send(raceEvents);
	}
	else{
		message.channel.send(`No one is enrolled for the races tonight`)
	}
}
function actualRace(client,message){
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/horseRace.json`)){
		let uniquePart = secondPartName[Math.floor(Math.random()*secondPartName.length)];
		let todaysDate = new Date();
		let raceDate = `${todaysDate.getMonth() + 1}-${todaysDate.getDate()}-${todaysDate.getFullYear()}`
		let raceName = `The ${uniquePart} Derby of ${raceDate}`;
		let raceRead = fs.readFileSync(`/home/mattguy/carlcoin/cache/horseRace.json`);
		let raceFile = JSON.parse(raceRead);
		let total = raceFile.total;
		let horses = [];
		let raceEvents = "";
		for(let i=0;i<raceFile.racers.length;i++){
			let id = raceFile.racers[i].id;
			for(let userFinder = 0;userFinder < data.users.length;userFinder++){
				if(data.users[userFinder].id == id){
					let horseFound = false;
					for(let horseFinder = 0; horseFinder < data.users[userFinder].horses.length; horseFinder++){
						if(data.users[userFinder].horses[horseFinder].id === raceFile.racers[i].horse){
							horseFound = true;
							let horse = JSON.parse(JSON.stringify(data.users[userFinder].horses[horseFinder]));
							let name = raceFile.racers[i].name;
							let currentHorse = {"name":`${name}`,"id":`${id}`,"bet":raceFile.racers[i].bet,"horse":horse,"jocky":raceFile.racers[i].jocky};
							horses.push(currentHorse);
							break;
						}
					}
					if(!horseFound){
						raceEvents += `${raceFile.racers[i].name}'s horse could not be found!\n`;
					}
					break;
				}
			}
		}
		if(horses.length < racerNeededSize){
			let i = racerNeededSize - horses.length;
			for(i;i!=0;i--){
				let AIHorse = createHorse();
				total += 100;
				let owner = `AI${i}`;
				let airacer = {"name":`${owner}`,"id":`${owner}`,"horse":AIHorse,"bet":100,"jocky":{"name":"none","statModifier":[0,0,0],"price":0,"wins":0,"loss":0}};
				horses.push(airacer);
			}
		}
		let racePos = [];
		for(let i=0;i<horses.length;i++){
			//pushes horseID onto race position
			console.log(i + '. ' + horses[i].horse.name);
			racePos.push(i);
		}
		raceEvents += `Welcome to ${raceName}, There are ${horses.length} horses today racing. The pot today is ${total}\n`;
		for(let raceSize=100;raceSize!=0;raceSize--){
			raceEvents += `Current standings:\n`;
			for(let places = 0;places < racePos.length;places++){
				raceEvents += `${places + 1}. ${horses[racePos[places]].horse.name} `;
				if(horses[racePos[places]].jocky.name != "none"){
					raceEvents += `supported by ${horses[racePos[places]].jocky.name}, `;
				}
				raceEvents += `owned by ${horses[racePos[places]].name} who bet ${horses[racePos[places]].bet}CC\n`;
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
				if(pos != 0){
					horseInFront = horses[racePos[pos-1]];
				}
				//get horse infront
				if(pos != racePos.length - 1){
					horseBehind = horses[racePos[pos+1]];
				}
				if(horseInFront.id != 'noPerson'){
					let currentHorseSpeed = 0;
					let challengerHorseSpeed = 0;
					
					let currMax = horses[racePos[pos]].horse.speed + horses[racePos[pos]].jocky.statModifier[1];
					let currMin = (horses[racePos[pos]].horse.speed + horses[racePos[pos]].jocky.statModifier[1]) * 0.75;
					currentHorseSpeed = Math.floor(Math.random()*(currMax - currMin + 1)) + currMin;
					
					let challMax = horseInFront.horse.speed + horseInFront.jocky.statModifier[1];
					let challMin = (horseInFront.horse.speed + horseInFront.jocky.statModifier[1]) * 0.75;
					challengerHorseSpeed = Math.floor(Math.random()*(challMax - challMin + 1)) + challMin;
					
					if(currentHorseSpeed > challengerHorseSpeed){
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
					raceEvents += `${horses[racePos[pos]].horse.name} is in first!\n`;
				}
				//special ability
				let specialChance = Math.random() + (horses[racePos[newPos]].jocky.statModifier[2] * 0.01);
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
					if(newPos != 0){
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
				else if(horses[racePos[newPos]].horse.special == 'Vicious' && specialChance >= 0.90){
					raceEvents += `${horses[racePos[newPos]].horse.name} activated ${horses[racePos[newPos]].horse.special}!\n`;
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
				else if(horses[racePos[newPos]].horse.special == 'Enforcer' && specialChance >= 0.85){
					raceEvents += `${horses[racePos[newPos]].horse.name} activated ${horses[racePos[newPos]].horse.special}!\n`;
					horseBehind = {"id":"noPerson"};
					if(newPos + 1 < racePos.length){
						horseBehind = horses[racePos[newPos+1]];
					}
					if(horseBehind.id != 'noPerson'){
						horses[racePos[newPos+1]].horse.stamina -= 10;
						raceEvents += `${horses[racePos[newPos]].horse.name} has knocked into ${horses[racePos[newPos+1]].horse.name}!\n`;
					}
					else{
						raceEvents += `${horses[racePos[newPos]].horse.name} has no one behind them!\n`;
					}
				}
				else if(horses[racePos[newPos]].horse.special == 'Scary' && specialChance >= 0.85){
					raceEvents += `${horses[racePos[newPos]].horse.name} activated ${horses[racePos[newPos]].horse.special}!\n`;
					horseBehind = {"id":"noPerson"};
					if(newPos + 1 < racePos.length){
						horseBehind = horses[racePos[newPos+1]];
					}
					if(horseBehind.id != 'noPerson'){
						horses[racePos[newPos+1]].horse.speed -= 5;
						raceEvents += `${horses[racePos[newPos]].horse.name} has given a menacing glare to ${horses[racePos[newPos+1]].horse.name}!\n`;
					}
					else{
						raceEvents += `${horses[racePos[newPos]].horse.name} has no one behind them!\n`;
					}
				}
				//end of specials
				horses[racePos[newPos]].horse.stamina += Math.floor(Math.random() * horses[racePos[newPos]].jocky.statModifier[0]);
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
		raceEvents += `The Race is over, Here are the results:\n`;
		let firstPlace = {};
		let secondPlace = {};
		let thirdPlace = {};
		for(let i=0;i<racePos.length;i++){
			raceEvents += `${i + 1}. ${horses[racePos[i]].horse.name}\n`;
			if(i == 0){
				firstPlace = horses[racePos[i]];
			}
			else if(i == 1){
				secondPlace = horses[racePos[i]];
			}
			else if(i == 2){
				thirdPlace = horses[racePos[i]];
			}
		}
		
		let originalTotal = total;
		
		let firstWinnings = Math.floor(total / 2);
		total -= firstWinnings;
		let secondWinnings = Math.floor(total / 2);
		total -= secondWinnings;
		let thirdWinnings = total;
		let victory = 'Placements:\n';
		let jockFile = fs.readFileSync('/home/mattguy/carlcoin/jockeys.json');
		let jock = JSON.parse(jockFile);
		for(let i=0;i<jock.jockey.length;i++){
			for(let j=0;j<horses.length;j++){
				if(jock.jockey[i].name == horses[j].jocky.name){
					jock.jockey[i].loss += 1;
				}
			}
			jock.jockey[i].hired = false;
		}
		for(let i=0;i<data.users.length;i++){
			if(data.users[i].id == firstPlace.id){
				let winnings = Math.floor(firstWinnings * (parseInt(firstPlace.bet) / originalTotal)) + parseInt(firstPlace.bet);
				data.users[i].balance +=  winnings;
				console.log('First place ' + winnings);
				raceEvents += `${data.users[i].name} won first place! They got ${winnings}CC!\n`;
				victory += `${data.users[i].name} won first place! They got ${winnings}CC!\n`;
				data.econ += winnings;
				let issue = true;
				for(let j=0;j<data.users[i].horses.length;j++){
					if(data.users[i].horses[j].id == firstPlace.horse.id){
						issue = false;
						data.users[i].horses[j].timeline += `${data.users[i].horses[j].name}, `
						if(firstPlace.jocky.name != "none"){
							data.users[i].horses[j].timeline += `supported by ${firstPlace.jocky.name}, `;
						}
						data.users[i].horses[j].timeline += `First Place Winner of ${raceName}, earning ${winnings}CC\n`;
						break;
					}
				}
				for(let j=0;j<jock.jockey.length;j++){
					if(jock.jockey[j].name == firstPlace.jocky.name){
						jock.jockey[j].wins += 1;
						jock.jockey[j].loss -= 1;
					}
				}
				if(issue){
					console.log('failed to give accolade for first to ' + data.users[i].name);
				}
			}
			else if(data.users[i].id == secondPlace.id){
				let winnings = Math.floor(secondWinnings * (parseInt(secondPlace.bet) / originalTotal)) + parseInt(secondPlace.bet);
				data.users[i].balance +=  winnings;
				console.log('Second place ' + winnings);
				raceEvents += `${data.users[i].name} won second place! They got ${winnings}CC!\n`;
				victory += `${data.users[i].name} won second place! They got ${winnings}CC!\n`;
				data.econ += winnings;
				let issue = true;
				for(let j=0;j<data.users[i].horses.length;j++){
					if(data.users[i].horses[j].id == secondPlace.horse.id){
						issue = false;
						data.users[i].horses[j].timeline += `${data.users[i].horses[j].name}, `
						if(secondPlace.jocky.name != "none"){
							data.users[i].horses[j].timeline += `supported by ${secondPlace.jocky.name}, `;
						}
						data.users[i].horses[j].timeline += `Second Place Winner of ${raceName}, earning ${winnings}CC\n`;
						break;
					}
				}
				for(let j=0;j<jock.jockey.length;j++){
					if(jock.jockey[j].name == secondPlace.jocky.name){
						jock.jockey[j].wins += 1;
						jock.jockey[j].loss -= 1;
					}
				}
				if(issue){
					console.log('failed to give accolade for second to ' + data.users[i].name);
				}
			}
			else if(data.users[i].id == thirdPlace.id){
				let winnings = Math.floor(thirdWinnings * (parseInt(thirdPlace.bet) / originalTotal)) + parseInt(thirdPlace.bet);
				data.users[i].balance +=  winnings;
				console.log('Third place ' + winnings);
				raceEvents += `${data.users[i].name} won third place! They got ${winnings}CC!\n`;
				victory += `${data.users[i].name} won third place! They got ${winnings}CC!\n`;
				data.econ += winnings;
				let issue = true;
				for(let j=0;j<data.users[i].horses.length;j++){
					if(data.users[i].horses[j].id == thirdPlace.horse.id){
						issue = false;
						data.users[i].horses[j].timeline += `${data.users[i].horses[j].name}, `
						if(thirdPlace.jocky.name != "none"){
							data.users[i].horses[j].timeline += `supported by ${thirdPlace.jocky.name}, `;
						}
						data.users[i].horses[j].timeline += `Third Place Winner of ${raceName}, earning ${winnings}CC\n`;
						break;
					}
				}
				for(let j=0;j<jock.jockey.length;j++){
					if(jock.jockey[j].name == thirdPlace.jocky.name){
						jock.jockey[j].wins += 1;
						jock.jockey[j].loss -= 1;
					}
				}
				if(issue){
					console.log('failed to give accolade for third to ' + data.users[i].name);
				}
			}
		}
		let newData = JSON.stringify(data);
		fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
		let newJock = JSON.stringify(jock);
		fs.writeFileSync('/home/mattguy/carlcoin/jockeys.json',newJock);
		
		client.guilds.cache.forEach((guild) => {
			try{
				guild.channels.cache.find((x) => x.name == 'general').send(`Here are today's horse race results\n${victory}`,{files:["/home/mattguy/carlcoin/cache/horseRaceEvents.txt"]});
			}
			catch(err){
				console.log("no general chat in "+guild.name);
			}
		});
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
		message.channel.send(`Usage: !cc horseTrain <index / all>`);
	}
	else{
		let horseIndex = 0;
		let trainAll = false;
		try{
			if(chop[chop.length-1] == 'all'){
				trainAll = true;
			}
			else{
				horseIndex = parseInt(chop[chop.length-1]);
			}
		}
		//if username cannot be gotten
		catch(err){
			message.channel.send(`Invalid index supplied`);
			return;
		}
		if(isNaN(horseIndex) || horseIndex < 0){
			message.channel.send(`Horse selection cannot be negative!`);
			return;
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
				else if(trainAll){
					let massTrain = '';
					console.log(data.users[i].name + ' is training all their horses');
					for(let allHorseIndex = 0; allHorseIndex < data.users[i].horses.length; allHorseIndex++){
						if(data.users[i].horses[allHorseIndex].trainingCooldown > Date.now()){
							let timeLeftClaim = data.users[i].horses[allHorseIndex].trainingCooldown - Date.now();
							timeLeftClaim = Math.floor(timeLeftClaim / 1000);
							timeLeftClaim = Math.floor(timeLeftClaim / 60);
							massTrain += `You trained ${data.users[i].horses[allHorseIndex].name} recently! Try again in ${timeLeftClaim} mins!\n`;
						}
						else{
							let staminaChance = Math.random();
							let speedChance = Math.random();
							let staminaAmount = Math.floor(Math.random()*5)+1;
							let speedAmount = Math.floor(Math.random()*5)+1;
							massTrain += `You start training ${data.users[i].horses[allHorseIndex].name}...\n`;
							if(staminaChance >= 0.25){
								data.users[i].horses[allHorseIndex].stamina = parseInt(data.users[i].horses[allHorseIndex].stamina) + staminaAmount;
								if(data.users[i].horses[allHorseIndex].stamina > 150){
									data.users[i].horses[allHorseIndex].stamina = 150;
								}
								massTrain += `${data.users[i].horses[allHorseIndex].name} improved their stamina by ${staminaAmount} points!\n`;
							}
							if(speedChance >= 0.75){
								data.users[i].horses[allHorseIndex].speed = parseInt(data.users[i].horses[allHorseIndex].speed) + speedAmount;
								if(data.users[i].horses[allHorseIndex].speed > 150){
									data.users[i].horses[allHorseIndex].speed = 150;
								}
								massTrain += `${data.users[i].horses[allHorseIndex].name} improved their speed by ${speedAmount} points!\n`;
							}
							massTrain += `Training complete for ${data.users[i].horses[allHorseIndex].name}!\n`;
							data.users[i].horses[allHorseIndex].trainingCooldown = Date.now() + 21600000;
							if(massTrain.length >= 1000){
								message.channel.send(massTrain);
								massTrain = '';
							}
						}
					}
					if(massTrain.length != 0){
						message.channel.send(massTrain);
					}
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
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
						console.log(data.users[i].name + ' is training ' + data.users[i].horses[horseIndex].name);
						let staminaChance = Math.random();
						let speedChance = Math.random();
						let staminaAmount = Math.floor(Math.random()*5)+1;
						let speedAmount = Math.floor(Math.random()*5)+1;
						let results = `You start training ${data.users[i].horses[horseIndex].name}...\n`;
						if(staminaChance >= 0.25){
							data.users[i].horses[horseIndex].stamina = parseInt(data.users[i].horses[horseIndex].stamina) + staminaAmount;
							if(data.users[i].horses[horseIndex].stamina > 150){
								data.users[i].horses[horseIndex].stamina = 150;
							}
							results += `${data.users[i].horses[horseIndex].name} improved their stamina by ${staminaAmount} points!\n`;
						}
						if(speedChance >= 0.75){
							data.users[i].horses[horseIndex].speed = parseInt(data.users[i].horses[horseIndex].speed) + speedAmount;
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
		message.channel.send('Usage: !cc horseBreed <index1> <index2>');
	}
	else{
		let horseIndex1 = 0;
		let horseID1 = 0;
		let horseIndex2 = 0;
		let horseID2 = 0;
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
		else if(isNaN(horseIndex1) || isNaN(horseIndex2)){
			message.channel.send(`Invalid Index!`);
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
						console.log(data.users[i].name + ' is breeding ' + data.users[i].horses[horseIndex1].name + ' and ' + data.users[i].horses[horseIndex2].name);
						let newHorse = createHorse();
						newHorse.speed = Math.floor((newHorse.speed + data.users[i].horses[horseIndex1].speed + data.users[i].horses[horseIndex2].speed) / 3);
						newHorse.stamina = Math.floor((newHorse.stamina + data.users[i].horses[horseIndex1].stamina + data.users[i].horses[horseIndex2].stamina) / 3);
						
						let newHorseTimeline = `${data.users[i].horses[horseIndex1].timeline}\n${data.users[i].horses[horseIndex2].timeline}\n${data.users[i].horses[horseIndex1].name}&${data.users[i].horses[horseIndex2].name}->${newHorse.name}\n`;
						
						newHorse.timeline = newHorseTimeline;
						
						horseID1 = data.users[i].horses[horseIndex1].id;
						horseID2 = data.users[i].horses[horseIndex2].id;
						//deletion start
						data.users[i].horses.splice(horseIndex1,1);
						for(let j=0;j<data.users[i].horses.length;j++){
							if(horseID2 == data.users[i].horses[j].id){
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
		message.channel.send('Usage: !cc horseSell <user> <index> <price>');
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
									if(horseIndex < 0 || horseIndex >= data.users[i].horses.length || isNaN(horseIndex)){
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
										console.log(data.users[j].name + " trying to sell a horse to " + data.users[j].name);
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
					horse.timeline += `${data.users[sellParse.sellerIndex].name} has sold ${horse.name} to data.users[sellParse.buyerIndex].name\n`;
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
					console.log(data.users[sellParse.sellerIndex].name + " has sold a horse to " + data.users[sellParse.buyerIndex].name);
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
				console.log(data.users[i].name + ' is checking their horses');
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
		message.channel.send(`Usage: !cc horseStats <index / all>`);
	}
	else{
		let horseIndex = 0;
		let horseAll = false;
		try{
			if(chop[chop.length-1] === 'all'){
				horseAll = true;
			}
			else{
				horseIndex = parseInt(chop[chop.length-1]);
			}
		}
		//if username cannot be gotten
		catch(err){
			message.channel.send(`Invalid index supplied`);
			return;
		}
		if(horseIndex < 0 || isNaN(horseIndex)){
			message.channel.send(`Horse selection cannot be negative!`);
			return;
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
						if(horseAll){
							for(let j=0;j<data.users[i].horses.length;j++){
								let horse = data.users[i].horses[j];
								const playercardEmbed = makeHorseEmbed(horse,data.users[i].name,message);
								message.channel.send(playercardEmbed);
								console.log(data.users[i].name + ' has checked their horse stats for ' + horse.name);
							}
						}
						else{
							let horse = data.users[i].horses[horseIndex];
							const playercardEmbed = makeHorseEmbed(horse,data.users[i].name,message);
							message.channel.send(playercardEmbed);
							console.log(data.users[i].name + ' has checked their horse stats for ' + horse.name);
						}
					}
				}
				return;
			}
		}
	}
}

function horseHelp(client,message){
	message.channel.send(`Use !cc horsePurchase to buy a new horse for ${horsePrice}CC! First horse costs 100CC!\nUse !cc horseRace <index> <bet> to enroll your horse in a race!\nUse !cc horseTrain <index / all> to improve your horse's stats!\nUse !cc horseSell <user> <index> <price> to sell your horse!\nUse !cc horseBreed <index1> <index2> to breed two of your horses! WARNING! THIS WILL RETIRE YOUR TWO HORSES!\nUse !cc horseList to see your horses!\nUse !cc horseStats <index / all> to get a specific horses stats!\nUse !cc horseAccept / !cc horseDeny to answer a purchase\nUse !cc horseName <index> <name> to change your horses name, the name can have spaces in it as well!\nUse !cc checkRace who is in the race\nUse !cc showJockeys to see the jockys available!\nUse !cc jockeyHire <index> to hire a specific jockey!`);
}

function makeHorseEmbed(newHorse,name,message){
	let trainCD = 'Training available';
	if(newHorse.trainingCooldown > Date.now()){
		let timeLeftClaim = newHorse.trainingCooldown - Date.now();
		timeLeftClaim = Math.floor(timeLeftClaim / 1000);
		timeLeftClaim = Math.floor(timeLeftClaim / 60);
		trainCD = `${timeLeftClaim} mins until ready`;
	}
	let horseSite = `<!DOCTYPE html> <html> <head> <title> ${newHorse.name}'s Timeline </title> <style> body, form{ margin: 0 auto; max-width:652px; overflow-x:hidden; background-color:#CCCCFF;}fieldset{ display: flex;}</style></head><body><h1>${newHorse.name}'s Timeline</h1><p style="white-space: pre-line">${newHorse.timeline}</p></body></html>`;
	if(fs.existsSync(`/var/www/html/carlHorses/${newHorse.id}timeline.html`)){
		fs.unlinkSync(`/var/www/html/carlHorses/${newHorse.id}timeline.html`);
	}
	let horseTimelineWrite = horseSite;
	fs.writeFileSync(`/var/www/html/carlHorses/${newHorse.id}timeline.html`,horseTimelineWrite);
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
			{ name: 'Training CD', value: `${trainCD}`, inline: true },
			{ name: 'Timeline', value: `[Click Here](http://67.244.23.211:4377/carlHorses/${newHorse.id}timeline.html)`},
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
	let birthday = today.getDate();
	if(birthday > 28){
		birthday = 28;
	}
	let newHorse = {"id":`${Date.now()}`,"name":`${name}`,"stamina":stamina,"speed":speed,"color":`${color}`,"height":height,"weight":weight,"gender":`${gender}`,"special":`${specialAbility}`,"age":age,"birthday":birthday,"trainingCooldown":0,"timeline":`Unknown -> ${name}\n`};
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
	actualRace,
	createHorse,
	nameHorse,
	checkRace,
	showJockeys,
	jockeyHire
};
