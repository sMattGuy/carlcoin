class Character{
	//info about the character
	species;
	inventory;
	equipped;
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
		this.inventory = [];
		this.equipped = [];
		this.soul = soul;
		this.weight = this.species.weight;
		this.hitpoints = this.species.naturalVitality + this.soul.constitution;
		this.armorValue = this.species.naturalArmor + this.soul.strength;
		this.dodgeValue = this.species.naturalDodge + this.soul.dexterity;
	}
	description(){
		let returnString = `${this.name}, The ${this.species.speciesType}. ${this.name} is currently ${this.name} has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. ${this.name}'s inventory is currently:`;
		if(this.inventory.length == 0){
			returnString += `Empty. `;
		}
		else{
			for(let i=0;i<this.inventory.length - 1;i++){
				returnString += `${this.inventory[i]}, `;
			}
			returnString += `${this.inventory[this.inventory.length - 1]}. `;
		}
		returnString += `${this.name} is currently Equipped with: `
		if(this.equipped.length == 0){
			returnString += `Nothing. `;
		}
		else{
			for(let i=0;i<this.equipped.length - 1;i++){
				returnString += `${this.equipped[i][0]}:${this.equipped[i][1]}, `;
			}
			returnString += `${this.equipped[this.equipped.length - 1][0]}:${this.equipped[this.equipped.length - 1][1]}. `;
		}
		returnString += `${this.soul.stats()}`;
		return returnString;
	}
}

module.exports = {
	Character
};