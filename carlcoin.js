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
const sprinter = require('./js/sprinter.js');
const bank = require('./js/bank.js');
const stock = require('./js/stock.js');
const realty = require('./js/realty.js');
const battle = require('./js/battle.js');
const connect = require('./js/connect.js');
const mancala = require('./js/mancala.js');
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
let prevHour = startupDay.getHours();
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
	 guild.members.fetch();
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
	if(message.content.startsWith('!cc')){
		console.log(universalDate.getHours() + ':' + universalDate.getMinutes() + ' ' + (universalDate.getMonth()+1) + '/' + universalDate.getDate() + '/' + universalDate.getFullYear());
	}
	//increment message counter with spam protection
	if(!raffleStart && (recentId !== message.author.id && !message.author.bot)){
		messageCounter += 1;
		recentId = message.author.id;
	}
	if(prevHour != universalDate.getHours()){
		prevHour = universalDate.getHours();
		stock.updateStocks(client,message);
		realty.realtyHour(client,message);
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
	if(today != prevDate || (message.content === '!cc triggerDaily' && message.author.id == 492850107038040095)){
		prevDate = universalDate.getDay();
		dailyEvents.dailyEvents(client,message);
	}
	/* START OF USER COMMANDS, MAKE SURE ALL COMMANDS BELOW ARE MEANT TO BE RUN ONLY ONCE */
	//guess command
	if(raffleStart && message.content.startsWith('!cc guess')){ /* !cc guess amount */
		console.log(message.author.username + ' is guessing');
		if(guessingGame.guessNumber(client,message)){
			raffleStart = false;
		}
	}
	//battle start command
	else if(message.content.startsWith('!cc challenge')){ /* !cc challenge @user amount */
		console.log(message.author.username + ' is challenging');
		playerBattle.battlePlayer(client,message);
	}
	//accept or deny battle
	else if(message.content === '!cc denyBattle' || message.content === '!cc acceptBattle'){
		console.log(message.author.username + ' is accepting/denying a battle');
		playerBattle.acceptDenyBattle(client,message);
	}
   //join command
	else if (message.content === '!cc join' && !message.author.bot) {
		console.log(message.author.username + ' is joining carl');
		joinCarl.joinCarlCoin(client,message);
	}
	//audit user
	else if(message.content.startsWith('!cc audit')){
		console.log(message.author.username + ' is auditing');
		audit.auditUser(client,message);
	}
	//player card
	else if(message.content === '!cc balance'){
		console.log(message.author.username + ' is checking balance');
		balance.checkBalance(client,message);
	}
	//pay user
	else if(message.content.startsWith('!cc pay')){
		console.log(message.author.username + ' is paying');
		pay.payUser(client,message);
	}
	//chance game
	else if(message.content === '!cc chance'){ /*!cc chance*/
		console.log(message.author.username + ' is chancing');	
		chance.chanceGame(client,message);
	}
	//work
	else if(message.content === '!cc work'){
		console.log(message.author.username + ' is working');
		work.workPlayer(client,message);
	}
	//purchase home
	else if(message.content.startsWith('!cc purchase')){ /* !cc purchase home/apartment/skyscraper */
		console.log(message.author.username + ' is purchasing');
		purchase.purchaseItem(client,message);
	}
	//purchase items
	else if(message.content === '!cc catalog'){
		console.log(message.author.username + ' is checking catalog');
		purchase.purchaseList(client,message);
	}
	//sell house
	else if(message.content.startsWith('!cc sell')){ /* !cc sell house/apartment */
		console.log(message.author.username + ' is selling');
		sell.sellBuilding(client,message);
	}
	//sell to someone
	else if(message.content.startsWith('!cc userSell')){ /* !cc sellTo person offer amount*/
		console.log(message.author.username + ' is selling to a user');
		sellUser.sellUser(client,message);
	}
	//accept offer
	else if(message.content === '!cc acceptPurchase' || message.content === '!cc denyPurchase'){
		console.log(message.author.username + ' is accepting/denying purchase');
		sellUser.acceptDenySale(client,message);
	}
	//economy function
	else if(message.content === '!cc econ'){
		console.log(message.author.username + ' is checking econ');
		econ.checkEcon(client,message);
	}
	//lottery
	else if(message.content === '!cc lottery'){
		console.log(message.author.username + ' is enrolling in lottery');
		lottery.enrollInLottery(client,message);
	}
	//blackjack
	else if(message.content.startsWith('!cc blackjack')){ /* !cc blackjack amount */	
		console.log(message.author.username + ' is playing blackjack');
		blackjack.blackjackStart(client,message);
	}
	//hit
	else if(message.content === '!cc hit'){
		console.log(message.author.username + ' is hitting in blackjack');
		blackjack.blackjackHit(client,message);
	}
	//stay
	else if(message.content === '!cc stand'){
		console.log(message.author.username + ' is standing in blackjack');
		blackjack.blackjackStand(client,message);
	}
	//uh oh
	else if(message.content === '!cc suicide'){
		console.log(message.author.username + ' is suiciding');
		suicide.attemptSuicide(client,message);
	}
	//relax
	else if(message.content === '!cc relax'){
		console.log(message.author.username + ' is relaxing');
		relax.relaxUser(client,message);
	}
	//doctor
	else if(message.content === '!cc doctor'){
		console.log(message.author.username + ' is going to the doctor');
		doctor.doctorVisit(client,message);
	}
	//check sanity
	else if(message.content === '!cc sanity'){
		console.log(message.author.username + ' is checking sanity');
		sanity.checkSanity(client,message);
	}
	//leaderboard
	else if(message.content === '!cc leaderboard'){
		console.log(message.author.username + ' is checking leaderboard');
		leaderboard.checkLeaderboard(client,message);
	}
	//update name
	else if(message.content === '!cc name'){
		console.log(message.author.username + ' is changing name');
		changeName.changeName(client,message);
	}
	//cc sex
	else if(message.content.startsWith('!cc sex')){
		console.log(message.author.username + ' is having sex');
		sex.haveSex(client,message);
	}
	//robbery
	else if(message.content.startsWith('!cc rob')){
		console.log(message.author.username + ' is robbing');
		rob.robPlayer(client,message);
	}
	//rock paper scissors
	else if(message.content.startsWith('!cc rps')){ /* !cc challenge @user amount */
		console.log(message.author.username + ' is rpsing');
		RPS.startRPS(client,message);
	}
	//accept or deny battle
	else if(message.content === '!cc denyRps' || message.content === '!cc acceptRps'){
		console.log(message.author.username + ' is accepting/denying rps');
		RPS.acceptDenyRPS(client,message);
	}
	//slot machine
	else if(message.content.startsWith('!cc slots')){
		console.log(message.author.username + ' is playing slots');
		slots.playSlots(client,message);
	}
	//help menu
	else if(message.content === '!cc help'){
		console.log(message.author.username + ' is checking help');
		help.mainHelp(client,message);
	}
	//gamble help
	else if(message.content === '!cc gameHelp'){
		console.log(message.author.username + ' is checking game help');
		help.gambleHelp(client,message);
	}
	//user help
	else if(message.content === '!cc userHelp'){
		console.log(message.author.username + ' is checking user help');
		help.userHelp(client,message);
	}
	//purchase horse
	else if(message.content === '!cc horsePurchase'){
		console.log(message.author.username + ' is purchasing horse');
		horse.purchaseHorse(client,message);
	}
	//see all horses
	else if(message.content === '!cc horseList'){
		console.log(message.author.username + ' is checking horse list');
		horse.horseList(client,message);
	}
	//see individual horse
	else if(message.content.startsWith('!cc horseStats')){
		console.log(message.author.username + ' is checking horse stats');
		horse.horseStats(client,message);
	}
	//sell horse
	else if(message.content.startsWith('!cc horseSell')){
		console.log(message.author.username + ' is selling horse');
		horse.horseSell(client,message);
	}
	//agree to offer
	else if(message.content === '!cc horseDeny' || message.content === '!cc horseAccept'){
		console.log(message.author.username + ' is accepting / denying horse sell');
		horse.acceptDenyHorse(client,message);
	}
	//horse help
	else if(message.content === '!cc horseHelp'){
		console.log(message.author.username + ' is checking horse help');
		horse.horseHelp(client,message);
	}
	//horse train
	else if(message.content.startsWith('!cc horseTrain')){
		console.log(message.author.username + ' is training horse');
		horse.trainHorse(client,message);
	}
	//horse breed
	else if(message.content.startsWith('!cc horseBreed')){
		console.log(message.author.username + ' is breeding horse');
		horse.breedHorse(client,message);
	}
	//race
	else if(message.content.startsWith('!cc horseRace')){
		console.log(message.author.username + ' is racing horse');
		horse.raceHorse(client,message);
	}
	//name horse
	else if(message.content.startsWith('!cc horseName')){
		console.log(message.author.username + ' is naming horse');
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
	//cause race
	else if(message.content === '!cc causeRace' && message.author.id == 492850107038040095){
		horse.actualRace(client,message);
	}
	//leave server
	else if(message.content.startsWith('!cc leaveServer') && message.author.id == 492850107038040095){
		admin.leaveServer(client,message);
	}
	//cure user
	else if(message.content.startsWith('!cc cureInsanity') && message.author.id == 492850107038040095){
		admin.cureInsanity(client,message);
	}
	//drive sprinter
	else if(message.content === '!cc driveSprinter'){
		console.log(message.author.username + ' is driving a sprinter');
		sprinter.driveSprinter(client,message);
	}
	//sprinter help
	else if(message.content === '!cc sprinterHelp'){
		console.log(message.author.username + ' is looking at sprinter help');
		sprinter.sprinterHelp(client,message);
	}
	//name horse
	else if(message.content === '!cc checkRace'){
		console.log(message.author.username + ' is checking horse race');
		horse.checkRace(client,message);
	}
	//bank stuff
	else if(message.content.startsWith('!cc createBankAccount')){
		console.log(message.author.username + ' is creating a bank account');
		bank.createBankAccount(client,message);
	}
	else if(message.content === '!cc bankBalance'){
		console.log(message.author.username + ' is checking bank account');
		bank.bankBalance(client,message);
	}
	else if(message.content.startsWith('!cc bankDeposit')){
		console.log(message.author.username + ' is depositing into a bank account');
		bank.bankDeposit(client,message);
	}
	else if(message.content.startsWith('!cc bankWithdraw')){
		console.log(message.author.username + ' is withdrawing from a bank account');
		bank.bankWithdraw(client,message);
	}
	else if(message.content === '!cc bankInfo'){
		console.log(message.author.username + ' is checking bank info');
		bank.bankInfo(client,message);
	}
	else if(message.content === '!cc bankHelp'){
		console.log(message.author.username + ' is checking bank help');
		bank.bankHelp(client,message);
	}
	//stock check
	else if(message.content === '!cc showStocks'){
		console.log(message.author.username + ' is checking stocks');
		stock.showStocks(client,message);
	}
	else if(message.content === '!cc stockPort'){
		console.log(message.author.username + ' is checking stock port');
		stock.showPort(client,message);
	}
	else if(message.content.startsWith('!cc stockBuy')){
		console.log(message.author.username + ' is buying stock');
		stock.buyStock(client,message);
	}
	else if(message.content.startsWith('!cc stockSell')){
		console.log(message.author.username + ' is selling stock');
		stock.sellStock(client,message);
	}
	else if(message.content === '!cc stockGraph'){
		console.log(message.author.username + ' is checking stock graph');
		stock.stockGraph(client,message);
	}
	else if(message.content === '!cc stockOwnership'){
		console.log(message.author.username + ' is checking stock ownership');
		stock.stockOwnership(client,message);
	}
	else if(message.content === '!cc forceStockUpdate' && message.author.id == 492850107038040095){
		console.log(message.author.username + ' is forcing stock update');
		stock.updateStocks(client,message);
	}
	else if(message.content.startsWith('!cc createNewStock') && message.author.id == 492850107038040095){
		console.log(message.author.username + ' is creating a stock');
		stock.createNewStock(client,message);
	}
	else if(message.content === '!cc stockHelp'){
		console.log(message.author.username + ' is checking stock help');
		stock.stockHelp(client,message);
	}
	//realty
	else if(message.content === '!cc realtyHelp'){
		console.log(message.author.username + ' is checking realty help');
		realty.realtyHelp(client,message);
	}
	else if(message.content === '!cc realtyListings'){
		console.log(message.author.username + ' is checking realty listings');
		realty.realtyListings(client,message);
	}
	else if(message.content === '!cc realtyGraph'){
		console.log(message.author.username + ' is checking realty graph');
		realty.realtyGraph(client,message);
	}
	else if(message.content.startsWith('!cc realtyList')){
		console.log(message.author.username + ' is listing a realty');
		realty.realtyList(client,message);
	}
	else if(message.content.startsWith('!cc realtyBuy')){
		console.log(message.author.username + ' is buying a realty');
		realty.realtyBuy(client,message);
	}
	else if(message.content.startsWith('!cc realtyCancel')){
		console.log(message.author.username + ' is canceling a realty');
		realty.realtyCancel(client,message);
	}
	else if(message.content === '!cc battle'){
		console.log(message.author.username + ' is battling an enemy');
		battle.testResponses(client,message);
	}
	else if(message.content === '!cc battleHelp'){
		console.log(message.author.username + ' is checking battle help');
		battle.battleHelp(client,message);
	}
	else if(message.content.startsWith('!cc connect4')){
		console.log(message.author.username + ' is playing connect4');
		connect.connect4(client,message);
	}
	else if(message.content === '!cc connectHelp'){
		console.log(message.author.username + ' is checking connect help');
		connect.connectHelp(client,message);
	}
	else if(message.content === '!cc mancalaHelp'){
		console.log(message.author.username + ' is checking mancala help');
		mancala.testDraw(client,message);
	}
	else if(message.content.startsWith('!cc mancala') && message.content != '!cc mancalaAccept' && message.content != '!cc mancalaDeny'){
		console.log(message.author.username + ' is playing mancala');
		mancala.mancala(client,message);
	}
	else if(message.content === '!cc patchnotes'){
		console.log(message.author.username + '  is checking patchnotes');
		message.channel.send(`Patch Notes 6/19/2021\nAdded mancala, see !cc mancalaHelp for more information`);
	}
	//caps lock
	else if(message.content.startsWith('!CC')){
		message.channel.send(`Stop yelling :|`);
	}	
});
// Log our bot in using the token from https://discord.com/developers/applications
client.login(`${credentials.token}`);
