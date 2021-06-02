const body = require('./body.js');

class Human{
	//the body
	speciesType;
	head;
	torso;
	leftArm;
	rightArm;
	leftHand;
	rightHand;
	leftLeg;
	rightLeg;
	leftFoot;
	rightFoot;
	//features
	color;
	eyeColor;
	hair;
	height;
	weight;
	//creature stats
	naturalVitality;
	naturalArmor;
	naturalDodge;
	//helper stuff
	equipmentSlots;
	constructor(){
		//define species type
		this.speciesType = 'Human';
		//define what parts its made of
		this.head = new body.Head();
		this.torso = new body.Torso();
		this.leftArm = new body.LeftArm();
		this.rightArm = new body.RightArm();
		this.rightHand = new body.RightHand();
		this.leftHand = new body.LeftHand();
		this.leftLeg = new body.LeftLeg();
		this.rightLeg = new body.RightLeg();
		this.leftFoot = new body.LeftFoot();
		this.rightFoot = new body.RightFoot();
		//plug the parts together
		//head to torso and reverse
		this.head.connections[0] = new body.Connection('Head','Torso');
		this.torso.connections[0] = new body.Connection('Torso','Head');
		//torso to arm and reverse
		this.torso.connections[1] = new body.Connection('Torso','Left Arm');
		this.torso.connections[2] = new body.Connection('Torso','Right Arm');
		this.leftArm.connections[0] = new body.Connection('Left Arm','Torso');
		this.rightArm.connections[0] = new body.Connection('Right Arm','Torso');
		//torso to leg and reverse
		this.torso.connections[3] = new body.Connection('Torso','Left Leg');
		this.torso.connections[4] = new body.Connection('Torso','Right Leg');
		this.leftLeg.connections[0] = new body.Connection('Left Leg','Torso');
		this.rightLeg.connections[0] = new body.Connection('Right Leg','Torso');
		//arm to hands and reverse
		this.leftArm.connections[1] = new body.Connection('Left Arm','Left Hand');
		this.rightArm.connections[1] = new body.Connection('Right Arm','Right Hand');
		this.leftHand.connections[0] = new body.Connection('Left Hand','Left Arm');
		this.rightHand.connections[0] = new body.Connection('Right Hand','Right Arm');
		//legs to feet and reverse
		this.leftLeg.connections[1] = new body.Connection('Left Leg','Left Foot');
		this.rightLeg.connections[1] = new body.Connection('Right Leg','Right Foot');
		this.leftFoot.connections[0] = new body.Connection('Left Foot','Left Leg');
		this.rightFoot.connections[0] = new body.Connection('Right Foot','Right Leg');
		//applying the features to each part
		//head features
		this.head.eyes = 2;
		this.head.ears = 2;
		this.head.noses = 1;
		this.head.mouths = 1;
		this.head.brains = 1;
		this.head.teeth = 32;
		this.head.tongues = 1;
		//torso features
		this.torso.hearts = 1;
		this.torso.ribs = 24
		this.torso.spines = 1;
		this.torso.stomaches = 1;
		this.torso.livers = 1;
		this.torso.lungs = 2;
		this.torso.intestines = 2;
		this.torso.kidneys = 2;
		//arm features
		this.leftArm.segments = 2;
		this.rightArm.segments = 2;
		//hand features
		this.leftHand.fingers = 5;
		this.leftHand.joints = 3;
		this.leftHand.thumbs = 1;
		this.rightHand.fingers = 5;
		this.rightHand.joints = 3;
		this.rightHand.thumbs = 1;
		//leg features
		this.leftLeg.segments = 2;
		this.rightLeg.segments = 2;
		//foot features
		this.leftFoot.toes = 5;
		this.leftFoot.joints = 3;
		this.rightFoot.toes = 5;
		this.rightFoot.joints = 3;
		//features that are customizable
		this.color = 'White';
		this.eyeColor = 'Brown';
		this.hair = 'Grey';
		this.height = '100';
		this.weight = '100';
		//number stats
		this.naturalVitality = 50;
		this.naturalArmor = 2;
		this.naturalDodge = 5;
		//individual parts stats
		this.head.hitpoints = 10;
		this.head.armorValue = 0;
		this.head.dodgeValue = 4;
		this.torso.hitpoints = 25;
		this.torso.armorValue = 0;
		this.torso.dodgeValue = 3;
		this.leftArm.hitpoints = 5;
		this.leftArm.armorValue = 0;
		this.leftArm.dodgeValue = 8;
		this.rightArm.hitpoints = 5;
		this.rightArm.armorValue = 0;
		this.rightArm.dodgeValue = 8;
		this.leftHand.hitpoints = 5;
		this.leftHand.armorValue = 0;
		this.leftHand.dodgeValue = 5;
		this.rightHand.hitpoints = 5;
		this.rightHand.armorValue = 0;
		this.rightHand.dodgeValue = 5;
		this.leftLeg.hitpoints = 15;
		this.leftLeg.armorValue = 0;
		this.leftLeg.dodgeValue = 8;
		this.rightLeg.hitpoints = 15;
		this.rightLeg.armorValue = 0;
		this.rightLeg.dodgeValue = 8;
		this.leftFoot.hitpoints = 5;
		this.leftFoot.armorValue = 0;
		this.leftFoot.dodgeValue = 4;
		this.rightFoot.hitpoints = 5;
		this.rightFoot.armorValue = 0;
		this.rightFoot.dodgeValue = 4;
		this.equipmentSlots = this.head.equipmentSlots.concat(this.torso.equipmentSlots.concat(this.leftArm.equipmentSlots.concat(this.rightArm.equipmentSlots.concat(this.leftHand.equipmentSlots.concat(this.rightHand.equipmentSlots.concat(this.leftLeg.equipmentSlots.concat(this.rightLeg.equipmentSlots.concat(this.leftFoot.equipmentSlots.concat(this.rightFoot.equipmentSlots)))))))));
	}
	fullbodyStatus(){
		let fullReport = this.head.description();
		fullReport += '\n' + this.torso.description();
		fullReport += '\n' + this.leftArm.description();
		fullReport += '\n' + this.rightArm.description();
		fullReport += '\n' + this.leftHand.description();
		fullReport += '\n' + this.rightHand.description();
		fullReport += '\n' + this.leftLeg.description();
		fullReport += '\n' + this.rightLeg.description();
		fullReport += '\n' + this.leftFoot.description();
		fullReport += '\n' + this.rightFoot.description();
		return fullReport;
	}
	description(){
		let description = `This a human. The humans skin is ${this.color}. The humans eyes are ${this.eyeColor}. The humans hair is ${this.hair}. The humans height is ${this.height}. The humans weight is ${this.weight}. The human has a natural vitality of ${this.naturalVitality}, a natural armor of ${this.naturalArmor} and a natural dodge of ${this.naturalDodge}. The human has these equipment slots: `;
		for(let i=0;i<this.equipmentSlots.length-1;i++){
			description += `${this.equipmentSlots[i][0]}:${this.equipmentSlots[i][1].name}, `;
		}
		description += `${this.equipmentSlots[this.equipmentSlots.length-1][0]}:${this.equipmentSlots[this.equipmentSlots.length-1][1].name}. `;
		return description;
	}
}

module.exports = {
	Human
};