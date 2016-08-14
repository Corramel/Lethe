var Discord = require('discord.js');

var util = require('util');
var ytdl = require('ytdl-core');
var request = require('superagent');
var reequest = require('request');
var url = require('url');
var express = require('express');
var cheerio = require('cheerio');
var parseString = require('xml2js').parseString;
var app = express();
// Output version information in console
var git = require('git-rev');

git.short(commit => git.branch(branch => {
  console.log(`Lethe#${branch}@${commit}`);
}));

var shouldDisallowQueue = require('./lib/permission-checks.js');
var Saved = require('./lib/saved.js');
Saved.read();

var YoutubeTrack = require('./lib/youtube-track.js');

var Util = require('./lib/util.js');
var Config = require('./lib/config.js');
var adminIds = Config.adminIds;
var randEbolaPic = require('./lib/ebolachaninfo.json');
var randFangCringe = require('./lib/fangsmemes.json');
var triviaAnswers = require('./lib/questionsNadeko.json');
var CURRENT_REV = 4;

var client = new Discord.Client();

// Handle discord.js warnings
client.on('warn', (m) => console.log('[warn]', m));
client.on('debug', (m) => console.log('[debug]', m));
var randomPunInfo;
var totalNumberNeeded;
var randomCompliment;
var yourMomJoke;
var randomInsult;
var luckyOnes;
var toParse;
var pickBotOn = false;
var timeCommandUsedFirst;
var fireemblemJSON;
var messageArray = [];
var voteAllIDs = [];
var playQueue = [];
var boundChannel = false;
var currentStream = false;
var ownerID = "81526338728501248"
var imgurKey = "7e434a22b72652ce49644e5fc337e5711327f1f4"
var voteCount = 0;
var voteTotalCount = 0;
// Video that is currently being played
var currentVideo = false;

// Last video played
var lastVideo = false;

var botMention = false;

var shouldStockpile = false
var stockpile = '';

// Handling api key
var apiKey = process.argv[4] || (Config.auth.apiKey !== "youtube API key (optional)") ? Config.auth.apiKey : false;

client.on('ready', () => {
  if (Config.botHasNickname) {
    botMention = `<@!${client.user.id}>`;
  } else {
   botMention = `<@${client.user.id}>`;
 }
  console.log(`Bot mention: ${botMention}`);
  if (Config.configRev !== CURRENT_REV) {
    console.log('WARNING: Your lethe-config.json is out of date relative to the code using it! Please update it from the git repository, otherwise things will break!');
  }
});

