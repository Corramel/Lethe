const Discord = require('discord.js');
const token = ('MjgzNzMzMTc4MTI2OTU4NjA5.C45XAA.KXWsoYAYUXfmAcAPHaCk7-N3vDA');

const util = require('util');
const weather = require('openweathermap-js');
const ytdl = require('ytdl-core');
const request = require('superagent');
const reequest = require('request');
const url = require('url');
const express = require('express');
const cheerio = require('cheerio');
const parseString = require('xml2js').parseString;
const moment = require('moment');
const app = express();
// Output version information in console
const git = require('git-rev');

git.short(commit => git.branch(branch => {
    console.log(`Lethe#${branch}@${commit}`);
}));

const shouldDisallowQueue = require('./lib/permission-checks.js');
const Saved = require('./lib/saved.js');
Saved.read();

const YoutubeTrack = require('./lib/youtube-track.js');

const feCalcs = require('./lib/FEFunctions.js')
const Util = require('./lib/util.js');
const Config = require('./lib/config.js');
const adminIds = Config.adminIds;
const tarots = require('./lib/magical-cards.json');
const randEbolaPic = require('./lib/ebolachaninfo.json');
const randFangCringe = require('./lib/fangsmemes.json');
const feSys = require('./lib/FEClasses.json');
var CURRENT_REV = 4;

const client = new Discord.Client();

