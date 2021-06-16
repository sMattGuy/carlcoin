const Discord = require('discord.js');
const fs = require('fs');
//enemies
//baby
const glassJoe = {art:`
+==============================+\n|       PATHETIC ENEMY\n|		  GLASS JOE\n|         |\\     ____\n|         | \\.-./ .-'\n|          \\ _  _(\n|          | .)(./\n|          |   \\(\n|          |     \\\n|          |  \\vvv\n|          |  |__\n|         /       -.\n+==============================+\n`,hp:10,str:1,con:5,wis:4,dex:2,intel:3,chr:0};

//easy
const lesserDevil = {art:`+==============================+\n|       ENEMY OF THE STATE\n|		 THE LESSER DEVIL\n|             (_)L|J\n|      )      (") |     (\n|      ,(. A  / \\-|   (,)\n|     )' (' \\/\\ / |  ) (.\n|    (' ),).  _W_ | (,)' )\n|   ^^^^^^^^^^^^^^^^^^^^^^^\n+==============================+\n`,hp:50,str:10,con:15,wis:5,dex:4,intel:10,chr:15};

//normal
const floatingHead = {art:
`+==============================+\n|       UGLY FLOATING HEAD\n|		 THE SMILING DEVIL\n|         (\\-"^^^"-/)\n|         //^\\   /^\\\\\n|        ;/ ~_\\ /_~ \\;\n|        |  / \\Y/ \\  |\n|       (,  \\0/ \\0/  ,)\n|        |   /   \\   |\n|        | (_\\._./_) |\n|         \\ \\v-.-v/ /\n|          \\ '===' /\n|           \\_____/\n+==============================+\n`,hp:125,str:20,con:30,wis:26,dex:30,intel:20,chr:25};

//hard
const jokester = {art:`+==============================+\n|          KNIGHT OF HELL\n|           ARMORED DEMON\n|              .    .\n|           _..;|;__;|;\n|         ,'   ';  \\'; -.\n|    .--._)|    ;==,|,=='\n|      \\ @; \\_  < G," G).\n|        \\/-;,(  )  .>. )\n|           < ,-;'-.__.;'\n|             \\_  -,__,'\n|                   ;;;;\n+==============================+\n`,hp:200,str:50,con:75,wis:50,dex:55,intel:80,chr:75};

//expert
const king = {art:
`+==============================+\n|          KING OF HELL\n|		     THE LYCH\n|    ,    ,    /\\   /\\\n|   /( /\\ )\\  _\\ \\_/ /_\n|   |\\_||_/| < \\_   _/ >\n|   \\______/  \\|0   0|/\n|     _\\/_   _(_  ^  _)_\n|    ( () ) / \\|V"""V|/ \\\n|      {}   \\  \\_____/  /\n|      ()   /\\   )=(   /\\\n|      {}  /  \\_/\\=/\\_/  \\\n+==============================+\n`,hp:500,str:100,con:100,wis:75,dex:70,intel:120,chr:130};

//nightmare
const tux = {art:
`+==============================+\n|      GOD OF "BUT ITS FREE"\n|	      TUX THE PENGUIN\n|              _nnnn_\n|             dGGGGMMb\n|            @p~qp~~qMb\n|            M|@||@) M|\n|            @,----.JM|\n|           JS^\\__/  qKL\n|          dZP        qKRb\n|         dZP          qKKb\n|        fZP            SMMb\n|        HZM            MMMM\n|        FqM            MMMM\n|      __| ".        |\\dS"qML\n|      |     .       |  ' \\Zq\n|     _)      \\.___.,|     .'\n|     \\____   )MMMMMP|   .'\n|           -'        --'\n+==============================+\n`,hp:1000,str:500,con:250,wis:500,dex:150,intel:800,chr:580};

