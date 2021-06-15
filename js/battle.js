const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');

function testResponses(client,message){
	const filter = m => {
		return (m.content === '!cc attack' || m.content === '!cc look' || m.content === '!cc block' || m.content === '!cc run' || m.content === '!cc item');
	};
	//get database information
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	let id = message.author.id;
	message.channel.send('ACTIONS:\n!cc attack\n!cc look\n!cc block\n!cc run\n!cc item').then(()=>{
		message.channel.awaitMessages(filter,{
			max:1,time:20000,errors:['time']
		}).then(choice => {
			//parsing of choice begins here
			message.channel.send(`You selected ${choice.first().content}`)
		})
	}).catch(e => {
		message.channel.send(`Didnt get valid response in time`);
		console.log(e);
	});
}


async function drawBattle(channel, gameMessage){
	const canvas = Canvas.createCanvas(496,288);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('/home/mattguy/carlcoin/battleImages/board.jpg');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = '#358a54';
	ctx.strokeRect(0,0,canvas.width,canvas.height);

	channel.send(`${gameMessage}`,attachment);
}


module.exports = {
	testResponses
};