const itemFile = require('./item.js');
class Character{
	//info about the character
	species;
	inventory;
	equipped;
	primaryHand;
	//info that is non-physical
	soul;
	name;
	weight;
	hitpoints;
	armorValue;
	dodgeValue;
	
	constructor(name, species, soul){
		this.name = name;
		this.species = species;
		this.primaryHand = this.species.rightHand;
		this.inventory = [];
		this.equipped = this.species.equipmentSlots;
		this.soul = soul;
		this.weight = this.species.weight;
		this.hitpoints = this.species.naturalVitality + this.soul.constitution;
		this.armorValue = this.species.naturalArmor + this.soul.strength;
		this.dodgeValue = this.species.naturalDodge + this.soul.dexterity;
	}
	description(){
		let returnString = `${this.name}, ${this.species.description()}${this.name} has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV.\n${this.checkInventory()}\n${this.checkEquipment()}\n${this.soul.stats()}`;
		return returnString;
	}
	checkInventory(){
		let returnString = `Inventory:\n`;
		if(this.inventory.length == 0){
			returnString += `Empty. `;
		}
		else{
			for(let i=0;i<this.inventory.length;i++){
				returnString += `${i}. ${this.inventory[i].name}\n`;
			}
		}
		return returnString;
	}
	checkEquipment(){
		let returnString = `Equipment:\n`;
		for(let i=0;i<this.equipped.length ;i++){
			returnString += `${this.equipped[i][0]}:${this.equipped[i][1].name}\n`;
		}
		return returnString;
	}
	//objects are pushed into the array
	putInInventory(item){
		this.inventory.push(item);
		this.weight += item.weight;
		return `${item.name} has been placed in your inventory!`;
	}
	//items are selected by index in inventory, therefore item = a number
	//after which the item itself is pushed into the slot
	equipItem(itemNum,slot){
		if(itemNum >= this.inventory.length || itemNum < 0){
			return `Invalid inventory slot selected!`;
		}
		let item = this.inventory[itemNum];
		if(!slot.includes(item.equipLocation)){
			return `Invalid equipment slot selected!`;
		}
		for(let i=0;i<this.equipped.length;i++){
			if(slot == this.equipped[i][0]){
				let returnString = '';
				this.inventory.splice(itemNum,1);
				if(this.equipped[i][1].name != 'Nothing'){
					returnString += this.equipped[i][1].name + ' has been placed in your inventory.\n';
					if(!isNaN(this.equipped[i][1].armorValue)){
						this.armorValue -= this.equipped[i][1].armorValue;
					}
					if(!isNaN(this.equipped[i][1].dodgeValue)){
						this.dodgeValue -= this.equipped[i][1].dodgeValue;
					}
					if(!isNaN(item.armorValue)){
						this.armorValue += item.armorValue;
					}
					if(!isNaN(item.dodgeValue)){
						this.dodgeValue += item.dodgeValue;
					}
					this.inventory.push(this.equipped[i][1]);
					this.equipped[i][1] = item;
				}
				else{
					if(!isNaN(item.armorValue)){
						this.armorValue += item.armorValue;
					}
					if(!isNaN(item.dodgeValue)){
						this.dodgeValue += item.dodgeValue;
					}
					this.equipped[i][1] = item;
				}
				returnString += `${item.name} has been equipped!`;
				return returnString;
			}
		}
	}
	attack(defender, target){
		let events = ``;
		let weapon = this.primaryHand.equipmentSlots[0][1];
		if(weapon.name == 'Nothing'){
			let weapon = new itemFile.Weapon(2,'Fist','Flesh','HeldObject',0,this.color);
		}
		let deflected = false;
		let attackerRoll = Math.floor(Math.random()*6) + this.soul.strength;
		let defenderArmorRoll = Math.floor(Math.random()*6) + defender.armorValue;
		let defenderDodgeRoll = Math.floor(Math.random()*6) + defender.dodgeValue;
		if(target != null){
			defenderArmorRoll += target.armorValue;
			defenderDodgeRoll += target.dodgeValue;
		}
		let defenderRoll = (defenderArmorRoll > defenderDodgeRoll) ? defenderArmorRoll : defenderDodgeRoll;
		//hit landed
		if(attackerRoll > defenderRoll){
			events += `${this.name} Hits! [${attackerRoll} vs. ${defenderRoll}]\n`;
			if(target != null){
				let damage = (weapon.damage + this.soul.strength) - target.armorValue;
				if(damage < 0){
					damage = 0;
					deflected = true;
					events += `The attack is deflected by ${defender.name}'s Armor!\n`;
				}
				target.hitpoints -= damage;
				if(target.hitpoints < 0){
					if(target.name == 'Torso'){
						events += `The attack caves into the ${defender.name}'s ${target.name}!\n`;
						defender.species.disconnectParts(target);
						defender.hitpoints = 0;
					}
					else if(target.name == 'Head'){
						events += `The attack sends the ${defender.name}'s ${target.name} flying off!\n`;
						defender.species.disconnectParts(target);
						defender.hitpoints = 0;
					}
					else{
						events += `The attack sends the ${defender.name}'s ${target.name} flying off!\n`;
						defender.species.disconnectParts(target);
						defender.hitpoints -= 10;
					}
				}
				else if(!deflected){
					events += `The attack cleaves at the ${defender.name}'s ${target.name} for ${damage} damage!\n`;
				}
			}
			else{
				let damage = (weapon.damage + this.soul.strength) - defender.armorValue;
				if(damage < 0){
					damage = 0;
					deflected = true;
					events += `The attack is deflected by ${defender.name}'s Armor!\n`;
				}
				if(!deflected){
					defender.hitpoints -= damage;
					events += `The attack cleaves at ${defender.name} for ${damage} damage!\n`;
				}
			}
		}
		//attack missed
		else{
			events += `${this.name} Misses! [${attackerRoll} vs. ${defenderRoll}]\n`;
		}
		return events;
	}
}

module.exports = {
	Character
};