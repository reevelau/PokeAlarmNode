'use strict';

var debug = require('debug')('pokemin-info');
var jsonfile = require('jsonfile');

class PokemonInfo{
  constructor(){
    this.pokeInfoStore = new Array(1000);
    this.current_active_number = 151; // from 1 to 151 pokemon
  }

  initialize(configPath, lang){
    var tranlationPath = `./locales/pokemon.${lang}.json`;
    debug('[+] translation file path: %s', tranlationPath);

    return new Promise(function(resolve,reject){
      jsonfile.readFile(tranlationPath, function(err, translation){

        if(err){
          debug('[-] error when reading file: %s, %s', tranlationPath, err);
          reject(err);
          return;
        }

        // adding the translation to pokeInfoStore
        if(translation){
          for(var key in translation){
            var id = parseInt(key,10);
            if(id <= this.current_active_number){
              //debug(`[+] working with pokemon id ${id}`);
              var name = translation[key];
              this.pokeInfoStore[id] = {
                name : name,
                id: id,
                config : 'True'
              }
            }
          }
        }

        // read config file
        jsonfile.readFile(configPath, function(err, config){

          if(err){
            debug(`[-] error when reading config file ${err}`);
            reject(err);
            return;
          }

          if(config && config.pokemon && Object.keys(config.pokemon).length === this.current_active_number){
            var count = 1;
            for(var pokekey in config.pokemon){
              var cur = this.pokeInfoStore[count++];
              cur.config = config.pokemon[pokekey];
              if(cur.config !== 'False')
                debug(`[+] Pokemon [${cur.name}] is [${cur.config}]`);
            }

            resolve();
          }
          else{
            var msg = 'Config file does not contain all pokemon config!';
            debug(`[-] ${msg}`);
            reject(msg);
          }

        }.bind(this));

      }.bind(this));

    }.bind(this));

  }


  isValid(id){
    if(0<id && id<this.current_active_number){
      return true;
    }
    else{
      debug(`[-] pokemon id ${id} out of range`);
      return false;
    }
  }

  getPokemonName(id){
    return this.pokeInfoStore[id].name;
  }


  isEnabled(id){
    if(this.isValid(id)){
      if(this.pokeInfoStore[id].config.toLowerCase().indexOf('false') !== -1){
        return false;
      }
      else{
        return true;
      }
    }

    return false;
  }

  isNotify(id){
    if(this.isValid(id)){
      if(this.pokeInfoStore[id].config.toLowerCase().indexOf('notify') !== -1){
        return true;
      }
    }
    return false;
  }
};

module.exports = PokemonInfo;
