'use strict';


var jsonfile = require('jsonfile');
var spawnpointfile = 'spawn_point_store.json'
var reindex = require('reindex');
var debug = require('debug')('spawn-point-info');
var _ = require('lodash');

class SpawnInfoStore{
  constructor(spawnpoint_date_file){
    this.spawnpoint_date_file = spawnpoint_date_file || spawnpointfile;
    debug(`[+] using spawn point file ${this.spawnpoint_date_file}`);
    this.SpawnPointDb = null;
  }
  initialize(){
    var _self = this;
    return new Promise(function(resolve,reject){
      jsonfile.readFile(_self.spawnpoint_date_file, function(err, obj){
        if(err){
          debug(`[-] failed reading ${this.spawnpoint_date_file}`);
          reject(err);
          return;
        }
        debug(`[+] reading spawn point file succes, going to reindex`);
        _self.SpawnPointDb = reindex(obj.spawns, 'id');

        resolve();

      });

    });
  }

  getSpawnPointById(id){
    if(this.SpawnPointDb === null)
      return null;

    return this.SpawnPointDb[id];
  }

}

module.exports = SpawnInfoStore;
