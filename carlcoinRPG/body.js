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
		let returnString = `Its head has ${this.eyes} eyes, ${this.ears} ears, ${this.noses} noses, ${this.mouths} mouths, ${this.brains} brains, ${this.teeth} teeth, ${this.tongues} tongues. It is currently wearing ${this.equipmentSlots[0][1].name} on its head and ${this.equipmentSlots[1][1].name} as a mask. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
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
		let returnString = `Its torso has ${this.hearts} hearts, ${this.ribs} ribs, ${this.spines} spines, ${this.stomaches} stomaches, ${this.livers} livers, ${this.lungs} lungs, ${this.intestines} intestines, ${this.kidneys} kidneys. It is currently wearing ${this.equipmentSlots[0][1].name} for a shirt and ${this.equipmentSlots[1][1].name} as a coat. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class RightArm extends BodyPart{
	segments;
	//values
	constructor(segment,hitp,av,dv){
		super('Right Arm',[['rightVambrace',{name:'Nothing'}]],hitp,av,dv);
		this.segments = segment;
	}
	description(){
		let returnString = `Its right arm has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as a vambrace. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class LeftArm extends BodyPart{
	segments;
	constructor(segment,hitp,av,dv){
		super('Left Arm',[['leftVambrace',{name:'Nothing'}]],hitp,av,dv);
		this.segments = segment;
	}
	description(){
		let returnString = `Its left arm has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as a vambrace. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class RightHand extends BodyPart{
	fingers;
	joints;
	thumbs;
	constructor(finger,joint,thumb,hitp,av,dv){
		super('Right Hand',[['rightHeldObject',{name:'Nothing'}],['rightGlove',{name:'Nothing'}]],hitp,av,dv);
		this.fingers = finger;
		this.joints = joint;
		this.thumbs = thumb;
	}
	description(){
		let returnString = `Its right hand has ${this.fingers} fingers, ${this.joints} joints per finger, ${this.thumbs} thumbs. It is currently holding ${this.equipmentSlots[0][1].name}. It is currently wearing ${this.equipmentSlots[1][1].name} as a glove. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class LeftHand extends BodyPart{
	fingers;
	joints;
	thumbs;
	constructor(finger,joint,thumb,hitp,av,dv){
		super('Left Hand',[['leftHeldObject',{name:'Nothing'}],['leftGlove',{name:'Nothing'}]],hitp,av,dv);
		this.fingers = finger;
		this.joints = joint;
		this.thumbs = thumb;
	}
	description(){
		let returnString = `Its left hand has ${this.fingers} fingers, ${this.joints} joints per finger, ${this.thumbs} thumbs. It is currently holding ${this.equipmentSlots[0][1].name}. It is currently wearing ${this.equipmentSlots[1][1].name} as a glove. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class RightLeg extends BodyPart{
	segments;
	constructor(segment,hitp,av,dv){
		super('Right Leg',[['rightGreaves',{name:'Nothing'}]],hitp,av,dv);
		this.segments = segment;
	}
	description(){
		let returnString = `Its right leg has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as greaves. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class LeftLeg extends BodyPart{
	segments;
	constructor(segment,hitp,av,dv){
		super('Left Leg',[['leftGreaves',{name:'Nothing'}]],hitp,av,dv);
		this.segments = segment;
	}
	description(){
		let returnString = `Its left leg has ${this.segments} segments. It is currently wearing ${this.equipmentSlots[0][1].name} as greaves. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class RightFoot extends BodyPart{
	toes;
	joints;
	constructor(toe,joint,hitp,av,dv){
		super('Right Foot',[['rightShoe',{name:'Nothing'}]],hitp,av,dv);
		this.toes = toe;
		this.joints = joint;
	}
	description(){
		let returnString = `Its right foot has ${this.toes} toes, ${this.joints} joints per toe. It is currently wearing ${this.equipmentSlots[0][1].name} as a shoe. It has ${this.hitpoints} HP, ${this.armorValue} AV and ${this.dodgeValue} DV. `;
		for(let i=0;i<this.connections.length;i++){
			returnString += `${this.connections[i].description()}`
		}
		return returnString;
	}
}
class LeftFoot extends BodyPart{
	toes;
	joints;
	constructor(toe,joint,hitp,av,dv){
		super('Left Foot',[['leftShoe',{name:'Nothing'}]],hitp,av,dv);
		this.toes = toe;
		this.joints = joint;
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