class BodyPart{
	name;
	hitpoints;
	armorValue;
	dodgeValue;
	equipmentSlots;
	connections;
	constructor(name,equipmentSlots,hitp,av,dv){
		this.name = name;
		this.hitpoints = hitp;
		this.armorValue = av;
		this.dodgeValue = dv;
		this.equipmentSlots = equipmentSlots;
		this.connections = [];
	}
}
class Connection{
	connection;
	/*
	connections work as a size 2 array where index 0 is the part and index 1 is its connection. a null connection means there is no connection
	*/
	constructor(part1, part2){
		this.connection = [part1,part2];
	}
	description(){
		return `There is a connection between the ${this.connection[0].name} and ${this.connection[1].name}. `;
	}
}
class Head extends BodyPart{
	//all features a head can have
	//counts / external features
	eyes;
	ears;
	noses;
	mouths;
	//counts / internal features
	brains;
	teeth;
	tongues;
	//features are defined by how many they have or a description
	constructor(eye,ear,nose,mouth,brain,tooth,tongue,hitp,av,dv){
		super('Head',[['hat',{name:'Nothing'}],['mask',{name:'Nothing'}]],hitp,av,dv);
		this.eyes = eye;
		this.ears = ear;
		this.noses = nose;
		this.mouths = mouth;
		this.brains = brain;
		this.teeth = tooth;
		this.tongues = tongue;
	}
	description(){
		let returnString = ``;
		if(this.hitpoints <= 0){
			returnString = `Its ${this.name} has been seperated from its body. `;
		}
		else{
			returnString = `Its head has ${this.eyes} eyes, ${this.ears} ears, ${this.noses} noses, ${this.mouths} mouths, ${this.brains} brains, ${this.teeth} teeth, ${this.tongues} tongues. It is currently wearing ${this.equipmentSlots[0][1].name} on its head and ${this.equipmentSlots[1][1].name} as a mask. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
			for(let i=0;i<this.connections.length;i++){
				returnString += `${this.connections[i].description()}`
			}
		}
		return returnString;
	}
}
class Torso extends BodyPart{
	//acts as a hub for appendages such as heads, arms, legs and so on
	//this holds the torsos features
	//internals
	hearts;
	ribs;
	spines;
	stomaches;
	livers;
	lungs;
	intestines;
	kidneys;
	constructor(heart,rib,spine,stomach,liver,lung,intestin,kidney,hitp,av,dv){
		super('Torso',[['shirt',{name:'Nothing'}],['coat',{name:'Nothing'}]],hitp,av,dv);
		this.hearts = heart;
		this.ribs = rib;
		this.spines = spine;
		this.stomaches = stomach;
		this.livers = liver;
		this.lungs = lung;
		this.intestines = intestin;
		this.kidneys = kidney;
	}
	description(){
		let returnString = ``;
		if(this.hitpoints <= 0){
			returnString = `Its ${this.name} has been seperated from its body. `;
		}
		else{
			returnString = `Its torso has ${this.hearts} hearts, ${this.ribs} ribs, ${this.spines} spines, ${this.stomaches} stomaches, ${this.livers} livers, ${this.lungs} lungs, ${this.intestines} intestines, ${this.kidneys} kidneys. It is currently wearing ${this.equipmentSlots[0][1].name} for a shirt and ${this.equipmentSlots[1][1].name} as a coat. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
			for(let i=0;i<this.connections.length;i++){
				returnString += `${this.connections[i].description()}`
			}
		}
		return returnString;
	}
}
class Arm extends BodyPart{
	segments;
	constructor(segment,hitp,av,dv){
		super('Arm',[['vambrace',{name:'Nothing'}]],hitp,av,dv);
		this.segments = segment;
	}
	description(){
		let returnString = ``;
		if(this.hitpoints <= 0){
			returnString = `Its ${this.name} has been seperated from its body. `;
		}
		else{
			returnString = `Its arm has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as a vambrace. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
			for(let i=0;i<this.connections.length;i++){
				returnString += `${this.connections[i].description()}`
			}
		}
		return returnString;
	}
}
class Hand extends BodyPart{
	fingers;
	joints;
	thumbs;
	constructor(finger,joint,thumb,hitp,av,dv){
		super('Hand',[['heldObject',{name:'Nothing'}],['glove',{name:'Nothing'}]],hitp,av,dv);
		this.fingers = finger;
		this.joints = joint;
		this.thumbs = thumb;
	}
	description(){
		let returnString = ``;
		if(this.hitpoints <= 0){
			returnString = `Its ${this.name} has been seperated from its body. `;
		}
		else{
			returnString = `Its hand has ${this.fingers} fingers, ${this.joints} joints per finger, ${this.thumbs} thumbs. It is currently holding ${this.equipmentSlots[0][1].name}. It is currently wearing ${this.equipmentSlots[1][1].name} as a glove. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
			for(let i=0;i<this.connections.length;i++){
				returnString += `${this.connections[i].description()}`
			}
		}
		return returnString;
	}
}
class Leg extends BodyPart{
	segments;
	constructor(segment,hitp,av,dv){
		super('Leg',[['greaves',{name:'Nothing'}]],hitp,av,dv);
		this.segments = segment;
	}
	description(){
		let returnString = ``;
		if(this.hitpoints <= 0){
			returnString = `Its ${this.name} has been seperated from its body. `;
		}
		else{
			returnString = `Its leg has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as greaves. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
			for(let i=0;i<this.connections.length;i++){
				returnString += `${this.connections[i].description()}`
			}
		}
		return returnString;
	}
}
class Foot extends BodyPart{
	toes;
	joints;
	constructor(toe,joint,hitp,av,dv){
		super('Foot',[['shoe',{name:'Nothing'}]],hitp,av,dv);
		this.toes = toe;
		this.joints = joint;
	}
	description(){
		let returnString = ``;
		if(this.hitpoints <= 0){
			returnString = `Its ${this.name} has been seperated from its body. `;
		}
		else{
			returnString = `Its foot has ${this.toes} toes, ${this.joints} joints per toe. It is currently wearing ${this.equipmentSlots[0][1].name} as a shoe. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
			for(let i=0;i<this.connections.length;i++){
				returnString += `${this.connections[i].description()}`
			}
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