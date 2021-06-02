class Connection{
	connection;
	/*
	connections work as a size 2 array where index 0 is the part and index 1 is its connection. a null connection means there is no connection
	*/
	constructor(part1, part2){
		this.connection = [part1,part2];
	}
	description(){
		return `There is a connection between the ${this.connection[0]} and ${this.connection[1]}. `;
	}
}
class Head{
	//all features a head can have
	//counts / external features
	name;
	eyes;
	ears;
	noses;
	mouths;
	//counts / internal features
	brains;
	teeth;
	tongues;
	//wearing
	hat;
	mask;
	//stats
	hitpoints;
	armorValue;
	dodgeValue;
	//helper variables
	equipmentSlots;
	//connections it has
	connections;
	//features are defined by how many they have or a description
	constructor(){
		this.name = 'Head';
		this.eyes = 0;
		this.ears = 0;
		this.noses = 0;
		this.mouths = 0;
		this.brains = 0;
		this.teeth = 0;
		this.tongues = 0;
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['hat',{name:'Nothing'}],['mask',{name:'Nothing'}]];
		//example connections[0] = connection['head']['torso']
		this.connections = []; //this defines the connection
	}
	description(){
		let returnString = `Its head has ${this.eyes} eyes, ${this.ears} ears, ${this.noses} noses, ${this.mouths} mouths, ${this.brains} brains, ${this.teeth} teeth, ${this.tongues} tongues. It is currently wearing ${this.equipmentSlots[0][1].name} on its head and ${this.equipmentSlots[1][1].name} as a mask. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class Torso{
	//acts as a hub for appendages such as heads, arms, legs and so on
	//this holds the torsos features
	name;
	//internals
	hearts;
	ribs;
	spines;
	stomaches;
	livers;
	lungs;
	intestines;
	kidneys;
	//wearing
	shirt;
	coat;
	//stats
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Torso';
		this.hearts = 0;
		this.ribs = 0;
		this.spines = 0;
		this.stomaches = 0;
		this.livers = 0;
		this.lungs = 0;
		this.intestines = 0;
		this.kidneys = 0;
		this.shirt = {name:'Nothing'};
		this.coat = {name:'Nothing'};
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['shirt','Nothing'],['coat','Nothing']];
		this.connections = [];
	}
	description(){
		let returnString = `Its torso has ${this.hearts} hearts, ${this.ribs} ribs, ${this.spines} spines, ${this.stomaches} stomaches, ${this.livers} livers, ${this.lungs} lungs, ${this.intestines} intestines, ${this.kidneys} kidneys. It is currently wearing ${this.shirt.name} for a shirt and ${this.coat.name} as a coat. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class Arm{
	name;
	segments;
	//wearing
	vambrace;
	//values
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Arm';
		this.segments = 0;
		this.vambrace = {name:'Nothing'};
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['vambrace','Nothing']];
		this.connections = [];
	}
	description(){
		let returnString = `Its arm has ${this.segments} segments. It is currently wearing ${this.vambrace.name} as a vambrace. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class Hand{
	name;
	fingers;
	joints;
	thumbs;
	//hands are special since they can hold objects
	heldObject;
	//wearing
	glove;
	//values
	hitpoints;
	dodgeValue;
	armorValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Hand';
		this.fingers = 0;
		this.joints = 0;
		this.thumbs = 0;
		this.heldObject = {name:'Nothing'};
		this.glove = {name:'Nothing'};
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['heldObject','Nothing'],['glove','Nothing']];
		this.connections = [];
	}
	description(){
		let returnString = `Its hand has ${this.fingers} fingers, ${this.joints} joints per finger, ${this.thumbs} thumbs. It is currently holding ${this.heldObject.name}. It is currently wearing ${this.glove.name} as a glove. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class Leg{
	name;
	segments;
	//wearing
	greaves;
	//values
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Leg';
		this.segments = 0;
		this.greaves = {name:'Nothing'};
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['greaves','Nothing']];
		this.connections = [];
	}
	description(){
		let returnString = `Its leg has ${this.segments} segments. It is currently wearing ${this.greaves.name} as greaves. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class Foot{
	name;
	toes;
	joints;
	//wearing
	shoe;
	//values
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	connections;
	constructor(){
		this.name = 'Foot';
		this.toes = 0;
		this.joints = 0;
		this.shoe = {name:'Nothing'};
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.connections = [];
		this.equipmentSlots = [['shoe','Nothing']];
	}
	description(){
		let returnString = `Its foot has ${this.toes} toes, ${this.joints} joints per toe. It is currently wearing ${this.shoe.name} as a shoe. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}

module.exports = {
	Connection,
	Head,
	Torso,
	Arm,
	Hand,
	Leg,
	Foot
};