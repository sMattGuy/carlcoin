const Discord = require('discord.js');
const fs = require('fs');

function battlePlayer(client,message){
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
			if(fs.existsSync(`/home/mattguy/carlcoin/cache/${opponent}battle`)){
				//if opponent file exists, parse data
				let battleFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${opponent}battle`);
				let battleParse = JSON.parse(battleFile);
				//time expired for battle, delete old file
				if(battleParse.battleEnder < Date.now()){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${opponent}battle`);
				}
				//if person is already in battle
				else{
					rebattle = false;
					message.channel.send('That person is already in battle!');
				}
			}
			//begin finding battle
			if(rebattle){
				//parse wager and check if valid
				let wager = parseInt(chop[chop.length-1]);
				//check if trying to battle self
				if(opponent == challenger){
					message.channel.send('Go fight your inner demons elsewhere');
				}
				//check that wager is valid
				else if(isNaN(wager) || wager <= 0){
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
											console.log("battle:" + data.users[i].name + " vs " + data.users[j].name + " for " + wager);
											//begin setting up battle variables
											let battleEnder = Date.now() + 60000;
											let battleInfo = {"challenger":`${challenger}`,"challIndex":`${i}`,"opponent":`${opponent}`,"oppIndex":`${j}`,"wager":`${wager}`,"battleEnder":`${battleEnder}`};
											let jsonBattle = JSON.stringify(battleInfo);
											//create battle cache file and alert opponent of their challenge
											fs.writeFileSync(`/home/mattguy/carlcoin/cache/${opponent}battle`,jsonBattle);
											data.users[i]["activity"] = Date.now();
											let newData = JSON.stringify(data);
											fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
											message.channel.send(`${data.users[j].name}! Type !cc acceptBattle to accept ${data.users[i].name}'s challenge or type !cc denyBattle to reject the challenge. You have 1 minute to respond.`);
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

function acceptDenyBattle(client,message){
	//save message author id
	let personsId = message.author.id;
	//find if opponent file exists
	if(fs.existsSync(`/home/mattguy/carlcoin/cache/${personsId}battle`)){
		//parse opponent cache file
		let battleFile = fs.readFileSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
		let battleParse = JSON.parse(battleFile);
		//check if time has expired for this opponent
		if(battleParse.battleEnder < Date.now()){
			fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
			message.channel.send('Time has expired to accept the battle');
		}
		else{
			//if deny battle, mock opponent and delete their cache file
			if(message.content == '!cc denyBattle'){
				fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
				message.channel.send('Coward');
			}
			//accept battle protocol
			else if(message.content == '!cc acceptBattle'){
				//parse database
				let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
				let data = JSON.parse(database);
				//parse wager from cache file
				let wager = parseInt(battleParse.wager);
				//checking to see if user suddenly doesnt have enough money
				if(data.users[battleParse.challIndex].balance - wager < 0){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
					message.channel.send(`The challenger doesn't have enough money!`);
				}
				else if(data.users[battleParse.oppIndex].balance - wager < 0){
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
					message.channel.send(`You don't have enough money!`);
				}
				//begin battle
				else{
					//set the winning amount
					let winnerAmount = wager * 2;
					//take money from both users
					data.users[battleParse.challIndex].balance -= wager;
					data.users[battleParse.oppIndex].balance -= wager;
					data.users[battleParse.challIndex]["activity"] = Date.now();
					data.users[battleParse.oppIndex]["activity"] = Date.now();
					//generate their random value
					let ChallengerRandom = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
					let OpponentRandom = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
					//check to see who wins
					//challenger wins
					if(ChallengerRandom > OpponentRandom){
						data.users[battleParse.challIndex].balance += winnerAmount;
						message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n| \\o   |  o   |\n|  |\\  | /|\\  |\n| / \\  | / \\  |\n|      |      |\n+--${ChallengerRandom}---+--${OpponentRandom}---+`,{"code":true});
						message.channel.send(`${data.users[battleParse.challIndex].name} has won! They now have ${data.users[battleParse.challIndex].balance}CC!`);
					}
					//opponent wins
					else if(ChallengerRandom < OpponentRandom){
						data.users[battleParse.oppIndex].balance += winnerAmount;
						message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n|  o   |  o/  |\n| /|\\  | /|   |\n| / \\  | / \\  |\n|      |      |\n+--${ChallengerRandom}---+--${OpponentRandom}---+`,{"code":true});
						message.channel.send(`${data.users[battleParse.oppIndex].name} has won! They now have ${data.users[battleParse.oppIndex].balance}CC!`);
					}
					//users tie
					else{
						data.users[battleParse.challIndex].balance += wager;
						data.users[battleParse.oppIndex].balance += wager;
						message.channel.send(`${data.users[battleParse.challIndex].name} vs ${data.users[battleParse.oppIndex].name} for ${winnerAmount}CC\n+------+------+\n|      |      |\n|  o   |  o   |\n| /|\\  | /|\\  |\n| / \\  | / \\  |\n|      |      |\n+--${ChallengerRandom}---+--${OpponentRandom}---+`,{"code":true});
						message.channel.send(`A draw?! How lame!`);
					}
					data.users[battleParse.challIndex]["bitterness"] = 0;
					data.users[battleParse.oppIndex]["bitterness"] = 0;
					//write new data to database and delete cache file
					let newData = JSON.stringify(data);
					fs.writeFileSync('/home/mattguy/carlcoin/database.json',newData);
					fs.unlinkSync(`/home/mattguy/carlcoin/cache/${personsId}battle`);
				}
			}
		}
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
	battlePlayer,
	acceptDenyBattle
};