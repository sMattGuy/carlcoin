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
			choice.first().delete();
			let option = choice.first().content;
			if(option == 'baby'){
				enemy = babyEnemies[Math.floor(Math.random() * babyEnemies.length)];
			}
			else if(option == 'easy'){
				enemy = easyEnemies[Math.floor(Math.random() * easyEnemies.length)];
			}
			else if(option == 'normal'){
				enemy = normalEnemies[Math.floor(Math.random() * normalEnemies.length)];
			}
			else if(option == 'hard'){
				enemy = hardEnemies[Math.floor(Math.random() * hardEnemies.length)];
			}
			else if(option == 'expert'){
				enemy = expertEnemies[Math.floor(Math.random() * expertEnemies.length)];
			}
			else if(option == 'nightmare'){
				enemy = nightmareEnemies[Math.floor(Math.random() * nightmareEnemies.length)];
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
							gameMessage += `The attack was deflected!\n`;
						}
						else{
							eHp -= totalDamage;
							gameMessage += `The attack lands for ${totalDamage}HP!\n`;
						}
					}
					else{
						gameMessage += `The attack was dodged!\n`;
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
							gameMessage += `The attack was deflected!\n`;
						}
						else{
							eHp -= totalDamage;
							gameMessage += `The attack lands for ${totalDamage}HP!\n`;
						}
					}
					else{
						gameMessage += `The attack was dodged!\n`;
					}
				}
				else if(action === '!cc block'){
					tempArmor += Math.floor(Math.random() * (con + wis)) + defenseBonus;
					gameMessage += `You gain ${tempArmor} defense for this turn!\n`;
				}
				else if(action === '!cc look'){
					if(Math.random() <= .1){
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
					let amountEarned = 0;
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
							gameMessage += `The attack was deflected!\n`;
						}
						else{
							playerHp -= totalDamage;
							gameMessage += `The attack lands for ${totalDamage}HP!\n`;
						}
					}
					else{
						gameMessage += `The attack was dodged!\n`;
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
							gameMessage += `The attack was deflected!\n`;
						}
						else{
							playerHp -= totalDamage;
							gameMessage += `The attack lands for ${totalDamage}HP!\n`;
						}
					}
					else{
						gameMessage += `The attack was dodged!\n`;
					}
				}
				if(playerHp <= 0){
					database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
					data = JSON.parse(database);
					let amountEarned = 0;
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

module.exports = {
	testResponses
};