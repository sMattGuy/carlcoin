const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');

function checkVictory(boardArray,col,row,id){
	//check vertical
	let count = 0;
	for(let i=0;i<boardArray[0].length;i++){
		if(boardArray[col][i] == id){
			count++;
		}
		else{
			count = 0;
		}
		if(count >= 4){
			return true;
		}
	}
	//check horizontal
	count = 0;
	for(let i=0;i<boardArray.length;i++){
		if(boardArray[i][row] == id){
			count++
		}
		else{
			count = 0;
		}
		if(count >= 4){
			return true;
		}
	}
	//check down right diagnol 
	for(let rowStart = 0;rowStart<boardArray[0].length - 3;rowStart++){
		count = 0;
		let rowC = 0;
		let colC = 0;
		for(rowC = rowStart, colC = 0; rowC < boardArray[0].length && colC < boardArray.length;rowC++, colC++){
			//console.log('down right row'+colC+' '+rowC);
			if(boardArray[colC][rowC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
		//console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
	}
	//check down right diagnol 
	for(let colStart = 0;colStart<boardArray.length - 3;colStart++){
		count = 0;
		let rowC = 0;
		let colC = 0;
		for(rowC = 0, colC = colStart; rowC < boardArray[0].length && colC < boardArray.length;rowC++, colC++){
			//console.log('down right col'+colC+' '+rowC);
			if(boardArray[colC][rowC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
		//console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
	}
	//check down left diagnol 
	for(let colStart = boardArray.length-1;colStart>2;colStart--){
		count = 0;
		let rowC = 0;
		let colC = 0;
		for(rowC = 0, colC = colStart; rowC < boardArray[0].length && colC >= 0;rowC++, colC--){
			//console.log('down left col'+colC+' '+rowC);
			if(boardArray[colC][rowC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
		//console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
	}
	//check down left diagnol 
	for(let rowStart = 0;rowStart<boardArray[0].length - 3;rowStart++){
		count = 0;
		let rowC = 0;
		let colC = 0;
		for(rowC = rowStart, colC = boardArray.length-1; rowC < boardArray[0].length && colC >= 0;rowC++, colC--){
			//console.log('down left row'+colC+' '+rowC);
			if(boardArray[colC][rowC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
		//console.log('~~~~~~~~~~~~~~~~~~~~~~~~');
	}
	return false;
}

function checkTie(boardArray){
	for(let i=0;i<boardArray.length;i++){
		if(boardArray[i][0] == 0){
			return false;
		}
	}
	return true;
}

function connect4(client,message){
	let workingID = message.author.id;
	let enemyID = "";
	let playerName = message.author.username;
	let enemyName = "";
	let chop = message.content.split(" ");
	let boardArray = [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]];
	if(chop.length != 4){
		message.channel.send('Usage: !cc connect4 <user> <amount>');
		return;
	}
	try{
		enemyID = getUserFromMention(client,chop[chop.length-2]).id;
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
		return (m.content.startsWith('!cc place')&&(workingID == m.author.id));
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
		return ((m.content === '!cc connectAccept' || m.content === '!cc connectDeny')&&(enemyID == m.author.id));
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
	let newData = JSON.stringify(data);
	fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
	message.channel.send(`${enemyName}! Type !cc connectAccept to accept the battle, or !cc connectDeny to reject the battle, You have 1 min to respond!`).then(msg => {
		message.channel.awaitMessages(diffFilter,{max:1,time:60000,errors:['time']}).then(choice => {
			let option = choice.first().content;
			if(option == '!cc connectAccept'){
				database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
				data = JSON.parse(database);
				let newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				let info = `It is ${message.author.username}'s turn!\n`;
				frame(info);
			}
			else if(option == '!cc connectDeny'){
				database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
				data = JSON.parse(database);
				for(let i=0;i<data.users.length;i++){
					if(data.users[i].id == enemyID){
						data.users[i].busy = 0;
					}
					if(data.users[i].id == id){
						data.users[i].busy = 0;
					}
				}
				newData = JSON.stringify(data);
				fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
				message.channel.send(`You have declined the game!`);
				return;
			}
		}).catch(e => {
			database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			data = JSON.parse(database);
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == enemyID){
					data.users[i].busy = 0;
				}
				if(data.users[i].id == id){
					data.users[i].busy = 0;
					data.users[i].balance += wager;
				}
			}
			newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			message.channel.send(`Opponent didn't respond in time`);
			console.log(e);
		})
	});
	
	async function frame(info){
		//draw the board
		if(checkTie(boardArray)){
			drawConnect(message.channel,`It's a tie!`,boardArray).then(()=>{
				database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
				data = JSON.parse(database);
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
			});
			return;
		}
		drawConnect(message.channel,`${info}Use !cc place <index>`,boardArray).then( msg =>{
			message.channel.awaitMessages(filter,{
				max:1,time:60000,errors:['time']
			}).then(choice => {
				//parsing of choice begins here
				choice.first().delete().catch(() => {console.log('couldnt delete message in battle')});
				let action = choice.first().content;
				let chopAction = action.split(" ");
				let number = parseInt(chopAction[chopAction.length-1]);
				if(number >= boardArray.length || number < 0 || isNaN(number)){
					msg.delete().catch(() => {console.log('couldnt delete message in battle')});
					let currentName = "";
					if(workingID == id){
						currentName = playerName;
					}
					else{
						currentName = enemyName;
					}
					frame(`Invalid index selected ${currentName}! try again!\n`);
				}
				else if(boardArray[number][0] == 1 || boardArray[number][0] == -1){
					msg.delete().catch(() => {console.log('couldnt delete message in battle')});
					let currentName = "";
					if(workingID == id){
						currentName = playerName;
					}
					else{
						currentName = enemyName;
					}
					frame(`That column is full ${currentName}! select a different one!\n`);
				}
				//actually place piece
				else{
					for(let i=0;i<boardArray[number].length;i++){
					if(i+1 == boardArray[number].length || boardArray[number][i+1] == 1 || boardArray[number][i+1] == -1){
							//reached end place piece
							let num;
							if(workingID == id){
								boardArray[number][i] = 1;
								num = 1;
							}
							else{
								boardArray[number][i] = -1;
								num = -1;
							}
							//check if win
							//number is the column, i is the downward direction
							/*
							 0 1 2 3 4 5 6			these are number
							|_|_|_|_|_|_|_| 0
							|_|_|_|_|_|_|_| 1 	i
							|_|_|_|_|_|_|_| 2 	|	these are i
							|_|_|_|_|_|_|_| 3	V
							|_|_|_|_|_|_|_| 4
							|_|_|_|_|_|_|_| 5
							*/
							if(checkVictory(boardArray,number,i,num)){
								database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
								data = JSON.parse(database);
								let winner = workingID;
								let loser = "";
								if(workingID == id){
									loser = enemyID;
								}
								else{
									loser = id;
								}
								info = "";
								for(let i=0;i<data.users.length;i++){
									if(data.users[i].id == winner){
										data.users[i].balance += (wager*2);
										data.users[i].busy = 0;
										if(isNaN(data.users[i]["INT"])){
											data.users[i]["INT"] = 0;
										}
										if(isNaN(data.users[i]["intExp"])){
											data.users[i]["intExp"] = 0;
										}
										data.users[i]["intExp"] += 1;
										if(data.users[i]["INT"] * 2 + 1 < data.users[i]["intExp"]){
											data.users[i]["intExp"] = 0;
											data.users[i]["INT"] += 1;
											info += `Your mind games helped you with critical thinking, causing your INT to increase!\n`;
										}
									}
									if(data.users[i].id == loser){
										data.users[i].busy = 0;
									}
								}
								let newData = JSON.stringify(data);
								fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
								if(workingID == id){
									info += `${playerName} has won! They have won ${wager*2}CC!\n`;
								}
								else{
									info += `${enemyName} has won! They have won ${wager*2}CC!\n`;
								}
								drawConnect(message.channel,`${info}`,boardArray).then(()=>{
									msg.delete().catch(() => {console.log('couldnt delete message in battle')});
								});
								return;
							}
							else{
								//not won yet
								if(workingID == id){
									workingID = enemyID;
									msg.delete().catch(() => {console.log('couldnt delete message in battle')});
									frame(`It's (blue) ${enemyName}'s turn! ${playerName} placed their chip in ${number}!\n`);
								}
								else{
									workingID = id;
									msg.delete().catch(() => {console.log('couldnt delete message in battle')});
									frame(`It's (red) ${playerName}'s turn! ${enemyName} placed their chip in ${number}!\n`);
								}
							}
							break;
						}
					}
				}
			}).catch(e => {
			database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			data = JSON.parse(database);
			let payPlayer = '';
			let slacker = '';
			let slackerName = '';
			let payPlayerName = '';
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
					payPlayerName = data.users[i].name;
				}
				if(data.users[i].id == slacker){
					data.users[i].busy = 0;
					slackerName = data.users[i].name;
				}
			}
			message.channel.send(`${slackerName} didn't respond in time! ${payPlayerName} wins!`);
			let newData = JSON.stringify(data);
			fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
			console.log(e);
		});
		}).catch(e => {
			database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
			data = JSON.parse(database);
			message.channel.send(`Didn't get back a response, sending money back to both players`);
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

function connectHelp(client,message){
	message.channel.send(`Use !cc connect4 <user> <wager> to challenge someone to connect 4\nUse !cc connectAccept or !cc connectDeny to respond to the challenge\nUse !cc place <index> to place your piece`);
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

async function drawConnect(channel,info,boardArray){
	const canvas = Canvas.createCanvas(288,252);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('/home/mattguy/carlcoin/connect/connectBoard.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#0000';
	ctx.strokeRect(0,0,canvas.width,canvas.height);
		
	for(let i=0;i<boardArray[0].length;i++){
		for(let j=0;j<boardArray.length;j++){
			if(boardArray[j][i] == 1){
				let chip = await Canvas.loadImage(`/home/mattguy/carlcoin/connect/redChip.png`);
				ctx.drawImage(chip,(j*36)+18,(i*36)+18+i,36,36);
			}
			else if(boardArray[j][i] == -1){
				let chip = await Canvas.loadImage(`/home/mattguy/carlcoin/connect/blueChip.png`);
				ctx.drawImage(chip,(j*36)+18,(i*36)+18+i,36,36);
			}
			else{
				continue;
			}
		}
	}	
	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'connect4image.png');
	return channel.send(info,attachment);
}
//export section
module.exports = {
	connect4,
	connectHelp
};