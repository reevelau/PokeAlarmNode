'use strict';

const debug = require('debug')('main'),
      config = require('config'),
      express = require('express'),
      bodyParser = require('body-parser'),
      Queue = require('co-queue'),
      co = require('co'),
      moment = require('moment'),
      cache = require('memory-cache'),
      is = require('is_js'),
      atob = require('atob'),
      bigInt = require('big-integer'),
      NodeGeocoder = require('node-geocoder');

var SpawnPointInfo = require('./spawn-point-info.js'),
    PokemonInfo = require('./pokemon-info.js'),
    Messenger = require('./telegram-bot-messenger.js'),
    MessageProcessor = require('./message-processor.js'),
    PokeRequestParser = require('../src/poke-request-parser.js'),
    GecodeCache = require('../src/geocode-cache.js');

var spawnpointfile = 'spawn_point_store.json';


var spawnPointStore = new SpawnPointInfo(spawnpointfile);
spawnPointStore.initialize().then(success=>{
  debug(`[+] spawn point file loaded`)
});

var alarmConfig = config.get('alarms')[0];
var geocodeConfig = config.get('geocoder')||{};
var translation = config.get('translation');

var pokeInfo = new PokemonInfo();
pokeInfo.initialize('./config/default.json', translation.pokemon_language).then(()=>{
  debug(`[+] reading pokemon information done`);
});
var requestParser = new PokeRequestParser(pokeInfo);


var geocoder = new GecodeCache(geocodeConfig);

var bot = new Messenger(
  {
    bot_token:alarmConfig.bot_token,
    chat_id : alarmConfig.chat_id
  }
);

var queue = new Queue();
var mprocessor = new MessageProcessor(spawnPointStore);

function shouldProcess(pokemon){
  if(pokemon !== null
        && null === cache.get(pokemon.encounter_id))
  {
    var time15minInMs = 15 * 60 * 1000;
    var cache_time_out = pokemon.time_until_hidden_ms;

    if(cache_time_out < 0)
      cache_time_out = time15minInMs;

    if(cache_time_out > 4 * time15minInMs)
      cache_time_out = time15minInMs; // Assumed that time_until_hidden_ms would greater than 1 hour

    cache.put(
      pokemon.encounter_id,
      pokemon,
      cache_time_out,
      (key,value)=>{
        debug(`[+] memory-cache GC [${key}:${pokemon.message_id|| JSON.stringify(value,'',2)}]`)
      }
    );
    return true;
  }

  return false;
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
      var pokemon = yield requestParser.parse(body);
      debug(`[!] ${pokemon.message_id} ${pokemon.encounter_id}`);
      debug(`[!] ${pokemon.message_id} ${body.message.last_modified_time} ${body.message.disappear_time} ${body.message.time_until_hidden_ms}`);
      if(shouldProcess(pokemon))
        yield messageHandler(pokemon);
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
