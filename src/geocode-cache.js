'use strict';

var debug = require('debug')('geocode-cache');
var cache = require('memory-cache');
var NodeGeocoder = require('node-geocoder');



class GeocodeCache{
  constructor(options){
    var options = {
      provider: 'google',
      // Optional depending on the providers
      httpAdapter: 'https', // Default
      language: 'zh-TW'
    };
    this.geocoder = NodeGeocoder(options);
  }

  reverse(latitude,longitude){
    var _self = this;
    var cachekey = `geocahe:${latitude}-${longitude}`;
    return new Promise(function(resolve,reject){
      var fromcache = cache.get(cachekey);
      if(fromcache != null){
        //cache hit
        debug(`cache hit!`);
        resolve(fromcache, true);
      }
      else{
        debug(`cache miss`);
        _self.geocoder.reverse({lat:latitude, lon:longitude})
          .then(success=>{
            debug(`response from server`);
            cache.put(cachekey, success);
            resolve(success, false);
          },failed=>{
            reject(failed)
          });
      }

    });
  }
}

module.exports = GeocodeCache;
