const http = require('http');
const querystring = require('querystring');
const discord = require('discord.js');
const { time } = require('console');
const { version } = require('os');
const client = new discord.Client();

let words = [];
let agendas = [];

let games_insider = {};
let games_ito = {};

//Insider Gameのコマンド
const create_insider = /^\/create insider$/
const join_insider = /^\/join insider$/
const out_insider = /^\/out insider$/
const start_insider = /^\/start insider$/
const start_ex_insider = /^\/start_ex insider$/
const answer_insider = /^\/answer insider$/
const destroy_insider = /^\/destroy insider$/
//itoのコマンド
const create_ito = /^\/create ito$/
const join_ito = /^\/join ito$/
const out_ito = /^\/out ito$/
const start_ito = /^\/start ito$/
const change_ito = /^\/change ito$/
const playcard_ito = /^\/playvard ito$/
const destroy_ito = /^\/destroy ito$/


class INSIDER{
  #members = [];
  #timer = "none";
  #start_time = "0";
  #word = "";
  #master_id = 0;
  #insider_id = 0;
  #follower_id = 0;
  #playing = false;
  constructor(){
    this.#members = [];
    this.#timer = "none";
    this.#start_time = 0;
    this.#word = "";
    this.#master_id = 0;
    this.#insider_id = [];
    this.#follower_id = 0;
  }
  get timer(){
    return this.#timer;
  }
  get time(){
    return ((+new Date()) - this.#start_time);
  }
  get word(){
    return this.#word;
  }
  get mster(){
    return this.#master_id;
  }
  get insider(){
    return this.#insider_id;
  }
  get follower(){
    return this.#follower_id;
  }
  get members(){
    return this.#members;
  }
  get isPlaying(){
    return this.#playing;
  }
  add_member(user_id,channel_id){
    if(this.#members.includes(user_id)){
      sendMsg(channel_id, "あなたはすでに参加しています");
    }else{
      this.#members.push(user_id);
      sendMsg(channel_id, "ご参加ありがとうございます");
    }
    return;
  }
  out_member(user_id,channel_id){
    var index = this.#members.indexOf(user_id);
    if(index >= 0){
      this.#members.splice(index, 1)
      sendMsg(channel_id, "ご参加ありがとうございました");
    }else{
      sendMsg(channel_id, "参加していません");
    }
    return;
  }
  set_word(){
    this.#word = words[getRandomInt(words.length)];
    return;
  }
  start_game(){
    this.#playing = true;
  }
  end_game(){
    this.#playing = false;
  }
  timer_start(){
    if(this.#timer.match("none")){
      this.#timer = "on";
      this.#start_time = (+new Date());
    }else if(this.timer.match("on")){
      this.#timer = "reverse";
    }
    return;
  }
  timer_off(){
    this.#timer = "none";
    return;
  }
  member_num(){
    if(this.#members.length < 4){
      return false;
    }else{
      return true;
    }
  }
  alloc_role(r,id){
    this.#insider_id = [];
    for(var i = 0;i < this.#members.length;i++){
      if(i == r[0]){
        client.users.get(this.#members[i]).send("あなたはインサイダーです");
        client.users.get(this.#members[i]).send("お題は"+this.#word+"です");
        client.users.get(this.#members[i]).send("自分がインサイダーである事に気づかれずに正解にたどり着きましょう");
        this.#insider_id.push(this.#members[i]);
      }else if(i == r[1]){
        client.users.get(this.#members[i]).send("あなたはマスターです");
        client.users.get(this.#members[i]).send("お題は"+this.#word+"です");
        client.users.get(this.#members[i]).send("プレイヤーの皆さんの質問に答えましょう");
        this.#master_id = this.#members[i];
      }else{
        client.users.get(this.#members[i]).send("あなたは庶民です");
        client.users.get(this.#members[i]).send("他のプレイヤーと協力して正解にたどり着き、インサイダーを暴きましょう");
      }
    }
    sendMsg(id, "役職を確認してゲームを開始してください");
    sendMsg(id, "マスターは<@"+this.#master_id+">さんです");
  }
  alloc_role_ex(r){
    this.#insider_id = [];
    for(var i = 0;i < this.#members.length;i++){
      if(i == r[0]){
        client.users.get(this.#members[i]).send("あなたはインサイダーです");
        client.users.get(this.#members[i]).send("お題は"+this.#word+"です");
        if(this.#members.length >= 9){
          client.users.get(this.#members[i]).send("もう一人のインサイダーは<"+client.users.get(this.#members[this.#members.length-1]).username+">さんです");
          client.users.get(this.#members[i]).send("自分達がインサイダーである事に気づかれずに正解にたどり着きましょう");
        }else{
          client.users.get(this.#members[i]).send("自分がインサイダーである事に気づかれずに正解にたどり着きましょう");
        }
        this.#insider_id.push(this.#members[i]);
      }else if(i == r[1]){
        client.users.get(this.#members[i]).send("あなたはマスターです");
        client.users.get(this.#members[i]).send("お題は"+this.#word+"です");
        client.users.get(this.#members[i]).send("プレイヤーの皆さんの質問に答えましょう");
        this.#master_id = this.#members[i];
      }else if(i == r[this.#members.length - 2] && this.#members.length > 8){
        client.users.get(this.#members[i]).send("あなたはインサイダーです");
        client.users.get(this.#members[i]).send("お題は"+this.#word+"です");
        client.users.get(this.#members[i]).send("もう一人のインサイダーは<"+client.users.get(this.#members[0]).username+">さんです");
        client.users.get(this.#members[i]).send("自分達がインサイダーである事に気づかれずに正解にたどり着きましょう");
        this.#insider_id.push(this.#members[i]);
      }else if(i == r[this.#members.length - 1]){
        client.users.get(this.#members[i]).send("あなたはフォロワーです");
        client.users.get(this.#members[i]).send("いわゆる狂人です");
        client.users.get(this.#members[i]).send("インサイダーは");
        if(this.#members.length >= 9){
          client.users.get(this.#members[i]).send("<"+client.users.get(this.#members[this.#members.length-1]).username+">さんと");
        }
        client.users.get(this.#members[i]).send("<"+client.users.get(this.#members[0]).username+">さんです");
        this.#follower_id = this.#members[i];
      }else{
        client.users.get(this.#members[i]).send("あなたは庶民です");
        client.users.get(this.#members[i]).send("他のプレイヤーと協力して正解にたどり着き、インサイダーを暴きましょう");
      }
    }
  }
}
class ITO{
  #member = {};
  #deck = [];
  #level = 1;
  #life = 3;
  #agenda = "";
  #hand_list = [];
  #playing = false;
  constructor(){
    this.#member = {};
    this.#level = 1;
    this.#life = 3;
    this.#agenda = "";
    this.#hand_list = [];
    for(var i = 1;i <=100;i++){
      this.#deck.push(i);
    }
  }

  get member(){
    return this.#member;
  }
  get life(){
    return this.#life;
  }
  get level(){
    return this.#level;
  }
  get isPlaying(){
    return this.#playing;
  }

  member_num(){
    return Object.keys(this.#member).length;
  }
  add_member(user_id,channel_id){
    if(!(String(user_id) in this.#member)){
      this.#member[user_id] = [];
      sendMsg(channel_id, "ご参加ありがとうございます");
    }else{
      sendMsg(channel_id, "あなたはすでに参加しています");
    }
  }
  out_member(user_id,channel_id){
    if(String(user_id) in this.#member){
      delete this.#member[String(user_id)];
      sendMsg(channel_id, "ご参加ありがとうございました");
    }else{
      sendMsg(channel_id, "ゲームに参加していません");
    }
    return;
  }
  shuffle(){   
    var j = 0;
    for(var i = 99;i >= 0;i--){
      j = getRandomInt(100);
      [this.#deck[i], this.#deck[j]] = [this.#deck[j], this.#deck[i]];
    }
  }
  start_game(){
    this.#playing = true;
  }
  end_game(){
    this.#playing = false;
  }
  hand_out(){
    var num = 0;
    this.#hand_list = [];
    this.shuffle();
    this.shuffle();
    for(var key in this.#member){
      let hand = [];
      for(var i = 0;i < this.#level;i++){
        hand.push(this.#deck[num]);
        this.#hand_list.push(this.#deck[num]);
        num++;
      }
      this.#member[key] = hand;
      this.#member[key].sort((first, second) => first - second);
      client.users.get(key).send("あなたの手札です");
      client.users.get(key).send(""+hand);
    }
    this.#hand_list.sort((first, second) => first - second);
  }
  select_agenda(channel_id){
    this.#agenda = agendas[getRandomInt(agendas.length)];
    sendMsg(channel_id, "お題は"+this.#agenda+"です");
  }
  check_card(num,channel_id){
    if(num == this.#hand_list[0]){
      return;
    }
    var i = 0;
    while(num > this.#hand_list[i]){
      if(this.#life == 0){
        break;
      }
      for(var key in this.#member){
        if(this.#member[key].length > 0){
          if(this.#member[key][0] == this.#hand_list[0]){
            sendMsg(channel_id, client.users.get(key).username+"さんが"+this.#hand_list[0]+"を持っていた");
            this.#member[key].splice(0,1);
            this.#hand_list.splice(0,1);
            this.#life--;
            break;
          }
        }
      }
    }
    sendMsg(channel_id, "残りライフ:"+this.#life);
  }
  play_card(user_id,channel_id){
    if(this.#member[user_id].length > 0){
      var card = this.#member[user_id][0];
      sendMsg(channel_id, String(card));
      this.check_card(card)
      this.#member[user_id].splice(0,1);
      this.#hand_list.splice(0,1);
      client.users.get(user_id).send("手札を消費しました");
      if(this.#member[user_id].length > 0){
        client.users.get(user_id).send(""+this.#member[user_id]);
      }else{
        client.users.get(user_id).send("手札を使い切りました");
      }
      if(this.#hand_list.length == 0){
        if(this.#life > 0){
          console.log(this.member_num() * (this.#level + 1));
          if(100 > this.member_num() * (this.#level + 1)){
            sendMsg(channel_id, "level."+this.#level+"をクリアしました\n「/startgame ito」で次のレベルに挑めます");
            this.#level++;
            this.add_life();
          }else{
            sendMsg(channel_id, "全てのレベルをクリアしました\n「/startgame ito」でもう一度同じレベルに挑めます");
            this.add_life();
          }
        }else{
          sendMsg(channel_id, "Game Over");
          this.#level = 1;
          this.#life = 3;
        }
        this.end_game();
      }
    }else{
      sendMsg(channel_id, "あなたはすでに手札を使い切っています");
    }
  }
  add_life(){
    if(this.#life < 3){
      this.#life++;
    }
  }
}

http.createServer(function(req, res){
  if (req.method == 'POST'){
    var data = "";
    req.on('data', function(chunk){
      data += chunk;
    });
    req.on('end', function(){
      if(!data){
        res.end("No post data");
        return;
      }
      var dataObject = querystring.parse(data);
      console.log("post:" + dataObject.type);
      if(dataObject.type == "wake"){
        console.log("Woke up in post");
        res.end();
        return;
      }

      if(dataObject.type == "words"){
        let emb = {embed: JSON.parse(dataObject.content)};
        words = emb.embed.fields;
      }
      if(dataObject.type == "agenda"){
        let emb = {embed: JSON.parse(dataObject.content)};
        agendas = emb.embed.fields;
      }

      res.end();
    });
  }
  else if (req.method == 'GET'){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);

client.on('ready', message =>{
  console.log('Bot準備完了～');
  client.user.setPresence({ activity: { name: 'げーむ' } });
});

client.on('message', message =>{
  if (message.author.id == client.user.id || message.author.bot){
    return;
  }
  if (message.isMemberMentioned(client.user)){
    sendReply(message, "呼びましたか？");
    return;
  }

  if (message.content.match(create_insider)){
    if(!(String(message.channel.id) in games_insider)){
      let game = new INSIDER();
      games_insider[message.channel.id] = game;
      sendMsg(message.channel.id, "ゲームを作成しました");
    }else{
      sendMsg(message.channel.id, "すでに作成されています");
    }
  }
  if (message.content.match(join_insider)){
    if(String(message.channel.id) in games_insider){
      if(games_insider[String(message.channel.id)].isPlaying){
        sendMsg(message.channel.id, "ゲーム中です\n現在のゲームが終了してからお試しください");
        return;
      }
      games_insider[String(message.channel.id)].add_member(message.author.id,message.channel.id);
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create insider」コマンドでゲームを作成してからお試しください");
    }
    return;
    //member_lists[channel][player]
  }
  if (message.content.match(out_insider)){
    if(String(message.channel.id) in games_insider){
      if(games_insider[String(message.channel.id)].isPlaying){
        sendMsg(message.channel.id, "ゲーム中です\n現在のゲームが終了してからお試しください");
        return;
      }
      games_insider[String(message.channel.id)].out_member(message.author.id,message.channel.id);
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create insider」コマンドでゲームを作成してからお試しください");
    }
    return;
  }
  if (message.content.match(start_insider)){
    if(String(message.channel.id) in games_insider){
      game = games_insider[String(message.channel.id)];
      if(!game.members.includes(message.author.id)){
        sendMsg(message.channel.id, "このコマンドはゲームに参加する人だけが使えます");
        return;
      }
      if(!(game.member_num())){
        sendMsg(message.channel.id, "プレイヤーが足りません。\nお友達を誘ってみてはどうですか？");
        return;
      }
      if(game.isPlaying){
        sendMsg(message.channel.id, "ゲーム中です\n現在のゲームが終了してからお試しください");
        return;
      }
      game.set_word();
      let r = getRandomArry(game.members.length);
      game.alloc_role(getRandomArry(game.members.length),message.channel.id);
      game.start_game();
      game.timer_start();
      setTimeout(function () {
        if(game.timer.match("on")){
          sendMsg(message.channel.id, "残念、時間切れです");
          game.end_game();
          game.timer_off();
        }
      }, 300*1000)
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create insider」コマンドでゲームを作成してからお試しください");
    }
    return;
    //sendMsg(message.channel.id, "マスターは <@"+this.#members[r[1]]+">さんです");
  }
  if (message.content.match(start_ex_insider)){
    if(String(message.channel.id) in games_insider){
      let game = games_insider[String(message.channel.id)];
      if(game.members.includes(message.author.id)){
        sendMsg(message.channel.id, "このコマンドはゲームに参加する人だけが使えます");
        return;
      }
      if(!(game.member_num())){
        sendMsg(message.channel.id, "プレイヤーが足りません。\nお友達を誘ってみてはどうですか？");
        return;
      }
      if(game.isPlaying){
        sendMsg(message.channel.id, "ゲーム中です\n現在のゲームが終了してからお試しください");
        return;
      }
      game.set_word();
      let r = getRandomArry(game.members.length);
      game.alloc_role_ex(getRandomArry(game.members.length));
      sendMsg(message.channel.id, "役職を確認してゲームを開始してください");
      sendMsg(message.channel.id, "マスターは<@"+game.master+">さんです");
      game.start_game();
      game.timer_start();
      setTimeout(function () {
        if(game.timer.match("on")){
          sendMsg(message.channel.id, "残念、時間切れです");
          game.end_game();
          game.timer_off();
        }
      }, 300*1000)
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create insider」コマンドでゲームを作成してからお試しください");
    }
    return;
    //sendMsg(message.channel.id, "マスターは <@"+this.#members[r[1]]+">さんです");
  }
  if (message.content.match('/正解')){
    if(String(message.channel.id) in games_insider){
      let game = games_insider[String(message.channel.id)];
      if(game.timer.match('none') || game.timer.match('reverse')){
        sendMsg(message.channel.id, "現在は回答フェイズではありません");
        return;
      }
      sendMsg(message.channel.id, "おめでとうございます\n無事答えにたどり着くことが出来ました");
      sendMsg(message.channel.id, "それでは"+(game.time/1000)+"秒でインサイダーを見つけ出してください");
      game.timer_start();
      setTimeout(function () {
        if(game.timer.match("reverse")){
          sendMsg(message.channel.id, "投票の時間です");
          game.timer_off();
          game.end_game();
        }
      }, game.time)
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create insider」コマンドでゲームを作成してからお試しください");
    }
    return;
  }
  if (message.content.match(answer_insider)){
    if(String(message.channel.id) in games_insider){
      let game = games_insider[String(message.channel.id)];
      sendMsg(message.channel.id, "インサイダーは");
      sendMsg(message.channel.id, "<@"+game.insider[0]+">さん");
      if(game.insider.length > 1){
        sendMsg(message.channel.id, "<@"+game.insider[1]+">さん");
        sendMsg(message.channel.id, "フォロワーは");
        sendMsg(message.channel.id, "<@"+game.follower+">さん");
      }
      sendMsg(message.channel.id, "でした");
    }
  }
  if (message.content.match(destroy_insider)){
    if(String(message.channel.id) in games_insider){
      delete games_insider[String(message.channel.id)];
      sendMsg(message.channel.id, "ゲームが削除されました\n再び遊ぶ場合は「/create insider」コマンドでゲームを作成してください");
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていないもしくはすでに削除されています");
    }
    return;
  }

  if (message.content.match(create_ito)){
    if(!(String(message.channel.id) in games_ito)){
      let game = new ITO();
      games_ito[message.channel.id] = game;
      sendMsg(message.channel.id, "ゲームを作成しました");
    }else{
      sendMsg(message.channel.id, "すでに作成されています");
    }
  }
  if (message.content.match(join_ito)){
    if(String(message.channel.id) in games_ito){
      if(games_ito[String(message.channel.id)].isPlaying){
        sendMsg(message.channel.id, "ゲーム中です\n現在のゲームが終了してからお試しください");
        return;
      }
      games_ito[String(message.channel.id)].add_member(message.author.id,message.channel.id);
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create ito」コマンドでゲームを作成してからお試しください");
    }
    return;
  }
  if (message.content.match(out_ito)){
    if(String(message.channel.id) in games_ito){
      if(games_ito[String(message.channel.id)].isPlaying){
        sendMsg(message.channel.id, "ゲーム中です\n現在のゲームが終了してからお試しください");
        return;
      }
      games_ito[String(message.channel.id)].out_member(message.author.id,message.channel.id);
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create ito」コマンドでゲームを作成してからお試しください");
    }
    return;
  }
  if (message.content.match(start_ito)){
    if(String(message.channel.id) in games_ito){
      let game = games_ito[String(message.channel.id)];
      if(!(String(message.author.id) in game.member)){
        sendMsg(message.channel.id, "このコマンドはゲームに参加する人だけが使えます");
        return;
      }
      if(game.member_num() < 2){
        sendMsg(message.channel.id, "プレイヤーが足りません。\nお友達を誘ってみてはどうですか？");
        return;
      }
      if(game.isPlaying){
        sendMsg(message.channel.id, "ゲーム中です\n現在のゲームが終了してからお試しください");
        return;
      }
      game.hand_out();
      game.select_agenda(message.channel.id);
      sendMsg(message.channel.id, "LEVEL:"+game.level+"\nLIFE:"+game.life);
      game.start_game();
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create ito」コマンドでゲームを作成してからお試しください");
    }
    return;
  }
  if (message.content.match(change_ito)){
    if(String(message.channel.id) in games_ito){
      let game = games_ito[String(message.channel.id)];
      if(!(String(message.author.id) in game.member)){
        sendMsg(message.channel.id, "このコマンドはゲームに参加する人だけが使えます");
        return;
      }
      if(!(game.isPlaying)){
        sendMsg(message.channel.id, "ゲーム中限定のコマンドです");
        return;
      }
      sendMsg(message.channel.id, "お題を再抽選します");
      game.select_agenda(message.channel.id);
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create ito」コマンドでゲームを作成してからお試しください");
    }
    return;
  }
  if (message.content.match(playcard_ito)){
    if(String(message.channel.id) in games_ito){
      let game = games_ito[String(message.channel.id)];
      if(!(String(message.author.id) in game.member)){
        sendMsg(message.channel.id, "このコマンドはゲームに参加する人だけが使えます");
        return;
      }
      if(!(game.isPlaying)){
        sendMsg(message.channel.id, "ゲーム中限定のコマンドです");
        return;
      }
      game.play_card(message.author.id,message.channel.id);
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていません\n「/create ito」コマンドでゲームを作成してからお試しください");
    }
    return;
  }
  if (message.content.match(destroy_ito)){
    if(String(message.channel.id) in games_ito){
      delete games_ito[String(message.channel.id)];
      sendMsg(message.channel.id, "ゲームが削除されました\n再び遊ぶ場合は「/create ito」コマンドでゲームを作成してください");
    }else{
      sendMsg(message.channel.id, "ゲームが作成されていないもしくはすでに削除されています");
    }
    return;
  }

});

if(process.env.DISCORD_BOT_TOKEN == undefined){
 console.log('DISCORD_BOT_TOKENが設定されていません。');
 process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );

function sendReply(message, text){
  message.reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(console.error);
}

function sendMsg(channelId, text, option={}){
  client.channels.get(channelId).send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

function getRandomInt(max) {
  var min = 0;
  var max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRandomArry(max){
  let array = [];
  for(var i = 0;i < max;i++){
    array.push(i);
  }
  var j = 0;
  for(var i = max - 1;i >= 0;i--){
    j = getRandomInt(max);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}