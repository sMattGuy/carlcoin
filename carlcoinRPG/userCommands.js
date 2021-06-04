//simple battle function that will do one turn
function checkInventory(character){
	let inventory = `${character.name}'s inventory is currently:`;
	if(character.inventory.length == 0){
		inventory += `Empty. `;
	}
	else{
		for(let i=0;i<character.inventory.length - 1;i++){
			inventory += `${character.inventory[i].name}, `;
		}
		inventory += `${character.inventory[character.inventory.length - 1].name}. `;
	}
	return inventory;
}

function checkEquipment(character){
	let equipment = `${character.name}'s equipment is currently:`;
	if(character.equipped.length == 0){
		equipment += `Empty. `;
	}
	else{
		for(let i=0;i<character.equipped.length - 1;i++){
			equipment += `${character.equipped[i][0]}:${character.equipped[i][1].name}, `;
		}
		equipment += `${character.equipped[character.equipped.length - 1][0]}:${character.equipped[character.equipped.length - 1][1].name}. `;
	}
	return equipment;
}

function attack(attacker, defender, weapon, target){
	let events = ``;
	let attackerRoll = Math.floor(Math.random()*6) + attacker.soul.strength;
	let defenderArmorRoll = Math.floor(Math.random()*6) + defender.armorValue;
	let defenderDodgeRoll = Math.floor(Math.random()*6) + defender.dodgeValue;
	if(target != null){
		defenderArmorRoll += target.armorValue;
		defenderDodgeRoll += target.dodgeValue;
	}
	let defenderRoll = (defenderArmorRoll > defenderDodgeRoll) ? defenderArmorRoll : defenderDodgeRoll;
	//hit landed
	if(attackerRoll > defenderRoll){
		events += `Attacker Hits! [${attackerRoll} vs. ${defenderRoll}]\n`;
		if(target != null){
			let damage = weapon.damage - target.armorValue;
			target.hitpoints -= damage;
			if(target.hitpoints < 0){
				if(target.name == 'Torso'){
					events += `The attack caves into the defenders ${target.name}!\n`;
					defender.hitpoints = 0;
				}
				else if(target.name == 'Head'){
					events += `The attack sends the defenders ${target.name} flying off!\n`;
					defender.hitpoints = 0;
				}
				else{
					events += `The attack sends the defenders ${target.name} flying off!\n`;
					defender.hitpoints -= 10;
				}
			}
			else{
				events += `The attack cleaves at the defenders ${target.name} for ${damage} damage!\n`;
			}
		}
		else{
			let damage = weapon.damage - defender.armorValue;
			defender.hitpoints -= damage;
			events += `The attack cleaves at the defender for ${damage} damage!\n`;
		}
	}
	//attack missed
	else{
		events += `Attacker Misses! [${attackerRoll} vs. ${defenderRoll}]\n`;
	}
}

module.exports = {
	checkInventory,
	checkEquipment,
	attack
};