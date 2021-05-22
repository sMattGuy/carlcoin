const Discord = require('discord.js');
const fs = require('fs');

function startRPS(client,message){
	//check command is correctly entered
	let chop = message.content.split(" ");
	if(chop.length != 4){
		message.channel.send('Command arguments incorrect!');
	}
	else{
		//read and parse database
		let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
		let data = JSON.parse(database);
		//assign challenger
		let challenger = message.author.id;
		let mentionOK = true;
		let opponent = 0;
		//check if opponent exists or is correctly entered
		try{
			opponent = getUserFromMention(client,chop[chop.length-2]).id;
		}
		catch(err){
			message.channel.send('Invalid user selected!');
			mentionOK = false;
		}
		//run if opponent parse is okay
		if(mentionOK){
			let rebattle = true;
			//check if opponent is in battle
			if(fs.existsSync(`/home/mattguy/carlcoin/cache/${opponent}rps`)){
				//if opponent file exists, parse data
				let rpsFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${opponent}rps`);
				let rpsParse = JSON.parse(rpsFile);
				//time expired for battle, delete old file
				if(rpsParse.rpsEnder < Date.now()){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${opponent}rps`);
				}
				//if person is already in battle
				else{
					rebattle = false;
					message.channel.send('That person is already playing rock paper scissors!');
				}
			}
			//begin finding battle
			if(rebattle){
				//parse wager and check if valid
				let wager = parseInt(chop[chop.length-1]);
				//check if trying to battle self
				if(opponent == challenger){
					message.channel.send('You try to verse yourself and lost... how sad');
				}
				//check that wager is valid
				else if(isNaN(wager) || wager < 0){ //change later
					message.channel.send('Invalid amount entered!');
				}
				else{
					let noUser = true;
					//find challenger in database
					for(let i=0;i<data.users.length;i++){
						if(data.users[i].id == challenger){
							//if challenger doesnt have enough money
							if(data.users[i].balance - wager < 0){
								message.channel.send('You dont have enough CC!');
							}
							else{
								let noOpp = true;
								//find opponent in database
								for(let j=0;j<data.users.length;j++){
									if(data.users[j].id == opponent){
										//if opponent doesnt have enough money
										if(data.users[j].balance - wager < 0){
											message.channel.send('Opponent doesnt have enough CC!');
										}
										else{
											console.log("RPS:" + data.users[i].name + " vs " + data.users[j].name + " for " + wager);
											//begin setting up battle variables
											let rpsEnder = Date.now() + 60000;
											let rpsInfo = {"challenger":`${challenger}`,"challIndex":`${i}`,"opponent":`${opponent}`,"oppIndex":`${j}`,"wager":`${wager}`,"rpsEnder":`${rpsEnder}`};
											let jsonBattle = JSON.stringify(rpsInfo);
											//create battle cache file and alert opponent of their challenge
											fs.writeFileSync(`/home/mattguy/carlcoin/cache/${opponent}rps`,jsonBattle);
											data.users[i]["activity"] = Date.now();
											let newData = JSON.stringify(data);
											fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
											message.channel.send(`${data.users[j].name}! Type !cc acceptRps to accept ${data.users[i].name}'s rock paper scissors request or type !cc denyRps to reject the challenge. You have 1 minute to respond, make sure you can recieve DM's!`);
										}
										noOpp = false;
										break;
									}
								}
								if(noOpp){
									message.channel.send('Opponent doesnt exist!');
								}
							}
							noUser = false;
							break;
						}
					}
					if(noUser){
						message.channel.send('You are not registered for CC!');
					}
				}
			}
		}
	}	
}

