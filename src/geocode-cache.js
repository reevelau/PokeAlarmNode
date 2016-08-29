'use strict';

var debug = require('debug')('geocode-cache');
var cache = require('memory-cache');
var NodeGeocoder = require('node-geocoder');



class GeocodeCache{
  constructor(op){
    var options = {
      provider: 'google',
      // Optional depending on the providers
      httpAdapter: 'https', // Default
      language: op.language || 'zh-TW',
      apiKey: op.apiKey || null
    };
    debug(`language: ${op.language}, apiKey: ${op.apiKey}`);
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

            if( Array.isArray(success) && success.length >0){
              cache.put(cachekey, success);
              debug(`server return ${success} but no a array with at least 1 element`);
            }
            resolve(success, false);
          },failed=>{
            reject(failed)
          });
      }

    });
  }
}

module.exports = GeocodeCache;
