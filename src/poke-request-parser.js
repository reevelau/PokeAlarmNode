'use strict';
var is = require('is_js');
var debug = require('debug')('poke-request-parser');
var debug_main = require('debug')('main');
var PokemonInfo = require('./pokemon-info.js');
var atob = require('atob');
var bigInt = require('big-integer');
var pad = require('pad');
var crypto = require('crypto');

var config = require('config');
var geocodeConfig = config.get('geocoder')||{};
var GecodeCache = require('../src/geocode-cache.js');
var geocoder = new GecodeCache(geocodeConfig);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function shouldProcess(request){
  /*
  expecting to get this as request

  var request = {
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

  var ret = false;
  if(!request)
    return ret;
  if(!request.type)
    return ret;
  if(request.type !== 'pokemon')
    return ret;
  if(!request.message)
    return ret;
  if(is.not.string(request.message.encounter_id))
    return ret;
  if(is.not.number(request.message.time_until_hidden_ms))
    return ret;
  if(is.not.number(request.message.last_modified_time ))
    return ret;
  if(is.not.number(request.message.disappear_time))
    return ret;
  if(is.not.number(request.message.pokemon_id))
    return ret;
  if(is.not.number(request.message.latitude))
    return ret;
  if(is.not.number(request.message.longitude))
    return ret;
  if(is.not.string(request.message.spawnpoint_id))
    return ret;

  return true;
}

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

class PokeRequestParser{
  constructor(pokeInfo){
    //if( ! (pokeInfo instanceof PokemonInfo))
    //  throw 'Argument Exception, pokeInfo need to be instanceof PokemonInfo';
    this.pokeInfo = pokeInfo;
  }

  *parse(request){
    //debug_main(`parsing ${JSON.stringify(request,'',2)}`);

    if(!shouldProcess(request))
      return null;
    /*
    output something like this, when check success
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
    */
    var pokeId = request.message.pokemon_id;
    var enable = this.pokeInfo.isEnabled(pokeId);
    var streetName = yield getStreetName(request.message.latitude, request.message.longitude);
    var encounter_id_str = bigInt(atob(request.message.encounter_id),10).toString(16);
    var spawnpointId = parseInt(request.message.spawnpoint_id,16);
    var msg_id_raw = `${spawnpointId},${encounter_id_str}`;
    var msg_id = crypto.createHash('md5').update(msg_id_raw).digest("hex");

    var pokemon = {
      id : pokeId,
      name: this.pokeInfo.getPokemonName(pokeId),
      enable : enable,
      notify: this.pokeInfo.isNotify(pokeId),
      latitude: request.message.latitude,
      longitude: request.message.longitude,
      streetName: streetName,
      last_modified_time: request.message.last_modified_time,
      time_until_hidden_ms: request.message.time_until_hidden_ms,
      disappear_time: request.message.disappear_time,
      spawnpointId: spawnpointId,
      encounter_id: encounter_id_str,
      message_id : msg_id,
      message: ''
    };

    return pokemon;
  }

};

module.exports = PokeRequestParser;
