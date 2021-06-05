const soulFile = require('./soul.js');
const speciesFile = require('./species.js');
const itemFile = require('./item.js');
const characterFile = require('./character.js');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let s = new soulFile.Soul();
let es = new soulFile.Soul();
s.strength = Math.floor(Math.random()*5)+1;
s.constitution = Math.floor(Math.random()*5)+1;
s.wisdom = Math.floor(Math.random()*5)+1;
s.dexterity = Math.floor(Math.random()*5)+1;
s.intelligence = Math.floor(Math.random()*5)+1;
s.charisma = Math.floor(Math.random()*5)+1;

es.strength = 1;
es.constitution = 1;
es.wisdom = 1;
es.dexterity = 1;
es.intelligence = 1;
es.charisma = 1;

let h = new speciesFile.Human('Blue','Blue','Blue');
let eh = new speciesFile.CreepyCrawler('Red','Red','Red');

let c = new characterFile.Character('Hero', h, s, h.rightHand);
let ec = new characterFile.Character('Villian', eh, es, eh.hand1);

let sword = new itemFile.Weapon(5,'Sword','Iron','heldObject',6,'Grey');
let coat = new itemFile.Armor(4,-2,'Leather Jacket','Leather','coat',8,'Grey');

console.log(c.putInInventory(sword));
console.log(c.putInInventory(coat));
console.log(ec.putInInventory(sword));
console.log(ec.putInInventory(coat));

console.log(c.equipItem(0,c.species.rightHand,'heldObject'));
console.log(c.equipItem(0,c.species.torso,'coat'));

console.log(c.description());

let turn = 0;

loop();

function loop(){
	let ecBodyParts = ``;
	let i=0
	for(i=0;i<ec.species.bodyParts.length;i++){
		if(ec.species.bodyParts[i] == ec.primaryHand){
			ecBodyParts += `${i}. ${ec.species.bodyParts[i].name} (Primary)\n`;
		}
		else{
			ecBodyParts += `${i}. ${ec.species.bodyParts[i].name}\n`;
		}
	}
	ecBodyParts += `${i}. No target\n`
	console.log(`${ecBodyParts}`);
	rl.question(`turn ${turn}. Attack: type body part number to attack: `, function(response){
		console.clear();
		if(response == null){
			console.log(c.attack(ec, null));
		}
		else{
			console.log(c.attack(ec, ec.species.bodyParts[parseInt(response)]));
		}
		let attackMode = Math.random();
		let bodypart = Math.floor(Math.random() * c.species.bodyParts.length);
		let attackFinal = (attackMode >= 0.5) ? null : c.species.bodyParts[bodypart];
		console.log(ec.attack(c, attackFinal));
		console.log(`Debug:\n${c.name} ${c.hitpoints}\n${ec.name} ${ec.hitpoints}\n`);
		if(c.hitpoints <= 0 || ec.hitpoints <= 0){
			rl.close();
			return;
		}
		else{
			turn++;
			return loop();
		}
	});
}





