const Discord = require('discord.js');
const token = (process.argv[3]);
const Twitter = require('twitter')
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
const momentTimer = require("moment-timer");
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
const arcana = require('./lib/magical-cards.json');
const tarot = require('./lib/tarotcards.json');
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
    '?gelbooru', '?ngelbooru', '?rule34', '?fepic', '?dspic', '?hibiki', '?atasuki', '?hirasawa', '?bismarck', '?cc', '?yomom', '?insult', '?wakeup', '?partysover', '?kaio', '?blaze', '?anna', '?evan', '?simmer',
    '?komari', '?tumblr', '?google', '?justacustom', '?asexual', '?darkness', '?chancey', 'nanami', '?uni', '?niger', '?unumii', '?edgemaster', '?jimbo', '?stayfree', '?dion', '?fang', '?starterpack', '?lyin', '?compliment', '?catfax',
    '?catpix', '?haiku', '?choice', '?8ball', '?mura',  '?chill', '?disgusting', '?murder', '?clearly', '?stiff', '?sadness', '?peace', '?friends', '?shock', '?goodgirls', '?mana'
];
var boundChannel = false;
var timeNow;
var timeOfYasu;
var tweetsArr = [];
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
var twitterClient = new Twitter({
  consumer_key: 'C19eIy8lWHqErz0wxY5O46wGG',
  consumer_secret: 'IAnttwZcQ0jM78VBu3g1PQ2SuxMPh8Lo1xrKAvwFMdLTuBPBu3',
  access_token_key: '',
  access_token_secret: ''
});
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
      /*var params = {screen_name: 'DeformedYasu', count:20, includes_entites:true, exclude_replies:true};
      twitterClient.get('favorites/list', params, function(error, tweets, response) {
        if (!error) {
        var tweetsArr = [];
              for(i = 0; i<19; i++){
                  if(Object.keys(tweets[i].entities).includes("media")){
                  tweetsArr.push(tweets[i]);
                  }
              }
            console.log(tweetsArr);
            //console.log(tweets);
        } else {
            throw error
        }
      }); */

    if (client.user.id == m.author.id) return;
    if (!botMention) return;
    if (client.user.id == m.author.id) return;
    if(m.content.startsWith(`?yastwi`)){
      console.log(m.channel.name);
      if(m.channel.name === "estoylameme" || m.channel.name === "just-chat"){
      var timer = moment.duration(10, "seconds").timer({
        loop:true
      }, function() {
        console.log("running!");
        if(!timeOfYasu){
          var params = {screen_name: 'DeformedYasu', count:20, includes_entites:true, exclude_replies:true};
          twitterClient.get('favorites/list', params, function(error, tweets, response) {
            if (!error) {
                tweetsArr = [];
                  for(var i = 0; i<tweets.length; i++){
                      //console.log(tweets[i]);
                      if(Object.keys(tweets[i].entities).includes("media")){
                      tweetsArr.push(tweets[i]);
                      //console.log(tweetsArr[0]);
                      }
                  }
                //  console.log(tweetsArr);
                  var tweetDateString = Date.parse(tweetsArr[0].created_at)
                  console.log(tweetDateString);
                  timeOfYasu = moment(tweetDateString);
                  timeNow = moment();
                  m.channel.send(tweetsArr[0].entities.media[0].expanded_url);
                 tweetsArr = [];
                //console.log(tweetsArr);
                //console.log(tweets);
            } else {
                throw error
            }
          });
        } else if(timeOfYasu.diff(timeNow) > 0){
          console.log(timeNow.diff(timeOfYasu));
          var params = {screen_name: 'DeformedYasu', count:20, includes_entites:true, exclude_replies:true};
          twitterClient.get('favorites/list', params, function(error, tweets, response) {
            if (!error) {
                tweetsArr = [];
                  for(var i = 0; i<tweets.length; i++){
                      //console.log(tweets[i]);
                      if(Object.keys(tweets[i].entities).includes("media")){
                      tweetsArr.push(tweets[i]);
                      console.log(tweetsArr[0]);
                      }
                  }
                  console.log(tweetsArr);
                  var tweetDateString = tweetsArr[0].entities.created_at;
                  timeOfYasu = moment(Date.parse(tweetDateString.replace(/( \+)/, ' UTC$1')));
                  timeNow = moment();
                  m.channel.send(tweetsArr[0].entities.media[0].expanded_url);
                 tweetsArr = [];
            } else {
                throw error
            }
          });
        } else {
          console.log(timeNow.diff(timeOfYasu));
          console.log(timeNow);
          console.log(timeOfYasu);
          console.log("Nothing here, boss.");
          return;
        }
      });
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
