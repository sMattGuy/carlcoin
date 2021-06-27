const Discord = require('discord.js');
const fs = require('fs');

function mainHelp(client,message){
	message.channel.send(`use !cc gameHelp to see information on games\nuse !cc userHelp to see user commands\nuse !cc horseHelp to see information on horses\nuse !cc sprinterHelp to see sprinter commands\nuse !cc bankHelp to see bank information!\nuse !cc stockHelp to see stock information\nuse !cc realtyHelp to see realty information\nuse !cc battleHelp to learn about battles\nuse !cc connectHelp to see info on connect 4\nuse !cc mancalaHelp for mancala information\nuse !cc patchnotes to see recent changes`);
}

function gambleHelp(client,message){
	message.channel.send(`use !cc chance to maybe double your money!\nuse !cc guess <number> when theres a solve chance! numbers are between 1 and 100\nuse !cc challenge <@user> <amount> to challenge someone for some CC!\nuse !cc lottery to enroll in the lottery, winner gets the pot!\nuse !cc blackjack <amount> to play blackjack\nuse !cc rob <@user> to attempt to steal some coin from them!\nuse !cc rps <@user> <amount> to challenge someone to rock paper scissors, the bot will DM you!\nuse !cc slots <amount> to play some slot machine games!`);
}

function userHelp(client,message){
	message.channel.send(`use !cc join to join Carl Coin!\nuse !cc balance to see your balance\nuse !cc pay <@user> <amount> to pay another user\nuse !cc work to go to the carl mines!\nuse !cc econ to see the current economy\nuse !cc purchase <type> to purchase something\nuse !cc catalog to see all things for sale\nuse !cc sell <type> to sell a house, apartment or skyscraper!\nuse !cc userSell <@user> <type> <amount> to sell to another person\nuse !cc relax to unwind some stress from gambling\nuse !cc sanity to see how you are feeling\nuse !cc leaderboard to see everyones balance\nuse !cc audit <@user> to see their balance\nuse !cc doctor to get some medicine for your insanity\nuse !cc name to update to your current name`);
}

//export functions
module.exports = {
	mainHelp,
	gambleHelp,
	userHelp
};