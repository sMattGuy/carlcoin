class Soul{
	strength;
	constitution;
	wisdom;
	dexterity;
	intelligence;
	charisma;
	
	constructor(){
		this.strength = 0;
		this.constitution = 0;
		this.wisdom = 0;
		this.dexterity = 0;
		this.intelligence = 0;
		this.charisma = 0;
	}
	
	description(){
		return `This is the soul of an unknown entity. Its misty body floats aimlessly. Its shape is constantly changing. Its color is white, but mostly transparent.`;
	}
	stats(){
		return `Its stats are as follows:\nStrength = ${this.strength}\nConstitution = ${this.constitution}\nWisdom = ${this.wisdom}\nDexterity = ${this.dexterity}\nIntelligence = ${this.intelligence}\nCharisma = ${this.charisma}`;
	}
}

module.exports = {
	Soul
};