// Handle discord.js warnings
client.on('warn', (m) => console.log('[warn]', m));
client.on('debug', (m) => console.log('[debug]', m));
var channelToJoin = "";
var options = {
    appid: '9d456f29174a2626137d59075d2737a4', // Your Openweathermap api Key
    location: 'London', // City for which you want the weather
    cityID: 2172797, // City ID of the location
    coord: {
        lat: 35, // Location latitude…
        lon: 139 // … and longitude
    },
    ZIPcode: '94040,us', // Zipcode
    bbox: '12,32,15,37,10', // Box if you want weather for multiple cities
    cluster: true, // Use server clustering of points (only with bbox)
    cnt: 10, // Number of cities around coordinates (in current weather with cycle mode) or number of lines you want (in forecast)
    method: 'name', // Which method you want to use to choose the location : [name, cityID, coord, ZIPcode, box, cycle]
    format: 'JSON', // Format you want the data to be returned (if JSON, returns parsed JSON object)
    accuracy: 'like', // Accuracy (check openweathermap API documentation)
    units: 'metric', // Units : [metric, imperial, undefined] (°C, °F, K)
    lang: 'en' // Language for weather description
}
var currentWeather = "";
var battleLog = "";
var userToPing;
var dispatcher;
var randomPunInfo;
var totalNumberNeeded;
var randomCompliment;
var yourMomJoke;
var randomInsult;
var luckyOnes;
var toParse;
var pickBotOn = false;
var timeCommandUsedFirst;
var channelEquals = false;
var fireemblemJSON;
var messageArray = [];
var voteAllIDs = [];
var playQueue = [];
var cardNames = ["Sharpshooter", "Pugilist", "Neophyte", "Vagabond", "Arbiter", "Chaplain", "Sovereign", "Troubadour", "Oracle", "Cavalier", "Tactician", "Ambsace", "Fortuitous"];
var shitpostCommands = ["?musicHelp", "?wontstop", "?weather", "?fast", "?goodbye", "?understand", "?ohno", "?phrase", "?gin", "?tarot", "?slash ", "?yourdone", "?EbolaChan", "?popcorn", "?cliff", "?tofu", "?ben", "?rr", '?perfect',
    '?gelbooru', '?ngelbooru', '?rule34', '?fepic', '?dspic', '?hibiki', '?atasuki', '?hirasawa', '?bismarck', '?cc', '?yomom', '?insult', '?wakeup', '?partysover', '?kaio', '?blaze', '?anna', '?evan', '?fag', '?simmer',
    '?komari', '?tumblr', '?google', '?justacustom', '?asexual', '?darkness', '?chancey', 'nanami', '?uni', '?niger', '?unumii', '?edgemaster', '?jimbo', '?stayfree', '?dion', '?fang', '?starterpack', '?lyin', '?compliment', '?catfax',
    '?catpix', '?haiku', '?choice', '?8ball', '?mura', '?gasthejaps', '?chill', '?disgusting', '?murder', '?clearly', '?stiff', '?sadness', '?peace', '?friends', '?shock', '?goodgirls', '?mana'
];
var boundChannel = false;
var boundChannelArr = [];
var currentStream = false;
var ownerID = "81526338728501248"
var imgurToken = "538304a26a119fe123a5074216590ab2e877d163"
var imgurClientID = "714c0e3e7e06dfd";
var imgurClientSecret = "ed8502d3ebb267dbd8a226cacb1223500c0c34ce";
var quoteKey = "pjH2CNeLrYmshTdw2SBV61vNBWiBp1dGTDOjsnedWRo6C44xqr";
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

    if (m.content.startsWith(`?randomBird`)) {
        var birdArray = [];
        var birdObj = {};
        reequest.get({
            url: "https://api.imgur.com/3/gallery/r/birdpics",
            headers: {
                "Authorization": 'Client-ID ' + imgurClientID
            },
            json: true
        }, function(error, response, body) {
            if (!error) {
                birdObj = body;
                birdArray = birdObj["data"]
                /*.filter(function(a){
                  return !(a.is_album);
                }); */
                birdRandomImage = birdArray[Math.floor(Math.random() * birdArray.length)];
                if (birdRandomImage.is_album) {
                    var image = "http://i.imgur.com/" + birdRandomImage.cover + ".jpg";
                    var title = birdRandomImage.title || "/r/birdpics";
                    var embed = new Discord.RichEmbed();
                    embed.setColor("#c39582");
                    embed.setAuthor(title, "http://s.imgur.com/images/favicon-96x96.png", "http://imgur.com/" + birdRandomImage.cover)
                    embed.setImage(image);
                    m.channel.sendEmbed(embed);
                } else {
                    var image = birdRandomImage.link.replace(`\\/`, `/`);
                    var title = birdRandomImage.title || "/r/birdpics";
                    var embed = new Discord.RichEmbed();
                    embed.setColor("#c39582");
                    embed.setAuthor(title, "http://s.imgur.com/images/favicon-96x96.png", "http://imgur.com/" + birdRandomImage.id)
                    embed.setImage(image);
                    m.channel.sendEmbed(embed);
                }

            } else {
                console.log("An error!");
                console.log(error);
                m.reply(error);
            }
        });
        console.log("Finished");
    }

    if (m.content.startsWith(`?randomDog`)) {
        var birdArray = [];
        var birdObj = {};
        reequest.get({
            url: "https://api.imgur.com/3/gallery/r/dogpics",
            headers: {
                "Authorization": 'Client-ID ' + imgurClientID
            },
            json: true
        }, function(error, response, body) {
            if (!error) {
                birdObj = body;
                birdArray = birdObj["data"]
                /*.filter(function(a){
                  return !(a.is_album);
                }); */
                birdRandomImage = birdArray[Math.floor(Math.random() * birdArray.length)];
                if (birdRandomImage.is_album) {
                    var image = "http://i.imgur.com/" + birdRandomImage.cover + ".jpg";
                    var title = birdRandomImage.title || "/r/birdpics";
                    var embed = new Discord.RichEmbed();
                    embed.setColor("#fdc6b2");
                    embed.setAuthor(title, "http://s.imgur.com/images/favicon-96x96.png", "http://imgur.com/" + birdRandomImage.cover)
                    embed.setImage(image);
                    m.channel.sendEmbed(embed);
                } else {
                    var image = birdRandomImage.link.replace(`\\/`, `/`);
                    var title = birdRandomImage.title || "/r/birdpics";
                    var embed = new Discord.RichEmbed();
                    embed.setColor("#e91e63");
                    embed.setAuthor(title, "http://s.imgur.com/images/favicon-96x96.png", "http://imgur.com/" + birdRandomImage.id)
                    embed.setImage(image);
                    m.channel.sendEmbed(embed);
                }

            } else {
                console.log(error);
                m.reply(error);
            }
        });
    }
    if (m.content.startsWith(`?quote`)) {
        reequest.get({
            url: "https://andruxnet-random-famous-quotes.p.mashape.com/?cat=famous",
            headers: {
                "X-Mashape-Key": quoteKey
            },
            json: true
        }, function(error, response, body) {
            if (!error) {
                var embed = new Discord.RichEmbed();
                embed.setColor("#d546d5");
                embed.setAuthor(body.quote);
                embed.setFooter("-" + body.author);
                m.channel.sendEmbed(embed);
            } else {
                console.log(error);
            }
        });
    }

    if (m.content.startsWith(`?battle`)) {
        var battleWon = false;
        var player1name = `<@${m.author.id}>`;
        var player2name = m.content.slice(8);
        var infoWanted = m.content.slice(8);
        var feClasses = Object.keys(feSys.classes);
        var player1class = feClasses[Math.round(Math.random())];
        var player2class = feClasses[Math.round(Math.random())];
        var player1 = feSys.classes[player1class];
        var player2 = feSys.classes[player2class];
        var attackLogp1 = feCalcs.player1Attack(player1, feSys.weapons.iron.sword, player1name, player2, feSys.weapons.iron.sword, player2name);
        var attackLogp2 = feCalcs.player1Attack(player2, feSys.weapons.iron.sword, player1name, player1, feSys.weapons.iron.sword, player1name);
        var meme = [];
        //console.log(attackLog);
        //console.log("Meme is " + meme);
        //  console.log(attackLog);
        //console.log(feCalcs.playerSkillTriggers(player1, player1.skills, "attack"));
        var battleMsg = player1name + " is a " + player1.name + "! " + player2name + " is a " + player2.name + "! Let the battle begin! \n";
        var p1HP = player1.hp;
        var p2HP = player2.hp;
        var turn = "";
        var turnNum = 1;
        while (!battleWon) {
            if (!(turnNum % 2 == 0)) {

                if (feCalcs.calculateDoubleAtk(player1.spd, player2.spd)) {
                    for (var i = 0; i < 2; i++) {
                        meme = feCalcs.enemyDefense(player1, feSys.weapons.iron.sword, attackLogp1, player1name, (p1HP), player2, player2name, p2HP);
                        battleMsg = battleMsg + meme[0];
                        p2HP = meme[1];
                        if (meme[2] == true) {
                            battleWon = true;
                            break;
                        }
                        p1HP = meme[3];
                        attackLogp1 = feCalcs.player1Attack(player1, feSys.weapons.iron.sword, player1name, player2, feSys.weapons.iron.sword, player2name);
                        if (battleWon) {
                            break;
                        }
                    }
                } else {
                    meme = feCalcs.enemyDefense(player1, feSys.weapons.iron.sword, attackLogp1, player1name, p1HP, player2, player2name, p2HP);
                    battleMsg = battleMsg + meme[0];
                    p2HP = meme[1];
                    if (meme[2] == true) {
                        battleWon = true;
                        break;
                    }
                    p1HP = meme[3];
                    attackLogp1 = feCalcs.player1Attack(player1, feSys.weapons.iron.sword, player1name, player2, feSys.weapons.iron.sword, player2name);
                    if (battleWon) {
                        break;
                    }
                }

                if (p1HP > 0 && p2HP <= 0) {
                    break;
                }
                console.log(turnNum + " p1");
                console.log(p2HP > 0 + " p2HP");
                console.log(p1HP > 0 + " p1HP");
                turnNum++;
            } else {
                if (feCalcs.calculateDoubleAtk(player2.spd, player1.spd)) {
                    for (var i = 0; i < 2; i++) {
                        meme = feCalcs.enemyDefense(player2, feSys.weapons.iron.sword, attackLogp2, player2name, p2HP, player1, player1name, p1HP);
                        battleMsg = battleMsg + meme[0];
                        p1HP = meme[1];
                        if (meme[2] == true) {
                            battleWon = true;
                            break;
                        }
                        p2HP = meme[3];
                        attackLogp2 = feCalcs.player1Attack(player2, feSys.weapons.iron.sword, player2name, player1, feSys.weapons.iron.sword, player1name);
                        if (battleWon) {
                            break;
                        }
                    }
                } else {
                    meme = feCalcs.enemyDefense(player2, feSys.weapons.iron.sword, attackLogp2, player2name, p2HP, player1, player1name, p1HP);
                    battleMsg = battleMsg + meme[0];
                    p1HP = meme[1];
                    if (meme[2] == true) {
                        battleWon = true;
                        break;
                    }
                    p2HP = meme[3];
                    attackLogp2 = feCalcs.player1Attack(player2, feSys.weapons.iron.sword, player2name, player1, feSys.weapons.iron.sword, player1name);
                    if (battleWon) {
                        break;
                    }
                }

                if (p2HP > 0 && p1HP <= 0) {
                    break;
                }
                console.log(turnNum + " p2")
                console.log(p2HP > 0 + " p2HP");
                console.log(p1HP > 0 + " p1HP");
                turnNum++;
            }
        }
        console.log(turnNum);
        if (p2HP > 0 && p1HP <= 0) {
            battleMsg = battleMsg + `***` + player2name + " wins!***";
        } else {
            battleMsg = battleMsg + `***` + player1name + " wins!***";
        }
        m.reply(battleMsg);
        return;
    }
    if (m.content.startsWith(`?weather`)) {
        currentWeather = "";
        weather.current({
            method: 'name',
            location: m.content.slice(9),
            appid: '9d456f29174a2626137d59075d2737a4',
            units: 'metric'
        }, function(err, data) {
            if (!err) {
                console.log(data);
                if (!(data.cod == "200")) {
                    m.reply("Typo? Or maybe that place doesn't exist.");
                    console.log(data.cod + data.message)
                    return;
                } else {
                    var weatherInfo = data.weather[0];
                    var dayOrNight = "";
                    if ((data.dt >= data.sys.sunset) || (data.dt <= data.sys.sunrise)) { //Night
                        dayOrNight = "🌃 It's night-time.";
                    } else {
                        //Day
                        dayOrNight = "🏙 It's day-time.";
                    }
                    var kmToMph = Math.round(data.wind.speed * 0.621371);
                    currentWeather = ":flag_" + data.sys.country.toLowerCase() + ": " + data.name + ", " + data.sys.country + "'s temperature is: " + Math.round(data.main.temp) + "° Celsius or " + (Math.round(parseInt(data.main.temp) * 1.8 + 32)) + "° Farenheit. " + dayOrNight;
                    if (weatherInfo.id <= 531 && weatherInfo.id >= 500) { //rain
                        var rainArray = ["Stay indoors!", "Get comfy.", "Bring an umbrella.", "Hope you have an umbrella.", "Hope for a rainbow!", "Wait it out.", "Pitter, patter.", "Don't get a cold.", "Don't slip!"];
                        currentWeather = currentWeather + "\n It's currently raining! 🌧 " + rainArray[Math.floor(Math.random() * rainArray.length)] + "\n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else if (weatherInfo.id <= 232 && weatherInfo.id >= 200) { //thunderstorm
                        var rainArray = ["Stay indoors!", "Get comfy.", "Bring an umbrella.", "Hope you have an umbrella.", "Hope for a rainbow!", "Wait it out.", "Pitter, patter.", "Don't go outside.", "Don't slip!"];
                        urrentWeather = currentWeather + "\n It's currently raining! 🌧 " + rainArray[Math.floor(Math.random() * rainArray.length)] + "\n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else if (weatherInfo.id <= 321 && weatherInfo.id >= 300) { //drizzle
                        var rainArray = ["Stay indoors!", "Get comfy.", "Bring an umbrella.", "Hope you have an umbrella.", "Hope for a rainbow!", "Wait it out.", "Pitter, patter.", "Don't get a cold.", "Don't slip!"];
                        currentWeather = currentWeather + "\n It's currently drizzling outside. 🌧" + rainArray[Math.floor(Math.random() * rainArray.length)] + "\n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else if (weatherInfo.id <= 622 && weatherInfo.id >= 600) { //snow
                        currentWeather = currentWeather + "\n It's snowing! ❄️ \n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else if (weatherInfo.id <= 781 && weatherInfo.id >= 701) { //atmosphere, ex: mist
                        currentWeather = currentWeather + "\n There's " + weatherInfo.description + " in the air. 🌫 \n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else if (weatherInfo.id == 800) { //It's clear outside.
                        currentWeather = currentWeather + "\n It's clear outside! Nice and clear. 🌞 \n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else if (weatherInfo.id <= 804 && weatherInfo.id >= 801) { //clouds
                        currentWeather = currentWeather + "\n It's cloudy outside. ☁️ \n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else if (weatherInfo.id <= 906 && weatherInfo.id >= 900) { // it's extreme
                        curentWeather = currentWeather + "\n ⚠️⚠️⚠️ There is an extreme condition outside! Condition description: " + weatherInfo.description + ". Careful out there. \n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else if (weatherInfo.id <= 962 && weatherInfo.id >= 952) { //gusts
                        currentWeather = currentWeather + "\n It's breezy outside! 💨" + "\n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else if (weatherInfo.id == 951) {
                        currentWeather = currentWeather + "\n It's calm outside. Relax, friend. 🌞" + "\n Windspeed: " + data.wind.speed + "km/h or " + kmToMph + "mph";
                    } else {
                        m.reply("Something went wrong.");
                        return;
                    }
                    m.reply(currentWeather);
                    return;
                }
            }
        });
    }
    if (m.content.startsWith(`?phrase`)) {
        var start1 = ["A bad excuse", "A bad workman", "A bird in the hand", "A cat", "A cat", "A chain", "A change", "A child that's born on the Sabbath day", "A dog", "A drowning man", "A free lunch", "A friend in need", "A friend to everybody", "A friend who shares", "A friend's frown", "A gentle answer", "A golden key", "A good beginning", "A good conscience", "A good husband", "A good man", "A good thing", "A harsh word", "A house divided against itself", "A leopard", "A little knowledge", "A loveless life", "A man", "A miss", "A nod", "A penny saved", "A picture", "A problem shared", "A red sky at night", "A red sky in the morning", "A rising tide", "A rolling stone", "A stitch in time", "A thing of beauty", "A throne", "A volunteer", "A watched pot", "A woman's place", "A woman's work", "A word to the wise", "Absence", "Power corrupts; absolute power", "Adversity", "All publicity", "All that glitters", "All the world", "All work and no play", "All you need", "An apple a day", "An army", "An elephant", "An empty barrel", "An Englishman's home", "An onion a day", "An ounce of prevention", "Attack", "Beauty", "Beauty", "Blood", "Bread", "Brevity", "Charity", "Cleanliness", "Crime", "Crying over spilt milk", "Curiosity", "Diligence", "Discretion", "Don't bite the hand that", "Erring", "Every cloud", "Every dog", "Every man", "Every man", "Every picture", "Experience", "Failing to plan", "Faint heart", "Fair exchange", "Faith", "Familiarity", "Flattery", "Fortune", "Friday's child", "Giving", "Good talk", "Half a loaf", "Handsome", "He has enough who", "He is rich who", "He who fights and runs away", "He who hesitates", "He who laughs last", "He who lives by the sword", "Hindsight", "History", "Home", "Honesty", "If a job is worth doing it", "Ignorance", "Imitation", "In the kingdom of the blind, the one-eyed man", "It never rains, but it", "Knowledge", "Laughter", "Life", "Lightning", "Lost time", "Love", "Misery", "Monday's child", "Money", "Money", "Music", "Necessity", "No man", "No man", "No news", "One good turn", "One man's junk", "One man's meat", "One swallow", "Opportunity", "Patience", "Possession", "Practice", "Pride", "Procrastination", "Revenge", "Revenge", "Rome", "Saturday's child", "Seeing", "Silence", "Speak of the devil and he", "Strike while the iron", "Success has many fathers, while failure", "Talk", "That which does not kill us", "The apple", "The bottom line", "The cake", "The cobbler", "The course of true love", "The customer", "The darkest hour", "The devil", "The early bird", "The end", "The forbidden fruit", "The grass", "The hand that rocks the cradle", "The husband", "The last straw", "The longest journey", "The love of money", "The pen", "The pot", "The proof of the pudding", "The road to hell", "The second mouse", "The sleeping fox", "The spirit is willing, but the flesh", "The squeaky wheel", "The truth", "The way to a man's heart", "The world", "Thursday's child", "Time", "Tomorrow", "Live for today, for tomorrow", "True beauty", "Truth", "Tuesday's child", "Two is company, but three", "Variety", "Virtue", "Wednesday's child", "What can't be cured", "What goes up", "What's good for the goose", "Who dares", "Worrying", "Youth", "A journey of a thousand miles", "A man with a hammer", "A man who is his own lawyer", "Careless talk", "Courage is the measure of a man, beauty", "Doubt", "The fear of the Lord", "East is east, and west", "Give him an inch and he", "Give a man a fish and he", "Give a man a fish and he will eat for a day; teach him to fish and he", "Give a man enough rope and he", "He that goes a-borrowing,", "He who pays the piper", "He who knows, does not speak. He who speaks,", "Hell", "If anything can go wrong, it", "Knowledge is power, France", "Many a true word", "March comes in like a lion and", "The rain in Spain", "When clouds look like black smoke, a wise man", "Nature", "One hand", "Slow and steady", "Stupid", "The best defence", "Hatred", "God", "No man or woman is worth your tears, and the one who is", "A bully", "A handsome shoe", "No wise man", "Make hay while the sun", "A single penny, fairly got,"];
        var start2 = ["A fool and his money", "Accidents", "Actions", "All good things", "All roads", "Appearances", "Barking dogs", "Beggars", "Birds of a feather", "Boys", "Cheaters", "Clothes", "Comparisons", "Dead men", "First impressions", "Fools", "God helps those who", "Good fences", "Good things", "Good things", "Great minds", "Little things", "Many drops", "Many hands", "Oil and water", "Only fools and horses", "Only the good", "People, when in Rome,", "Those who live in glass houses", "Sticks and stones may break my bones, but words", "Sticks and stones", "The best things in life", "The meek", "Those who can, do; those who can't,", "Those who don't learn from history", "Those who sleep with dogs", "Too many cooks", "Two blacks", "Two heads", "Two wrongs", "The walls", "When the cat's away the mice", "When the going gets tough, the tough", "Wonders", "Worse things", "If you pay peanuts, you", "When life gives you lemons, you", "If you can't stand the heat, you", "Laugh and the world laughs with you; weep and you", "If you spare the rod, you", "Take care of the pence, and the pounds", "Diamonds", "Rules"];
        var end1 = ["is easily parted", "happens", "speaks louder than words", "must come to an end", "leads to Rome", "can be deceiving", "seldom bites", "can't be a chooser", "flocks together", "will be boys", "never prospers", "does not make the man", "is odious", "tells no tales", "is the most lasting", "makes good neighbours", "comes to those who wait", "comes in small packages", "pleases little minds", "makes a shower", "makes light work", "doesn't mix", "works", "dies young", "should do as the Romans do", "shouldn't throw stones", "will never hurt me", "may break my bones, but words will never hurt me", "is free", "will inherit the earth", "will rise with fleas", "spoils the broth", "is better than one", "doesn't make a right", "has ears", "will never cease", "happens at sea", "is better than none", "blames his tools", "is worth two in the bush", "may look at a king", "has nine lives", "is only as strong as its weakest link", "is as good as a rest", "is fair and wise and good and gay", "is a man's best friend", "will clutch at a straw", "is a friend indeed", "is a friend to nobody", "is a friend who cares", "is better than a fool's smile", "turns away wrath", "can open any door", "makes a good ending", "is a soft pillow", "makes a good wife", "is hard to find", "is soon snatched up", "stirs up anger", "cannot stand", "can't change its spots", "is a dangerous thing", "is a living death", "is known by the company he keeps", "is as good as a mile", "is as good as a wink to a blind horse", "is a penny earned", "is worth a thousand words", "is a problem halved", "is a shepherd's delight", "is a shepherd's warning", "lifts all boats", "gathers no moss", "saves nine", "is a joy forever", "is only a bench covered in velvet", "is worth twenty pressed men", "never boils", "is in the home", "is never done", "makes the heart grow fonder", "corrupts absolutely", "makes strange bedfellows", "is good publicity", "is not gold", "loves a lover", "makes Jack a dull boy", "is love", "keeps the doctor away", "marches on its stomach", "never forgets", "makes the most noise", "is his castle", "keeps everyone away", "is worth a pound of cure", "is the best form of defence", "is in the eye of the beholder", "is only skin deep", "is thicker than water", "always falls buttered side down", "is the soul of wit", "begins at home", "is next to godliness", "doesn't pay", "is no use", "killed the cat", "is the mother of good luck", "is the better part of valour", "is human", "has a silver lining", "has its day", "is the architect of his destiny", "has his price", "tells a story", "is the father of wisdom", "is planning to fail", "never won fair lady", "is no robbery", "will move mountains", "breeds contempt", "will get you nowhere", "favours the brave", "is loving and giving", "is better than receiving", "saves the food", "is better than no bread", "is as handsome does", "is content", "is satisfied", "lives to fight another day", "is lost", "laughs longest", "shall die by the sword", "is always twenty-twenty", "repeats itself", "is where the heart is", "is the best policy", "is worth doing well", "is bliss", "is the sincerest form of flattery", "is king", "pours", "is power", "is the best medicine", "begins at forty", "is just a bowl of cherries", "never strikes twice", "is never found again", "is blind", "loves company", "is fair of face", "talks", "doesn't grow on trees", "makes the world go round", "has charms to soothe the savage breast", "is the mother of invention", "is an island", "can serve two masters", "is good news", "deserves another", "is another man's treasure", "is another man's poison", "does not make a summer", "never knocks twice", "is a virtue", "is nine-tenths of the law", "makes perfect", "comes before a fall", "is the thief of time", "is a dish best served cold", "is sweet", "wasn't built in a day", "works hard for its living", "is believing", "is golden", "is bound to appear", "is hot", "is an orphan", "is cheap", "makes us stronger", "doesn't fall far from the tree", "is the bottom line", "is a lie", "always wears the worst shoes", "never did run smooth", "is always right", "is before the dawn", "finds work for idle hands", "catches the worm", "justifies the means", "is the sweetest fruit", "is always greener on the other side", "rules the world", "is always the last to know", "breaks the camel's back", "starts with a single step", "is the root of all evil", "is a root of all kinds of evil", "is mightier than the sword", "calls the kettle black", "is in the eating", "is paved with good intentions", "gets the cheese", "catches no chickens", "is weak", "gets the grease", "will out", "is through his stomach", "is your oyster", "has far to go", "flies", "is a new day", "never comes", "lies within", "is stranger than fiction", "is full of grace", "is company, but three is a crowd", "is the spice of life", "is its own reward", "is full of woe", "must be endured", "must come down", "is good for the gander", "wins", "never did anyone any good", "is wasted on the young", "is the new black", "is fair in love and war", "cannot live by bread alone", "makes a man healthy, wealthy and wise", "is well that ends well", "is what you make it", "begins with a single step", "sees every problem as a nail", "has a fool for a client", "costs lives", "is the measure of a woman", "shouldn't bite the hand that feeds you", "shouldn't cry over spilt milk", "shouldn't count your chickens before they are hatched", "shouldn't cross the bridge till you come to it", "shouldn't cut off your nose to spite your face", "should never look a gift horse in the mouth", "shouldn't rock the boat", "is the beginning of wisdom", "is enough", "is the beginning of wisdom", "will take a mile", "will eat for a day", "will eat for a lifetime", "will hang himself", "goes a-sorrowing", "calls the tune", "does not know", "hath no fury like a woman scorned", "gets monkeys", "makes lemonade", "gets out of the kitchen", "is bacon", "weeps alone", "is spoken in jest", "comes in like a lion and goes out like a lamb", "goes out like a lamb", "falls mainly on the plain", "will put on his cloak", "abhors a vacuum", "should never judge a book by its cover", "should never say never", "is certain, except death and taxes", "washes the other", "wins the race", "is as stupid does", "is a good offence", "is money", "is born every minute", "is as blind as love", "loves a cheerful giver", "is a thin line between love and hate", "won't make you cry", "is always a coward", "often pinches the foot", "wishes to be younger", "is worse than his bite", "can start a great fire", "is worth a thousand that are not", "is a girl's best friend", "burns a hole in your pocket", "is made to be broken"];
        var end2 = ["are easily parted", "happen", "speak louder than words", "must come to an end", "lead to Rome", "can be deceiving", "seldom bite", "can't be choosers", "flock together", "will be boys", "never prosper", "do not make the man", "are odious", "tell no tales", "are the most lasting", "seldom differ", "help themselves", "make good neighbours", "come to those who wait", "come in small packages", "think alike", "please little minds", "make a shower", "make light work", "don't mix", "work", "die young", "should do as the Romans do", "shouldn't throw stones", "will never hurt me", "may break my bones, but words will never hurt me", "are free", "will inherit the earth", "teach", "will rise with fleas", "spoil the broth", "don't make a white", "are better than one", "don't make a right", "have ears", "will play", "get going", "will never cease", "happen at sea", "are better than none", "blame their tools", "are worth two in the bush", "may look at a king", "have nine lives", "are only as strong as their weakest link", "are as good as a rest", "are a man's best friend", "will clutch at a straw", "are a friend indeed", "are a friend to nobody", "are better than a fool's smile", "turn away wrath", "can open any door", "make a good ending", "are a soft pillow", "make good wives", "are hard to find", "are soon snatched up", "stir up anger", "cannot stand", "can't change their spots", "are a dangerous thing", "are a living death", "are known by the company they keep", "are as good as a mile", "are as good as a wink to a blind horse", "are a penny earned", "are worth a thousand words", "are a problem halved", "are a shepherd's delight", "are a shepherd's warning", "lift all boats", "gather no moss", "save nine", "are a joy forever", "are only a bench covered in velvet", "are worth twenty pressed men", "never boil", "are in the home", "are never done", "make the heart grow fonder", "corrupt absolutely", "make strange bedfellows", "are good publicity", "are not gold", "love a lover", "make Jack a dull boy", "are love", "keep the doctor away", "march on their stomach", "never forget", "make the most noise", "are their castle", "keep everyone away", "are worth a pound of cure", "are the best form of defence", "are in the eye of the beholder", "are only skin deep", "are thicker than water", "always fall buttered side down", "are the soul of wit", "begin at home", "are next to godliness", "don't pay", "are no use", "killed the cat", "are the mother of good luck", "are the better part of valour", "have a silver lining", "have their day", "are the architect of their destiny", "have their price", "tell a story", "are the father of wisdom", "are planning to fail", "never won fair ladies", "are no robbery", "will move no mountains", "breed contempt", "will get you nowhere", "favour the brave", "are better than receiving", "save the food", "are better than no bread", "are as handsome does", "are content", "are satisfied", "live to fight another day", "are lost", "laugh longest", "shall die by the sword", "are always twenty-twenty", "are where the heart is", "are the best policy", "are worth doing well", "are bliss", "are the sincerest form of flattery", "pour", "are power", "are the best medicine", "begin at forty", "are just a bowl of cherries", "never strike twice", "are never found again", "are blind", "love company", "don't grow on trees", "make the world go round", "have charms to soothe the savage breast", "are the mothers of invention", "are islands", "can serve two masters", "are good news", "deserve another", "are another man's treasure", "are another man's poison", "do not make a summer", "never knock twice", "are nine-tenths of the law", "make perfect", "come before a fall", "are the thieves of time", "are a dish best served cold", "are sweet", "weren't built in a day", "are believing", "are golden", "are bound to appear", "are hot", "are orphans", "are cheap", "make us stronger", "don't fall far from the tree", "are the bottom line", "are a lie", "always wear the worst shoes", "never did run smooth", "are always right", "are before the dawn", "find work for idle hands", "catch the worm", "justify the means", "are the sweetest fruits", "are always greener on the other side", "rule the world", "are always the last to know", "break the camel's back", "start with a single step", "are the root of all evil", "are mightier than the sword", "call the kettle black", "are in the eating", "are paved with good intentions", "get the cheese", "catch no chickens", "are weak", "get the grease", "are your oyster", "fly", "are a new day", "never come", "lie within", "are stranger than fiction", "are company, but three is a crowd", "are the spice of life", "must be endured", "must come down", "are good for the gander", "win", "never did anyone any good", "are wasted on the young", "are the new black", "are fair in love and war", "cannot live by bread alone", "make a man healthy, wealthy and wise", "are well that end well", "are what you make them", "begin with a single step", "see every problem as a nail", "have a fool for a client", "cost lives", "are the measure of a woman", "shouldn't bite the hand that feeds them", "shouldn't cry over spilt milk", "shouldn't count their chickens before they are hatched", "shouldn't cross the bridge till they come to it", "shouldn't cut off their nose to spite their face", "shouldn't keep a dog and bark themselves", "should never look a gift horse in the mouth", "shouldn't put all their eggs in one basket", "shouldn't rock the boat", "can't walk before they can crawl", "are the beginning of wisdom", "are enough", "are the beginning of wisdom", "rush in where angels fear to tread", "will take a mile", "will eat for a day", "will eat for a lifetime", "will hang themselves", "go a-sorrowing", "call the tune", "do not know", "have no fury like a woman scorned", "get monkeys", "make lemonade", "get out of the kitchen", "are bacon", "weep alone", "are spoken in jest", "come in like a lion and go out like a lamb", "go out like a lamb", "fall mainly on the plain", "abhor a vacuum", "should never judge a book by its cover", "should never say never", "win the race", "spoil the child", "will take care of themselves", "are a good offence", "are money", "are born every minute", "are as blind as love", "won't make you cry", "are always a coward", "often pinch the foot", "are what you eat", "are worse than his bite", "can start a great fire", "are a girl's best friend", "burn a hole in your pocket", "are made to be broken"];
        var starting = [start1, start2]
        if (starting[Math.floor(Math.random())] === start1) {
            m.channel.sendMessage(start1[Math.floor(Math.random() * start1.length)] + " " + end1[Math.floor(Math.random() * end1.length)] + ".")
        } else {
            m.channel.sendMessage(start2[Math.floor(Math.random() * start2.length)] + " " + end2[Math.floor(Math.random() * end2.length)] + ".")
        }
        return;
    }
    if (m.content.startsWith(`?tarot`)) {
        var cardNames = ["Sharpshooter", "Pugilist", "Neophyte", "Vagabond", "Arbiter", "Chaplain", "Sovereign", "Troubadour", "Oracle", "Cavalier", "Tactician", "Ambsace", "Fortuitous"];
        console.log(cardNames);
        console.log(tarots);
        console.log(tarots.Sharpshooter.Card);
        var chosenCard = cardNames[Math.floor(Math.random() * cardNames.length)];
        console.log(chosenCard);
        var chosenCardPic = tarots[chosenCard].Card;
        console.log(chosenCardPic);
        var chosenCardDesc = tarots[chosenCard].Description
        m.channel.sendMessage(`${chosenCardPic}`);
        m.channel.sendMessage(`${chosenCardDesc}`);
        return;
    }
    if (m.content.startsWith(`?popcorn`)) {
        m.channel.sendMessage("https://pbs.twimg.com/profile_images/597538481225752577/93eMVOd3.jpg")
        return;
    }
    if (m.content.startsWith(`?yomom`)) { //Testing 4 jokes
        var requestUrl = "http://api.yomomma.info/"
        reequest.get({
          url: requestUrl,
          json: true
      }, function(error, response, body) {
            if (!error){
              var joke = body
              m.channel.sendMessage(joke["joke"]);
            }
          });
          return;
        }
    if (m.content.startsWith(`?darkness`)) { //my old friend
        var darknessArray = ["https://www.youtube.com/watch?v=a5gz6KB_yvQ", "https://www.youtube.com/watch?v=ZNwICMDMV-g", "https://i.ytimg.com/vi/ZNwICMDMV-g/maxresdefault.jpg", "http://i1.kym-cdn.com/entries/icons/original/000/018/886/hello.png"]
        m.channel.sendMessage(darknessArray[Math.floor(Math.random() * darknessArray.length)])
        return;
    }
    if (m.content.startsWith(`?starterpack`)) { //memecontrol
        var birdArray = [];
        var birdObj = {};
        reequest.get({
            url: "https://api.imgur.com/3/gallery/r/starterpacks/",
            headers: {
                "Authorization": 'Client-ID ' + imgurClientID
            },
            json: true
        }, function(error, response, body) {
            if (!error) {
                birdObj = body;
                birdArray = birdObj["data"]
                /*.filter(function(a){
                  return !(a.is_album);
                }); */
                birdRandomImage = birdArray[Math.floor(Math.random() * birdArray.length)];
                if (birdRandomImage.is_album) {
                    var image = "http://i.imgur.com/" + birdRandomImage.cover + ".jpg";
                    var title = birdRandomImage.title || "/r/starterpacks";
                    var embed = new Discord.RichEmbed();
                    embed.setColor("#1bb76e");
                    embed.setImage(image);
                    embed.setAuthor(title);
                    m.channel.sendEmbed(embed);
                } else {
                    var image = birdRandomImage.link.replace(`\\/`, `/`);
                    var title = birdRandomImage.title || "/r/starterpacks";
                    var embed = new Discord.RichEmbed();
                    embed.setColor("#1bb76e");
                    embed.setAuthor(title);
                    embed.setImage(image);
                    m.channel.sendEmbed(embed);
                }

            } else {
                console.log("An error!");
                console.log(error);
                m.reply(error);
            }
        });
        console.log("Finished");
    }
    if (m.content.startsWith(`?compliment`)) {
        var complimentArray = ["Hiya! Did you know any day spent with you is my favorite day?", "Heya, I just wanted to tell you: when in doubt, smile!", "Hey man, my life would suck without you. Thanks, you're great.", "Phew! You're back. there’s rarely any dull moment when I’m with you. You're fabulous.", "Whoa, I like your socks. #sockswag ", "Hey! I think our friendship is like a cup of tea, a special blend of you and me.", "Hi! LOL your status was super funny!", "Hey! I think you have a good fashion sense.", "Hi! I wanted to let you know that you wear really cute sweaters.", "Hi! You're my number one.", "Hey, do you wanna build a snowman? It doesn't have to be a snowman~", "Hey... I'd give you a tissue, for your issues.", "Hi! Just letting you know that you can copy my math homework!", "Heya, you're so fancy, you already know.", "Hey friend, I'd invite you to my birthday party.", "Hi! Just letting you know that your personality is brighter than the stars.", "I love you!", "Hi! You're spontaneous, and I love it!", "Hey, I appreciate all of your opinions.", "W-whoa... Your smile is breath taking.", "Hi! You are the gravy to my mashed potatoes.", "Hey, I'm so glad we met.", "Hey, is it hot in here or is it just you?", "Hi. I don't speak much English, but with you all I really need to say is beautiful.", "Hey, I think you could survive a zombie apocalypse.", "Y-you're so rad...", "Heya friend! You're more fun than a barrel of monkeys.", "Hi! You're nicer than a day on the beach.", "Hey, you make me think of beautiful things, like strawberries.", "Hi. You're more fun than bubble wrap.", "Man, playing video games with you would be fun.", "Hello, I'd like to know why you're so beautiful.", "Hey, I think you could invent words and people would use them.", "Hey, did you know there's 21 letters in the Alphabet? Oh wait. I forgot u, r, a, q, t! How stupid of me... :wink:", "Hey! You're tastier than chicken soup when I have the flu.", "Hi, are you a Beaver? Cause Dam!", "Hey, why are you so talented? I can't Handel your musicality.", "Hi! Are you a train? because I choo,choo,choose you!", "You're beautiful no matter what they say", "Hey... You're the apple in my eye, it still hurts but I love pain~", "Hey, are you wifi? Because I'm feeling a connection ;)", "Hey, did you know you are the USB port to my USB? We fit perfectly together.", "Hi. Did you know you're the smoothest one of all? <3"]
            m.reply(complimentArray[Math.floor(Math.random() * complimentArray.length)])
            return;
    }

    if (m.content.toLowerCase().startsWith(`${botMention} hi`) || m.content.toLowerCase().startsWith(`${botMention} hello`) || m.content.toLowerCase().startsWith(`${botMention} hey`) || m.content.toLowerCase().startsWith(`${botMention} sup`) || m.content.toLowerCase().startsWith(`${botMention} yo`)) {

        var complimentArray = ["Hiya! Did you know any day spent with you is my favorite day?", "Heya, I just wanted to tell you: when in doubt, smile!", "Hey man, my life would suck without you. Thanks, you're great.", "Phew! You're back. there’s rarely any dull moment when I’m with you. You're fabulous.", "Whoa, I like your socks. #sockswag ", "Hey! I think our friendship is like a cup of tea, a special blend of you and me.", "Hi! LOL your status was super funny!", "Hey! I think you have a good fashion sense.", "Hi! I wanted to let you know that you wear really cute sweaters.", "Hi! You're my number one.", "Hey, do you wanna build a snowman? It doesn't have to be a snowman~", "Hey... I'd give you a tissue, for your issues.", "Hi! Just letting you know that you can copy my math homework!", "Heya, you're so fancy, you already know.", "Hey friend, I'd invite you to my birthday party.", "Hi! Just letting you know that your personality is brighter than the stars.", "I love you!", "Hi! You're spontaneous, and I love it!", "Hey, I appreciate all of your opinions.", "W-whoa... Your smile is breath taking.", "Hi! You are the gravy to my mashed potatoes.", "Hey, I'm so glad we met.", "Hey, is it hot in here or is it just you?", "Hi. I don't speak much English, but with you all I really need to say is beautiful.", "Hey, I think you could survive a zombie apocalypse.", "Y-you're so rad...", "Heya friend! You're more fun than a barrel of monkeys.", "Hi! You're nicer than a day on the beach.", "Hey, you make me think of beautiful things, like strawberries.", "Hi. You're more fun than bubble wrap.", "Man, playing video games with you would be fun.", "Hello, I'd like to know why you're so beautiful.", "Hey, I think you could invent words and people would use them.", "Hey, did you know there's 21 letters in the Alphabet? Oh wait. I forgot u, r, a, q, t! How stupid of me... :wink:", "Hey! You're tastier than chicken soup when I have the flu.", "Hi, are you a Beaver? Cause Dam!", "Hey, why are you so talented? I can't Handel your musicality.", "Hi! Are you a train? because I choo,choo,choose you!", "You're beautiful no matter what they say", "Hey... You're the apple in my eye, it still hurts but I love pain~", "Hey, are you wifi? Because I'm feeling a connection ;)", "Hey, did you know you are the USB port to my USB? We fit perfectly together.", "Hi. Did you know you're the smoothest one of all? <3"]
        var responseArray = [complimentArray[Math.floor(Math.random() * complimentArray.length)], complimentArray[Math.floor(Math.random() * complimentArray.length)], complimentArray[Math.floor(Math.random() * complimentArray.length)], "Hello, how are you?", "Hi!!!", "Why, hello there.", "Hello!", "Hi there!", "Greetings!"];
        m.reply(responseArray[Math.floor(Math.random() * responseArray.length)]);
        return;

    }
    if (m.content.startsWith(`?catfax`)) {
        var requestUrl = ` http://catfacts-api.appspot.com/api/facts`;
        reequest({
            url: requestUrl,
            json: true,
            headers: {
                'User-Agent': 'request'
            }
        }, (err, res, data) => {
            if (err) {
                console.log("Error:", err);
            } else if (res.statusCode !== 200) {
                console.log("Got a bad response", res.statusCode);
            } else {
                console.log(data);
                m.reply(data.facts);
            };
        });
        return;
    };
    if (m.content.startsWith(`?catpix`)) {
        var requestUrl = `http://random.cat/meow`;
        reequest({
            url: requestUrl,
            headers: {
                'User-Agent': 'request'
            }
        }, (err, res, data) => {
            if (err) {
                console.log(err);
            } else if (res.statusCode !== 200) {
                console.log("Got a bad response", res.statusCode);
            } else {
                console.log(data);
                var parsedData = JSON.parse(data);
                m.channel.sendFile(parsedData.file.replace('\/', '/'))
            }
        })
    }

    if (m.content.startsWith(`?haiku`)) {
        var requestUrl = "http://www.smalltime.com/Haiku?square=";
        reequest(requestUrl, function(error, response, html) {
            if (!error) {
                var $ = cheerio.load(html);
                $('tr').filter(function() {
                    var insultData = $(this);
                    randomInsult = insultData.text();
                    m.channel.sendMessage(randomInsult);
                    return;
                })
            }
        })
        var insult = randomInsult;
    }
    /* if (m.content.startsWith(``)) { //memecontrol
      if (!checkCommand(m, ``)) return
      m.reply("")
      return
    }
    */
    if (m.content.startsWith(`?choice `)) {
        var userChoices = (m.content).slice(8);
        var userChoicesArray = userChoices.split(";");
        if (userChoicesArray.length > 1) {
            var botChoice = userChoicesArray[Math.floor(Math.random() * userChoicesArray.length)];
            m.channel.sendMessage(`Memelord2000 has decided... \`${botChoice}\`!`);
            return;
        } else {
            m.channel.sendMessage(`You either didn't format it correctly, or only have one choice. Use ';' to split your choices.`)
        }

    }
    if (m.content.startsWith(`?roll`)) {
        m.channel.sendMessage(`${Math.floor(Math.random()*100)}`);
        return;
    }

    if (m.content.startsWith(`?8ball`)) {
        userQuestion = (m.content).slice(7)
        var ballArray = ["Signs :arrow_right: to yes.", "Yeah.", "Try again.", "Without a doubt.", "Memelord2000 says no.", "I'd say yes.", "Go for it, fam.", "It doesn't look so good...", "Yep!", "Uh, I don't think you want to know.", "It seems very doubtful.", "Memelord2000 says: \"Yes, definitely\"!", "Even I know it's certain!", "Err... Foggy, hazy, y'know.", "Probably!", "Perhaps you should ask later?", "No.", "It seems the outlook is good!", "I wouldn't count on it."]
        if (m.content.length > 7) {
            if (m.content.indexOf("?", 7) === -1) {
                m.channel.sendMessage(`<@${m.author.id.toString()}> \`${userQuestion}?\`: ${ballArray[Math.floor(Math.random()*ballArray.length)]}`)
                return;
            } else {
                m.channel.sendMessage(`<@${m.author.id.toString()}> \`${userQuestion}\`: ${ballArray[Math.floor(Math.random()*ballArray.length)]}`)
                return;
            }
        } else {
            m.reply("You need to have a question or something...")
            return;
        }

    }


});
client.login(token).then(output => {
    console.log(token)
}).catch(err => {
    console.error(err)
});

function getReply(content) {
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
