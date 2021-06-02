const soulFile = require('./soul.js');
const bodyFile = require('./body.js');
const speciesFile = require('./species.js');
const weaponFile = require('./weapon.js');
const armorFile = require('./armor.js');
const characterFile = require('./character.js');
const userCommandsFile = require('./userCommands.js');

console.log('Creating a new soul');
let soul = new soulFile.Soul();
soul.strength = 10;
soul.constitution = 5;
soul.wisdom = 3;
soul.dexterity = 8;
soul.intelligence = 7;
soul.charisma = 15;
console.log(soul.description());
console.log(soul.stats());

console.log('Creating a new human');
let h = new speciesFile.Human();
console.log(h.description());

console.log('Creating new character');
let c = new characterFile.Character('tony',h,soul);
console.log(c.description());

console.log('Creating a weapon for our character');
let a = new weaponFile.Axe();
console.log(a.description());

console.log('Creating breastplate for our character');
let b = new armorFile.Breastplate();
console.log(b.description());

console.log('Giving weapon to character');
//find equipment slot
let equipmentArea = 'rightHeldObject';
for(let i=0;i<c.equipped.length;i++){
	if(c.equipped[i][0] == equipmentArea){
		c.equipped[i][1] = a;
		c.weight += a.weight;
	}
}
console.log(c.species.rightHand.description());

c.inventory.push(b)

console.log('Character after equipping items');
console.log(c.description());

console.log('Printing out every limb of a character');
console.log(c.species.fullbodyStatus());

console.log('standalone inventory check');
console.log(userCommandsFile.checkInventory(c));

console.log('standalone equipment check');
console.log(userCommandsFile.checkEquipment(c));
