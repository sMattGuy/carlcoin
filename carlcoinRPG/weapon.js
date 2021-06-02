class Axe{
	name;
	damage;
	material;
	weight;
	color;
	constructor(){
		this.name = 'Axe';
		this.damage = 10;
		this.material = 'Iron';
		this.weight = '10';
		this.color = 'Grey';
	}
	description(){
		return `A sturdy ${this.material} Axe. It weighs ${this.weight} Units, and is ${this.color}. Its base damage is ${this.damage} HP.`;
	}
}

module.exports = {
	Axe
};