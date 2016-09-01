'use strict';

var debug = require('debug')('main');
var config = require('config');
var express = require('express');
var bodyParser = require('body-parser');
var Queue = require('co-queue');
var co = require('co');
var moment = require('moment');
var cache = require('memory-cache');
var is = require('is_js');
var atob = require('atob');
var bigInt = require('big-integer');

var NodeGeocoder = require('node-geocoder');

var spawnpointfile = 'spawn_point_store.json';
var SpawnPointInfo = require('./spawn-point-info.js');
var spawnPointStore = new SpawnPointInfo(spawnpointfile);
spawnPointStore.initialize().then(success=>{
  debug(`[+] spawn point file loaded`)
});

var PokemonInfo = require('./pokemon-info.js');
var Messenger = require('./telegram-bot-messenger.js');
var MessageProcessor = require('./message-processor.js');

var alarmConfig = config.get('alarms')[0];
var geocodeConfig = config.get('geocoder')||{};

var pokeInfo = new PokemonInfo();
pokeInfo.initialize('./config/default.json', 'zh_hk').then(()=>{
  debug(`[+] reading pokemon information done`);
});

var GecodeCache = require('../src/geocode-cache.js');
var geocoder = new GecodeCache(geocodeConfig);

var bot = new Messenger(
  {
    bot_token:alarmConfig.bot_token,
    chat_id : alarmConfig.chat_id
  }
);

var queue = new Queue();
var mprocessor = new MessageProcessor(spawnPointStore);

function * getStreetName(lat,long){
  var ret = 'none';
  try{
    var apiret = yield geocoder.reverse(lat, long);
    ret = apiret[0].streetName;
  }
  catch(e){
    debug(`failed to resolve ${lat},${long} error ${e}`);
  }
  return ret;
};

function * messageHandler(pokemon){
  if(pokemon.enable){

    mprocessor.process(pokemon);

    yield bot.handleSpawn(pokemon);
    debug(`[+] ${pokemon.name} notification was triggered.`)
  }
  else{
    debug(`[+] ${pokemon.name} ignored: notify not enabled.`);
  }
};

co(function*(){
  while(true){

    var body = yield queue.next();

    try{
      if(body.type === 'pokemon'
            && is.string( body.message.encounter_id)
            && null === cache.get(body.message.encounter_id))
      {
        cache.put(
          body.message.encounter_id,
          true,
          body.message.time_until_hidden_ms,
          (key,value)=>{
            debug(`[+] memory-cache GC [${key}:${value}]`)
          }
        );
        var pokeId = body.message.pokemon_id;

        /*
        "message": {
            "time_until_hidden_ms": 836349,
            "last_modified_time": 1472350762791,
            "disappear_time": 1472351599,
            "pokemon_id": 42,
            "latitude": 22.37469662944935,
            "spawnpoint_id": "340407a8041",
            "encounter_id": "MTM4OTU1ODUzNDQ0MjI0NDM0NTM=",
            "longitude": 114.18002367787557
          },
          "type": "pokemon"
        }
        */


        var enable = pokeInfo.isEnabled(pokeId);
        var streetName = yield getStreetName(body.message.latitude, body.message.longitude);

        var pokemon = {
          id : pokeId,
          name: pokeInfo.getPokemonName(pokeId),
          enable : enable,
          notify: pokeInfo.isNotify(pokeId),
          latitude: body.message.latitude,
          longitude: body.message.longitude,
          streetName: streetName,
          last_modified_time: body.message.last_modified_time,
          time_until_hidden_ms: body.message.time_until_hidden_ms,
          disappear_time: body.message.disappear_time,
          spawnpointId: parseInt(body.message.spawnpoint_id,16),
          encounter_id: bigInt(atob(body.message.encounter_id),10).toString(16),
          message: ''
        };
        yield messageHandler(pokemon);
      }
    }
    catch(e){
      var msg = JSON.stringify(body,'',2);
      debug(`error: ${e} when processing ${msg}`);
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
  queue.push(body);
  res.send('OK');
});

app.listen(port);
