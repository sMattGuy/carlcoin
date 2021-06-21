const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');

function mancala(client,message){
	let workingID = message.author.id;
	let enemyID = "";
	let playerName = message.author.username;
	let enemyName = "";
	let playerImage = message.author.displayAvatarURL({format:'png'});
	let enemyImage = "";
	let chop = message.content.split(" ");
	let boardArray = [[4,4,4,4,4,4],[4,4,4,4,4,4]];
	let playerPocket = 0;
	let enemyPocket = 0;
	if(chop.length != 4){
		message.channel.send('Usage: !cc mancala <user> <amount>');
		return;
	}
	try{
		let enemy = getUserFromMention(client,chop[chop.length-2])
		enemyID = enemy.id;
		enemyImage = enemy.displayAvatarURL({format:'png'});
	}
	catch(err){
		message.channel.send('Invalid user selected!');
		return;
	}
	//parse wager and check if valid
	let wager = parseInt(chop[chop.length-1]);
	//check if trying to battle self temp disabled for testing
	if(message.author.id == enemyID){
		message.channel.send('You cannot play with yourself..... weirdo');
		return;
	}
	//check that wager is valid temp 0 for testing
	if(isNaN(wager) || wager < 0){
		message.channel.send('Invalid amount entered!');
		return;
	}
	const filter = m => {
		return (m.content.startsWith('!cc pocket')&&(workingID == m.author.id));
	};
	//get database information
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	//variables to store about player
	let playerId = message.author.id;
	let found = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == id){
			if(data.users[i].hasOwnProperty("busy") && data.users[i].busy == 1){
				message.channel.send(`You can only play one game at a time!`);
				return;
			}
			if(data.users[i].balance - wager < 0){
				message.channel.send(`You don't have enough CC!`);
				return;
			}
			data.users[i].busy = 1;
			data.users[i].balance -= wager;
			found = true;
			break;
		}
	}
	if(!found){
		message.channel.send(`You are not registered for Carl Coin!`);
		return;
	}
	//get the acceptance of battle
	const diffFilter = m => {
		return ((m.content === '!cc mancalaAccept' || m.content === '!cc mancalaDeny')&&(enemyID == m.author.id));
	}
	//look for enemy
	found = false;
	for(let i=0;i<data.users.length;i++){
		if(data.users[i].id == enemyID){
			if(data.users[i].balance - wager < 0){
				message.channel.send(`Your enemy doesn't have enough CC!`);
				return;
			}
			if(data.users[i].hasOwnProperty("busy") && data.users[i].busy == 1){
				message.channel.send(`Your opponent only play one game at a time!`);
				return;
			}
			data.users[i].busy = 1;
			enemyName = data.users[i].name;
			data.users[i].balance -= wager;
			found = true; 
			break;
		}
	}
	if(!found){
		message.channel.send(`Your opponent is not registered for Carl Coin!`);
		return;
	}
	message.channel.send(`${enemyName}! Type !cc mancalaAccept to accept the battle, or !cc mancalaDeny to reject the battle, You have 1 min to respond!`).then(msg => {
		message.channel.awaitMessages(diffFilter,{max:1,time:60000,errors:['time']}).then(choice => {
			let option = choice.first().content;
			if(option == '!cc mancalaAccept'){
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				let info = `It is ${message.author.username}'s turn!\n`;
				frame(info);
			}
			else if(option == '!cc mancalaDeny'){
				message.channel.send(`You have declined the game!`);
				return;
			}
		}).catch(e => {
			message.channel.send(`Opponent didn't respond in time`);
			console.log(e);
		})
	});
	
	async function frame(info){
		//draw the board
		//will need to change
		drawMancala(message.channel,`${info}Use !cc pocket <index>`,boardArray,playerImage,enemyImage).then( msg =>{
			message.channel.awaitMessages(filter,{
				max:1,time:60000,errors:['time']
			}).then(choice => {
				//parsing of choice begins here
				choice.first().delete().catch(() => {console.log('couldnt delete message in mancala')});
				//get action
				let action = choice.first().content;
				let chopAction = action.split(" ");
				let sideIndex = 0;
				if(workingID == playerId){
					sideIndex = 0;
				}
				else{
					sideIndex = 1;
				}
				let number = parseInt(chopAction[chopAction.length-1]);
				if(number >= boardArray[0].length || number < 0 || isNaN(number)){
					msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
					let currentName = "";
					if(workingID == id){
						currentName = playerName;
					}
					else{
						currentName = enemyName;
					}
					frame(`Invalid pocket selected ${currentName}! try again!\n`);
				}
				//check if pocket is empty
				else if(boardArray[sideIndex][number] == 0){
					msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
					let currentName = "";
					if(workingID == id){
						currentName = playerName;
					}
					else{
						currentName = enemyName;
					}
					frame(`Invalid pocket selected ${currentName}! try again!\n`);
				}
				//actually do game calculation
				else{
					let pieceCount = boardArray[sideIndex][number];
					boardArray[sideIndex][number] = 0;
					//advance to next pocket
					let enemySide = false;
					let goAgain = false;
					for(let i=pieceCount;i>0;i--){
						number = (number+1)%7;
						if(number%7 == 6 && !enemySide){
							playerPocket++;
							goAgain = true;
							if(sideIndex == 1){
								sideIndex = 0;
							}
							else{
								sideIndex = 1;
							}
							enemySide = true;
						}
						else if(number%7 == 6 && enemySide){
							number = 0;
							if(sideIndex == 1){
								sideIndex = 0;
							}
							else{
								sideIndex = 1;
							}
							enemySide = false;
							boardArray[sideIndex][number]++;
						}
						else{
							goAgain = false;
							boardArray[sideIndex][number]++;
						}
					}
					//steal
					if(boardArray[sideIndex][number] == 1){
						let oppositeSide = 0;
						if(sideIndex == 1){
							oppositeSide = 0;
						}
						else{
							oppositeSide = 1;
						}
						//complete steal
						if(boardArray[oppositeSide][number] != 0){
							if(workingID == id){
								playerPocket += boardArray[sideIndex][number] + boardArray[oppositeSide][number];
							}
							else{
								enemyPocket += boardArray[sideIndex][number] + boardArray[oppositeSide][number];
							}
							boardArray[sideIndex][number] = 0;
							boardArray[oppositeSide][number] = 0;
						}
					}
					if(goAgain){
						//player gets to go again
						
					}
					//check game end
					let gameOver = true;
					for(let i=0;i<boardArray[0].length;i++){
						if(boardArray[0][i] != 0){
							gameOver = false;
							break;
						}
					}
					for(let i=0;i<boardArray[0].length;i++){
						if(boardArray[1][i] != 0){
							gameOver = false;
							break;
						}
					}
					//end game
					if(gameOver){
						for(let i=0;i<boardArray[0].length;i++){
							playerPocket += boardArray[0][i];
							boardArray[0][i] = 0;
							enemyPocket += boardArray[1][i];
							boardArray[1][i] = 0;
						}
						let winner = "";
						let loser = "";
						if(playerPocket > enemyPocket){
							//player wins
							winner = id;
							loser = enemyID;
							info = `${playerName} has won! They got ${wager*2}CC!`;
						}
						else if(playerPocket < enemyPocket){
							//enemy wins
							winner = enemyID;
							loser = id;
							info = `${enemyName} has won! They got ${wager*2}CC!`;
						}
						else{
							//tie
							for(let i=0;i<data.users.length;i++){
								if(data.users[i].id == id){
									data.users[i].balance += wager;
									data.users[i].busy = 0;
								}
								if(data.users[i].id == enemyID){
									data.users[i].balance += wager;
									data.users[i].busy = 0;
								}
							}
							let newData = JSON.stringify(data);
							fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
							//draw final screen
							info = `It's a tie.... Good job?`;
							drawMancala(message.channel,`${info}`,boardArray,playerImage,enemyImage).then(()=>{
								msg.delete().catch(() => {console.log('couldnt delete message in battle')});
							});
							return;
						}
						for(let i=0;i<data.users.length;i++){
							if(data.users[i].id == winner){
								data.users[i].balance += wager*2;
								data.users[i].busy = 0;
							}
							if(data.users[i].id == loser){
								data.users[i].busy = 0;
							}
						}
						let newData = JSON.stringify(data);
						fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
						//draw final screen
						drawMancala(message.channel,`${info}`,boardArray,playerImage,enemyImage).then(()=>{
							msg.delete().catch(() => {console.log('couldnt delete message in battle')});
						});
						return;
					}
				}
			}).catch(e => {
			message.channel.send(`Didnt get valid response in time`);
			let payPlayer = '';
			let slacker = '';
			if(workingID == id){
				payPlayer = enemyID;
				slacker = id;
			}
			else{
				payPlayer = id;
				slacker = enemyID;
			}
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == payPlayer){
					data.users[i].balance += wager*2;
					data.users[i].busy = 0;
				}
				if(data.users[i].id == slacker){
					data.users[i].busy = 0;
				}
			}
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			console.log(e);
		});
		}).catch(e => {
			message.channel.send(`Didnt get valid response in time 2`);
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == id){
					data.users[i].balance += wager;
					data.users[i].busy = 0;
				}
				if(data.users[i].id == enemyID){
					data.users[i].balance += wager;
					data.users[i].busy = 0;
				}
			}
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			console.log(e);
		});
	}
}

