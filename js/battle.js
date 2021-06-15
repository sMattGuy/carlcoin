const Discord = require('discord.js');
const fs = require('fs');


const lesserDevil = {art:`+==============================+\n|       ENEMY OF THE STATE\n|		 THE LESSER DEVIL\n|             (_)L|J\n|      )      (") |     (\n|      ,(. A / \-|   (,)\n|     )' (' \\/\\ / |  ) (.\n|    (' ),).  _W_ | (,)' )\n|   ^^^^^^^^^^^^^^^^^^^^^^^\n+==============================+\n`,hp:10,str:10,con:15,wis:5,dex:4,intel:10,chr:15};

const actionBar = `ACTIONS:\n!cc attack | !cc block\n!cc look   | !cc item\n!cc run    | !cc magic`;


function testResponses(client,message){
	const filter = m => {
		return ((m.content === '!cc attack' || m.content === '!cc look' || m.content === '!cc block' || m.content === '!cc run' || m.content === '!cc item' || m.content === '!cc magic')&&(message.author.id == m.author.id));
	};
	//get database information
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//variables to store about player
	let str = 0;
	let con = 0;
	let wis = 0;
	let dex = 0;
	let intel = 0;
	let chr = 0;
	let tempArmor = 0;
	let attackBonus = 0;
	let defenseBonus = 0;
	let playerHp = 10;
	let playerBalance = 0;
	let found = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			found = true;
			playerBalance = data.users[i].balance;
			str = data.users[i]["STR"];
			if(isNaN(str)){
				str = 0;
			}
			dex = data.users[i]["DEX"];
			if(isNaN(dex)){
				dex = 0;
			}
			con = data.users[i]["CON"];
			if(isNaN(con)){
				con = 0;
			}
			intel = data.users[i]["INT"];
			if(isNaN(intel)){
				intel = 0;
			}
			wis = data.users[i]["WIS"];
			if(isNaN(wis)){
				wis = 0;
			}
			chr = data.users[i]["CHR"];
			if(isNaN(chr)){
				chr = 0;
			}
			break;
		}
	}
	if(!found){
		message.channel.send(`You are not registered for Carl Coin!`);
		return;
	}
	//adjust health
	playerHp += con;
	//enemy information
	let enemy = lesserDevil;
	let eArt = enemy.art;
	let eHp = enemy.hp;
	let eStr = enemy.str;
	let eCon = enemy.con;
	let eWis = enemy.wis;
	let eDex = enemy.dex;
	let eIntel =  enemy.intel;
	let eChr = enemy.chr;
	
	//actual box that will perform the loop
	frame();
	
	async function frame(){
		message.channel.send(`${eArt}HP:${playerHp} | ENEMY HP:${eHp}\n${actionBar}`,{code:true}).then(()=>{
			message.channel.awaitMessages(filter,{
				max:1,time:20000,errors:['time']
			}).then(choice => {
				//parsing of choice begins here
				let action = choice.first().content;
				if(action === '!cc attack'){
					let damage = Math.floor(Math.random() * str) + attackBonus;
					let block = Math.floor(Math.random() * eDex);
					if(damage > block){
						//player hits
						let armor = Math.floor(Math.random() * eCon);
						let totalDamage = damage - armor;
						if(totalDamage <= 0){
							//attack deflected
							message.channel.send(`The attack was deflected!`)
						}
						else{
							eHp -= totalDamage;
							message.channel.send(`The attack lands for ${totalDamage}HP!`);
						}
					}
					else{
						message.channel.send(`The attack was dodged!`)
					}
				}
				else if(action === '!cc magic'){
					let damage = Math.floor(Math.random() * chr) + attackBonus;
					let block = Math.floor(Math.random() * eWis);
					if(damage > block){
						//player hits
						let armor = Math.floor(Math.random() * eChr);
						let totalDamage = damage - armor;
						if(totalDamage <= 0){
							//attack deflected
							message.channel.send(`The attack was deflected!`)
						}
						else{
							eHp -= totalDamage;
							message.channel.send(`The attack lands for ${totalDamage}HP!`);
						}
					}
					else{
						message.channel.send(`The attack was dodged!`)
					}
				}
				else if(action === '!cc block'){
					tempArmor += Math.floor(Math.random() * (con + wis)) + defenseBonus;
					message.channel.send(`You gain ${tempArmor} defense for this turn!`);
				}
				else if(action === '!cc look'){
					if(Math.random() <= .1){
						let bonus = Math.floor(Math.random() * intel);
						if(Math.random() <=.5){
							//attack bonus
							attackBonus += bonus;
							message.channel.send(`You spot a weakness in your enemy, you get a permanent +${bonus} to attack!`);
						}
						else{
							//defense bonus
							defenseBonus += bonus;
							message.channel.send(`You spot a pattern in your enemy's moves, you get a permanent +${bonus} to defense!`);
						}
					}
				}
				else if(action === '!cc item'){
					let hpHeal = Math.floor(Math.random()*5)+1;
					playerHp += hpHeal;
					message.channel.send(`You use a bandage and heal ${hpHeal}HP!`);
				}
				else if(action === '!cc run'){
					message.channel.send(`You run away! COWARD!!!!!`);
					return;
				}
				//check hp of enemy
				if(eHp <= 0){
					message.channel.send(`You have defeated the enemy! You win!`);
					return;
				}
				//enemy attack
				message.channel.send(`The enemy attacks!`);
				if(Math.random() <= .5){
					//physical attack
					let damage = Math.floor(Math.random() * eStr);
					let block = Math.floor(Math.random() * dex) + defenseBonus;
					if(damage > block){
						//player hits
						let armor = Math.floor(Math.random() * con);
						let totalDamage = damage - armor;
						if(totalDamage <= 0){
							//attack deflected
							message.channel.send(`The attack was deflected!`)
						}
						else{
							playerHp -= totalDamage;
							message.channel.send(`The attack lands for ${totalDamage}HP!`);
						}
					}
					else{
						message.channel.send(`The attack was dodged!`)
					}
				}
				else{
					//magic
					let damage = Math.floor(Math.random() * eChr);
					let block = Math.floor(Math.random() * wis) + defenseBonus;
					if(damage > block){
						//player hits
						let armor = Math.floor(Math.random() * chr);
						let totalDamage = damage - armor;
						if(totalDamage <= 0){
							//attack deflected
							message.channel.send(`The attack was deflected!`)
						}
						else{
							playerHp -= totalDamage;
							message.channel.send(`The attack lands for ${totalDamage}HP!`);
						}
					}
					else{
						message.channel.send(`The attack was dodged!`)
					}
				}
				if(playerHp <= 0){
					message.channel.send(`You have died! So sad!`);
					return;
				}
				frame();
			});
		}).catch(e => {
			message.channel.send(`Didnt get valid response in time`);
			console.log(e);
		});
	}
}

module.exports = {
	testResponses
};