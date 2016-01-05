var Discord = require('discord.js');

var ytdl = require('ytdl-core');
var request = require('superagent');
var url = require('url');

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
var CURRENT_REV = 3;

var client = new Discord.Client();

// Handle discord.js warnings
client.on('warn', (m) => console.log('[warn]', m));
client.on('debug', (m) => console.log('[debug]', m));

var voteAllIDs = [];
var playQueue = [];
var boundChannel = false;
var currentStream = false;
var voteCount = 0;
var voteTotalCount = 0;
// Video that is currently being played
var currentVideo = false;

// Last video played
var lastVideo = false;

var botMention = false;

var shouldStockpile = false;
var stockpile = '';

// Handling api key
var apiKey = process.argv[4] || (Config.auth.apiKey !== "youtube API key (optional)") ? Config.auth.apiKey : false;

client.on('ready', () => {
  botMention = `<@${client.user.id}>`;
  console.log(`Bot mention: ${botMention}`);
  if (Config.configRev !== CURRENT_REV) {
    console.log('WARNING: Your lethe-config.json is out of date relative to the code using it! Please update it from the git repository, otherwise things will break!');
  }
});

client.on('message', m => {
  var antiCS = m.content.toLowerCase()
  if (!botMention) return;
  if (client.user.id == m.author.id) return;

  if (!(m.content.startsWith(`${botMention} `) || m.content.startsWith(`?`))) return;

  if (m.content.startsWith(`${botMention} info`)) {
    if (!checkCommand(m, 'info')) return;
    git.short(commit => git.branch(branch => {
      client.reply(m, `Version: \`Lethe#${branch}@${commit}\` (cf: ${Config.configRev} cr: ${CURRENT_REV}). Info about Lethe can be found at https://github.com/meew0/Lethe.`);
    }));
    return;
  }

  if (m.content.startsWith(`${botMention} h`)) { // help
    if (!checkCommand(m, 'help')) return;
    client.reply(m, 'Usage info can be found here: https://github.com/meew0/Lethe/wiki/Usage');
    return;
  }

  if (m.content.startsWith(`${botMention} i`)) { // init
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

  if (m.content.startsWith(`${botMention} d`)) { // destroy
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
 if (m.content.startsWith(`?ben`)) { // a meme
    if (!checkCommand(m, `?ben`)) return
    var benArray = ["**BEN'S STATUS** \n Lips: LARGE \n Feelings: WHO CARES \n Race: SHADOW-REALM BEAST", "http://puu.sh/m3gGP/de199907f3.png", "http://puu.sh/m3gDD/3c6f7c553b.png", "http://puu.sh/m3gIA/28638cd9ad.jpg", "http://puu.sh/m9tgv/84bc2f4914.jpg", "http://puu.sh/m9tfd/fdd3ad0c46.jpg", "http://puu.sh/m9th3/12a1326552.jpg", "https://cdn.discordapp.com/attachments/93578176231374848/130413901367083008/benkms.jpg" ,"https://cdn.discordapp.com/attachments/93578176231374848/130413948091629568/ben.jpg", "https://puu.sh/ldqI3/7fe79e185e.jpg", "https://puu.sh/ldqI3/7fe79e185e.jpg", "https://puu.sh/ldqC3/563b0df440.jpg", "http://puu.sh/lvryP/a7aeb5c7f2.jpg", "http://puu.sh/l0dy0/97c6792172.jpg", "https://docs.google.com/document/d/1XXeZrKqhCzwAcrbD3IHsAOnwp-XhXdJWwpZQrdLLKZo/edit", "https://docs.google.com/document/d/1qvlZMQLP6BatNGCLt-wrAdVt2bFsqxshGu_RIDMngc0/edit?pref=2&pli=1"]
    client.sendMessage(m.channel, benArray[Math.floor(Math.random() * benArray.length)])
    return;
 }
 if (m.content.startsWith(`?kaio`)) { 
   if (!checkCommand(m, `?kaio`)) return
   var kaioArray = ["http://puu.sh/miD0v/5322ab2006.jpg" , "http://puu.sh/miFg2/b53356ef98.jpg"]
   client.sendMessage(m.channel, kaioArray[Math.floor(Math.random()* kaioArray.length)])
   return;
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
if (m.content.startsWith(`?google`)) { // google
  if (!checkCommand(m, `?google`)) return
  var searchInfo = m.content.slice(8)
  var googleSearch = "https://www.google.com/search?q=" + encodeURIComponent(searchInfo);
  client.reply(m, googleSearch)
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
    var chanceyArray = ["\n >attacking \n I was telling you how is it when you legit tell me to \"promise\" you to text first. \n I was implying that I cannot guarantee shit like this because it rarely happens, even if someone were to complain. \n Attack sounds like this: \n You sound like you're triggered. Where's your problem glasses? Oh wait. You're a nigger! You're just gonna complain that everything bad that happens to you is because you're black. Are you ready to get cucked by your master? Or perhaps you'd rather fuck gorillas aka your own people.", "http://puu.sh/lvpn6/2199db5dcd.png"]
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
  var vanillaArray = ["https://i.gyazo.com/fb6577a3239a86a24fac222e53b1e889.png", "http://puu.sh/maD1a/ebe71dec99.jpg", "https://i.gyazo.com/af8f05c42fb749f170a3788ebae3f9c6.png", "https://i.gyazo.com/109f37eaafac9ee14669d3b9a53e11ad.png", "http://puu.sh/menhE/94c73018b1.png"]
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
  if(m.content.length < 7){
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
  client.reply(m, "http://ecx.images-amazon.com/images/I/81GRxyntAaL._SL1500_.jpg")
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
  var fangArray = ["http://puu.sh/m2Xfd/bdfa504036.png", "http://puu.sh/m2Wew/d1fd328349.png", "http://puu.sh/m2VSU/b481f10fe6.png","http://puu.sh/m2VQa/85113beedc.png"]
  client.reply(m, fangArray[Math.floor(Math.random() * fangArray.length)])
  return;
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
if (antiCS.startsWith(`hello ebolabot`) || antiCS.startsWith(`hi ebolabot`) || antiCS.startsWith(`helo ebolabot`)) {
  var responseArray = ["Hello, how are you?", "Hi!!!", "Why, hello there.", "Hello!", "Hai. x3", "Hi there!", "Hello! <3", "H-hi.."]
  if (m.author.id === "81526338728501248") {
    client.reply(m, responseArray[Math.floor(Math.random() * responseArray.length)]);
    return;
  } else {
    var responseArray = ["You're actually trash! Commit Sudoku..", "Oh, hello, stupid one.", "Awww, look! It's retarded. Hi!!!", "...Ew.", "...", "LOL!", "What did you just say to me?", "Ebola-chan told me not to talk to plebeians...", "..Ew, it's a nonbeliever...", "I hope you never ever recieve Ebola-chan's love!!!! D:<", "Uh.. Hello...?", "Why are you talking to me? You're scaring me...", "Please go away.", "Hai!", "How are ya?", "Oh my god, get away from me.", "You're really 3DPD...", "I think you should commit suicide! How's that for a greeting, huh?", "Fuck you!", "Kill yourself!", "I hope you get nagasaki'd, you thundercunt."]
    client.reply(m, responseArray[Math.floor(Math.random() * responseArray.length)]);
  }
}
/* if (m.content.startsWith(``)) { //memecontrol
  if (!checkCommand(m, ``)) return
  client.reply(m, "")
  return
} 
*/
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
    if (voteTotalCount >= 5){
      console.log("L I M I T S  W E R E  M E A N T  T O  B E  B R O K E N . . .")
      console.log("The current amount of votes are" + voteTotalCount)
        playStopped();
        voteTotalCount = 0;
        voteAllIDs = [];
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
client.login(process.argv[2] || Config.auth.email, process.argv[3] || Config.auth.password).catch((e) => {
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
});

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
