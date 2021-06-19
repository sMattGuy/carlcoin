const Discord = require('discord.js');
const fs = require('fs');

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
		if(boardArray[i][col] == id){
			count++
		}
		else{
			count = 0;
		}
		if(count >= 4){
			return true;
		}
	}
	//check diagnol 
	for(let rowStart = 0;rowStart<boardArray.length - 4;rowStart++){
		count = 0;
		let rowC = rowStart;
		let colC = 0;
		for(rowC = rowStart, colC = 0; rowC < boardArray[0].length && colC < boardArray.length;rowC++, colC++){
			if(boardArray[rowC][colC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
	}
	//check diagnol 
	for(let colStart = 0;colStart<boardArray[0].length - 4;colStart++){
		count = 0;
		let rowC = 0;
		let colC = 0;
		for(rowC = 0, colC = colStart; rowC < boardArray[0].length && colC < boardArray.length;rowC++, colC++){
			if(boardArray[rowC][colC] == id){
				count++;
				if(count >= 4){
					return true;
				}
			}
			else{
				count = 0;
			}
		}
	}
	return false;
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
	/*
	if(message.author.id == enemyID){
		message.channel.send('You cannot play with yourself..... weirdo');
		return;
	}
	*/
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
			if(data.users[i].balance - wager < 0){
				message.channel.send(`You don't have enough CC!`);
				return;
			}
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
	message.channel.send(`${message.author.username}! Type !cc connectAccept to accept the battle, or !cc connectDeny to reject the battle, You have 1 min to respond!`).then(msg => {
		message.channel.awaitMessages(diffFilter,{max:1,time:60000,errors:['time']}).then(choice => {
			let option = choice.first().content;
			if(option == '!cc connectAccept'){
				let info = `It is ${message.author.username}'s turn!\n`;
				frame(info);
			}
			else if(option == '!cc connectDeny'){
				message.channel.send(`You have declined the game!`);
				return;
			}
		}).catch(e => {
			message.channel.send(`No difficulty choice made in time`);
			console.log(e);
		})
	});
	
	function frame(info){
		//draw the board
		let boardImage = ` 0 1 2 3 4 5 6\n`;
		for(let i=0;i<boardArray[0].length;i++){
			boardImage += `|`;
			for(let j=0;j<boardArray.length;j++){
				if(boardArray[j][i] == 1){
					boardImage += 'R|';
				}
				else if(boardArray[j][i] == -1){
					boardImage += 'B|';
				}
				else{
					boardImage += '_|';
				}
			}
			boardImage += `\n`;
		}
		message.channel.send(`${info}${boardImage}\nUse !cc place <index>`,{code:true}).then( msg =>{
			message.channel.awaitMessages(filter,{
				max:1,time:60000,errors:['time']
			}).then(choice => {
				//parsing of choice begins here
				choice.first().delete().catch(() => {console.log('couldnt delete message in battle')});
				let action = choice.first().content;
				console.log(action);
				let chopAction = action.split(" ");
				let number = parseInt(chopAction[chopAction.length-1]);
				console.log(number);
				if(number >= boardArray.length || number < 0 || isNaN(number)){
					msg.delete().catch(() => {console.log('couldnt delete message in battle')});;
					frame(`Invalid index selected! try again\n`);
				}
				else if(boardArray[number][0] == 1 || boardArray[number][0] == -1){
					msg.delete().catch(() => {console.log('couldnt delete message in battle')});;
					frame(`That column is full! select a different one!\n`);
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
							if(checkVictory(boardArray,number,i,num)){
								message.channel.send(`Connect 4! The game has ended`);
								for(let i=0;i<data.users.length;i++){
									if(data.users[i].id == workingID){
										data.users[i].balance += (wager*2);
										break;
									}
								}
								let newData = JSON.stringify(data);
								fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
								return;
							}
							else{
								//not won yet
								if(workingID == id){
									workingID = enemyID;
									msg.delete().catch(() => {console.log('couldnt delete message in battle')});;
									frame(`It's ${enemyName}'s turn!\n`);
								}
								else{
									workingID = id;
									msg.delete().catch(() => {console.log('couldnt delete message in battle')});;
									frame(`It's ${playerName}'s turn!\n`);
								}
							}
							break;
						}
					}
				}
			}).catch(e => {
			message.channel.send(`Didnt get valid response in time 1`);
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == id){
					data.users[i].balance += wager;
				}
				if(data.users[i].id == enemyID){
					data.users[i].balance += wager;
				}
			}
			console.log(e);
		});
		}).catch(e => {
			message.channel.send(`Didnt get valid response in time 2`);
			for(let i=0;i<data.users.length;i++){
				if(data.users[i].id == id){
					data.users[i].balance += wager;
				}
				if(data.users[i].id == enemyID){
					data.users[i].balance += wager;
				}
			}
			console.log(e);
		});
	}
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

//export section
module.exports = {
	connect4
};