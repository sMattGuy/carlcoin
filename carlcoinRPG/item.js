class Item{
	name;
	material;
	equipLocation;
	weight;
	color;
	constructor(name,material,equipLocation,weight,color){
		this.name = name;
		this.material = material;
		this.equipLocation = equipLocation;
		this.weight = weight;
		this.color = color;
	}
}
class Weapon extends Item{
	damage;
	constructor(damage,name,material,equipLocation,weight,color){
		super(name,material,equipLocation,weight,color);
		this.damage = damage;
	}
	description(){
		return `A sturdy ${this.material} ${this.name}. It weighs ${this.weight} Units, and is ${this.color}. It is placed in the ${this.equipLocation} slot. Its base damage is ${this.damage} HP.`;
	}
	
}
class Armor extends Item{
	armorValue;
	dodgeValue;
	constructor(armorValue,dodgeValue,name,material,equipLocation,weight,color){
		super(name,material,equipLocation,weight,color);
		this.armorValue = armorValue;
		this.dodgeValue = dodgeValue;
	}
	description(){
		return `This is a ${this.material} ${this.name}. It weighs ${this.weight} Units. It is the color ${this.color}. It is worn in the ${this.equipLocation} slot. It gives ${this.armorValue} AV and ${this.dodgeValue} DV.`;
	}
}

module.exports = {
	Weapon,
	Armor
};