function acceptDenyRPS(client,message){
	//save message author id
	let personsId = message.author.id;
	//find if opponent file exists
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}rps`)){
		//parse opponent cache file
		let rpsFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
		let rpsParse = JSON.parse(rpsFile);
		//check if time has expired for this opponent
		if(rpsParse.rpsEnder < Date.now()){
			fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
			message.channel.send('Time has expired to accept the rock paper scissors battle');
		}
		else{
			//if deny battle, mock opponent and delete their cache file
			if(message.content == '!cc denyRps'){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
				message.channel.send('You lose by default');
			}
			//accept battle protocol
			else if(message.content == '!cc acceptRps'){
				//parse database
				let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
				let data = JSON.parse(database);
				//parse wager from cache file
				let wager = parseInt(rpsParse.wager);
				//checking to see if user suddenly doesnt have enough money
				if(data.users[rpsParse.challIndex].balance - wager < 0){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
					message.channel.send(`The challenger doesn't have enough money!`);
				}
				else if(data.users[rpsParse.oppIndex].balance - wager < 0){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
					message.channel.send(`You don't have enough money!`);
				}
				//begin battle
				else{
					message.channel.send(`Getting challengers throw, please wait!`);
					//set the winning amount
					let winnerAmount = wager * 2;
					const filter = m => {
						if((m.content !== 'rock' && m.content !== 'paper' && m.content !== 'scissors') && !m.author.bot){
							m.channel.send('Invalid choice, make sure you spelt it correctly!');
						}
						return (m.content === 'rock' || m.content === 'paper' || m.content === 'scissors')
					};
					//take money from both users
					client.users.cache.get(data.users[rpsParse.challIndex].id).send(`Type rock, paper, or scissors`).then(()=>{
						client.users.cache.get(data.users[rpsParse.challIndex].id).dmChannel.awaitMessages(filter, {max:1,time:20000,errors:['time']}).then(challChoice => {
							client.users.cache.get(data.users[rpsParse.challIndex].id).send(`Got it, going to get opponents choice now`);
							client.users.cache.get(data.users[rpsParse.oppIndex].id).send(`Type rock, paper, or scissors`).then(()=>{
								client.users.cache.get(data.users[rpsParse.oppIndex].id).dmChannel.awaitMessages(filter, {max:1,time:20000,errors:['time']}).then(oppChoice => {
									client.users.cache.get(data.users[rpsParse.challIndex].id).send(`Go back to the channel you were challenged to see who wins!`);
									client.users.cache.get(data.users[rpsParse.oppIndex].id).send(`Go back to the channel you were challenged to see who wins!`);
									let challThrow = challChoice.first().content;
									let oppThrow = oppChoice.first().content;
									
									if(challThrow != 'rock' && challThrow != 'scissors' && challThrow != 'paper' && oppThrow != 'rock' && oppThrow != 'scissors' && oppThrow != 'paper'){
										message.channel.send(`Someone didn't choose correctly, the match is cancelled!`)
									}
									else if(challThrow == 'rock' && oppThrow == 'scissors'){
										message.channel.send(`${data.users[rpsParse.challIndex].name} threw rock, ${data.users[rpsParse.oppIndex].name} threw scissors`);
										message.channel.send(`${data.users[rpsParse.challIndex].name} won!`);
										data.users[rpsParse.challIndex].balance += wager;
										data.users[rpsParse.oppIndex].balance -= wager;
									}
									else if(challThrow == 'scissors' && oppThrow == 'paper'){
										message.channel.send(`${data.users[rpsParse.challIndex].name} threw scissors, ${data.users[rpsParse.oppIndex].name} threw paper`);
										message.channel.send(`${data.users[rpsParse.challIndex].name} won!`);
										data.users[rpsParse.challIndex].balance += wager;
										data.users[rpsParse.oppIndex].balance -= wager;
									}
									else if(challThrow == 'paper' && oppThrow == 'rock'){
										message.channel.send(`${data.users[rpsParse.challIndex].name} threw paper, ${data.users[rpsParse.oppIndex].name} threw rock`);
										message.channel.send(`${data.users[rpsParse.challIndex].name} won!`);
										data.users[rpsParse.challIndex].balance += wager;
										data.users[rpsParse.oppIndex].balance -= wager;
									}
									else if(challThrow == oppThrow){
										message.channel.send(`${data.users[rpsParse.challIndex].name} threw ${challThrow}, ${data.users[rpsParse.oppIndex].name} threw ${oppThrow}`);
										message.channel.send(`It's a tie!`);
									}
									else{
										message.channel.send(`${data.users[rpsParse.challIndex].name} threw ${challThrow}, ${data.users[rpsParse.oppIndex].name} threw ${oppThrow}`);
										message.channel.send(`${data.users[rpsParse.oppIndex].name} won!`);
										data.users[rpsParse.challIndex].balance -= wager;
										data.users[rpsParse.oppIndex].balance += wager;
									}
									data.users[rpsParse.challIndex]["activity"] = Date.now();
									data.users[rpsParse.oppIndex]["activity"] = Date.now();
									data.users[rpsParse.challIndex]["bitterness"] = 0;
									data.users[rpsParse.oppIndex]["bitterness"] = 0;
									//write new data to database and delete cache file
									let newData = JSON.stringify(data);
									fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
									fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);
								}).catch(oppChoice => {message.channel.send(`Opponent didn't type their response correctly or time expired to respond`);fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);});
							}).catch(() => {message.channel.send(`Failed to send DM to opponent (make sure you have DM's on for this server!)`);fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);});
						}).catch(challChoice => {message.channel.send(`Challenger didn't type their response correctly or time expired to respond`);fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);});
					}).catch(() => {message.channel.send(`Failed to send DM to challenger (make sure you have DM's on for this server!)`);fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}rps`);});
				}
			}
		}
	}
}

//helper function to get user
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

//export functions
module.exports = {
	startRPS,
	acceptDenyRPS
};