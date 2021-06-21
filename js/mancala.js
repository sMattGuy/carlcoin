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
				message.channel.send(`Your opponent can only play one game at a time!`);
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
		drawMancala(message.channel,`${info}Use !cc pocket <index>`,boardArray,playerImage,enemyImage,playerPocket,enemyPocket,playerName,enemyName).then( msg =>{
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
					frame(`That pocket is invalid ${currentName}! try again!\n`);
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
					frame(`Pocket ${number} has no pieces ${currentName}! try again!\n`);
				}
				//actually do game calculation
				else{
					let pieceCount = boardArray[sideIndex][number];
					let originalPocket = number;
					boardArray[sideIndex][number] = 0;
					//advance to next pocket
					let enemySide = false;
					let goAgain = false;
					for(let i=pieceCount;i!=0;i--){
						number++;
						if(number == 6 && !enemySide){
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
						else if(number == 6 && enemySide){
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
						if(workingID == id){
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
							frame(`It's (Right) ${playerName}'s turn again! ${playerName} moved ${pieceCount} pieces from pocket ${originalPocket}!\n`);
							return;
						}
						else{
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
							frame(`It's (Left) ${enemyName}'s turn! ${enemyName} moved ${pieceCount} pieces from pocket ${originalPocket}!\n`);
							return;
						}
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
							drawMancala(message.channel,`${info}`,boardArray,playerImage,enemyImage,playerPocket,enemyPocket,playerName,enemyName).then(()=>{
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
						drawMancala(message.channel,`${info}`,boardArray,playerImage,enemyImage,playerPocket,enemyPocket,playerName,enemyName).then(()=>{
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
						});
						return;
					}
					else{
						//not won yet
						if(workingID == id){
							workingID = enemyID;
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
							frame(`It's (Right) ${enemyName}'s turn! ${playerName} moved ${pieceCount} pieces from pocket ${originalPocket}!\n`);
						}
						else{
							workingID = id;
							msg.delete().catch(() => {console.log('couldnt delete message in mancala')});
							frame(`It's (Left) ${playerName}'s turn! ${enemyName} moved ${pieceCount} pieces from pocket ${originalPocket}!\n`);
						}
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
	let boardArray = [[1,2,3,4,5,6],[8,9,10,11,12,13]];
	let playerScore = 7;
	let enemyScore = 14;
	let playerIcon = message.author.displayAvatarURL({format:'png'});
	let EnemyIcon = message.author.displayAvatarURL({format:'png'});
	drawMancala(message.channel,`test board`,boardArray,playerIcon,EnemyIcon,playerScore,enemyScore,message.author.username,message.author.username);
}

async function drawMancala(channel,info,boardArray,playerIcon,EnemyIcon,playerScore,enemyScore,playerName,enemyName){
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
	ctx.drawImage(playerPic, 5, 5, 50, 50);
	ctx.drawImage(enemyPic, 245, 345, 50, 50);
	//place in pockets
	//player side
	for(let j=boardArray[0].length-1;j>=0;j--){
		for(let k=0;k<boardArray[0][j];k++){
			let currentRock = `${pieceNames[k%pieceNames.length]}Rock.png`;
			let rock = await Canvas.loadImage(`/home/mattguy/carlcoin/mancala/${currentRock}`);
			ctx.drawImage(rock,80 + Math.floor(Math.random() * 10),300 - (j * 42) + Math.floor(Math.random() * 10),10,10);
		}
		ctx.font = '12px sans-serif';
		ctx.fillStyle = '#000000';
		ctx.fillText(boardArray[0][j],45,310 - (j * 43));
	}
	//enemy side
	for(let j=0;j<boardArray[1].length;j++){
		for(let k=0;k<boardArray[1][j];k++){
			let currentRock = `${pieceNames[k%pieceNames.length]}Rock.png`;
			let rock = await Canvas.loadImage(`/home/mattguy/carlcoin/mancala/${currentRock}`);
			ctx.drawImage(rock,80 + (120 + Math.floor(Math.random() * 10)),87 + ((j * 42) + Math.floor(Math.random() * 10)),10,10);
		}
		ctx.font = '12px sans-serif';
		ctx.fillStyle = '#000000';
		ctx.fillText(boardArray[1][j],45 + 200,100 + (j * 43));
	}
	//player scores
	for(let k=0;k<playerScore;k++){
		let rock = await Canvas.loadImage(`/home/mattguy/carlcoin/mancala/${pieceNames[k%pieceNames.length]}Rock.png`);
		ctx.drawImage(rock,85 + Math.floor(Math.random() * 120),45 + Math.floor(Math.random() * 10),10,10);
	}
	//enemy scores
	for(let k=0;k<enemyScore;k++){
		let rock = await Canvas.loadImage(`/home/mattguy/carlcoin/mancala/${pieceNames[k%pieceNames.length]}Rock.png`);
		ctx.drawImage(rock,85 + Math.floor(Math.random() * 120),330 + Math.floor(Math.random() * 8),10,10);
	}
	//draw scores
	ctx.font = '12px sans-serif';
	ctx.fillStyle = '#000000';
	ctx.fillText(playerScore,230,20);
	ctx.fillText(enemyScore,60,390);
	ctx.fillText(playerName,60,20);
	ctx.fillText(enemyName,170,390);
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