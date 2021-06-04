const body = require('./body.js');

class Species{
	bodyParts;
	speciesType;
	naturalVitality;
	naturalArmor;
	naturalDodge;
	equipmentSlots;
	height;
	weight;
	constructor(name,nv,na,nd,height,weight){
		this.bodyParts = [];
		this.speciesType = name;
		this.naturalVitality = nv;
		this.naturalArmor = na;
		this.naturalDodge = nd;
		this.equipmentSlots = [];
		this.height = height;
		this.weight = weight;
	}
	connectParts(part1,part2){
		part1.connections.push(new body.Connection(part1,part2));
		part2.connections.push(new body.Connection(part2,part1));
	}
	disconnectParts(part){
		//goes through the severed part and removes its connections,
		//but it first calls the helper function to remove it from the other part
		//as well
		for(let i=0;i<part.connections.length;i++){
			this.disconnectAttachedParts(part.connections[i][1],part);
			part.connections.splice(i,1);
		}
	}
	disconnectAttachedParts(part1,part2){
		//removes the part from the other peice
		for(let i=0;i<part1.connections.length;i++){
			if(part1.connections[i][1] == part2){
				part1.connections.splice(i,1);
			}
		}
	}
	listBodyParts(){
		let report = '';
		for(let i=0;i<this.bodyParts.length;i++){
			report += this.bodyParts[i].name + '\n';
		}
		return report;
	}
}

class Human extends Species{
	//the body
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
	//function beginnings
	constructor(color,eyeColor,hair){
		super('Human',50,2,5,100,100);
		//define what parts its made of
		this.head = new body.Head(2,2,1,1,1,32,1,10,0,4);
		this.torso = new body.Torso(1,24,1,1,1,2,2,2,25,0,3);
		this.leftArm = new body.LeftArm(2,5,0,8);
		this.rightArm = new body.RightArm(2,5,0,8);
		this.rightHand = new body.RightHand(5,3,1,5,0,5);
		this.leftHand = new body.LeftHand(5,3,1,5,0,5);
		this.leftLeg = new body.LeftLeg(2,15,0,8);
		this.rightLeg = new body.RightLeg(2,15,0,8);
		this.leftFoot = new body.LeftFoot(5,3,5,0,4);
		this.rightFoot = new body.RightFoot(5,3,5,0,4);
		
		//features that are customizable
		this.color = color;
		this.eyeColor = eyeColor;
		this.hair = hair;
		
		//species specific arrays
		this.bodyParts = [this.head,this.torso,this.leftArm,this.rightArm,this.rightHand,this.leftHand,this.leftLeg,this.rightLeg,this.leftFoot,this.rightFoot];
		this.equipmentSlots = this.head.equipmentSlots.concat(this.torso.equipmentSlots.concat(this.leftArm.equipmentSlots.concat(this.rightArm.equipmentSlots.concat(this.leftHand.equipmentSlots.concat(this.rightHand.equipmentSlots.concat(this.leftLeg.equipmentSlots.concat(this.rightLeg.equipmentSlots.concat(this.leftFoot.equipmentSlots.concat(this.rightFoot.equipmentSlots)))))))));
		//plug the parts together
		//head to torso and reverse
		super.connectParts(this.head,this.torso);
		//torso to arm and reverse
		super.connectParts(this.torso,this.leftArm);
		super.connectParts(this.torso,this.rightArm);
		//torso to leg and reverse
		super.connectParts(this.torso,this.leftLeg);
		super.connectParts(this.torso,this.rightLeg);
		//arm to hands and reverse
		super.connectParts(this.leftArm,this.leftHand);
		super.connectParts(this.rightArm,this.rightHand);
		//legs to feet and reverse
		super.connectParts(this.leftLeg,this.leftFoot);
		super.connectParts(this.rightLeg,this.rightFoot);
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