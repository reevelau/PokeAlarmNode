'use strict';

var debug = require('debug')('message-processor');
var debug_main = require('debug')('main');
var Spawn = require('./poke-spawn.js');
var pad = require('pad');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

class MessageProcessor {
  constructor(spawnPointStore){
    this.spawnPointStore = spawnPointStore;
  }
  process(pokemon){
    var ret = '';

    pokemon.timeInfo = '';
    pokemon.stype = -1
    var spawntime = -1;

    var spawnp = this.spawnPointStore.getSpawnPointById(pokemon.spawnpointId);
    if(spawnp && spawnp.type != -1 && spawnp.type != 1){
      pokemon.stype = spawnp.type;
      spawntime = spawnp.spawntime;
    }
    else{
      debug(`spawn point info is null`);
    }

    var spawn = new Spawn(pokemon.last_modified_time,
                            pokemon.disappear_time,
                            pokemon.time_until_hidden_ms,
                            spawntime,
                            pokemon.stype);

    pokemon.timeInfo = spawn.toString();

    var streetName = pokemon.streetName;
    //#e928e2f0f86a0630d
    //#id0016CFBDF9407029
    var msg_id = 'id' + pad(getRandomInt(100000,Number.MAX_SAFE_INTEGER).toString(16).toUpperCase(), 16, ,'D');

    pokemon.message = `<b>${pokemon.name} (${pokemon.id})</b> @<a href="https://maps.google.com/maps?q=${pokemon.latitude},${pokemon.longitude}">${streetName}</a>\n`;
    pokemon.message += `${pokemon.timeInfo}\n`;
    pokemon.message += `#${pokemon.name} #${streetName}\n`;
    pokemon.message += `-----\n`;
    pokemon.message += `立法會選舉，9月4日請投票(7:30am-10:30pm)！<a href="http://www.elections.gov.hk/legco2016/chi/introd_gc_nte.html">新界東候選人名單</a>。\n`;
    pokemon.message += `#${msg_id}\n`;
    //pokemon.message += `#e${pokemon.encounter_id.toString(16)} #type${pokemon.stype} #ss${pokemon.spawnpointId}`;
    debug_main(`[+] ${msg_id} #e${pokemon.encounter_id.toString(16)} #type${pokemon.stype} #ss${pokemon.spawnpointId}`);
    return ret;
  };
};



module.exports = MessageProcessor;
