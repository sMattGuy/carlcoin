const soulFile = require('./soul.js');
const speciesFile = require('./species.js');
const itemFile = require('./item.js');
const characterFile = require('./character.js');
const fs = require('fs');

let soul = new soulFile.Soul();
soul.strength = 10;
soul.constitution = 5;
soul.wisdom = 3;
soul.dexterity = 8;
soul.intelligence = 7;
soul.charisma = 15;
let results = 'Creating a new soul\n';
results += soul.description() + '\n';
results += soul.stats() + '\n';
fs.writeFileSync('./results/soul.txt',results);

results = 'Creating a human\n';
let h = new speciesFile.Human('White','Brown','Grey');
results += h.fullbodyStatus() + '\n';
results += h.listBodyParts() + '\n';
results += h.description() + '\n';
fs.writeFileSync('./results/species.txt',results);

results = 'Creating new character\n';
let c = new characterFile.Character('Tony',h,soul);
results += c.description();
fs.writeFileSync('./results/character.txt',results);

results = 'Creating new items\n';
let axe = new itemFile.Weapon(10,'Axe','Iron','HeldObject',10,'Grey');
results += axe.description() + '\n';
fs.writeFileSync('./results/items.txt',results);

results = 'Equipping items\n';
results += c.putInInventory(axe) + '\n';
results += c.checkInventory() + '\n';
results += c.equipItem(0,'rightHeldObject') + '\n';
fs.writeFileSync('./results/equip.txt',results);

let enemySoul = new soulFile.Soul();
enemySoul.strength = 2;
enemySoul.constitution = 2;
enemySoul.wisdom = 2;
enemySoul.dexterity = 2;
enemySoul.intelligence = 2;
enemySoul.charisma = 2;

let enemyBody = new speciesFile.Human('Red','Red','Red');

let enemyCharacter = new characterFile.Character('Evil',enemyBody,enemySoul);


console.log(c.attack(enemyCharacter,enemyCharacter.species.head));
console.log(enemyCharacter.description());
console.log(enemyCharacter.species.listBodyParts())

