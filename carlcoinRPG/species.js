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
	constructor(){
		//define species type
		this.speciesType = 'Human';
		//define what parts its made of
		this.head = new body.Head();
		this.torso = new body.Torso();
		this.leftArm = new body.Arm();
		this.rightArm = new body.Arm();
		this.rightHand = new body.Hand();
		this.leftHand = new body.Hand();
		this.leftLeg = new body.Leg();
		this.rightLeg = new body.Leg();
		this.leftFoot = new body.Foot();
		this.rightFoot = new body.Foot();
		//plug the parts together
		//head to torso and reverse
		this.head.connections[0] = new body.Connection('head','torso');
		this.torso.connections[0] = new body.Connection('torso','head');
		//torso to arm and reverse
		this.torso.connections[1] = new body.Connection('torso','left arm');
		this.torso.connections[2] = new body.Connection('torso','right arm');
		this.leftArm.connections[0] = new body.Connection('left arm','torso');
		this.rightArm.connections[0] = new body.Connection('right arm','torso');
		//torso to leg and reverse
		this.torso.connections[3] = new body.Connection('torso','left leg');
		this.torso.connections[4] = new body.Connection('torso','right leg');
		this.leftLeg.connections[0] = new body.Connection('left leg','torso');
		this.rightLeg.connections[0] = new body.Connection('right leg','torso');
		//arm to hands and reverse
		this.leftArm.connections[1] = new body.Connection('left arm','left hand');
		this.rightArm.connections[1] = new body.Connection('right arm','right hand');
		this.leftHand.connections[0] = new body.Connection('left hand','left arm');
		this.rightHand.connections[0] = new body.Connection('right hand','right arm');
		//legs to feet and reverse
		this.leftLeg.connections[1] = new body.Connection('left leg','left foot');
		this.rightLeg.connections[1] = new body.Connection('right leg','right foot');
		this.leftFoot.connections[0] = new body.Connection('left foot','left leg');
		this.rightFoot.connections[0] = new body.Connection('right foot','right leg');
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
		this.rightFoot.joints = 1;
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
	}
	description(){
		return `This a human, their skin is ${this.color}, their eyes are ${this.eyeColor}, their hair is ${this.hair}, their height is ${this.height}, their weight is ${this.weight}. It has a natural vitality of ${this.naturalVitality}, a natural armor of ${this.naturalArmor} and a natural dodge of ${this.naturalDodge}. `;
	}
}

module.exports = {
	Human
};