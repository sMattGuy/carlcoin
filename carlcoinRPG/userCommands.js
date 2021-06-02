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
module.exports = {
	checkInventory,
	checkEquipment
};