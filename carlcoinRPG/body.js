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
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['shirt',{name:'Nothing'}],['coat',{name:'Nothing'}]];
		this.connections = [];
	}
	description(){
		let returnString = `Its torso has ${this.hearts} hearts, ${this.ribs} ribs, ${this.spines} spines, ${this.stomaches} stomaches, ${this.livers} livers, ${this.lungs} lungs, ${this.intestines} intestines, ${this.kidneys} kidneys. It is currently wearing ${this.equipmentSlots[0][1].name} for a shirt and ${this.equipmentSlots[1][1].name} as a coat. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class RightArm{
	name;
	segments;
	//values
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Right Arm';
		this.segments = 0;
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['rightVambrace',{name:'Nothing'}]];
		this.connections = [];
	}
	description(){
		let returnString = `Its right arm has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as a vambrace. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class LeftArm{
	name;
	segments;
	//values
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Left Arm';
		this.segments = 0;
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['leftVambrace',{name:'Nothing'}]];
		this.connections = [];
	}
	description(){
		let returnString = `Its left arm has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as a vambrace. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class RightHand{
	name;
	fingers;
	joints;
	thumbs;
	//values
	hitpoints;
	dodgeValue;
	armorValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Right Hand';
		this.fingers = 0;
		this.joints = 0;
		this.thumbs = 0;
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['rightHeldObject',{name:'Nothing'}],['rightGlove',{name:'Nothing'}]];
		this.connections = [];
	}
	description(){
		let returnString = `Its right hand has ${this.fingers} fingers, ${this.joints} joints per finger, ${this.thumbs} thumbs. It is currently holding ${this.equipmentSlots[0][1].name}. It is currently wearing ${this.equipmentSlots[1][1].name} as a glove. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class LeftHand{
	name;
	fingers;
	joints;
	thumbs;
	//values
	hitpoints;
	dodgeValue;
	armorValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Left Hand';
		this.fingers = 0;
		this.joints = 0;
		this.thumbs = 0;
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['leftHeldObject',{name:'Nothing'}],['leftGlove',{name:'Nothing'}]];
		this.connections = [];
	}
	description(){
		let returnString = `Its left hand has ${this.fingers} fingers, ${this.joints} joints per finger, ${this.thumbs} thumbs. It is currently holding ${this.equipmentSlots[0][1].name}. It is currently wearing ${this.equipmentSlots[1][1].name} as a glove. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class RightLeg{
	name;
	segments;
	//values
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Right Leg';
		this.segments = 0;
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['rightGreaves',{name:'Nothing'}]];
		this.connections = [];
	}
	description(){
		let returnString = `Its right leg has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as greaves. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class LeftLeg{
	name;
	segments;
	//values
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	//connections
	connections;
	constructor(){
		this.name = 'Left Leg';
		this.segments = 0;
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.equipmentSlots = [['leftGreaves',{name:'Nothing'}]];
		this.connections = [];
	}
	description(){
		let returnString = `Its left leg has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as greaves. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class RightFoot{
	name;
	toes;
	joints;
	//values
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	connections;
	constructor(){
		this.name = 'Right Foot';
		this.toes = 0;
		this.joints = 0;
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.connections = [];
		this.equipmentSlots = [['rightShoe',{name:'Nothing'}]];
	}
	description(){
		let returnString = `Its right foot has ${this.toes} toes, ${this.joints} joints per toe. It is currently wearing ${this.equipmentSlots[0][1].name} as a shoe. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class LeftFoot{
	name;
	toes;
	joints;
	//values
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	connections;
	constructor(){
		this.name = 'Left Foot';
		this.toes = 0;
		this.joints = 0;
		this.hitpoints = 0;
		this.armorValue = 0;
		this.dodgeValue = 0;
		this.connections = [];
		this.equipmentSlots = [['leftShoe',{name:'Nothing'}]];
	}
	description(){
		let returnString = `Its left foot has ${this.toes} toes, ${this.joints} joints per toe. It is currently wearing ${this.equipmentSlots[0][1].name} as a shoe. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
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
	RightArm,
	LeftArm,
	RightHand,
	LeftHand,
	RightLeg,
	LeftLeg,
	RightFoot,
	LeftFoot
};