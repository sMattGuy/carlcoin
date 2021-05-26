const Discord = require('discord.js');
const fs = require('fs');

const colors = ['Appaloosa','Bay','Black','Brown','Buckskin','Chestnut','Cremello','Dun','Grey','Overo','Palomino','Piebald','Roan','Skewbald','Spotted','Tobiano'];
const genderType = ['Male','Female'];
const specialType = ['Speed Boost','Stamina Boost','Slipstream','Full Force','Vicious'];

const firstPartName = ['Special','Silence','Tokai','Air','Condor','Oguri','Grass','Gold','Symboli','Taiki','Daiwa','T.M.','Narita','Hishi','Fuji','Mejiro','Seiun','Yukino','Manhattan','Tosen','Haru','Kawakami','Mejiro','Fine','Smart','Narita','Super','Inari','Nishino','Biko','Bamboo','Marvelous','Mihono','Sweep','Ines','Biwa','Sakura','Shinko','Agnes','Zenno','Meisho','Rice','Admire','Curren','Eishin','Nakayama','Mayano','Nice','King','Matikane','Ikuno','Daitaku','Twin','Seeking','Tamamo'];
const secondPartName = ['Week','Suzuka','Teio','Vodka','Groove','Pasa','Cap','Wonder','Ship','Rudolf','Shuttle','Scarlet','Opera','Brian','Amazon','Kiseki','Maruzensky','McQueen','Sky','Bijin','Ticket','Cross','Pearl','Cafe','Jordan','Urara','Princess','Ryan','Matikanefukukitaru','Motion','Falcon','Taishin','Shakur','City','Creek','One','Flower','Pegasus','Akebono','Memory','Sunday','Bourbon','Tosho','Fujin','Hayahide','Bakushin','Windy','Tachyon','Rob Roy','Doto','Shower','Vega','Chan','Digital','Flash','Festa','Top Gun','Dober','Nature','Halo','Tannhauser','Dictus','Helios','Turbo'];

//horse value definition
const horsePrice = 0;

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
	let newHorse = {"name":`${name}`,"stamina":`${stamina}`,"speed":`${speed}`,"color":`${color}`,"height":`${height}`,"weight":`${weight}`,"gender":`${gender}`,"special":`${specialAbility}`,"age":`${age}`,"isBirthday":"true","birthday":`${today.getDate()}`};
	console.log(newHorse);
	return newHorse;
}

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
				const playercardEmbed = new Discord.MessageEmbed()
					.setColor('#F7931A')
					.setTitle(`${newHorse.name}'s stats`)
					.setAuthor(`${data.users[i].name}`, `${message.author.displayAvatarURL()}`)
					.setThumbnail('https://i.imgur.com/0aDFif9.png')
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
					)
				message.channel.send(playercardEmbed);
				message.channel.send(`You have purchased ${newHorse.name}!`);
				data.users[i].balance -= horsePrice;
				data.econ -=  horsePrice;
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			}
		}
	}
}

function raceHorse(client,message){
	
}

function trainHorse(client,message){
	
}

function breedHorse(client,message){
	
}

function horseHelp(client,message){
	
}

//export functions
module.exports = {
	createHorse,
	purchaseHorse,
	raceHorse,
	trainHorse,
	breedHorse,
	horseHelp
};