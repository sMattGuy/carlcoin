'use strict';
// Import the discord.js module and others
const Discord = require('discord.js');
const fs = require('fs');
const Canvas = require('canvas');
//additional files holding each feature
const playerBattle = require('./js/playerBattle.js');
const guessingGame = require('./js/guessGame.js');
const dailyEvents = require('./js/daily.js');
const joinCarl = require('./js/joinCarl.js');
const audit = require('./js/audit.js');
const balance = require('./js/balance.js');
const pay = require('./js/payUser.js');
const chance = require('./js/chance.js');
const work = require('./js/work.js');
const purchase = require('./js/purchase.js');
const sell = require('./js/sellBuilding.js');
const sellUser = require('./js/sellUser.js');
const econ = require('./js/economy.js');
const lottery = require('./js/lottery.js');
const blackjack = require('./js/blackjack.js');
const suicide = require('./js/suicide.js');
const relax = require('./js/relax.js');
const doctor = require('./js/doctor.js');
const sanity = require('./js/sanity.js');
const leaderboard = require('./js/leaderboard.js');
const changeName = require('./js/changeName.js');
const sex = require('./js/sex.js');
const rob = require('./js/robbery.js');
const RPS = require('./js/rockpaperscissors.js');
const slots = require('./js/slotmachine.js');
const help = require('./js/help.js');
const horse = require('./js/horse.js');
const admin = require('./js/admin.js');


// Create an instance of a Discord client
const client = new Discord.Client();
// import token and database
const credentials = require('./auth.json');
//raffle variables
let startupDay = new Date();
let messageCounter = 0;
let raffleStart = false;
//new day checking variables
let prevDate = startupDay.getDay();
//anti spam stuff
let recentId;

