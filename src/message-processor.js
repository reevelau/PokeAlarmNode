'use strict';

var debug = require('debug')('message-processor');

var Spawn = require('./poke-spawn.js');



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


    pokemon.message = `<b>${pokemon.name} (${pokemon.id})</b> @<a href="https://maps.google.com/maps?q=${pokemon.latitude},${pokemon.longitude}">${streetName}</a>\n`;
    pokemon.message += `${pokemon.timeInfo}\n`;
    pokemon.message += `#${pokemon.name} #${streetName}\n`;
    pokemon.message += `\n`;
    pokemon.message += `#e${pokemon.encounter_id.toString(16)} #type${pokemon.stype} #ss${pokemon.spawnpointId}`;

    return ret;
  };
};



module.exports = MessageProcessor;