//arrays
const babyEnemies = [glassJoe];
const easyEnemies = [lesserDevil];
const normalEnemies = [floatingHead];
const hardEnemies = [jokester];
const expertEnemies = [king];
const nightmareEnemies = [tux];
//action bar constant
const actionBar = `ACTIONS:\n!cc attack | !cc block\n!cc look   | !cc item\n!cc run    | !cc magic`;

//player attack flavortext
const physicalAttack = [`You bash the enemy with an axe for `,`You slice the enemy with a sword for `,`You shoot the enemy with your 9mm for `, `You plow into the enemy with your Mercedes-Benz 2021 Sprinter Cargo Van with 170" Wheelbase High Roof, 4 Cylinder Diesel engine with 2500 Horse Power, capable of holding over 4000 Lbs payload for `,`You fire a barrage of arrows at the enemy for `,`You strike the enemy with 1000 punches for `,`You bash the enemies head with your own for `,`You kick the enemy in the head for `,`You grapple the enemy and toss them to the ground for `,`You input Raging Demon on the enemy for `,`You whip the enemy for `, `You punch the enemy in the head for `,`You use blackbelt level jujitsu on the enemy for `,`You flick the enemy for `, `You hit the enemy several times in the chest for `,`You target each pressure point on the enemy for `,`You beat the enemy to a pulp for `, `You throw a pie at the enemy for `,`You bite the enemy for `,`You really lean into the enemy for `,`You give the enemy a real beating for `,`You, Tony, Franky, Guiseppi and Carlos take the enemy out back for `,`You miss the enemy but they fall backwards and hit the ground for `,`You wallop the enemy for `,`You kick the enemies ass *LITERALLY for `,`You approach the enemy, instead of running away you go closer and attack for `,`You give a beat-down to the enemy for `,`You punch so fast it doesn't even register to the enemy they've just been hit for `,`You punch not once, not twice, but three times for `];
const magicAttack = [`You sunder the enemy's mind for `,`You light the enemy on fire with your mind for `,`You cast raise temperature on the opponent for `,`You cast fill water on the enemies lungs for `,`You use your 'wand' to 'cast' gunshot wound for `,`You focus a beam of light into the enemy for `,`You teleport a cinderblock into the enemy for `,`You create a fog and hit the enemy with a bat for `,`You fire an explosion with your hands at the enemy for `];

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
	let moneyMultipler = 0;
	let tempArmor = 0;
	let attackBonus = 0;
	let defenseBonus = 0;
	let playerHp = 100;
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
	//adjust health & get level
	playerHp += con;
	let playerLevel = str + con + wis + dex + intel + chr;
	
	//get the difficulty level a player wants
	const diffFilter = m => {
		return ((m.content === 'baby' || m.content === 'easy' || m.content === 'normal' || m.content === 'hard' || m.content === 'expert' || m.content === 'nightmare')&&(message.author.id == m.author.id));
	}
	let enemy = {};
	let eArt = `(O_O)`;
	let eHp = 0;
	let eStr = 0;
	let eCon = 0;
	let eWis = 0;
	let eDex = 0;
	let eIntel =  0;
	let eChr = 0;
	let enemyLevel = 0;
	message.channel.send(`what difficulty level do you want (You are level ${playerLevel}): baby, easy, normal, hard, expert, nightmare`).then(msg => {
		message.channel.awaitMessages(diffFilter,{max:1,time:30000,errors:['time']}).then(choice => {
			let option = choice.first().content;
			if(option == 'baby'){
				enemy = babyEnemies[Math.floor(Math.random() * babyEnemies.length)];
				moneyMultipler = 1;
				if(balance - moneyMultipler <= 0){
					message.channel.send(`You don't have enough money to spare if you lose!`);
					return;
				}
			}
			else if(option == 'easy'){
				enemy = easyEnemies[Math.floor(Math.random() * easyEnemies.length)];
				moneyMultipler = 5;
				if(balance - moneyMultipler <= 0){
					message.channel.send(`You don't have enough money to spare if you lose!`);
					return;
				}
			}
			else if(option == 'normal'){
				enemy = normalEnemies[Math.floor(Math.random() * normalEnemies.length)];
				moneyMultipler = 10;
				if(balance - moneyMultipler <= 0){
					message.channel.send(`You don't have enough money to spare if you lose!`);
					return;
				}
			}
			else if(option == 'hard'){
				enemy = hardEnemies[Math.floor(Math.random() * hardEnemies.length)];
				moneyMultipler = 20;
				if(balance - moneyMultipler <= 0){
					message.channel.send(`You don't have enough money to spare if you lose!`);
					return;
				}
			}
			else if(option == 'expert'){
				enemy = expertEnemies[Math.floor(Math.random() * expertEnemies.length)];
				moneyMultipler = 40;
				if(balance - moneyMultipler <= 0){
					message.channel.send(`You don't have enough money to spare if you lose!`);
					return;
				}
			}
			else if(option == 'nightmare'){
				enemy = nightmareEnemies[Math.floor(Math.random() * nightmareEnemies.length)];
				moneyMultipler = 80;
				if(balance - moneyMultipler <= 0){
					message.channel.send(`You don't have enough money to spare if you lose!`);
					return;
				}
			}
			eArt = enemy.art;
			eHp = enemy.hp;
			eStr = enemy.str;
			eCon = enemy.con;
			eWis = enemy.wis;
			eDex = enemy.dex;
			eIntel =  enemy.intel;
			eChr = enemy.chr;
			enemyLevel = eStr + eCon + eWis + eDex + eIntel + eChr;
			//actual box that will perform the loop
			let initMessage = `Info will be here!\nYour LVL: ${playerLevel} | Enemy LVL: ${enemyLevel}\n`;
			frame(initMessage);
		}).catch(e => {
			message.channel.send(`No difficulty choice made in time`);
			console.log(e);
		})
	});
	
	async function frame(infoMessage){
		message.channel.send(`${infoMessage}${eArt}HP:${playerHp} | ENEMY HP:${eHp}\n${actionBar}`,{code:true}).then( msg =>{
			message.channel.awaitMessages(filter,{
				max:1,time:60000,errors:['time']
			}).then(choice => {
				//parsing of choice begins here
				choice.first().delete();
				let action = choice.first().content;
				let gameMessage = ``;
				if(action === '!cc attack'){
					let damage = Math.floor(Math.random() * str) + attackBonus;
					let block = Math.floor(Math.random() * eDex);
					if(damage > block){
						//player hits
						let armor = Math.floor(Math.random() * eCon);
						let totalDamage = damage - armor;
						if(totalDamage <= 0){
							//attack deflected
							gameMessage += `The attack was deflected by the enemies defenses!\n`;
						}
						else{
							eHp -= totalDamage;
							gameMessage += `${physicalAttack[Math.floor(Math.random() * physicalAttack.length)]}${totalDamage}HP!\n`;
						}
					}
					else{
						gameMessage += `The attack was dodged by the enemies insane speed!\n`;
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
							gameMessage += `The attack was deflected by the enemies mental fortitude!\n`;
						}
						else{
							eHp -= totalDamage;
							gameMessage += `${magicAttack[Math.floor(Math.random() * magicAttack.length)]}${totalDamage}HP!\n`;
						}
					}
					else{
						gameMessage += `The attack failed to connect with the enemy!\n`;
					}
				}
				else if(action === '!cc block'){
					tempArmor += Math.floor(Math.random() * (con + wis)) + defenseBonus;
					gameMessage += `You gain ${tempArmor} defense for this turn!\n`;
				}
				else if(action === '!cc look'){
					if(Math.random() <= (.1 + (intel / 100))){
						let bonus = Math.floor(Math.random() * intel);
						if(Math.random() <=.5){
							//attack bonus
							attackBonus += bonus;
							gameMessage += `You spot a weakness in your enemy, you get a permanent +${bonus} to attack!\n`;
						}
						else{
							//defense bonus
							defenseBonus += bonus;
							gameMessage += `You spot a pattern in your enemy's moves, you get a permanent +${bonus} to defense!\n`;
						}
					}
					else{
						gameMessage += `You couldn't find anything exploitable!\n`;
					}
				}
				else if(action === '!cc item'){
					let hpHeal = Math.floor(Math.random()*intel)+1;
					playerHp += hpHeal;
					gameMessage += `You use a bandage and heal ${hpHeal}HP!\n`;
				}
				else if(action === '!cc run'){
					gameMessage += `You run away! COWARD!!!!!\n`;
					message.channel.send(gameMessage);
					return;
				}
				//check hp of enemy
				if(eHp <= 0){
					database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					data = JSON.parse(database);
					let amountEarned = Math.floor((enemyLevel / playerLevel) * moneyMultipler);
					for(let i=0;i<data.users.length;i++){
						if(data.users[i].id == id){
							data.users[i].balance += amountEarned;
						}
					}
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					gameMessage += `You have defeated the enemy! You win! As a reward you got ${amountEarned}CC! Your level is ${playerLevel}, the enemies level was ${enemyLevel}\n`;
					message.channel.send(gameMessage);
					return;
				}
				//enemy attack
				gameMessage += `The enemy attacks!\n`;
				if(Math.random() <= .5){
					//physical attack
					let damage = Math.floor(Math.random() * eStr);
					let block = Math.floor(Math.random() * dex) + defenseBonus + tempArmor;
					if(damage > block){
						//player hits
						let armor = Math.floor(Math.random() * con);
						let totalDamage = damage - armor;
						if(totalDamage <= 0){
							//attack deflected
							gameMessage += `The attack was deflected by your armor!\n`;
						}
						else{
							playerHp -= totalDamage;
							gameMessage += `The attack lands for ${totalDamage}HP!\n`;
						}
					}
					else{
						gameMessage += `The attack was dodged by your insane speed!\n`;
					}
				}
				else{
					//magic
					let damage = Math.floor(Math.random() * eChr);
					let block = Math.floor(Math.random() * wis) + defenseBonus + tempArmor;
					if(damage > block){
						//player hits
						let armor = Math.floor(Math.random() * chr);
						let totalDamage = damage - armor;
						if(totalDamage <= 0){
							//attack deflected
							gameMessage += `The attack was deflected by your mental fortitude!\n`;
						}
						else{
							playerHp -= totalDamage;
							gameMessage += `The attack lands for ${totalDamage}HP!\n`;
						}
					}
					else{
						gameMessage += `The attack failed to target you!\n`;
					}
				}
				if(playerHp <= 0){
					database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					data = JSON.parse(database);
					let amountEarned = Math.floor((enemyLevel / playerLevel) * moneyMultipler);
					for(let i=0;i<data.users.length;i++){
						if(data.users[i].id == id){
							data.users[i].balance -= amountEarned;
						}
					}
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					gameMessage += `You have died! So sad! You lost ${amountEarned}CC! Your level is ${playerLevel}, the enemies level was ${enemyLevel}\n`;
					message.channel.send(gameMessage);
					return;
				}
				tempArmor = 0;
				msg.delete();
				frame(gameMessage);
			}).catch(e => {
			message.channel.send(`Didnt get valid response in time`);
			console.log(e);
		});
		}).catch(e => {
			message.channel.send(`Didnt get valid response in time`);
			console.log(e);
		});
	}
}

function battleHelp(client,message){
	message.channel.send(`Use !cc battle to start a battle\nAfter this you will have to type a difficulty once prompted, type baby, easy, normal, hard, expert or nightmare\nOnce in a battle you have 6 actions\n!cc attack will do a physical attack relying on your STR\n!cc magic will do a psychic relying on your CHR\n!cc block will give you a boost of defense for a turn\n!cc look will use your INT to find a weakness in the enemy\n!cc item will use your INT to heal your wounds\n!cc run will get you out of the fight`);
}

module.exports = {
	testResponses,
	battleHelp
};