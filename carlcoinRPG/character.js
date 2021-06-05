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
	
	constructor(name, species, soul, primaryHand){
		this.name = name;
		this.species = species;
		this.primaryHand = primaryHand;
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
	equipItem(itemNum,limb,slot){
		if(itemNum >= this.inventory.length || itemNum < 0){
			return `Invalid inventory slot selected!`;
		}
		let item = this.inventory[itemNum];
		if(!slot.includes(item.equipLocation)){
			return `Invalid equipment slot selected!`;
		}
		let limbExists = false;
		for(let i=0;i<this.species.bodyParts.length;i++){
			if(this.species.bodyParts[i] === limb){
				limbExists = true;
			}
		}
		if(!limbExists){
			return `Limb could not be found!`;
		}
		for(let i=0;i<limb.equipmentSlots.length;i++){
			if(slot == limb.equipmentSlots[i][0]){
				let returnString = '';
				this.inventory.splice(itemNum,1);
				if(this.equipped[i][1].name != 'Nothing'){
					returnString += limb.equipmentSlots[i][1].name + ' has been placed in your inventory.\n';
					if(!isNaN(limb.equipmentSlots[i][1].armorValue)){
						this.armorValue -= limb.equipmentSlots[i][1].armorValue;
						limb.armorValue -= limb.equipmentSlots[i][1].armorValue;
					}
					if(!isNaN(limb.equipmentSlots[i][1].dodgeValue)){
						this.dodgeValue -= limb.equipmentSlots[i][1].dodgeValue;
						limb.dodgeValue -= limb.equipmentSlots[i][1].dodgeValue;
					}
					if(!isNaN(item.armorValue)){
						this.armorValue += item.armorValue;
						limb.armorValue += item.armorValue;
					}
					if(!isNaN(item.dodgeValue)){
						this.dodgeValue += item.dodgeValue;
						limb.dodgeValue += item.dodgeValue;
					}
					this.inventory.push(limb.equipmentSlots[i][1]);
					limb.equipmentSlots[i][1] = item;
				}
				else{
					if(!isNaN(item.armorValue)){
						this.armorValue += item.armorValue;
						limb.armorValue += item.armorValue;
					}
					if(!isNaN(item.dodgeValue)){
						this.dodgeValue += item.dodgeValue;
						limb.dodgeValue += item.dodgeValue;
					}
					limb.equipmentSlots[i][1] = item;
				}
				returnString += `${item.name} has been equipped!`;
				return returnString;
			}
		}
	}
	attack(defender, target){
		let events = ``;
		if(this.primaryHand == null){
			return `${this.name} has no hands to fight with!\n`;
		}
		let weapon = this.primaryHand.equipmentSlots[0][1];
		if(weapon.name == 'Nothing'){
			weapon = new itemFile.Weapon(1,'Fist','Flesh','HeldObject',0,this.color);
		}
		let deflected = false;
		let attackerRoll = Math.floor(Math.random()*6) + Math.floor(Math.random() * this.soul.dexterity);
		let defenderArmorRoll = Math.floor(Math.random()*6) + Math.floor(Math.random() * defender.armorValue);
		let defenderDodgeRoll = Math.floor(Math.random()*6) + Math.floor(Math.random() * defender.dodgeValue);
		if(target != null){
			defenderArmorRoll += Math.floor(Math.random() * target.armorValue);
			defenderDodgeRoll += Math.floor(Math.random() * target.dodgeValue);
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
					events += `${this.name}'s ${weapon.name} is deflected by ${defender.name}'s Armor!\n`;
				}
				target.hitpoints -= damage;
				defender.hitpoints -= damage;
				if(target.hitpoints < 0){
					if(target.name == 'Torso'){
						events += `${this.name}'s ${weapon.name} caves into the ${defender.name}'s ${target.name}!\n`;
						defender.species.disconnectParts(target);
						defender.hitpoints = 0;
					}
					else if(target.name == 'Head'){
						events += `${this.name}'s ${weapon.name} sends the ${defender.name}'s ${target.name} flying off!\n`;
						defender.species.disconnectParts(target);
						defender.hitpoints = 0;
					}
					else if(target.name == 'Hand'){
						events += `${this.name}'s ${weapon.name} sends the ${defender.name}'s ${target.name} flying off!\n`;
						defender.species.disconnectParts(target);
						let foundReplacement = false;
						if(target == defender.primaryHand){
							for(let i=0;i<defender.species.bodyParts.length;i++){
								if(defender.species.bodyParts[i].name == 'Hand'){
									foundReplacement = true;
									defender.primaryHand = defender.species.bodyParts[i];
								}
							}
							if(!foundReplacement){
								events += `${defender.name} doesn't have any hands to fight!\n`;
								defender.primaryHand = null;
							}
						}
						defender.hitpoints -= 10;
					}
					else{
						events += `${this.name}'s ${weapon.name} sends the ${defender.name}'s ${target.name} flying off!\n`;
						defender.species.disconnectParts(target);
						defender.hitpoints -= 10;
					}
				}
				else if(!deflected){
					events += `${this.name}'s ${weapon.name} cleaves at the ${defender.name}'s ${target.name} for ${damage} damage!\n`;
				}
			}
			else{
				let damage = (weapon.damage + this.soul.strength) - defender.armorValue;
				if(damage < 0){
					damage = 0;
					deflected = true;
					events += `${this.name}'s ${weapon.name} is deflected by ${defender.name}'s Armor!\n`;
				}
				if(!deflected){
					defender.hitpoints -= damage;
					events += `${this.name}'s ${weapon.name} cleaves at ${defender.name} for ${damage} damage!\n`;
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