function mancalaHelp(client,message){
	message.channel.send(`Use !cc mancala <user> <wager> to challenge someone to mancala\nUse !cc pocket <index> to place your piece`);
}

function getUserFromMention(client,mention) {
	if (!mention) return;
	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);
		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}
		return client.users.cache.get(mention);
	}
}

function testDraw(client,message){
	let boardArray = [[5,3,8,2,6,2],[9,1,11,3,6,9]];
	let playerScore = 15;
	let enemyScore = 13;
	let playerIcon = message.author.displayAvatarURL({format:'png'});
	let EnemyIcon = message.author.displayAvatarURL({format:'png'});
	drawMancala(message.channel,`test board`,boardArray,playerIcon,EnemyIcon,playerScore,enemyScore)
}

async function drawMancala(channel,info,boardArray,playerIcon,EnemyIcon,playerScore,enemyScore){
	const canvas = Canvas.createCanvas(300,400);
	const pieceNames = ['red','blue','purple','green','orange','yellow'];
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('/home/mattguy/carlcoin/mancala/mancalaboard.png');
	const playerPic = await Canvas.loadImage(playerIcon);
	const enemyPic = await Canvas.loadImage(EnemyIcon);
	//draw background board
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#0000';
	ctx.strokeRect(0,0,canvas.width,canvas.height);
	//place icons
	//place in pockets
	for(let i=0;i<boardArray.length;i++){
		for(let j=0;j<boardArray[0].length;j++){
			for(let k=0;k<boardArray[i][j];k++){
				let rock = await Canvas.loadImage(`/home/mattguy/carlcoin/mancala/${pieceNames[k%pieceNames.length]}Rock.png`);
				ctx.font = '12px sans-serif';
				context.fillStyle = '#000000';
				ctx.fillText(boardArray[i][j],35 + (i*245),90 + (j * 30));
				ctx.drawImage(rock,90 + (i*120) + Math.floor(Math.random * 3),100 + (j * 45) + Math.floor(Math.random * 3);
			}
		}
	}
	for(let k=0;k<playerScore;k++){
		let rock = await Canvas.loadImage(`/home/mattguy/carlcoin/mancala/${pieceNames[k%pieceNames.length]}Rock.png`);
		ctx.drawImage(rock,150 + Math.floor(Math.random * 60),50 + Math.floor(Math.random * 10);
	}
	for(let k=0;k<enemyScore;k++){
		let rock = await Canvas.loadImage(`/home/mattguy/carlcoin/mancala/${pieceNames[k%pieceNames.length]}Rock.png`);
		ctx.drawImage(rock,150 + Math.floor(Math.random * 60),340 + Math.floor(Math.random * 10);
	}
	//draw scores
	ctx.font = '12px sans-serif';
	context.fillStyle = '#000000';
	ctx.fillText(playerScore,120,10);
	ctx.fillText(playerScore,120,380);
	//place in score sections
	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'connect4image.png');
	return channel.send(info,attachment);
}
//export section
module.exports = {
	mancala,
	mancalaHelp,
	testDraw
};