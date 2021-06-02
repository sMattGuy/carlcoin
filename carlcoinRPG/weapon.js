class Axe{
	name;
	damage;
	material;
	weaponLocation;
	weight;
	color;
	constructor(){
		this.name = 'Axe';
		this.equipLocation = 'heldObject';
		this.damage = 10;
		this.material = 'Iron';
		this.weight = '10';
		this.color = 'Grey';
	}
	description(){
		return `A sturdy ${this.material} Axe. It weighs ${this.weight} Units, and is ${this.color}. It is placed in the ${this.equipLocation} slot. Its base damage is ${this.damage} HP.`;
	}
}

module.exports = {
	Axe
};