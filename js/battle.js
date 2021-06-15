const Discord = require('discord.js');
const fs = require('fs');

function testResponses(client,message){
	const filter = m => {
		if((m.content !== '!cc attack' && m.content !== '!cc look' && m.content !== '!cc block' && m.content !== '!cc run' && m.content !== '!cc item') && !m.author.bot && (m.author.id == message.author.id)){
			m.channel.send('Invalid choice, make sure you spelt it correctly!');
		}
		return (m.content === '!cc attack' || m.content === '!cc look' || m.content === '!cc block' || m.content === '!cc run' || m.content === '!cc item');
	};
	message.channel.send('ACTIONS:\n!cc attack\n!cc look\n!cc block\n!cc run\n!cc item').then(()=>{message.channel.awaitMessages(filter,{max:1,time:20000,errors:['time']}).then(choice => {message.channel.send(`You selected ${choice.content}`)})}).catch(e => {message.channel.send(`Didnt get valid response in time`);console.log(e);});
}

module.exports = {
	testResponses
};