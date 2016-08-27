'use strict';

var debug = require('debug')('main');
var config = require('config');
var express = require('express');
var bodyParser = require('body-parser');
var Queue = require('co-queue');
var co = require('co');

var NodeGeocoder = require('node-geocoder');

var Spawn = require('./poke-spawn.js');
var SpawnPointInfo = require('./spawn-point-info.js');
var PokemonInfo = require('./pokemon-info.js');
var Messenger = require('./telegram-bot-messenger.js');

var alarmConfig = config.get('alarms')[0];

var spawnpointfile = 'spawn_point_store.json';

var spawnPointStore = new SpawnPointInfo(spawnpointfile);
spawnPointStore.initialize().then(success=>{
  debug(`[+] spawn point file loaded`)
});

var pokeInfo = new PokemonInfo();
pokeInfo.initialize('./config/default.json', 'zh_hk').then(()=>{
  debug(`[+] reading pokemon information done`);
});

var options = {
  provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  language: 'zh-TW'
};
var geocoder = NodeGeocoder(options);

var bot = new Messenger(
  {
    bot_token:alarmConfig.bot_token,
    chat_id : alarmConfig.chat_id
  }
);

var queue = new Queue();

co(function*(){
  while(true){

    var body = yield queue.next();

    if(body.message.pokemon_id )
    {
      var pokeId = body.message.pokemon_id;
      var enable = pokeInfo.isEnabled(pokeId);

      var pokemon = {
        id : pokeId,
        name: pokeInfo.getPokemonName(pokeId),
        enable : enable,
        latitude: body.message.latitude,
        longitude: body.message.longitude,
        geoCoderAddr: yield geocoder.reverse({lat:body.message.latitude, lon:body.message.longitude}),
        last_modified_time: body.message.last_modified_time,
        time_until_hidden_ms: body.message.time_until_hidden_ms,
        spawnpointId: parseInt(body.message.spawnpoint_id,16),
        message: ''
      };

      if(pokemon.enable){
        var timeInfo = '';

        var spawnp = spawnPointStore.getSpawnPointById(pokemon.spawnpointId);
        if(spawnp){
          var spawn = new Spawn(pokemon.last_modified_time, spawnp.spawntime,  spawnp.type);
          timeInfo = spawn.toString();
        }
        else{
          //TODO!
          // hack
          var spawntime = pokemon.last_modified_time + 738310
          timeInfo = 'NOT FOUND';
        }

        pokemon.message = `${pokemon.name} (${pokemon.id}) @${pokemon.geoCoderAddr[0].streetName}\n${timeInfo}`;
        yield bot.handleSpawn(pokemon);
        debug(`[+] ${pokemon.name} notification was triggered.`)
      }
      else{
        debug(`[+] ${pokemon.name} ignored: notify not enabled.`);
      }

    }
  }

}).catch(onerror);

function onerror(err) {
  // log any uncaught errors
  // co will not throw any errors you do not handle!!!
  // HANDLE ALL YOUR ERRORS!!!
  console.error(err.stack);
}


var port = 3000;
var app = express();

app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.get('/', function(req,res){
  res.send('hello world');
});

app.post('/', function(req,res){
  var body = req.body;
  process.stdout.write('.');
  queue.push(body);
  res.send('OK');
});

app.listen(port);
