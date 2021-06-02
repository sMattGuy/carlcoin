//simple battle function that will do one turn
function checkInventory(character){
	let inventory = `${character.name}'s inventory is currently:`;
	if(character.inventory.length == 0){
		inventory += `Empty. `;
	}
	else{
		for(let i=0;i<character.inventory.length - 1;i++){
			inventory += `${character.inventory[i]}, `;
		}
		inventory += `${character.inventory[character.inventory.length - 1]}. `;
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
			equipment += `${character.equipped[i]}, `;
		}
		equipment += `${character.equipped[character.equipped.length - 1]}. `;
	}
	return equipment;
}
module.exports = {
	checkInventory,
	checkEquipment
};