//sets ready presense
client.on('ready', () => {
  client.user.setPresence({
    status: 'online',
    activity: {
        name: 'for !cc help',
        type: "WATCHING"
    }
  });
  //list server
  client.guilds.cache.forEach(guild => {
    console.log(`${guild.name} | ${guild.id}`);
  });
  console.log('I am ready!');
});
// Create an event listener for messages
client.on('message', message => {
	//set presence
   client.user.setPresence({
      status: 'online',
		activity: {
         name: 'for !cc help',
         type: "WATCHING"
      }
   });
	//defines the date and time for certain aspects of the bot
	let universalDate = new Date();
	let timeRightNow = universalDate.getMinutes();
	let today = universalDate.getDay();	
	//increment message counter with spam protection
	if(!raffleStart && (recentId !== message.author.id && !message.author.bot)){
		messageCounter += 1;
		recentId = message.author.id;
	}
	//raffle functionality
	//message failsafe incase countery somehow goes past value
	let database = fs.readFileSync('/home/mattguy/carlcoin/database.json');
	let data = JSON.parse(database);
	//detects when md5 raffle should begin
	if((messageCounter >= data.raffleRNG && !raffleStart)){
		messageCounter = 0;
		raffleStart = true;
		guessingGame.startGuessGame(client,message);
	}
	//daily events
	if(today != prevDate){
		prevDate = universalDate.getDay();
		dailyEvents.dailyEvents(client,message);
	}
	/* START OF USER COMMANDS, MAKE SURE ALL COMMANDS BELOW ARE MEANT TO BE RUN ONLY ONCE */
	//guess command
	if(raffleStart && message.content.startsWith('!cc guess')){ /* !cc guess amount */
		if(guessingGame.guessNumber(client,message)){
			raffleStart = false;
		}
	}
	//battle start command
	else if(message.content.startsWith('!cc challenge')){ /* !cc challenge @user amount */
		playerBattle.battlePlayer(client,message);
	}
	//accept or deny battle
	else if(message.content === '!cc denyBattle' || message.content === '!cc acceptBattle'){
		playerBattle.acceptDenyBattle(client,message);
	}
   //join command
	else if (message.content === '!cc join' && !message.author.bot) {
		joinCarl.joinCarlCoin(client,message);
	}
	//audit user
	else if(message.content.startsWith('!cc audit')){
		audit.auditUser(client,message);
	}
	//player card
	else if(message.content === '!cc balance'){
		balance.checkBalance(client,message);
	}
	//pay user
	else if(message.content.startsWith('!cc pay')){
		pay.payUser(client,message);
	}
	//chance game
	else if(message.content === '!cc chance'){ /*!cc chance*/ 
		chance.chanceGame(client,message);
	}
	//work
	else if(message.content === '!cc work'){
		work.workPlayer(client,message);
	}
	//purchase home
	else if(message.content.startsWith('!cc purchase')){ /* !cc purchase home/apartment/skyscraper */
		purchase.purchaseItem(client,message);
	}
	//purchase items
	else if(message.content === '!cc catalog'){
		purchase.purchaseList(client,message);
	}
	//sell house
	else if(message.content.startsWith('!cc sell')){ /* !cc sell house/apartment */
		sell.sellBuilding(client,message);
	}
	//sell to someone
	else if(message.content.startsWith('!cc userSell')){ /* !cc sellTo person offer amount*/
		sellUser.sellUser(client,message);
	}
	//accept offer
	else if(message.content === '!cc acceptPurchase' || message.content === '!cc denyPurchase'){
		sellUser.acceptDenySale(client,message);
	}
	//economy function
	else if(message.content === '!cc econ'){
		econ.checkEcon(client,message);
	}
	//lottery
	else if(message.content === '!cc lottery'){
		lottery.enrollInLottery(client,message);
	}
	//blackjack
	else if(message.content.startsWith('!cc blackjack')){ /* !cc blackjack amount */	
		blackjack.blackjackStart(client,message);
	}
	//hit
	else if(message.content === '!cc hit'){
		blackjack.blackjackHit(client,message);
	}
	//stay
	else if(message.content === '!cc stand'){
		blackjack.blackjackStand(client,message);
	}
	//uh oh
	else if(message.content === '!cc suicide'){
		suicide.attemptSuicide(client,message);
	}
	//relax
	else if(message.content === '!cc relax'){
		relax.relaxUser(client,message);
	}
	//doctor
	else if(message.content === '!cc doctor'){
		doctor.doctorVisit(client,message);
	}
	//check sanity
	else if(message.content === '!cc sanity'){
		sanity.checkSanity(client,message);
	}
	//leaderboard
	else if(message.content === '!cc leaderboard'){
		leaderboard.checkLeaderboard(client,message);
	}
	//update name
	else if(message.content === '!cc name'){
		changeName.changeName(client,message);
	}
	//cc sex
	else if(message.content.startsWith('!cc sex')){
		sex.haveSex(client,message);
	}
	//robbery
	else if(message.content.startsWith('!cc rob')){
		rob.robPlayer(client,message);
	}
	//rock paper scissors
	else if(message.content.startsWith('!cc rps')){ /* !cc challenge @user amount */
		RPS.startRPS(client,message);
	}
	//accept or deny battle
	else if(message.content === '!cc denyRps' || message.content === '!cc acceptRps'){
		RPS.acceptDenyRPS(client,message);
	}
	//slot machine
	else if(message.content.startsWith('!cc slots')){
		slots.playSlots(client,message);
	}
	//help menu
	else if(message.content === '!cc help'){
		help.mainHelp(client,message);
	}
	//gamble help
	else if(message.content === '!cc gameHelp'){
		help.gambleHelp(client,message);
	}
	//user help
	else if(message.content === '!cc userHelp'){
		help.userHelp(client,message);
	}
	//purchase horse
	else if(message.content === '!cc horsePurchase'){
		horse.purchaseHorse(client,message);
	}
	//see all horses
	else if(message.content === '!cc horseList'){
		horse.horseList(client,message);
	}
	//see individual horse
	else if(message.content.startsWith('!cc horseStats')){
		horse.horseStats(client,message);
	}
	//sell horse
	else if(message.content.startsWith('!cc horseSell')){
		horse.horseSell(client,message);
	}
	//agree to offer
	else if(message.content === '!cc horseDeny' || message.content === '!cc horseAccept'){
		horse.acceptDenyHorse(client,message);
	}
	//horse help
	else if(message.content === '!cc horseHelp'){
		horse.horseHelp(client,message);
	}
	//horse train
	else if(message.content.startsWith('!cc horseTrain')){
		horse.trainHorse(client,message);
	}
	//horse breed
	else if(message.content.startsWith('!cc horseBreed')){
		horse.breedHorse(client,message);
	}
	//race
	else if(message.content.startsWith('!cc horseRace')){
		horse.raceHorse(client,message);
	}
	//name horse
	else if(message.content.startsWith('!cc horseName')){
		horse.nameHorse(client, message);
	}
	//give carl
	else if(message.content.startsWith('!cc giveCarlCoin') && message.author.id == 492850107038040095){
		admin.giveUserMoney(client, message);
	}
	//summon coin
	else if(message.content === '!cc summonGaintCoin' && message.author.id == 492850107038040095){
		admin.summonGaintCoin(client,message);
	}
	//caps lock
	else if(message.content.startsWith('!CC')){
		message.channel.send(`Stop yelling :|`);
	}	
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
