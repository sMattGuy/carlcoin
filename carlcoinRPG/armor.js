class Breastplate{
	name;
	material;
	weight;
	color;
	armorValue;
	dodgeValue;
	armorLocation;
	
	constructor(){
		this.name = 'Breastplate';
		this.material = 'Iron';
		this.weight = 20;
		this.color = 'Grey';
		this.armorValue = 4;
		this.dodgeValue = -1;
		this.equipLocation = 'coat';
	}
	description(){
		return `This is a ${this.material} Breastplate. It weighs ${this.weight} Units. It is the color ${this.color}. It is worn in the ${this.equipLocation} slot. It gives ${this.armorValue} AV and ${this.dodgeValue} DV. `;
	}
}

module.exports = {
	Breastplate
};