client.on('message', m => {
  if (!botMention) return;
  if (client.user.id == m.author.id) return;

  if (!(m.content.startsWith(`${botMention} `) || m.content.startsWith(`?`))) return;

  if (m.content.startsWith(`${botMention} info`)) {
    if (!checkCommand(m, 'info')) return;
    git.short(commit => git.branch(branch => {
      client.reply(m, `https://github.com/Corramel/Lethe; a bot that has been modified for memes and other funposting. Original bot can be found here:https://github.com/meew0/Lethe`);
    }));
    return;
  }
  if (m.content.startsWith(`${botMention} help`)) { // help
    if (!checkCommand(m, 'help')) return;
    client.reply(m, 'commands are coming soon, there are a lot of commands.');
    return;
  }

  if (m.content.startsWith(`${botMention} init`)) { // init
    if (!checkCommand(m, 'init')) return;
    if (boundChannel) return;
    var channelToJoin = spliceArguments(m.content)[1];
    for (var channel of m.channel.server.channels) {
      if (channel instanceof Discord.VoiceChannel) {
        if (!channelToJoin || channel.name === channelToJoin) {
          boundChannel = m.channel;
          client.reply(m, `Binding to text channel <#${boundChannel.id}> and voice channel **${channel.name}** \`(${channel.id})\``);
          client.joinVoiceChannel(channel).catch(error);
          break;
        }
      }
    }
    return;
  }

  if (m.content.startsWith(`${botMention} destroy`)) { // destroy
    if (!checkCommand(m, 'destroy')) return;
    if (!boundChannel) return;
    client.reply(m, `Unbinding from <#${boundChannel.id}> and destroying voice connection`);
    playQueue = [];
    client.internal.leaveVoiceChannel();
    boundChannel = false;
    currentStream = false;
    currentVideo = false;
    return;
  }
  if(m.content.startsWith(`?phrase`)) {
    	var start1=["A bad excuse","A bad workman","A bird in the hand","A cat","A cat","A chain","A change","A child that's born on the Sabbath day","A dog","A drowning man","A free lunch","A friend in need","A friend to everybody","A friend who shares","A friend's frown","A gentle answer","A golden key","A good beginning","A good conscience","A good husband","A good man","A good thing","A harsh word","A house divided against itself","A leopard","A little knowledge","A loveless life","A man","A miss","A nod","A penny saved","A picture","A problem shared","A red sky at night","A red sky in the morning","A rising tide","A rolling stone","A stitch in time","A thing of beauty","A throne","A volunteer","A watched pot","A woman's place","A woman's work","A word to the wise","Absence","Power corrupts; absolute power","Adversity","All publicity","All that glitters","All the world","All work and no play","All you need","An apple a day","An army","An elephant","An empty barrel","An Englishman's home","An onion a day","An ounce of prevention","Attack","Beauty","Beauty","Blood","Bread","Brevity","Charity","Cleanliness","Crime","Crying over spilt milk","Curiosity","Diligence","Discretion","Don't bite the hand that","Erring","Every cloud","Every dog","Every man","Every man","Every picture","Experience","Failing to plan","Faint heart","Fair exchange","Faith","Familiarity","Flattery","Fortune","Friday's child","Giving","Good talk","Half a loaf","Handsome","He has enough who","He is rich who","He who fights and runs away","He who hesitates","He who laughs last","He who lives by the sword","Hindsight","History","Home","Honesty","If a job is worth doing it","Ignorance","Imitation","In the kingdom of the blind, the one-eyed man","It never rains, but it","Knowledge","Laughter","Life","Lightning","Lost time","Love","Misery","Monday's child","Money","Money","Music","Necessity","No man","No man","No news","One good turn","One man's junk","One man's meat","One swallow","Opportunity","Patience","Possession","Practice","Pride","Procrastination","Revenge","Revenge","Rome","Saturday's child","Seeing","Silence","Speak of the devil and he","Strike while the iron","Success has many fathers, while failure","Talk","That which does not kill us","The apple","The bottom line","The cake","The cobbler","The course of true love","The customer","The darkest hour","The devil","The early bird","The end","The forbidden fruit","The grass","The hand that rocks the cradle","The husband","The last straw","The longest journey","The love of money","The pen","The pot","The proof of the pudding","The road to hell","The second mouse","The sleeping fox","The spirit is willing, but the flesh","The squeaky wheel","The truth","The way to a man's heart","The world","Thursday's child","Time","Tomorrow","Live for today, for tomorrow","True beauty","Truth","Tuesday's child","Two is company, but three","Variety","Virtue","Wednesday's child","What can't be cured","What goes up","What's good for the goose","Who dares","Worrying","Youth","A journey of a thousand miles","A man with a hammer","A man who is his own lawyer","Careless talk","Courage is the measure of a man, beauty","Doubt","The fear of the Lord","East is east, and west","Give him an inch and he","Give a man a fish and he","Give a man a fish and he will eat for a day; teach him to fish and he","Give a man enough rope and he","He that goes a-borrowing,","He who pays the piper","He who knows, does not speak. He who speaks,","Hell","If anything can go wrong, it","Knowledge is power, France","Many a true word","March comes in like a lion and","The rain in Spain","When clouds look like black smoke, a wise man","Nature","One hand","Slow and steady","Stupid","The best defence","Hatred","God","No man or woman is worth your tears, and the one who is","A bully","A handsome shoe","No wise man","Make hay while the sun","A single penny, fairly got,"];
		var start2=["A fool and his money","Accidents","Actions","All good things","All roads","Appearances","Barking dogs","Beggars","Birds of a feather","Boys","Cheaters","Clothes","Comparisons","Dead men","First impressions","Fools","God helps those who","Good fences","Good things","Good things","Great minds","Little things","Many drops","Many hands","Oil and water","Only fools and horses","Only the good","People, when in Rome,","Those who live in glass houses","Sticks and stones may break my bones, but words","Sticks and stones","The best things in life","The meek","Those who can, do; those who can't,","Those who don't learn from history","Those who sleep with dogs","Too many cooks","Two blacks","Two heads","Two wrongs","The walls","When the cat's away the mice","When the going gets tough, the tough","Wonders","Worse things","If you pay peanuts, you","When life gives you lemons, you","If you can't stand the heat, you","Laugh and the world laughs with you; weep and you","If you spare the rod, you","Take care of the pence, and the pounds","Diamonds","Rules"];
		var end1=["is easily parted","happens","speaks louder than words","must come to an end","leads to Rome","can be deceiving","seldom bites","can't be a chooser","flocks together","will be boys","never prospers","does not make the man","is odious","tells no tales","is the most lasting","makes good neighbours","comes to those who wait","comes in small packages","pleases little minds","makes a shower","makes light work","doesn't mix","works","dies young","should do as the Romans do","shouldn't throw stones","will never hurt me","may break my bones, but words will never hurt me","is free","will inherit the earth","will rise with fleas","spoils the broth","is better than one","doesn't make a right","has ears","will never cease","happens at sea","is better than none","blames his tools","is worth two in the bush","may look at a king","has nine lives","is only as strong as its weakest link","is as good as a rest","is fair and wise and good and gay","is a man's best friend","will clutch at a straw","is a friend indeed","is a friend to nobody","is a friend who cares","is better than a fool's smile","turns away wrath","can open any door","makes a good ending","is a soft pillow","makes a good wife","is hard to find","is soon snatched up","stirs up anger","cannot stand","can't change its spots","is a dangerous thing","is a living death","is known by the company he keeps","is as good as a mile","is as good as a wink to a blind horse","is a penny earned","is worth a thousand words","is a problem halved","is a shepherd's delight","is a shepherd's warning","lifts all boats","gathers no moss","saves nine","is a joy forever","is only a bench covered in velvet","is worth twenty pressed men","never boils","is in the home","is never done","makes the heart grow fonder","corrupts absolutely","makes strange bedfellows","is good publicity","is not gold","loves a lover","makes Jack a dull boy","is love","keeps the doctor away","marches on its stomach","never forgets","makes the most noise","is his castle","keeps everyone away","is worth a pound of cure","is the best form of defence","is in the eye of the beholder","is only skin deep","is thicker than water","always falls buttered side down","is the soul of wit","begins at home","is next to godliness","doesn't pay","is no use","killed the cat","is the mother of good luck","is the better part of valour","is human","has a silver lining","has its day","is the architect of his destiny","has his price","tells a story","is the father of wisdom","is planning to fail","never won fair lady","is no robbery","will move mountains","breeds contempt","will get you nowhere","favours the brave","is loving and giving","is better than receiving","saves the food","is better than no bread","is as handsome does","is content","is satisfied","lives to fight another day","is lost","laughs longest","shall die by the sword","is always twenty-twenty","repeats itself","is where the heart is","is the best policy","is worth doing well","is bliss","is the sincerest form of flattery","is king","pours","is power","is the best medicine","begins at forty","is just a bowl of cherries","never strikes twice","is never found again","is blind","loves company","is fair of face","talks","doesn't grow on trees","makes the world go round","has charms to soothe the savage breast","is the mother of invention","is an island","can serve two masters","is good news","deserves another","is another man's treasure","is another man's poison","does not make a summer","never knocks twice","is a virtue","is nine-tenths of the law","makes perfect","comes before a fall","is the thief of time","is a dish best served cold","is sweet","wasn't built in a day","works hard for its living","is believing","is golden","is bound to appear","is hot","is an orphan","is cheap","makes us stronger","doesn't fall far from the tree","is the bottom line","is a lie","always wears the worst shoes","never did run smooth","is always right","is before the dawn","finds work for idle hands","catches the worm","justifies the means","is the sweetest fruit","is always greener on the other side","rules the world","is always the last to know","breaks the camel's back","starts with a single step","is the root of all evil","is a root of all kinds of evil","is mightier than the sword","calls the kettle black","is in the eating","is paved with good intentions","gets the cheese","catches no chickens","is weak","gets the grease","will out","is through his stomach","is your oyster","has far to go","flies","is a new day","never comes","lies within","is stranger than fiction","is full of grace","is company, but three is a crowd","is the spice of life","is its own reward","is full of woe","must be endured","must come down","is good for the gander","wins","never did anyone any good","is wasted on the young","is the new black","is fair in love and war","cannot live by bread alone","makes a man healthy, wealthy and wise","is well that ends well","is what you make it","begins with a single step","sees every problem as a nail","has a fool for a client","costs lives","is the measure of a woman","shouldn't bite the hand that feeds you","shouldn't cry over spilt milk","shouldn't count your chickens before they are hatched","shouldn't cross the bridge till you come to it","shouldn't cut off your nose to spite your face","should never look a gift horse in the mouth","shouldn't rock the boat","is the beginning of wisdom","is enough","is the beginning of wisdom","will take a mile","will eat for a day","will eat for a lifetime","will hang himself","goes a-sorrowing","calls the tune","does not know","hath no fury like a woman scorned","gets monkeys","makes lemonade","gets out of the kitchen","is bacon","weeps alone","is spoken in jest","comes in like a lion and goes out like a lamb","goes out like a lamb","falls mainly on the plain","will put on his cloak","abhors a vacuum","should never judge a book by its cover","should never say never","is certain, except death and taxes","washes the other","wins the race","is as stupid does","is a good offence","is money","is born every minute","is as blind as love","loves a cheerful giver","is a thin line between love and hate","won't make you cry","is always a coward","often pinches the foot","wishes to be younger","is worse than his bite","can start a great fire","is worth a thousand that are not","is a girl's best friend","burns a hole in your pocket","is made to be broken"];
		var end2=["are easily parted","happen","speak louder than words","must come to an end","lead to Rome","can be deceiving","seldom bite","can't be choosers","flock together","will be boys","never prosper","do not make the man","are odious","tell no tales","are the most lasting","seldom differ","help themselves","make good neighbours","come to those who wait","come in small packages","think alike","please little minds","make a shower","make light work","don't mix","work","die young","should do as the Romans do","shouldn't throw stones","will never hurt me","may break my bones, but words will never hurt me","are free","will inherit the earth","teach","will rise with fleas","spoil the broth","don't make a white","are better than one","don't make a right","have ears","will play","get going","will never cease","happen at sea","are better than none","blame their tools","are worth two in the bush","may look at a king","have nine lives","are only as strong as their weakest link","are as good as a rest","are a man's best friend","will clutch at a straw","are a friend indeed","are a friend to nobody","are better than a fool's smile","turn away wrath","can open any door","make a good ending","are a soft pillow","make good wives","are hard to find","are soon snatched up","stir up anger","cannot stand","can't change their spots","are a dangerous thing","are a living death","are known by the company they keep","are as good as a mile","are as good as a wink to a blind horse","are a penny earned","are worth a thousand words","are a problem halved","are a shepherd's delight","are a shepherd's warning","lift all boats","gather no moss","save nine","are a joy forever","are only a bench covered in velvet","are worth twenty pressed men","never boil","are in the home","are never done","make the heart grow fonder","corrupt absolutely","make strange bedfellows","are good publicity","are not gold","love a lover","make Jack a dull boy","are love","keep the doctor away","march on their stomach","never forget","make the most noise","are their castle","keep everyone away","are worth a pound of cure","are the best form of defence","are in the eye of the beholder","are only skin deep","are thicker than water","always fall buttered side down","are the soul of wit","begin at home","are next to godliness","don't pay","are no use","killed the cat","are the mother of good luck","are the better part of valour","have a silver lining","have their day","are the architect of their destiny","have their price","tell a story","are the father of wisdom","are planning to fail","never won fair ladies","are no robbery","will move no mountains","breed contempt","will get you nowhere","favour the brave","are better than receiving","save the food","are better than no bread","are as handsome does","are content","are satisfied","live to fight another day","are lost","laugh longest","shall die by the sword","are always twenty-twenty","are where the heart is","are the best policy","are worth doing well","are bliss","are the sincerest form of flattery","pour","are power","are the best medicine","begin at forty","are just a bowl of cherries","never strike twice","are never found again","are blind","love company","don't grow on trees","make the world go round","have charms to soothe the savage breast","are the mothers of invention","are islands","can serve two masters","are good news","deserve another","are another man's treasure","are another man's poison","do not make a summer","never knock twice","are nine-tenths of the law","make perfect","come before a fall","are the thieves of time","are a dish best served cold","are sweet","weren't built in a day","are believing","are golden","are bound to appear","are hot","are orphans","are cheap","make us stronger","don't fall far from the tree","are the bottom line","are a lie","always wear the worst shoes","never did run smooth","are always right","are before the dawn","find work for idle hands","catch the worm","justify the means","are the sweetest fruits","are always greener on the other side","rule the world","are always the last to know","break the camel's back","start with a single step","are the root of all evil","are mightier than the sword","call the kettle black","are in the eating","are paved with good intentions","get the cheese","catch no chickens","are weak","get the grease","are your oyster","fly","are a new day","never come","lie within","are stranger than fiction","are company, but three is a crowd","are the spice of life","must be endured","must come down","are good for the gander","win","never did anyone any good","are wasted on the young","are the new black","are fair in love and war","cannot live by bread alone","make a man healthy, wealthy and wise","are well that end well","are what you make them","begin with a single step","see every problem as a nail","have a fool for a client","cost lives","are the measure of a woman","shouldn't bite the hand that feeds them","shouldn't cry over spilt milk","shouldn't count their chickens before they are hatched","shouldn't cross the bridge till they come to it","shouldn't cut off their nose to spite their face","shouldn't keep a dog and bark themselves","should never look a gift horse in the mouth","shouldn't put all their eggs in one basket","shouldn't rock the boat","can't walk before they can crawl","are the beginning of wisdom","are enough","are the beginning of wisdom","rush in where angels fear to tread","will take a mile","will eat for a day","will eat for a lifetime","will hang themselves","go a-sorrowing","call the tune","do not know","have no fury like a woman scorned","get monkeys","make lemonade","get out of the kitchen","are bacon","weep alone","are spoken in jest","come in like a lion and go out like a lamb","go out like a lamb","fall mainly on the plain","abhor a vacuum","should never judge a book by its cover","should never say never","win the race","spoil the child","will take care of themselves","are a good offence","are money","are born every minute","are as blind as love","won't make you cry","are always a coward","often pinch the foot","are what you eat","are worse than his bite","can start a great fire","are a girl's best friend","burn a hole in your pocket","are made to be broken"];
    var starting = [start1, start2]
    if(starting[Math.floor(Math.random())] === start1){
      client.sendMessage(m.channel, start1[Math.floor(Math.random()*start1.length)] + " " + end1[Math.floor(Math.random()*end1.length)] + ".")
    } else {
      client.sendMessage(m.channel, start2[Math.floor(Math.random()*start2.length)] + " " + end2[Math.floor(Math.random()*end2.length)] + ".")
    }
    return;
  }

  if (m.content.startsWith(`?gin`)){
    client.sendMessage(m.channel, "http://puu.sh/paA9X/111dceef42.png");
    return;
  }
  if (m.content.startsWith(`?slash `)){
    //var mentionInMessage = m;
    var infoWanted = m.content.slice(7)
    var allMentionsArray = infoWanted.split(" ");
    var allMentions = allMentionsArray.toString()
    var cleanUpMessage = allMentions.replace(",", ", ");
    console.log(cleanUpMessage);
    //console.log(mentionInMessage);
    var slashArray = ["http://i.imgur.com/RH2yX.jpg", "http://media.giphy.com/media/daDA43pfSyeHK/giphy.gif", "http://i.imgur.com/7JNeSzT.jpg", "http://i.imgur.com/ZgR1USn.png", "http://i.imgur.com/2KTyI5n.png", "http://i.imgur.com/WnHUFcB.jpg", "http://i.imgur.com/34X6qf4.jpg", "http://i.imgur.com/Oy49Zln.png"]
    client.sendMessage(m.channel, `${cleanUpMessage} you have been slashed by ${m.author}! ${slashArray[Math.floor(Math.random()*slashArray.length)]}`);
  }
  if (m.content.startsWith(`?yourdone`)){
    midoriArray = [`http://i.imgur.com/ki4865P.png`, `https://youtu.be/8S_8CX4YD-8?t=832`]
    client.sendMessage(m.channel, midoriArray[Math.floor(Math.random())])
  }
  if (m.content.startsWith(`?EbolaChan`)){
    var messageanswer = randEbolaPic.data.images[Math.floor(Math.random()*72)].link

    client.sendMessage(m.channel, messageanswer.replace(/\\\//g, "/"));
    return;
  }
  if(m.content.startsWith(`?pickBotOn`)){
    if(pickBotOn){
      pickBotOn = false;
    } else {
      pickBotOn = true;
    }
  }
  if(pickBotOn){
    var messageContent = m.content;
    var indexTrivia = -1;
    var len = triviaAnswers.length;
    for(var i = 0; i < len; i++){
      if(triviaAnswers[i].Question.indexOf(messageContent) > -1){
        indexTrivia = i;
        break;
      }
    }
    client.sendMessage(m.channel, triviaAnswers[i].Answer);
  }
  if (m.content.startsWith(`?popcorn`)){
  	client.sendMessage(m.channel, "https://pbs.twimg.com/profile_images/597538481225752577/93eMVOd3.jpg")
  	return;
  }
 if (m.content.startsWith(`?ben`)) { // a meme
    if (!checkCommand(m, `?ben`)) return
    var benArray = ["**BEN'S STATUS** \n Lips: LARGE \n Feelings: WHO CARES \n Race: SHADOW-REALM BEAST", "http://puu.sh/m3gGP/de199907f3.png", "http://puu.sh/m3gDD/3c6f7c553b.png", "http://puu.sh/m3gIA/28638cd9ad.jpg", "http://puu.sh/m9tgv/84bc2f4914.jpg", "http://puu.sh/m9tfd/fdd3ad0c46.jpg", "http://puu.sh/m9th3/12a1326552.jpg", "https://cdn.discordapp.com/attachments/93578176231374848/130413901367083008/benkms.jpg" ,"https://cdn.discordapp.com/attachments/93578176231374848/130413948091629568/ben.jpg", "https://puu.sh/ldqI3/7fe79e185e.jpg", "https://puu.sh/ldqI3/7fe79e185e.jpg", "https://puu.sh/ldqC3/563b0df440.jpg", "http://puu.sh/lvryP/a7aeb5c7f2.jpg", "http://puu.sh/l0dy0/97c6792172.jpg", "https://docs.google.com/document/d/1XXeZrKqhCzwAcrbD3IHsAOnwp-XhXdJWwpZQrdLLKZo/edit", "https://docs.google.com/document/d/1qvlZMQLP6BatNGCLt-wrAdVt2bFsqxshGu_RIDMngc0/edit?pref=2&pli=1"]
    client.sendMessage(m.channel, benArray[Math.floor(Math.random() * benArray.length)])
    return;
 }
 if (m.content.startsWith(`?rr`)) {
   var eventArray = [" pulls the trigger... finds out their nervousness was just bullshit.", " pulls the trigger out of fearlessness.. and finds out they're lucky.", " pulls the trigger... and makes it out alive.", " pulls the trigger... and finds out that they should probably play the lottery.", " pulls the trigger... and is lucky."];
   var eventArrayFull = [" pulls the trigger... :boom: :gun: :skull: R.I.P. in pieces you unlucky piece of shit.", " pulls the trigger... and finds out their nervousness was just bullshit.", " pulls the trigger out of fearlessness.. and finds out they're lucky.", " pulls the trigger... and makes it out alive.", " pulls the trigger... and finds out that they should probably play the lottery.", " pulls the trigger... and is lucky."];
   if(m.content.length > 4 && m.content.indexOf("|") > -1){
      var names = m.content.slice(3)
      var namesArray = names.split("|")
      if(namesArray.length > 6) {
        client.sendMessage(m.channel, "You have too many people, and not enough holes! You filthy whore.")
        return;
      } else {
        var unluckyOne = namesArray[Math.floor(Math.random()*namesArray.length)]
      //  var luckyindex = namesArray.indexOf(unluckyOne)
      //  luckyOnes = namesArray.splice(luckyindex, 1)
      function Meme(luckyindex){
        return luckyindex != unluckyOne
      }
        luckyOnes = namesArray.filter(Meme)
        for(i=0; i < luckyOnes.length; i++){
          messageArray.push(`${luckyOnes[i] + eventArray[Math.floor(Math.random()*eventArray.length)]} \n`)
          console.log(messageArray)
        }
        client.sendMessage(m.channel,`${messageArray.join("") + unluckyOne} pulls the trigger... :boom: :gun: :skull: R.I.P. in pieces you unlucky piece of shit.`);
        messageArray = [];
        luckyOnes = [];
        return;

        }
      } else {
        if(m.content.length < 5 && m.content.indexOf("|") === -1){
        client.sendMessage(m.channel, `${m.author.username + eventArrayFull[Math.floor(Math.random()*eventArrayFull.length)]}`)
        return;
        } else {
          client.sendMessage(m.channel, "To play, just use the ?rr without any other users, otherwise, add | inbetween every user you choose, up to 6. e.g: \"?rr |player1|player2|player3|player4|etc.|etc..\"")
          return;
        }
      }
   }
   if (m.content.startsWith(`?perfect`)){
     var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=lucina&rating=s&pid=${Math.floor(Math.random()*14 + 1)}`
     reequest(requestUrl, function(error, response, html){

       if(!error){
         var cheerio$ = cheerio.load(html, {xmlMode : true});
         cheerio$('posts').filter(function(){
           var toParse = cheerio$(this);
           var parsingInfo = toParse.text();

           parseString(toParse, function(err, result){


               var randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$

               while(randomPost.rating === "e" || randomPost.rating === "q"){
                 randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$
               }
               client.sendMessage(m.channel, randomPost.file_url);
               return;
             });
           });
       };
     });
  };
  if (m.content.startsWith(`?gelbooru`)){
    if(m.content.length > 10 && m.content.indexOf(";") > -1){
       var tags = m.content.slice(9)
       var tagsArray = tags.split(";")
       var tagsJoined = tagsArray.join(" ")
    var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tagsJoined}&rating=s&pid=${Math.floor(Math.random()*20)}`
    reequest(requestUrl, function(error, response, html){

      if(!error){
        var cheerio$ = cheerio.load(html, {xmlMode : true});
        cheerio$('posts').filter(function(){
          var toParse = cheerio$(this);
          var parsingInfo = toParse.text();

          parseString(toParse, function(err, result){
              //var lengthOfPosts = result.posts.post.length
              //console.log(lengthOfPosts);
              var randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$

              while(randomPost.rating === "e" || randomPost.rating === "q"){
                randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$
              }
              client.sendMessage(m.channel, randomPost.file_url);
              return;
            });
          });
      };
    });
 }
 }
 if (m.content.startsWith(`?ngelbooru`)){
   if(m.content.length > 11 && m.content.indexOf(";") > -1){
      var tags = m.content.slice(10)
      var tagsArray = tags.split(";")
      var tagsJoined = tagsArray.join(" ")
   var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=${tagsJoined}&rating=e&pid=${Math.floor(Math.random()*20)}`
   reequest(requestUrl, function(error, response, html){

     if(!error){
       var cheerio$ = cheerio.load(html, {xmlMode : true});
       cheerio$('posts').filter(function(){
         var toParse = cheerio$(this);
         var parsingInfo = toParse.text();

         parseString(toParse, function(err, result){
             //var lengthOfPosts = result.posts.post.length
             //console.log(lengthOfPosts);
             var randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$

             while(randomPost.rating === "s"){
               randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$
             }
             client.sendMessage(m.channel, randomPost.file_url);
             return;
           });
         });
     };
   });
}
}
 if (m.content.startsWith(`?fepic`)){
   var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=fire_emblem&rating=s&`
   reequest(requestUrl, function(error, response, html){

     if(!error){
       var cheerio$ = cheerio.load(html, {xmlMode : true});
       cheerio$('posts').filter(function(){
         var toParse = cheerio$(this);
         var parsingInfo = toParse.text();

         parseString(toParse, function(err, result){

             var randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$

             while(randomPost.rating === "e" || randomPost.rating === "q"){
               randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$
             }
             client.sendMessage(m.channel, randomPost.file_url);
             return;
           });
         });
     };
   });
};

 if (m.content.startsWith(`?dspic`)){
   var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=dark_souls&rating=s&pid=${Math.floor(Math.random()*14 + 1)}`
   reequest(requestUrl, function(error, response, html){

     if(!error){
       var cheerio$ = cheerio.load(html, {xmlMode : true});
       cheerio$('posts').filter(function(){
         var toParse = cheerio$(this);
         var parsingInfo = toParse.text();

         parseString(toParse, function(err, result){

             var randomPost = result.posts.post[Math.floor(Math.random()*100)].$

             while(randomPost.rating === "e" || randomPost.rating === "q"){
               randomPost = result.posts.post[Math.floor(Math.random()*100)].$
             }
             client.sendMessage(m.channel, randomPost.file_url);
             return;
           });
         });
       }
     });
};
if (m.content.startsWith(`?hibiki`)){
  var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=hibiki_(kantai_collection)&rating=s&pid=${Math.floor(Math.random()*14 + 1)}`
  reequest(requestUrl, function(error, response, html){

    if(!error){
      var cheerio$ = cheerio.load(html, {xmlMode : true});
      cheerio$('posts').filter(function(){
        var toParse = cheerio$(this);
        var parsingInfo = toParse.text();

        parseString(toParse, function(err, result){

            var randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$

            while(randomPost.rating === "e" || randomPost.rating === "q"){
              randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$
            }
            client.sendMessage(m.channel, randomPost.file_url);
            return;
          });
        });
      }
    });
};
if (m.content.startsWith(`?akatsuki`)){
  var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=akatsuki_(kantai_collection)&rating=s&pid=${Math.floor(Math.random()*14 + 1)}`
  reequest(requestUrl, function(error, response, html){

    if(!error){
      var cheerio$ = cheerio.load(html, {xmlMode : true});
      cheerio$('posts').filter(function(){
        var toParse = cheerio$(this);
        var parsingInfo = toParse.text();

        parseString(toParse, function(err, result){

            var randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$

            while(randomPost.rating === "e" || randomPost.rating === "q"){
              randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$
            }
            client.sendMessage(m.channel, randomPost.file_url);
            return;
          });
        });
      }
    });
};
if (m.content.startsWith(`?hirasawa`)){
  var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=hirasawa_yui&rating=s&pid=${Math.floor(Math.random()*20 + 1)}`
  reequest(requestUrl, function(error, response, html){

    if(!error){
      var cheerio$ = cheerio.load(html, {xmlMode : true});
      cheerio$('posts').filter(function(){
        var toParse = cheerio$(this);
        var parsingInfo = toParse.text();

        parseString(toParse, function(err, result){

            var randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$

            while(randomPost.rating === "e" || randomPost.rating === "q"){
              randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$
            }
            client.sendMessage(m.channel, randomPost.file_url);
            return;
          });
        });
      }
    });
};
if (m.content.startsWith(`?bismarck`)){
  var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=bismarck_(kantai_collection)&rating=s&pid=${Math.floor(Math.random()*14 + 1)}`
  reequest(requestUrl, function(error, response, html){

    if(!error){
      var cheerio$ = cheerio.load(html, {xmlMode : true});
      cheerio$('posts').filter(function(){
        var toParse = cheerio$(this);
        var parsingInfo = toParse.text();

        parseString(toParse, function(err, result){

            var randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$

            while(randomPost.rating === "e" || randomPost.rating === "q"){
              randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$
            }
            client.sendMessage(m.channel, randomPost.file_url);
            return;
          });
        });
      }
    });
};
if (m.content.startsWith(`?cc`)){
  var requestUrl = `http://gelbooru.com/index.php?page=dapi&s=post&q=index&tags=c.c.&rating=s&pid=${Math.floor(Math.random()*14 + 1)}`
  reequest(requestUrl, function(error, response, html){

    if(!error){
      var cheerio$ = cheerio.load(html, {xmlMode : true});
      cheerio$('posts').filter(function(){
        var toParse = cheerio$(this);
        var parsingInfo = toParse.text();

        parseString(toParse, function(err, result){

            var randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$

            while(randomPost.rating === "e" || randomPost.rating === "q"){
              randomPost = result.posts.post[Math.floor(Math.random()*result.posts.post.length)].$
            }
            client.sendMessage(m.channel, randomPost.file_url);
            return;
          });
        });
      }
    });
};


 if (m.content.startsWith(`?yomom`)) { //Testing 4 jokes
    if (!checkCommand(m, `?yomom`)) return
    var requestUrl = "http://yomomma.info/"
    reequest(requestUrl, function(error, response, html){
        if(!error){
          var $ = cheerio.load(html);
          $('h3').filter(function(){
          	var momData = $(this);
          	yourMomJoke = momData.text();
          })
      }
    })
    var joke = yourMomJoke
    client.sendMessage(m.channel, joke)
    return;
 }
/* if (m.content.startsWith(`?phrase`)) {
   var requestUrl = "http://www.randomwordgenerator.com/phrase.html"
   reequest(requestUrl, function(error, response, html){
     if(!error){
     var $ = cheerio.load(html)
  //var randomnum = Math.floor(Math.random()*puncellLength)+1
    //   randomPunInfo = $(`.pun-cell td:nth-child(${randomnum})`).text()
     $('.support-phrase').filter(function(){
         var punData = $(this);
         randomPunInfo = punData.text();
         })
     }
   })
   var punJoke = randomPunInfo
   client.sendMessage(m.channel, punJoke)
   return;
 } */
 if (m.content.startsWith(`?insult`)) {
   var requestUrl = "http://www.insultgenerator.org/";
   reequest(requestUrl, function(error, response, html){
     if(!error){
       var $ = cheerio.load(html);
       $('.wrap').filter(function(){
         var insultData = $(this);
         randomInsult = insultData.text();
       })
     }
   })
   var insult = randomInsult
   client.reply(m, insult)
   return;
 }
 if (m.content.startsWith(`?wakeup`)) {
   client.sendMessage(m.channel, "http://puu.sh/mk18d/a5117ed37a.png")
   return;
 }
 if (m.content.startsWith(`?partysover`)) {
   client.sendMessage(m.channel, "https://i.4cdn.org/vg/1451833265145.png")
   return;
 }
 if (m.content.startsWith(`?kaio`)) {
   if (!checkCommand(m, `?kaio`)) return
   var kaioArray = ["https://cdn.discordapp.com/attachments/93578176231374848/137512943058157568/ss_2015-09-02_at_01.18.43.jpg","https://cdn.discordapp.com/attachments/93578176231374848/137512835918987264/ss_2015-09-10_at_04.49.26.jpg","http://puu.sh/miD0v/5322ab2006.jpg" , "http://puu.sh/miFg2/b53356ef98.jpg", "https://i.gyazo.com/7c64e7f1a945f8c856f48f75e2f80f02.png", "iou", "iou", "iou"]
   client.sendMessage(m.channel, kaioArray[Math.floor(Math.random()* kaioArray.length)])
   return;
 }
 if (m.content.startsWith(`?blaze`)) {
   if(m.author.id === "82975678428872704" || m.author.id === "81526338728501248"){
     var blazeArray = ["https://cdn.discordapp.com/attachments/93578176231374848/137514138493517824/w0j9VbN.png", "https://cdn.discordapp.com/attachments/93578176231374848/137514162484936704/LuzD3fE.png", "https://cdn.discordapp.com/attachments/93578176231374848/137514196895137792/HENx6fX.png", "https://cdn.discordapp.com/attachments/93578176231374848/137514220961923074/EV1Bqy1.png"]
     client.sendMessage(m.channel, blazeArray[Math.floor(Math.random()*blazeArray.length)])
     return;
   }
 }
 if (m.content.startsWith(`?anna`)) {
   if (!checkCommand(m, `?anna`)) return
   client.reply(m, "There seems to be nothing here.")
   return;
 }
 if (m.content.startsWith(`?evan`)) { // wat a fag
    if (!checkCommand(m, `?evan`)) return
    var evanArray = ["http://puu.sh/mcIfe/4fd9e0578a.png"]
    client.sendMessage(m.channel, evanArray[Math.floor(Math.random()*evanArray.length)])
    return;
 }
 if (m.content.startsWith(`?fag`)) { // fags
    if (!checkCommand(m, `?fag`)) return
    var fagArray = ["http://puu.sh/mcIfe/4fd9e0578a.png"]
    client.sendMessage(m.channel, fagArray[Math.floor(Math.random()*fagArray.length)]);
    return;
}
if (m.content.startsWith(`?simmer`)){
  client.sendMessage(m.channel, "OMG 😱😱😱 BRO👬 CALM 😴😴 DOWN BRO ⬇️⬇️ SIMMER ☕️☕️ DOWN⬇️⬇️ U WANNA KNOW Y⁉️ BC 💁💁 IT WAS JUST A PRANK 😂😂😂 😛😜 HAHAHA GOT U 👌👌 U FUKIN RETARD 😂😁😁THERE'S A CAMERA 📹📷 RIGHT OVER 👈👇👆☝️ THERE 📍U FAGOT 👨‍❤️‍💋‍👨👨‍❤️‍💋‍👨👐WE 👨‍👨‍👦 GOT U BRO👬. I BET U DIDNT 🙅🙅NOE 💆HOW 2⃣ REACT WHEN MY 🙋 BRO DESMOND 😎😎 CAME UP ⬆️ TO U AND 💦💦😫😫 JIZZED ALL OVER UR 👖👖 SWEET JEANS 😂😂 IT WAS SO FUNNY 😂😛😀😀😅 NOW U HAVE 🙋👅👅 SUM BABY👶👶 GRAVY 💦🍲 ALL OVER THEM SHITS😵😵");
  return;
}
if (m.content.startsWith(`?funny`)){
  client.sendMessage(m.channel, "💯💯hOHoHOHHHHMYFUCkking GOFD 😂😂😂 DUDE 👌i AM 👉LITERALLY👈 iN 😂TEARS😂 RIGHT NOW BRo 👆👇👉👈 hHAHAHAHAHAHAHA ✌️👌👍 TAHT WA SO FUCKIN G FUNNY DUd 💧💧😅😂💦💧I cAN NOT FUCKING BELIEV how 💯FUNny 👌👍💯thta shit wa s 👀👍😆😂😂😅 I 👦 CAN NOT ❌ bRATHE 👃👄👃👄❌❌ / HELP ❗️I NEEd 👉👉 AN a m b u l a n c e🚑🚑 SSSooOOoo00000oOOOOOøøøØØØØØ fUCKING FUNY ✔️☑️💯💯1⃣0⃣0⃣😆😆😂😂😅 shit man ❕💯💯🔥☝️👌damn");
  return;
}
if (m.content.startsWith(`?komari`)) { // lmao
    if (!checkCommand(m, `?komari`)) return
    var komariArray = ["https://i.gyazo.com/de05c41201cd9c4e402e557de475c176.png", "https://i.gyazo.com/36d0fce02401db14680b97e276f25b4e.png", "https://i.gyazo.com/23ebae539c0c7494de1701b8676afbe0.png"]
    client.sendMessage(m.channel, komariArray[Math.floor(Math.random()*komariArray.length)])
    return;
}
if (m.content.startsWith(`?tumblr`)) {
  var tumblrArray1 = ["***AFAB*** - Assigned female at birth.","***Agender***, ***Agendered*** - A non-binary identity, meaning without a gender or gender identity.","***Alia***, ***Aliagender*** - A gender experience which is \"other\", or stands apart from existing gender constructs","***AMAB*** - Assigned male at birth.","***Ambigender*** - _1._ Available or common to more than one gender. \n _2._ A non-binary identity related to androgyne, bigender, and/or genderfluid.","***Androgens*** - Hormones such as testosterone, sometimes called \"male sex hormones,\" although people of any gender can have high androgen levels, and not all men have high androgen levels.","***Androgyne*** - A non-binary identity, meaning a combination, blending, or in-between point between two genders (usually between male and female). Androgynes may or may not present androgynously, and may or may not experience multiple genders..","***Androgynous***, ***Androgyny*** - _1._ Related to an androgyne gender identity. \n _2._ A gender presentation that is ambiguous between male and female, or which blends them, or lies in the middle between them.","***Androgynous of Center*** - Any of several gender identities that lean closer to \"androgyne\" than to male or female.","***Androsexual*** - Sexually attracted to masculinity or to men. _Warning: this word is sometimes used in transphobic ways._","***Anti-Androgens*** - Drugs that negate the effects of testosterone, usually given during adolescence to trans youth who do not wish to develop conventionally \"masculine\" features. A type of hormone blockers.","***Anti-Estrogens*** - Drugs that negate the effects of estradiol and other estrogens, usually given during adolescence to trans youth who do not wish to develop conventionally \"feminine features.\" A type of hormone blockers.","***ASAB*** - Assigned sex at birth.","***Assigned Sex (At Birth)*** - The gender identity imposed on someone by their family and by society. This gender is usually decided at birth or in utero, and is usually based on genitalia. Almost all people are assigned male or female at birth, even if they are intersex.","***Autoandrophilia*** - Pleasure, sexual or otherwise, derived from imagining oneself as a man. The much rarer counterpart to autogynephilia, and also not recommended.","***Autogynephilia*** - Pleasure, sexual or otherwise, derived from imagining oneself as a woman. Historically, diagnosis of autogynephilia was/is commonly used to restrict trans women’s access to transitioning, and to pathologize them as mentally ill. Not recommended for general discourse.","***Being Read*** 📖 - An alternative phrase to \"passing\" that shifts responsibility of correct gendering onto onlookers, instead of on the person who is read. A trans person who is read correctly is recognized as their correct gender.","***Bigender*** - A non-binary identity in which a person has two or more genders. Any combination of genders is possible, not just male/female. These genders may be present simultaneously, they may fluctuate, or both.","***Binarism*** - The belief, prejudice or social force that claims only two genders exist, male and female, and that all non-binary and genderqueer gender identities are invalid. Binarism is inextricably tied to colonialism and racism, and is a way that Western European cultures attack the gender expression of other cultures and ethnic groups.","***Binary Gender*** - A gender that is either strictly male or strictly female. This is not affected by whether a person is cis or trans: a trans man or trans woman has a binary gender, unless he or she also identifies as non-binary.","***Binder*** - In trans discussions, a garment used to minimize or alter the appearance of breasts.","***Binding*** - The practice of hiding or reshaping breasts, usually to achieve a more masculine or androgynous appearance.","***Biological Essentialism*** - In trans discussions, the belief that a person's gender can only be defined by their genes and/or genitalia at birth. Biological essentialism usually ignores the existence of intersex people and is a major component of transphobia.","***Biological Sex*** - A social construct that categorizes human bodies as male or female based on chromosomes or genitalia. Contrary to popular belief, there are not two biological sexes, because people can be born with a wide variety of sexual characteristics, and many different combinations of sexual characteristics. Many trans and/or intersex people find the phrase or concept offensive, and prefer the phrase \"assigned sex,\" or \"designated sex.\"","***Body Dysphoria*** - A feeling of stress or unhappiness related to one's body. In trans discussions, it is a type of gender dysphoria caused by the body’s appearance clashing with one's internal gender identity.","***Bottom Surgery*** - A colloquial term for surgery that corrects one's genitalia to better match one’s preferred gender presentation.","***Brain Sex*** - A controversial idea that posits that a person’s gender identity may be reflected by the structure of their brain.","***Butch*** - More reminiscent of what is traditionally considered boyish or masculine than feminine. May refer to a gender identity, gender presentation, or a style of dress. Often associated with lesbian culture.","***CAFAB*** - Coercively assigned female at birth.","***CAMAB*** - Coercively assigned male at birth.","***CASAB*** - Coercively assigned sex at birth. See assigned sex at birth.","***Cis*** - Short for cisgender or cissexual.","***Cis Privilege*** - Short for cisgender privilege.","***Cisgender*** - Consistently experiencing your gender in a way that matches the gender assigned to you at birth. Not trans.","***Cisgender Privilege*** - The benefits, opportunities and everyday courtesies that cisgender people are able to take for granted, and which trans and non-binary people may not be able to count on.","***Cishet*** - A person who is cisgender, hetero-romantic and heterosexual.","***Cissexism*** - The unjust social institution that validates cisgender identities more than trans identities, and which grants privileges to cis people while oppressing trans people.","***Cissexual*** - Usually a synonym for cisgender, though some people make a distinction, similar to the transgender/transsexual distinction.","***Chaser*** - A person who seeks out trans people for dating or sex. Chasers have a bad reputation for fetishizing, disrespecting and mistreating trans people, especially trans women.","***Chromosomes*** - Gene sequences that determine how an organism's body develops and reproduces. The human sex chromosomes, X and Y, usually determine whether a fetus develops typical egg-producing anatomy or typical sperm-producing anatomy. However, other factors can affect a person’s anatomical and psychological development, and the chromosomes do not necessarily reflect a person’s true gender.","***Clocking*** - An event in which an observer notices or realizes a trans person's assigned sex at birth, without the trans person's consent.","***Colonialism*** - In trans discussions, colonialism is the practice of imposing Western systems of gender onto non-Western cultures, invalidating native people's gender identities in the process. Colonialism can involve either denying that a gender exists, or reinterpreting the gender to fit a Western model, e.g. by claiming that a hijra person must be transgender. Binarism is a form of colonialism.","***Coming Out*** - In trans discussions, the process of telling someone that one is trans. This applies both to trans people who have transitioned to live as their correct gender, as well as to those who have not.","***Correct Pronouns*** - Alternate phrase for \"preferred pronouns\".","***Corrective Rape*** - Sexual assault done with the intent to change someone's sexual or romantic orientation, or gender identity. Trans people, especially trans women and sex workers, are sometimes victimized by corrective rape.","***Crossdresser*** - A person who chooses to wear clothing that does not match their gender identity or usual gender presentation. A controversial concept because clothing is not intrinsically gendered, and the wearer may define it as appropriate to their own gender regardless of social norms. This is a loaded term and should not be used without the permission of the person being referred to.","***Crossdressing*** - The act of wearing clothing that does not match one's gender identity. A controversial concept because clothing is not intrinsically gendered, and the wearer may define it as appropriate to their own gender regardless of social norms. Trans people who wear the clothing of their assigned sex may consider themselves as crossdressing; when wearing clothing of their actual gender, they are not crossdressing, though they may appear that way to uninformed people.","***Crossplay*** - To dress up as a fictional or historical character that is of a different gender than oneself. A controversial concept because clothing is not intrinsically gendered, and the wearer may define it as appropriate to their own gender regardless of social norms.","***Deep Stealth*** - Living full-time as one's correct gender, without any of the people one regularly interacts with knowing that one is trans.","***Degender*** - To ignore or invalidate someone's gender. Similar to misgendering, but does not necessarily impose a different, inaccurate gender onto the target person while invalidating them.","***Dehumanization*** - A kind of stigma that lessens a person by making them seem less than human; often likening them to an animal, machine or monster. A common component of transphobia.","***Demiboy*** - See demiguy.","***Demienby*** - A gender that is partly one non-biinary gender, and partly another non-binary gender."];
  var tumblrArray2 = ["***Demigender*** - Umbrella term for demigirl, demiguy, demienby, demiboy, and similar genders.","***Demigirl*** - A gender that is partly female and partly non-binary. Can be AFAB or AMAB.","***Demiguy*** - A gender that is partly male and partly non-binary. Can be AMAB or AFAB.","***Detransition*** - To stop, pause, or reverse some or all of the effects of transitioning.","***DFAB*** - Designated female at birth. Alternative to AFAB.","***Desexualization*** - A stigma that denies a person’s sexuality or sexual agency. A common component of transphobia.","***Designated Sex (At Birth)*** - An alternative phrase for assigned sex at birth.","***DMAB*** - Designated male at birth. Alternative to AMAB.","***Drag*** - Crossdressing. Drag is done for a wide variety of reasons and purposes. People in drag may attempt to plausibly appear as their target gender, parody gender, exaggerate gender, or deconstruct gender. Some people who wear drag are trans and some are not. See \"Crossdressing\" for problematic elements of this concept.","***Drag King*** - A person who does not identify as male but dresses up to resemble one. Trans men are not drag kings, because they are men. However, some people who appear to be drag kings may later come to identify as trans men. See \"Crossdressing\" for problematic elements of this concept.","***Drag Queen*** - A person who does not identify as female but dresses up to resemble one. Trans women are not drag queens, because they are women. However, some people who appear to be drag queens may later come to identify as trans women. See \"Crossdressing\" for problematic elements of this concept.","***DSM*** - The Diagnostic and Statistical Manual of Mental Disorders. The DSM-IV includes Gender Identity Disorder, which was renamed Gender Dysphoria in the DSM-V. There is controversy over whether these ideas should be included in the DSM or not.","***Dysphoria*** - In trans discussions, a feeling of displeasure, stress, anxiety or depression related to one's gender. See gender dysphoria.","***Dyadic*** - Having a stereotypical male or female anatomy, as Western culture would define it; not intersex.","**Electrolysis*** - Permanent hair removal. Sometimes taken by trans people to achieve a better gender presentation or feel more comfortable in their bodies.","***Enby*** - Casual term for a non-binary person. Not all non-binary people want to be referred to as enbies, so individual preferences should be respected here.","***Endocrinologist*** - A doctor who specializes in hormones. Trans people may need to see endocrinologists as they transition.","***Epicene*** - An archaic term for someone who has characteristics of both genders, or who can't be classified as purely male or female. Most often used for male-assigned people with feminine tendencies. Like most of these older terms, you shouldn't refer to someone this way unless they give you permission.","***Erasure*** - A lack of representation of a group in media, news and pop culture. Erasure may be either deliberate or accidental, and targets _all_ queer identities to varying degrees.","***Estradiol*** - The most potent and common form of estrogen in the human body. Supplemental estradiol is sometimes taken by trans people, usually with the intent of achieving a more feminine appearance.","***Estrogens*** - Hormones such as estradiol. Sometimes called \"female hormones,\" although people of any gender can have high levels of estrogens, and not all women have high estrogen levels.","***Eunuch*** - A man whose penis has been removed, or (rarely) a man who has been sterilized. This term should _not_ be used to refer to trans people.","***FAAB*** - Female-assigned at birth. Alternative to AFAB.","***Female-bodied*** - A common but problematic term used for cis women and AFAB trans people who have not undergone transitional surgery. AFAB and DFAB are recommended instead.","***Feminine of Center*** - Having a gender that is closer to \"female\" than to \"male\" or other genders.","***Femme*** - Reminiscent of what is traditionally considered femininity. May refer to a gender identity, gender presentation, or a style of dress. Strongly associated with lesbian culture.","***Fluid*** - Changeable, not static. Some people have fluid sexual orientations or gender identities. See genderfluid.","***FTM***, ***F2M*** - Female to male.","***FTN***, ***F2N*** - Female to neutral.","***FTX***, ***F2X*** - Female to an unspecified gender.","***Full Time*** - Living as one's correct gender every day, in all circumstances, in a way publicly visible to all people. Gatekeepers often require a period of living full-time before they are willing to approve of hormone therapy or surgery; this restriction can be dangerous or impossible for some trans people.","***Gaff*** - Underwear used for tucking. Sometimes used by DMAB trans people.","***Gatekeepers*** - People who have the power to progress or halt a trans person's journey of transition. These can include doctors, government officials, employers, family members, and more.","***Gender*** _n._ - A person's internal mental experience of their self and their relationship to \"male,\" \"female,\" \"androgynous,”\" \"genderless,\" and other identities. It is distinct from a person's assigned sex, anatomy, gender presentation, pronouns, socialization, and sexual orientation. Some people do not have a gender.","***Gender*** _v._ - To treat someone as if they are of a particular gender. This takes many forms, the most common of which are pronouns.","***Gender Affirmation Surgery*** - Surgery that alters a person's appearance to better reflect their preferred gender presentation. Also called gender confirmation surgery.","***Gender Bender***, ***Gender Bending*** - _1._ Altering or playing with gender presentation. \n _2._ In fiction, changing either a character’s gender identity, gender presentation, or both. A problematic concept because it tends to conflate gender identity with gender presentation or assigned sex.","***Gender Binary*** - The Western social construct that only grants legitimacy to two genders, male and female. Is frequently oppressive towards people who are trans and/or intersex.","***Gender Confirmation Surgery*** - Surgery that alters a person's appearance to better reflect their preferred gender presentation. Also called gender affirmation surgery.","***Gender Diversity*** - The inclusion of many or all genders, not just male and female.","***Gender Dysphoria*** - _1._ A feeling of discomfort, stress, confusion or negativity that is caused by a mismatch between one's assigned sex and one's actual gender. Can be either body dysphoria or social dysphoria, or both. Many trans and/or non-binary people experience gender dysphoria, but not all do. \n _2._ The phrase used for transgender experiences in the DSM-V.","***Gender Identity Disorder*** - The phrase used for transgender experiences in the DSM-IV.","***Gender Essentialism*** - The belief that there are intrinsic and unchangeable differences between genders, and that these differences manifest as anatomy, chromosomes, behavior, socialization and/or gender roles. A key component of transphobia.","***Gender Expression*** - The speech, clothing, body modification choices, gestures, behavior, and social role through which a person demonstrates their gender.","***Gender Neutral*** - Not specific or restricted to any particular gender.","***Gender Neutral Language*** - The use of nouns, titles and pronouns in such a way as to avoid specifying gender. This is useful for making environments and discussions more accessible to trans and non-binary people.","***Gender Nonconformity*** - Acting, speaking or dressing in a manner that is not traditionally encouraged for members of one’s gender.","***Gender Norm*** - An arbitrary expectation or standard that is applied to people of a certain gender.","***Gender Presentation*** - The way that a person's gender superficially appears to onlookers, which may be affected by anatomy, clothing, makeup, hairstyle, speech patterns and body language. May also include a person's stated desire to be treated as a certain gender and referred to with certain pronouns.","***Gender Reassignment Surgery*** - An older term for gender affirmation surgery or gender confirmation surgery. It is rather inaccurate because the surgery _does not_ change the recipient's gender, but alters the body to better reflect the gender.","***Gender Role*** - A set of expectations, standards, and cultural pressures associated with a particular gender. People may freely choose to follow or disregard gender roles. Conformity to gender roles does not reflect a person’s actual gender; cis people who violate gender roles do not become trans, nor do trans people need to follow traditional gender roles in order for their genders to be valid.","***Gender-Variant*** - _1._ Behaving or presenting one’s gender in a way that does not fit traditional models of male or female. \n _2._ An umbrella term, similar to non-binary and genderqueer.","***Genderflexible*** - See genderfluid.","***Genderfluid*** - Having a gender that is changeable. Genderfluid people may shift between multiple genders over time, or feel gender in different ways over time. Their preferred pronouns and gender presentation may or may not reflect these changes. Related to but distinct from genderflux.","***Genderflux*** - Having a gender that varies in intensity or degree over time; related to but distinct from genderfluid.","***Genderfuck*** - Gender presentation that deliberately seeks to violate conventional standards of male or female presentation.","***Genderless*** - Without a gender or gender identity. Similar to agender.","***Genderqueer*** - 1. An umbrella(☔) term that includes all gender identities other than strictly male or strictly female. Covers the same set of people as \"non-binary,\" but it has different social and political connotations, and is more strongly associated with \"queering gender\" and the queer political movement. \n _2._ Gender presentation that is not strictly male or female."];
  var tumblrArray3 = ["***Genetic Sex*** - See biologicax.","***Graygender***, ***greygender*** - \"A person who identifies as (at least partially) outside the gender binary and has a strong natural ambivalence about their gender identity or gender expression.\"","***GSD*** - Gender and sexual diversity. See GSM.","***GSM***, ***GSRM*** - Gender, sexual (and romantic) minorities. An alternative acronym to LGBT+.","***Gynecomastia*** - Uncommonly large breast tissue in non-female persons.","***Gynosexual*** - Sexually attracted to femininity, or to women. This word has also been wrongly used to mean \"attracted to women with vaginas,\" and to thus exclude trans women. (Note that gyno- is a prefix meaning \"woman,\ not \"vagina.\) Because of this, many trans people do not like this word.","***Harry Benjamin Syndrome***, ***HBS*** - An outdated term for transgender or transsexual experiences. Not recommended because of problematic associations about what constitutes \"true\" transsexuality.","***Hermaphrodite*** - A creature with both male and female sexual characteristics. This term should not be applied to humans.","***Heteronormativity***, ***Heterosexism*** - The cultural force that expects all people to be cisgender, heteroromantic and heterosexual. Major problem that affects all queer identities, including asexuals. Closely linked to homophobia, biphobia, transphobia and acephobia.","***Hijra*** (Definition not provided because of potential colonialist issues.)","***Hormone Blockers*** - Drugs used to negate or prevent the effects of hormones, particularly sex hormones. These include anti-androgens and anti-estrogens. Also called puberty blockers, puberty suppressors, puberty inhibitors, or hormone suppressors.","***Hormone Replacement Therapy*** - Therapy in which a person is given hormones that their body lacks, or does not have enough of. Many, but not all, trans people choose to use hormones to alter their gender presentation. Some cis people also undergo hormone replacement therapy for other purposes, e.g. estrogen replacement for postmenopausal women.","***HRT*** - Hormone replacement therapy.","***Hypersexualization*** - Treating a person as highly or overly sexual, or sexually objectifying them, at the cost of respecting them as a person. Commonly done by chasers and trans fetishists to trans people, especially trans women.","***Identity Policing*** - Telling a person that the way they identify, or the labels they use to describe themselves, are wrong.","***Internalization*** - The unconscious process in which a person accepts society's values and applies them to themself. Internalized homophobia, misogyny, cissexism and transphobia can hinder a person's understanding and acceptance of their gender.","***Intersex*** - Born with anatomy or genetics that do not easily fit into the Western cultural stereotypes of  \"male bodies\" or \"female bodies.\" This should not be considered a defect or disorder. Intersex people can be cisgender or transgender, and of any gender identity. There are many ways that a person can be intersex.","***Intergender*** - A gender identity that is particularly intended for intersex people to use.","***Invalidation*** - In trans discussions, a refusal to acknowledge someone's gender as real and worthy of respect, or to acknowledge the value of their experiences.","***Kathoey*** (Definition not provided due to potential colonialist issues.)","***LGBT+*** - Lesbian, gay, bisexual, transgender, and others. An acronym for the cultural and political community of people who are not heterosexual, hetero-romantic and cisgender. Sometimes expanded up to LGBT*QQIAUP+, in which T* = all transgender, non-binary and genderqueer people; Q = queer/questioning; I = intersex; A = asexual; U = undecided; and P = pansexual.","***MAAB*** - Male-assigned at birth. Alternative to AMAB.","***Male-bodied*** - A common but problematic term used for cis men and AMAB trans people who have not undergone transitional surgery. AMAB and DMAB are recommended instead.","***Masculine of Center*** - Having a gender that is closer to \"male\" than to \"female\" or other genders.","***Masculinization*** - _1._ The process by which a person's gender presentation becomes closer to what is traditionally considered masculine. \n _2._ In fetal development, the process by which androgen hormones affect the developing brain.","***Misgender*** - To treat someone as the incorrect gender.","***Mispronoun*** - To misgender someone by using an incorrect pronoun for them.","***MTF***, ***M2F*** - Male to female.","***MTN***, ***M2N** - Male to neutral.","***MTX***, ***M2X*** - Male to an unspecified gender.","***Multigender*** - An umbrella term for all people with multiple genders, including bigender, trigender, polygender and pangender, as well as genderfluid people who identify as multigender.","***Muxe*** (Definition not provided due to potential colonialist issues.)","***Mx.*** - A gender-neutral honorific, analogous to Mr. or Ms.","***Natal Man/Woman*** - A cisgender woman. This term is sometimes used by transphobic people to invalidate trans people, and as such, it is not recommended.","***Neutrois*** - _1._ Having a gender that is specifically neutral, or a neutral third gender that is neither male nor female. \n _2._ Without a gender or gender identity, similar to agender. \n _3._ A form of gender presentation without prominent sexual characteristics.","***No Gender*** - Without a gender or gender identity. See also agender and genderless.","***Non-binary*** - _1._ Any gender, or lack of gender, or mix of genders, that is not strictly male or female. \n _2._ \"Non-binary is a term for people who are not men or women, or are both men and women, or who are something else entirely, or are some combination of these things, or some of these things some of the time.\" –askanonbinary","***Non-Gendered*** - Without a gender or gender identity. Similar to agender and genderless.","***Packer*** - A prosthetic penis or similar tool, often used by trans men and transmasculine AFAB people.","***Packing*** - The act of using a packer.","***Pangender*** - Having or experiencing all genders, or many genders, either simultaneously or over time; may also include an agender or genderless experience. (Note: This term may have racist/colonialist implications if a person uses it to claim an identity from a culture they are not part of or are not treating with respect.)","***Passing*** - The state of being perceived as the gender one wishes to be seen as.","***Pathologization*** - The act of treating something as an illness or disorder, which is abnormal and needs to be fixed. Transgender status is often pathologized, especially for trans women.","***Polygender*** - Having or experiencing several genders, either simultaneously or over time; may also include an agender or genderless experience.","***Preferred Pronouns*** - The pronouns that a person wished to be called by. Using a person's preferred pronouns is a key part of respecting their gender. Also called \"correct pronouns.\"","***Presentation***, ***Presenting*** - See gender presentation.","***Primary Sex Characteristics*** - Anatomical organs that play a direct role in reproduction, such as the genitals.","***Pronouns*** - Small words such as he, she, her, them, and us, which are used to refer to people. In English, there are four common third-person pronoun groups: he/his/him, she/hers/her, they/their/them, and it/its/it. Individual people may decide which of these pronouns they wish to be referred to as, or they may use pronouns that have been more recently coined.","***Puberty Blocker*** - See hormone blockers.","***Queer*** - An umbrella term for all people who are not heterosexual, heteroromantic and cisgender, and who self-identify as queer. A sensitive issue because of its history as a slur. Some trans and/or non-binary people identify as queer, and others do not.","***Queering Gender*** - The act of playing with, deconstructing, transforming or reclaiming gender, moving it from a heteronormative, patriarchal and cissexist perspective into a queer perspective.","***Radscum*** - Feminists who exclude, invalidate or attack trans people, especially toward trans women.","***Rape Culture*** - The social expectations that make rape and sexual assault more socially acceptable, or which cause people to deny importance or recognition to acts of sexual assault.","***Read*** (📖) - In trans discussions, to correctly perceive someone as their true gender, which may or may not be their assigned sex at birth.","***Real Life Test*** - A requirement some gatekeepers require trans people to go through before they are willing to provide hormone therapy or surgery; may last anywhere from a few month to several years. This restriction can be dangerous or impossible for some trans people.","***Secondary Sex Characteristics*** - Anatomical features that develop during puberty, and which are related to sex hormones but not directly involved in reproduction. Examples include facial hair and rounded breasts.","***Sex Change*** - An outdated and inaccurate term for what is now called transitioning.","***Sex Reassignment Surgery*** - An older term for what is often now called gender confirmation surgery or gender affirmation surgery.","***Sexual Orientation*** - The group of people or genders to which a person can become sexually attracted, if at all.","***Singular They*** - Yes, this is grammatical. \"They\" is a convenient way to refer to a person of uncertain gender, or whose preferred pronouns are unknown. Some people also adopt \"they\" as their correct pronoun.","***Situational Genderfluid*** - Someone who is situationally genderfluid moves between genders based on their enviroment. As a sub-section of genderfluid, it implies a pattern. (From genderqueeries.)","***Skoliosexual*** - Sexually attracted to gender-variant or non-binary people. Not to be confused with fetishization of trans or non-binary people. Some trans and/or non-binary folks don’t like this because of problematic etymology or fetishistic usage, so I don’t advise using this."];
  var tumblrArray4 = ["***Social Dysphoria*** - In trans discussions, dysphoria that is caused by being perceived or treated by other people as an incorrect gender.","***Spivak Pronouns*** - E(y)/eir/em/emself. A set of gender-neutral pronouns.","***SRS*** - Sex reassignment surgery.","***Stand-to-pee*** - A device used to enable someone to urinate while standing up, in the manner that people with penises sometimes do.","***Standards of Care*** - Full name: \"Standards of Care for the Health of Transsexual, Transgender, and Gender Nonconforming People.\" These are non-binding guidelines that influence the decisions of many doctors and other gatekeepers in determining whether trans people are allowed to get transitional medical care. Often criticized for being overly strict, for preventing trans youth from transitioning, and for compelling non-binary trans people to hide or lie about their experiences in order to receive treatment.","***Stealth*** - Living publicly as one's correct gender without being open about the fact that one is trans.","***STP*** - Stand-to-pee.","***T*** - Testosterone","***TCR*** - Thyroid cartilage reduction surgery.","***TERF*** - Trans-exclusive radical feminist. That is, they exclude trans people from their feminist movement, and are transphobic and transmisogynistic. See also TWERF.","***Testosterone*** - The main androgen hormone in the human body. Supplemental testosterone is sometimes taken by trans people, usually with the intent of achieving a more masculine appearance.","***The Surgery*** - A mysterious and frightening transformation spoken of by cis people who don’t know anything about how trans people actually transition.","***They (singular)*** - See singular they.","***Third Gender*** - A phrase used in anthropology for genders and gender roles that do not fit the Western constructs of \"man\" or \"woman.\" The phrase is problematic because of its colonialist or Eurocentric associations.","***Tomboy*** - _1._ A woman, usually a young girl, who behaves or dresses in a traditionally masculine or boyish way. \n _2._ Occasionally used as a non-binary gender or presentation.","***Top Surgery*** - A colloquial term for surgery that corrects one’s chest area to better match one’s gender presentation.","***Trans*** - Short for transgender, or (less often) transsexual.","***Trans* *** - Variant of \"trans\" that specifically denotes inclusion of non-binary, genderqueer and gender-variant people. The asterisk is controversial.","***Trans Exclusive Radical Feminism*** - A sector of the feminist movement that does not accept trans people, especially trans women.","***Trans man*** - A man who is also trans.","***Trans woman*** - A woman who is also trans.","***Transexual*** - Alternative spelling for transsexual.","***Transfeminine*** - Having a gender that is female or feminine-of-center, and being trans.","***Transgender*** - An umbrella term for all people and genders that do not match the gender that they were assigned at birth, or which was imposed on them by society, or which they were raised as.","***Transition*** - To change one's presentation to reflect a gender other than the one assigned at birth. Transitioning may include, but does not require, any of the following: changing one's pronouns, wearing different clothing than before, altering one's legal gender, taking hormone therapy, and undergoing surgery.","***Transman*** - Alternative spelling for trans man. Not recommended because it is sometimes seen as implying that \"transman\" is separate from \"man,\" a form of cissexism.","***Transmasculine*** - Having a gender that is male or masculine-of-center, and being trans.","***Transmisogyny*** - Transphobia and misogyny combined, forming an especially virulent form of oppression against trans women and other transfeminine people.","***Transphobe*** - A person who acts, thinks or speaks with transphobia.","***Transphobia*** - Prejudice, stigma, or discrimination against trans, non-binary and/or genderqueer people. Can occur as both an individual attitude and as a widespread social force.","***Transsexual*** - _1._ A person whose gender does not match their assigned sex (similar to transgender). \n _2._ A person who has changed, or wishes to change, their anatomy to better reflect their true gender. This is a loaded term and should not be used to refer to someone without their permission. Some transsexual people do not identify as transgender.","***Transtrender*** - A derogatory word used by some trans people to invalidate other trans people's identities. Not recommended for use, as it is frequently associated with respectability politics.","***Transvestic Fetishism*** - A kink in which one derives pleasure (usually sexual) from wearing clothes of a different gender. This phrase is discredited in trans communities because it has often been used to delegitimize trans identities, especially those of trans women.","***Transvestite*** - Old-fashioned word for a person who wears clothing of another gender. Not to be confused with transgender or transsexual. A loaded term, not recommended.","***Transwoman*** - Alternative spelling for trans woman. Not recommended because it is sometimes seen as implying that “transwoman” is separate from \"woman,\" a form of cissexism.","***Trigender*** - _1._ Not identifying as male, female or androgynous, but constructing one's own distinct gender. \n _2._ Having a gender identity that includes or shifts between three or more distinct genders, similarly to bigender.","***Truscum*** - Trans people who invalidate or perpetuate prejudice against other trans people, often by claiming that others are not \“truly\” trans or \“trans enough.\” This is often related to respectability politics.","***Tucking*** - Moving the genitals into place to make the presence of a penis less obvious.","***TWERF*** - Trans woman exclusive radical feminist. That is, they exclude trans woman from their feminist movement, and are transmisogynistic." ,"***Woman-Born-Woman*** - A cisgender woman. This term is sometimes used by transphobic people to invalidate trans people, and as such, it is not recommended."];
  var specialArray = ["***Uni*** - A term for describing a transexual who unfortunately is an annoying prick who doesn't know how to be kind unironically. _For an example, use the command \"?uni\"._", "***Ben*** - A term for describing your average weeaboo nigger who has giant lips and is dark. May or may not have severe aspergers. Bias and No fun allowed to be expected from one.", "***Hanna*** - A term for describing your average edgy girl who may or may not be lewd as heck, and may or may not be attractive, usually not.", "***Dion*** - A term describing someone who is under the height of 4'10\"", "***Vanilla*** - A term describing your average punnigger who may or may not need to be hanged, drawn, and quartered.", "***Kuro*** - A term describing your average aromantic, asexual, ozzy fag who may or may not come with mild to severe autism."]
  var totalTumblrArray = [tumblrArray1[Math.floor(Math.random()*tumblrArray1.length)], tumblrArray2[Math.floor(Math.random()*tumblrArray2.length)], tumblrArray3[Math.floor(Math.random()*tumblrArray3.length)], tumblrArray4[Math.floor(Math.random()*tumblrArray4.length)], specialArray[Math.floor(Math.random()*specialArray.length)]]
  client.sendMessage(m.channel, totalTumblrArray[Math.floor(Math.random()*totalTumblrArray.length)])
  return;
}
if (m.content.startsWith(`?google`)) { // google
  if (!checkCommand(m, `?google`)) return
  var searchInfo = m.content.slice(8)
  var googleSearch = "https://www.google.com/search?q=" + encodeURIComponent(searchInfo);
  client.reply(m, googleSearch)
  return;
}
if (m.content.startsWith(`?justacustom`)){
  client.sendMessage(m.channel, "http://puu.sh/oDGoc/41e9c94583.jpg")
  return;
}
if (m.content.startsWith(`?asexual`) || m.content.startsWith(`?kuro`) || m.content.startsWith(`?aromantic`)) { //kuro
  if (!checkCommand(m, `?asexual`)) return
  var kuroArray = ["http://puu.sh/mev31/7dde568741.png", "https://puu.sh/lSqgq/6015ed7c50.png", "https://puu.sh/m7mJf/3b295db195.png", "https://puu.sh/m8u7L/e20325a995.png",]
  client.sendMessage(m.channel, kuroArray[Math.floor(Math.random()*kuroArray.length)] )
  return;
}

if (m.content.startsWith(`?darkness`)) { //my old friend
  if (!checkCommand(m, `?darkness`)) return
  var darknessArray = ["https://www.youtube.com/watch?v=a5gz6KB_yvQ", "https://www.youtube.com/watch?v=ZNwICMDMV-g", "https://i.ytimg.com/vi/ZNwICMDMV-g/maxresdefault.jpg", "http://i1.kym-cdn.com/entries/icons/original/000/018/886/hello.png"]
  client.sendMessage(m.channel, darknessArray[Math.floor(Math.random()*darknessArray.length)])
  return;
}
/* if (m.content.startsWith(`?moxie`)) { //lmao
    if (!checkCommand(m,`?moxie`)) return
    var moxieArray = ["http://i.imgur.com/2AP11r9.png"]
    client.sendMessage(m.channel, moxieArray[Math.floor(Math.random()*komariArray.length)])
    return;
} */
 if (m.content.startsWith(`?chancey`)) { // chancey telling off darrell
    if (!checkCommand(m, `?chancey`)) return
    var chanceyArray = ["http://puu.sh/mmmre/b40b5a1d1f.png", "\n >attacking \n I was telling you how is it when you legit tell me to \"promise\" you to text first. \n I was implying that I cannot guarantee shit like this because it rarely happens, even if someone were to complain. \n Attack sounds like this: \n You sound like you're triggered. Where's your problem glasses? Oh wait. You're a nigger! You're just gonna complain that everything bad that happens to you is because you're black. Are you ready to get cucked by your master? Or perhaps you'd rather fuck gorillas aka your own people.", "http://puu.sh/lvpn6/2199db5dcd.png"]
    client.sendMessage(m.channel, chanceyArray[Math.floor(Math.random()*chanceyArray.length)])
    return;
 }
 if (m.content.startsWith(`?turgle`)) {//meme
    if (!checkCommand(m,`turgle`)) return
    client.sendMessage(m.channel, "https://i.gyazo.com/2e5e7e03320bcbdcb5e6a86ca377b3fc.png")
    return;
 }
/* if (m.content.startsWith(`?nanami`)) { //nanami
  if (!checkCommand(m, `?vanilla`)) return
  var vanillaArray = ["https://i.gyazo.com/fb6577a3239a86a24fac222e53b1e889.png", "http://puu.sh/maD1a/ebe71dec99.jpg", "https://i.gyazo.com/af8f05c42fb749f170a3788ebae3f9c6.png", "https://i.gyazo.com/109f37eaafac9ee14669d3b9a53e11ad.png", "http://puu.sh/menhE/94c73018b1.png"]
  client.sendMessage(m.channel, vanillaArray[Math.floor(Math.random()*vanillaArray.length)])
  return;
}*/
 if (m.content.startsWith(`?vanilla`) || m.content.startsWith(`?nanami`)) { //nanami
  if (!checkCommand(m, `?vanilla`)) return
  var vanillaArray = ["https://i.gyazo.com/235af2315c7cefcf5e2364a26b8b3752.png", "https://i.gyazo.com/4189c488ed2f247fdc48bcc9d7971f7c.png", "https://i.gyazo.com/88a95e81cc012ac30a8917b08321d291.png", "https://i.gyazo.com/fb6577a3239a86a24fac222e53b1e889.png", "http://puu.sh/maD1a/ebe71dec99.jpg", "https://i.gyazo.com/af8f05c42fb749f170a3788ebae3f9c6.png", "https://i.gyazo.com/109f37eaafac9ee14669d3b9a53e11ad.png", "http://puu.sh/menhE/94c73018b1.png"]
  client.sendMessage(m.channel, vanillaArray[Math.floor(Math.random()*vanillaArray.length)])
  return;
}
 if (m.content.startsWith(`?uni`)) { //uni
    if (!checkCommand(m, `?uni`)) return
    var uniArray = ["https://puu.sh/lTwMZ/0176bb7075.JPG", "http://puu.sh/lNwLG/47cc9cf362.png", "http://puu.sh/m9whg/187a691bc7.png", "ALWAYS 🕔 make sure 👍 to shave 🔪🍑 because ✌️ the last time 🕒 we let 👐😪 a bush 🌳 in our lives 👈😜👉 it did 9/11 💥🏢🏢✈️🔥🔥🔥"]
    client.sendMessage(m.channel, uniArray[Math.floor(Math.random() * uniArray.length)])
    return;
 }
if (m.content.startsWith(`?roast`)) { //when ya homie gets roasted
  if (!checkCommand(m, `?roast`)) return
  var roastArray = ["https://40.media.tumblr.com/a45905c3728d9e12c0cf75f1068dc1ca/tumblr_noto8ys9Uc1rraq2ko2_1280.jpg", "https://cdn.discordapp.com/attachments/93578176231374848/130706697416081408/tumblr_nwsaleCKuD1s8as3do1_540.png", "http://www.kappit.com/img/pics/20150116_124218_bhcdaeb_sm.jpg", "http://img.memecdn.com/n-gga-gets-roasted-even-when-he-amp-039-s-dead_o_4109505.jpg", "http://cdn.meme.am/instances/500x/52976907.jpg", "http://www.kappit.com/img/pics/201501_2208_abfbd_sm.jpg", "http://i0.kym-cdn.com/photos/images/original/000/947/153/89e.jpg", "http://img.memecdn.com/we-all-been-throught-this_o_3521609.jpg", "http://cdn.meme.am/instances/500x/55960483.jpg", "https://i.imgflip.com/ngeg6.jpg", "http://img.memecdn.com/nice-guys-get-roasted-last_o_6089935.jpg", "https://40.media.tumblr.com/1102da4ecaed1492da9ab9662d62abc0/tumblr_npu3y5uKv81swz866o1_500.jpg", "https://pbs.twimg.com/media/CJK5waPWEAAoJyE.jpg", "http://puu.sh/mcJW3/4351a36e0b.png", "http://cdn.meme.am/instances/400x/57509406.jpg", "http://www.kappit.com/img/pics/201410_1526_fihbf_sm.jpg", "http://www.kappit.com/img/pics/201501_0902_bfhia_sm.jpg", "http://img.ifcdn.com/images/d6745e26c1fadaf2fa16a130fc398b8f4ffae666b0212be26c5364550d7e7ce6_1.jpg", "https://i.imgur.com/ngWCSjh.jpg", "http://img.ifcdn.com/images/6c571851a801b64e886f01a087a82cee95089f877198d1bd846e2c30c3e66652_1.jpg", "http://img.ifcdn.com/images/a4167df60cf75c3cfec1f1d4a96f1a3bb3986bbaf900a578830c32946186f4c8_1.jpg", "http://img.ifcdn.com/images/bd19c9876aa68bcb382cd030750a7378c627e3ded10b57e052a39473e756bb88_3.jpg", "https://scontent.cdninstagram.com/hphotos-xfp1/t51.2885-15/e35/11906257_1031577300246069_1601729207_n.jpg", "http://img.ifcdn.com/images/2c4a68e9c6d80906022de1d7434e8fa2792fa9f134f8999d7fa4cbb5daa8536c_1.jpg", "https://i.imgur.com/gZAR1gC.png", "http://img.ifcdn.com/images/945df2cbec8055e5e9feb25c97efea7a23ac48de02ed4134ae421c14f51b3c00_3.jpg", "http://img.ifcdn.com/images/9b54a313f4b7c92897323d4bc3f2d0bb1c7886111524cb7a85a914798e4f155c_3.jpg", "http://img.ifcdn.com/images/4e499b636afb516ec4c2d53c5c68d1418a6734cd495a464a9b4bfdb914f74e58_3.jpg", "http://img.ifcdn.com/images/bea0a6f2fbf7fcceafaa4be3d078f20da222dea4df473e93cb6597b32ff44f5d_3.jpg", "http://puu.sh/mcKv3/0edce0b0c7.png"]
  client.sendMessage(m.channel, roastArray[Math.floor(Math.random()*roastArray.length)])
  return;
}
if (m.content.startsWith(`?niger`)) { //niger
  if (!checkCommand(m, `?niger`)) return
  client.reply(m, "This is really offensive and racist. Labelling someone with the word \"niger\" is not right. We're all human and skin color, nationality, religion, political beliefs, sexual identity and orientation and lifestyle don't make us different under the skin. Pictures like this should be banned from tumblr.")
  return;
}
if (m.content.startsWith(`?nigger`)) { //niger
  if (!checkCommand(m,`?nigger`)) return
  if(m.content.length < 8){
    client.reply(m, "This is extremely offensive, racist, and sexist. Labelling someone with the word \"nigger\" is not right. We're all human and skin color, nationality, religion, political beliefs, sexual identity and orientation and lifestyle don't make us different under the skin. Things like this should be banned from tumblr.")
    return;
  } else {
    var nigFiller = (m.content).slice(8);
    client.reply(m, "This is extremely offensive, racist, and sexist. Labelling someone with the word \"" + nigFiller + "\" is not right. We're all human and skin color, nationality, religion, political beliefs, sexual identity and orientation and lifestyle don't make us different under the skin. Things like this should be banned from tumblr." )
    return;
  }
}
if (m.content.startsWith(`?unumii`)) { //unumii
  if (!checkCommand(m, `?unumii`)) return
  client.sendMessage(m.channel, "http://puu.sh/mero2/3d8fbbaacf.png")
  return;
}
if (m.content.startsWith(`?edgemaster`)) {//edge
  if(!checkCommand(m,`?edgemaster`)) return
  var edgeArray = ["http://puu.sh/merq0/24e932c0e5.png", "http://puu.sh/merdn/d6c644843e.png", "http://puu.sh/mersp/b0d7487014.png", "http://puu.sh/merwB/549f239009.png", "http://puu.sh/merye/ab56b50781.png", "http://puu.sh/merzr/6e21fadfd0.png"]
  client.sendMessage(m.channel, edgeArray[Math.floor(Math.random()*edgeArray.length)])
  return;
}
if (m.content.startsWith(`?jimbo`)) { //shadow realm jimbo
  if (!checkCommand(m, `?jimbo`)) return
  client.reply(m, "http://puu.sh/m1Ta5/910f1b8e35.png")
  return;
}
if (m.content.startsWith(`?stayfree`)) { //FREE
  if (!checkCommand(m, `?stayfree`)) return
  var freeArray = ["http://ecx.images-amazon.com/images/I/81GRxyntAaL._SL1500_.jpg","https://cdn.discordapp.com/attachments/121763234796666880/134607862323347456/free__iwatobi_swim_club_logo_wallpaper_by_baon2k-d6eqyop.png"]
  client.reply(m, freeArray[Math.floor(Math.random()*freeArray.length)])
  return;
}
if (m.content.startsWith(`?dion`)) { //fuckin spooked
  if (!checkCommand(m, `?dion`)) return
  var dionArray = ["http://puu.sh/m9kCz/81350ea87f.jpg", "http://puu.sh/m9oFW/fda62eb112.png", "https://i.gyazo.com/8606fb25fb564bd0235f482edb9dc921.png", "https://cdn.discordapp.com/attachments/128148462683422720/130425654255681536/IMG_1515.PNG", "http://puu.sh/lzAgv/55c4276d7c.png"]
  client.reply(m, dionArray[Math.floor(Math.random() * dionArray.length)])
  return;
}
if (m.content.startsWith(`?fang`)) { // what a fuckin retard
  if (!checkCommand(m, `?fang`)) return
  var messageanswer = randFangCringe.data.images[Math.floor(Math.random()*40)].link
  client.sendMessage(m.channel, messageanswer.replace(/\\\//g, "/"));
}
if (m.content.startsWith(`?starterpack`)) { //memecontrol
  if (!checkCommand(m, `?pack`)) return
  var starterpackArray = ["https://puu.sh/l4EIB/6e34ebbe36.jpg", "https://puu.sh/l4EAy/ecd052884e.jpg", "https://puu.sh/l4EtZ/a4f6819dfe.jpg", "https://puu.sh/l4Em3/e065f1a648.jpg", "https://puu.sh/l4EiX/4058337b49.jpg", "https://puu.sh/l4E38/787f1d7295.jpg", "https://puu.sh/l4E1q/a5c291f274.jpg", "http://cdn2.gurl.com/wp-content/uploads/2014/11/real-music-starter-pack.jpg", "http://socawlege.com/wp-content/uploads/2015/05/14.png", "http://socawlege.com/wp-content/uploads/2015/05/7.png", "http://cdn3.gurl.com/wp-content/uploads/2014/11/tumblr-white-girl-starter-pack.jpg", "https://puu.sh/m9PKe/fe80e20b66.png", "http://puu.sh/m9POD/7627d3cc78.png", "https://i.imgur.com/r3kOR9J.png", "http://puu.sh/m9PQ0/1a26c2f439.png", "http://orig10.deviantart.net/ae07/f/2015/169/0/c/the_i_hate_capitalism_starter_pack_by_billwilsoncia-d8xuw2b.png", "http://puu.sh/m9PR1/eeac97339a.png", "http://puu.sh/m9PRF/9946c618e1.png", "http://puu.sh/m9PSl/0dbfa24b47.png", "http://cdn.hiphopwired.com/wp-content/uploads/2014/11/starter-pack-2.png", "http://puu.sh/m9PTb/b73f4677d5.png", "http://puu.sh/m9PTX/2762d24475.png", "http://socawlege.com/wp-content/uploads/2014/12/kush.jpg", "https://i.imgur.com/lCWov56.jpg", "https://i.imgur.com/BfUDdnl.png", "http://cdn.hiphopwired.com/wp-content/uploads/2014/11/starter-pack-1.png", "http://www.starter-packs.com/wp-content/uploads/2014/12/home-alone.jpg", "http://cdn3.gurl.com/wp-content/uploads/2014/11/college-student-starter-pack.jpg", "https://i.imgur.com/M0oP8m4.jpg", "http://puu.sh/m9PZd/a0b5745764.png", "https://i.imgur.com/pDehVAX.jpg", "http://puu.sh/m9PZP/dc11be8fd2.png"];
  client.reply(m, starterpackArray[Math.floor(Math.random() * starterpackArray.length)])
  return;
}
if (m.content.startsWith(`?lyin`)) { //memecontrol
  if (!checkCommand(m, `?lyin`)) return
  var lyinArray = ["http://puu.sh/mctJ7/cedbe724f2.png", "https://i.ytimg.com/vi/Zy6JfChIXxg/hqdefault.jpg", "♫ Why the fuck you lyin', why you always lyin', mmmmohh my god, stop fuckin lyyyinn'♪♫."]
  client.reply(m, lyinArray[Math.floor(Math.random() * lyinArray.length)])
  return;
}
if (m.content.startsWith(`?compliment`)){
	var complimentArray = ["Hiya! Did you know any day spent with you is my favorite day?","Heya, I just wanted to tell you: when in doubt, smile!","Hey man, my life would suck without you. Thanks, you're great.","Phew! You're back. there’s rarely any dull moment when I’m with you. You're fabulous.", "Whoa, I like your socks. #sockswag ","Hey! I think our friendship is like a cup of tea, a special blend of you and me.","Hi! LOL your status was super funny!","Hey! I think you have a good fashion sense.","Hi! I wanted to let you know that you wear really cute sweaters.","Hi! You're my number one.","Hey, do you wanna build a snowman? It doesn't have to be a snowman~","Hey... I'd give you a tissue, for your issues.","Hi! Just letting you know that you can copy my math homework!","Heya, you're so fancy, you already know.","Hey friend, I'd invite you to my birthday party.","Hi! Just letting you know that your personality is brighter than the stars.","I love you!","Hi! You're spontaneous, and I love it!","Hey, I appreciate all of your opinions.","W-whoa... Your smile is breath taking.","Hi! You are the gravy to my mashed potatoes.","Hey, I'm so glad we met.","Hey, is it hot in here or is it just you?","Hi. I don't speak much English, but with you all I really need to say is beautiful.","Hey, I think you could survive a zombie apocalypse.","Y-you're so rad...","Heya friend! You're more fun than a barrel of monkeys.","Hi! You're nicer than a day on the beach.","Hey, you make me think of beautiful things, like strawberries.","Hi. You're more fun than bubble wrap.","Man, playing video games with you would be fun.","Hello, I'd like to know why you're so beautiful.","Hey, I think you could invent words and people would use them.","Hey, did you know there's 21 letters in the Alphabet? Oh wait. I forgot u, r, a, q, t! How stupid of me... :wink:","Hey! You're tastier than chicken soup when I have the flu.","Hi, are you a Beaver? Cause Dam!","Hey, why are you so talented? I can't Handel your musicality.", "Hi! Are you a train? because I choo,choo,choose you!", "You're beautiful no matter what they say","Hey... You're the apple in my eye, it still hurts but I love pain~", "Hey, are you wifi? Because I'm feeling a connection ;)", "Hey, did you know you are the USB port to my USB? We fit perfectly together.","Hi. Did you know you're the smoothest one of all? <3"]
	var requestUrl = "http://www.insultgenerator.org/";
   reequest(requestUrl, function(error, response, html){
     if(!error){
       var $ = cheerio.load(html);
       $('.wrap').filter(function(){
         var insultData = $(this);
         randomInsult = insultData.text();
       })
     }
   })
   var insult = randomInsult
   if(adminIds.indexOf(m.author.id) > -1){
   	client.reply(m, complimentArray[Math.floor(Math.random()*complimentArray.length)])
   	return;
   } else {
   	client.reply(m, insult)
   	return;
   }
}
if (m.content.toLowerCase().startsWith(`${botMention} hi`) || m.content.toLowerCase().startsWith(`${botMention} hello`) || m.content.toLowerCase().startsWith(`${botMention} hey`) || m.content.toLowerCase().startsWith(`${botMention} sup`) || m.content.toLowerCase().startsWith(`${botMention} yo`)) {
  if (m.author.id === "81526338728501248") {
    var complimentArray = ["Hiya! Did you know any day spent with you is my favorite day?","Heya, I just wanted to tell you: when in doubt, smile!","Hey man, my life would suck without you. Thanks, you're great.","Phew! You're back. there’s rarely any dull moment when I’m with you. You're fabulous.", "Whoa, I like your socks. #sockswag ","Hey! I think our friendship is like a cup of tea, a special blend of you and me.","Hi! LOL your status was super funny!","Hey! I think you have a good fashion sense.","Hi! I wanted to let you know that you wear really cute sweaters.","Hi! You're my number one.","Hey, do you wanna build a snowman? It doesn't have to be a snowman~","Hey... I'd give you a tissue, for your issues.","Hi! Just letting you know that you can copy my math homework!","Heya, you're so fancy, you already know.","Hey friend, I'd invite you to my birthday party.","Hi! Just letting you know that your personality is brighter than the stars.","I love you!","Hi! You're spontaneous, and I love it!","Hey, I appreciate all of your opinions.","W-whoa... Your smile is breath taking.","Hi! You are the gravy to my mashed potatoes.","Hey, I'm so glad we met.","Hey, is it hot in here or is it just you?","Hi. I don't speak much English, but with you all I really need to say is beautiful.","Hey, I think you could survive a zombie apocalypse.","Y-you're so rad...","Heya friend! You're more fun than a barrel of monkeys.","Hi! You're nicer than a day on the beach.","Hey, you make me think of beautiful things, like strawberries.","Hi. You're more fun than bubble wrap.","Man, playing video games with you would be fun.","Hello, I'd like to know why you're so beautiful.","Hey, I think you could invent words and people would use them.","Hey, did you know there's 21 letters in the Alphabet? Oh wait. I forgot u, r, a, q, t! How stupid of me... :wink:","Hey! You're tastier than chicken soup when I have the flu.","Hi, are you a Beaver? Cause Dam!","Hey, why are you so talented? I can't Handel your musicality.", "Hi! Are you a train? because I choo,choo,choose you!", "You're beautiful no matter what they say","Hey... You're the apple in my eye, it still hurts but I love pain~", "Hey, are you wifi? Because I'm feeling a connection ;)", "Hey, did you know you are the USB port to my USB? We fit perfectly together.","Hi. Did you know you're the smoothest one of all? <3"]
    var responseArray = [complimentArray[Math.floor(Math.random()*complimentArray.length)], complimentArray[Math.floor(Math.random()*complimentArray.length)], complimentArray[Math.floor(Math.random()*complimentArray.length)], "Hello, how are you?", "Hi!!!", "Why, hello there.", "Hello!", "Hai. x3", "Hi there!", "Hello! <3", "H-hi.."];
    client.reply(m, responseArray[Math.floor(Math.random() * responseArray.length)]);
    return;
  } else if(adminIds.indexOf(m.author.id) > -1){
    var responseArray = ["Hello, how are you?", "Hi!!!", "Why, hello there.", "Hello!", "Hai. x3", "Hi there!", "Hello~", "H-hi.."];
    client.reply(m, responseArray[Math.floor(Math.random() * responseArray.length)]);
    return;
  } else {
   var requestUrl = "http://www.insultgenerator.org/";
   reequest(requestUrl, function(error, response, html){
     if(!error){
       var $ = cheerio.load(html);
       $('.wrap').filter(function(){
         var insultData = $(this);
         randomInsult = insultData.text();
       })
     }
   })
   var insult = randomInsult
    var responseArray = [randomInsult, "Who the fuck are you?", "Please do humanity a favor and walk towards the light.","Die in a fire, you jew.", "Since when do I talk to normies?", "Are you okay? Did you hit your head?", "You look nasty.", "Hmm....", "Do you praise Ebola-chan?", "You need some oxiclean..", "Somebody, help me!!", "Stop harassing me!", "Please don't talk to me.", "You're actually trash! Commit Sudoku..", "Oh, hello, stupid one.", "Awww, look! It's retarded. Hi!!!", "...Ew.", "...", "LOL!", "What did you just say to me?", "Ebola-chan told me not to talk to plebeians...", "..Ew, it's a nonbeliever...", "I hope you never ever recieve Ebola-chan's love!!!! D:<", "Uh.. Hello...?", "Why are you talking to me? You're scaring me...", "Please go away.", "Hai!", "How are ya?", "Oh my god, get away from me.", "You're really 3DPD...", "I think you should commit suicide! How's that for a greeting, huh?", "Fuck you!", "Kill yourself!", "I hope you get nagasaki'd, you thundercunt."]
    client.reply(m, responseArray[Math.floor(Math.random() * responseArray.length)]);
  }
}

if(m.content.startsWith(`?haiku`)){
  var requestUrl = "http://www.smalltime.com/Haiku?square=";
  reequest(requestUrl, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      $('tr').filter(function(){
        var insultData = $(this);
        randomInsult = insultData.text();
        client.sendMessage(m.channel, randomInsult);
        return;
      })
    }
  })
  var insult = randomInsult;
}
/* if (m.content.startsWith(``)) { //memecontrol
  if (!checkCommand(m, ``)) return
  client.reply(m, "")
  return
}
*/
if (m.content.startsWith(`?8ball`)) {
  userQuestion = (m.content).slice(7)
  var ballArray = ["Signs :arrow_right: to yes.", "Yeah.", "Try again.", "Without a doubt.", "Ebola-chan says no.", "I'd say yes.", "Go for it, fam.","It doesn't look so good...","Yep!", "Uh, I don't think you want to know.","It seems very doubtful.", "Ebola-chan says: \"Yes, definitely\"!", "Even I know it's certain!", "Err... Foggy, hazy, y'know.", "Probably!", "Perhaps you should ask later?", "No.", "It seems the outlook is good!","I wouldn't count on it."]
  if(m.content.length > 7){
    if(m.content.indexOf("?", 7) === -1){
      client.sendMessage(m, `<@${m.author.id.toString()}> \`${userQuestion}?\`: ${ballArray[Math.floor(Math.random()*ballArray.length)]}`)
      return;
    } else {
      client.sendMessage(m, `<@${m.author.id.toString()}> \`${userQuestion}\`: ${ballArray[Math.floor(Math.random()*ballArray.length)]}`)
      return;
    }
  } else {
    client.reply(m, "You need to have a question or something...")
    return;
  }

}
//if (m.content.startsWith(`?test1`)){}
if (m.content.startsWith(`?mura`)) { //memecontrol
  if (!checkCommand(m, `?mura`)) return
  var muraArray = ["http://puu.sh/mh7WZ/5e312bee07.png", "https://i.gyazo.com/21dd51c5175d5ea00d57a15aeb95beb2.png"]
  client.reply(m, muraArray[Math.floor(Math.random() * muraArray.length)])
  return;
}
if (m.content.startsWith(`?gasthejaps`)) { //memecontrol
  if (!checkCommand(m, `?gasthejaps`)) return
  var gastheJaps = ["https://puu.sh/ksK2R/71306e0b2c.png", "https://puu.sh/ksJPk/378c22cdb3.png"]
  client.reply(m, gastheJaps[Math.floor(Math.random() * gastheJaps.length)])
  return;
}
if (m.content.startsWith(`?chill`)) { //memecontrol
  if (!checkCommand(m, `?chill`)) return
  client.reply(m, "https://puu.sh/kt0cd/76e8460d30.png")
  return
}
if (m.content.startsWith(`?disgusting`)) { //FE disgusting
  if (!checkCommand(m, `?disgusting`)) return
  var disgustingArray = ["http://puu.sh/m9urN/727dc202f1.jpg", "http://puu.sh/m9uHU/55e21971c4.png", "http://puu.sh/m9usJ/42f703711b.jpg", "http://puu.sh/m9uKU/8e234f5886.png"]
  client.reply(m, disgustingArray[Math.floor(Math.random() * disgustingArray.length)])
  return
}
if (m.content.startsWith(`?murder`)) { //FE murder
  if (!checkCommand(m, `?murder`)) return
  var murderArray = ["http://puu.sh/m9uEl/c078d7d7e3.jpg", "http://puu.sh/m9uDB/66606e1c4d.png", "http://puu.sh/m9uFf/5c50e06e88.png", "http://puu.sh/m9uCe/e950f095af.png"]
  client.reply(m, murderArray[Math.floor(Math.random() * murderArray.length)])
  return
}
if (m.content.startsWith(`?clearly`)) { //embarassing...
  if (!checkCommand(m, `?clearly`)) return
  var ruseArray = ["http://puu.sh/m9upL/d08c7cae41.jpg", "http://puu.sh/m9uuY/c73bdb1d8c.jpg", "http://puu.sh/m9uJx/88d050f6fd.png"]
  client.reply(m, ruseArray[Math.floor(Math.random()*ruseArray.length)])
  return
}
if (m.content.startsWith(`?stiff`)) { //stiffies and panties
  if (!checkCommand(m, `?stiff`)) return
  var stiffArray = ["http://puu.sh/m9vhb/e8eb27f5e8.png", "http://puu.sh/m9unQ/5e94a9615e.jpg"]
  client.reply(m, stiffArray[Math.floor(Math.random()*stiffArray.length)])
  return
}
if (m.content.startsWith(`?sadness`)) { //memecontrol
  if (!checkCommand(m, `?sadness`)) return
  var sadArray = ["http://puu.sh/m9up0/97a92a25ae.png", "http://puu.sh/m9uua/882e72756e.png"]
  client.reply(m, sadArray[Math.floor(Math.random()*sadArray.length)])
  return
}
if (m.content.startsWith(`?peace`)) { //PEACE
  if (!checkCommand(m, `?peace`)) return
  client.reply(m, "http://puu.sh/m9uG8/de8d3f9f9e.png")
  return
}
if (m.content.startsWith(`?friends`)) { //PEACE
  if (!checkCommand(m, `?friends`)) return
  client.reply(m, "http://puu.sh/m9ux9/c2b3d3bfda.png")
  return
}
if (m.content.startsWith(`?shock`)) { //PEACE
  if (!checkCommand(m, `?shock`)) return
  client.reply(m, "http://puu.sh/m9uBc/f5f18e509c.png")
  return
}
if (m.content.startsWith(`?goodgirls`)){ //goodgrils
  if (!checkCommand(m, `?goodgirls`)) return
  client.reply(m, "http://puu.sh/m2X9z/d979127608.png")
  return
}
  // Only respond to other messages inside the bound channel
  if (!m.channel.equals(boundChannel)) return;

  if (m.content.startsWith(`?next`)) {
    // next !checkCommand(m, '?next')
    if (userIsAdmin(m.author.id)) {
    playStopped();
    return;
  } else if((!userIsAdmin(m.author.id)) && (voteAllIDs.indexOf(m.author.id)<0)){
    voteCount = 1;
    client.sendMessage(m.channel, "Vote to next added by " + m.author.username + ".")
    var voter = m.author.id;
  } else {
    client.sendMessage(m.channel, m.author.username + " already voted!")
    voteCount = 0;
    }
    // console.log("The current amount of votes is " + voteCount);
    // console.log("The people in the vote list is " + voteList);
    voteTotalCount = voteCount + voteTotalCount;
    voteAllIDs.push(voter);
    console.log(voteCount);
    console.log(totalNumberNeeded = (Discord.VoiceChannel.members))
   // if(!(Discord.VoiceChannel.members).length === totalNumberNeeded){
  //    totalNumberNeeded = (Discord.VoiceChannel.members).length
  //  } else {
   //   totalNumberNeeded;
 //   }
    if (voteTotalCount >= 3){
      console.log("L I M I T S  W E R E  M E A N T  T O  B E  B R O K E N . . .")
      console.log("The current amount of votes are" + voteTotalCount)
        playStopped();
        voteTotalCount = 0;
        voteAllIDs = [];
      //  totalNumberNeeded = 0;
        return;
      } else {
        console.log("Not breaking limits........")
        console.log("The current amount of votes is " + voteTotalCount);
        console.log("The people in the vote list are " + voteAllIDs);
      };
      return;
  };

  if (m.content.startsWith(`${botMention} yq`) // youtube query
    || m.content.startsWith(`${botMention} qq`) // queue query
    || m.content.startsWith(`${botMention} pq`) // play query
    || m.content.startsWith(`${botMention} ytq`)) {

    if (!checkCommand(m, 'yq')) return;

    if (!apiKey) {
      client.reply(m, 'Search is disabled (no API KEY found).');
      return;
    }

    var args = spliceArguments(m.content)[1];

    if (!args) {
      client.reply(m, 'You need to specify a search parameter.');
      return;
    }

    var requestUrl = 'https://www.googleapis.com/youtube/v3/search' +
      `?part=snippet&q=${escape(args)}&key=${apiKey}`;

    request(requestUrl, (error, response) => {
      if (!error && response.statusCode == 200) {
        var body = response.body;
        if (body.items.length == 0) {
          client.reply(m, 'Your query gave 0 results.');
          return;
        }

        for (var item of body.items) {
          if (item.id.kind === 'youtube#video') {
            var vid = item.id.videoId;
            getInfoAndQueue(vid, m);
            return;
          }
        }

        client.reply(m, 'No video has been found!');
      } else {
        client.reply(m, 'There was an error searching.');
        return;
      }
    });

    return; // have to stop propagation
  }

  if (m.content.startsWith(`${botMention} pl`)) { // playlist
    if (!checkCommand(m, 'pl')) return;

    if (!apiKey) {
      client.reply(m, 'Playlist adding is disabled (no API KEY found).');
      return;
    }

    var pid = spliceArguments(m.content)[1];

    if (!pid) {
      client.reply(m, 'You need to specify a playlist ID!');
      return;
    }

    var requestUrl = 'https://www.googleapis.com/youtube/v3/playlistItems' +
      `?part=contentDetails&maxResults=50&playlistId=${pid}&key=${apiKey}`;

    request.get(requestUrl).end((error, response) => {
      if (!error && response.statusCode == 200) {
        var body = response.body;
        if (body.items.length == 0) {
          client.reply(m, 'That playlist has no videos.');
          return;
        }

        shouldStockpile = true;
        fancyReply(m, `Loading ${body.items.length} videos...`);
        var suppress = 0;
        body.items.forEach((elem, idx) => {
          var vid = elem.contentDetails.videoId;
          if (idx == 1) suppress = body.items.length - 2;
          if (idx == 2) suppress = -1;
          getInfoAndQueue(vid, m, suppress);
        });
        spitUp();
      } else {
        client.reply(m, 'There was an error finding playlist with that id.');
        return;
      }
    });

    return;
  }

  if (m.content.startsWith(`${botMention} y`) // youtube
    || m.content.startsWith(`${botMention} q`) // queue
    || m.content.startsWith(`${botMention} p`)) { // play

    if (!checkCommand(m, 'yt')) return;

    var vidList = spliceArguments(m.content)[1];

    var vids = vidList.split(',');
    var suppress = 0;
    vids.forEach((vid, idx) => {
      if (idx == 1) suppress = vids.length - 2;
      if (idx == 2) suppress = -1;
      parseVidAndQueue(vid, m, suppress);
    });
    return;
  }

  if (m.content.startsWith(`?replay`)) { // replay
    if (!checkCommand(m, 'replay')) return;
    var videoToPlay = currentVideo ? currentVideo : lastVideo ? lastVideo : false;
    if (!videoToPlay) {
      client.reply(m, 'No video has been played yet!');
      return;
    }

    playQueue.push(videoToPlay);
    client.reply(m, `Queued ${videoToPlay.prettyPrint()}`);
    return;
  }

  if (m.content.startsWith(`${botMention} sh`)) { // shuffle
    if (!checkCommand(m, 'shuffle')) return;
    if (playQueue.length < 2) {
      client.reply(m, 'Not enough songs in the queue.');
      return;
    } else {
      Util.shuffle(playQueue);
      client.reply(m, 'Songs in the queue have been shuffled.');
    }

    return;
  }

  if (m.content.startsWith(`?link`)) {
    if (!checkCommand(m, 'link')) return;
    if (currentVideo) client.reply(m, `<https://youtu.be/${currentVideo.vid}>`);
    return; // stop propagation
  }

  if (m.content.startsWith(`${botMention} list s`)) { // list saved
    if (!checkCommand(m, 'list saved')) return;
    var formattedList = 'Here are the videos currently saved: \n';
    for (var key in Saved.saved.videos) {
      if (Saved.saved.videos.hasOwnProperty(key)) {
        formattedList += `*${key}*: ${Saved.saved.videos[key].prettyPrint()}\n`;
      }
    }

    if (formattedList.length >= 2000) {
      Util.haste(formattedList, (key) => {
        if (!key) {
          client.reply(m, 'There was an error while retrieving the list of saved videos! Sorry :(');
        } else {
          client.reply(m, `http://hastebin.com/${key}.md`);
        }
      });
    } else client.reply(m, formattedList);
    return; // so list doesn't get triggered
  }

  if (m.content.startsWith(`?list`)) { // list
    if (!checkCommand(m, '?list')) return;

    var formattedList = '';
    if (currentVideo) formattedList += `Currently playing: ${currentVideo.fullPrint()}\n`;

    if (playQueue.length == 0) {
      formattedList += `The play queue is empty! Add something using **${botMention} yt *<video ID>***.`;
    } else {
      formattedList += 'Here are the videos currently in the play queue, from first added to last added: \n';

      var shouldBreak = false;

      playQueue.forEach((video, idx) => {
        if (shouldBreak) return;

        var formattedVideo = `${idx + 1}. ${video.fullPrint()}\n`;

        if ((formattedList.length + formattedVideo.length) > 1950) {
          formattedList += `... and ${playQueue.length - idx} more`;
          shouldBreak = true;
        } else {
          formattedList += formattedVideo;
        }
      });
    }

    client.reply(m, formattedList);
    return;
  }

  if (m.content.startsWith(`${botMention} s`)) { // save
    if (!checkCommand(m, 'save')) return;
    var argument = spliceArguments(m.content)[1];
    if (!argument) {
      client.reply(m, 'You need to specify a video and a keyword!');
      return;
    }

    var splitArgs = spliceArguments(argument, 1);

    var vid = splitArgs[0];
    vid = resolveVid(vid, m);

    YoutubeTrack.getInfoFromVid(vid, m, (err, info) => {
      if (err) handleYTError(err);
      else saveVideo(info, vid, splitArgs[1], m);
    });
    return;
  }

  if (m.content.startsWith(`?time`)) { // time
    if (!checkCommand(m, 'time')) return;
    var streamTime = client.internal.voiceConnection.streamTime; // in ms
    var streamSeconds = streamTime / 1000;
    var videoTime = currentVideo.lengthSeconds;
    client.reply(m, `${Util.formatTime(streamSeconds)} / ${Util.formatTime(videoTime)} (${((streamSeconds * 100) / videoTime).toFixed(2)} %)`);
    return;
  }
});

function parseVidAndQueue(vid, m, suppress) {
  vid = resolveVid(vid, m);
  if (!vid) {
    client.reply(m, 'You need to specify a video!');
    return;
  }

  getInfoAndQueue(vid, m, suppress);
}

function resolveVid(thing, m) {
  thing = thing.trim();
  if (thing === 'current') {
    if (currentVideo) return currentVideo.vid;
    client.reply(m, 'No video currently playing!'); return false;
  } else if (thing === 'last') {
    if (lastVideo) return lastVideo.vid;
    client.reply(m, 'No last played video found!'); return false;
  } else if (/^http/.test(thing)) {
    var parsed = url.parse(thing, true);
    if (parsed.query.v) return parsed.query.v;
    client.reply(m, 'Not a YouTube URL!'); return false;
  } else return Saved.possiblyRetrieveVideo(thing);
}

function getInfoAndQueue(vid, m, suppress) {
  YoutubeTrack.getInfoFromVid(vid, m, (err, video) => {
    if (err) handleYTError(err);
    else {
      possiblyQueue(video, m.author.id, m, suppress);
    }
  });
}

function spliceArguments(message, after) {
  after = after || 2;
  var rest = message.split(' ');
  var removed = rest.splice(0, after);
  return [removed.join(' '), rest.join(' ')];
}

function saveVideo(video, vid, keywords, m) {
  simplified = video.saveable();
  if (Saved.saved.videos.hasOwnProperty(keywords)) client.reply(m, `Warning: ${Saved.saved.videos[keywords].prettyPrint()} is already saved as *${keywords}*! Overwriting.`);

  var key;
  if (key = Saved.isVideoSaved(vid)) client.reply(m, `Warning: This video is already saved as *${key}*! Adding it anyway as *${keywords}*.`);

  Saved.saved.videos[keywords] = simplified;
  client.reply(m, `Saved video ${video.prettyPrint()} as *${keywords}*`);
  Saved.write();
}

function possiblyQueue(video, userId, m, suppress) {
  video.userId = userId;
  suppress = (suppress === undefined) ? false : suppress;
  reason = shouldDisallowQueue(playQueue, video, Config);
  if (!userIsAdmin(userId) && reason) {
    fancyReply(m, `You can't queue **${video.title}** right now! Reason: ${reason}`);
  } else {
    playQueue.push(video);
    if (suppress == 0) fancyReply(m, `Queued ${video.prettyPrint()}`);
    else if (suppress > -1) fancyReply(m, `Queued ${video.prettyPrint()} and ${suppress} other videos`);

    // Start playing if not playing yet
    if (!currentVideo) nextInQueue();
  }
}

function handleYTError(err) {
  if (err.toString().indexOf('Code 150') > -1) {
    // Video unavailable in country
    boundChannel.sendMessage('This video is unavailable in the country the bot is running in! Please try a different video.');
  } else if (err.message == 'Could not extract signature deciphering actions') {
    boundChannel.sendMessage('YouTube streams have changed their formats, please update `ytdl-core` to account for the change!');
  } else if (err.message == 'status code 404') {
    boundChannel.sendMessage('That video does not exist!');
  } else {
    boundChannel.sendMessage('An error occurred while getting video information! Please try a different video.');
  }

  console.log(err.toString());
}

function playStopped() {
  if (client.internal.voiceConnection) client.internal.voiceConnection.stopPlaying();

  boundChannel.sendMessage(`Finished playing **${currentVideo.title}**`);
  client.setStatus('online', null);
  lastVideo = currentVideo;
  currentVideo = false;
  voteTotalCount = 0;
  voteAllIDs = [];
  nextInQueue();
}

function play(video) {
  currentVideo = video;
  if (client.internal.voiceConnection) {
    var connection = client.internal.voiceConnection;
    currentStream = video.getStream();

    currentStream.on('error', (err) => {
      if (err.code === 'ECONNRESET') {
        if (!Config.suppressPlaybackNetworkError) {
          boundChannel.sendMessage(`There was a network error during playback! The connection to YouTube may be unstable. Auto-skipping to the next video...`);
        }
      } else {
        boundChannel.sendMessage(`There was an error during playback! **${err}**`);
      }
      playStopped(); // skip to next video
    });

    currentStream.on('end', () => setTimeout(playStopped, Config.timeOffset || 8000)); // 8 second leeway for bad timing
    connection.playRawStream(currentStream).then(intent => {
      boundChannel.sendMessage(`Playing ${video.prettyPrint()}`);
      client.setStatus('online', video.title);
    });
  }
}

function userIsAdmin(userId) {
  return Config.adminIds.indexOf(userId) > -1;
}

function checkCommand(m, command) {
  if (Config.commandsRestrictedToAdmins[command]) {
    if (!userIsAdmin(m.author.id)) {
      client.reply(m, `You don't have permission to execute that command! (user ID: \`${m.author.id}\`)`);
      return false;
    }
  }

  return true;
}

function nextInQueue() {
  if (playQueue.length > 0) {
    next = playQueue.shift();
    play(next);
  }
}

function fancyReply(m, message) {
  if (shouldStockpile) {
    stockpile += message + '\n';
  } else {
    client.reply(m, message);
  }
}

function spitUp(m) {
  client.reply(m, stockpile);
  stockpile = '';
  shouldStockpile = false;
}

function error(argument) {
  console.log(argument.stack);
}

// Email and password over command line
/*client.login(process.argv[2] || Config.auth.email, process.argv[3] || Config.auth.password).((e) => {
  try {
    if(e.status === 400 && ~e.response.error.text.indexOf("email")) {
      console.log("Error: You entered a bad email!");
    } else if(e.status === 400 && ~e.response.error.text.indexOf("password")) {
      console.log("Error: You entered a bad password!");
    } else {
      console.log(e);
    }
  } catch (err) {
    console.log(e);
  }
});*/
client.login("ebolachanslove3@gmail.com", "Rainbowz123", function(error, token){
  console.log(token);
  return;
});

function getReply(content){
     siteObject = content;
    };

process.on('uncaughtException', function(err) {
  // Handle ECONNRESETs caused by `next` or `destroy`
  if (err.code == 'ECONNRESET') {
    // Yes, I'm aware this is really bad node code. However, the uncaught exception
    // that causes this error is buried deep inside either discord.js, ytdl or node
    // itself and after countless hours of trying to debug this issue I have simply
    // given up. The fact that this error only happens *sometimes* while attempting
    // to skip to the next video (at other times, I used to get an EPIPE, which was
    // clearly an error in discord.js and was now fixed) tells me that this problem
    // can actually be safely prevented using uncaughtException. Should this bother
    // you, you can always try to debug the error yourself and make a PR.
    console.log('Got an ECONNRESET! This is *probably* not an error. Stacktrace:');
    console.log(err.stack);
  } else {
    // Normal error handling
    console.log(err);
    console.log(err.stack);
    process.exit(0);
  }
});
