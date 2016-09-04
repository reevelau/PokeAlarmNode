'use strict';

var expect    = require("chai").expect;
var PokeRequestParser = require('../src/poke-request-parser.js');
var mocha = require('mocha');
var coMocha = require('co-mocha');

coMocha(mocha);

// mock up class
class PokemonInfo{
  isValid(id){
    return true;
  }

  getPokemonName(id){
    return 'Mock';
  }


  isEnabled(id){
    return true;
  }

  isNotify(id){
    return true;
  }
};


describe("Poke Request Parser", function() {
  it("Should parse request", function *() {
    var info = new PokemonInfo();
    var parser = new PokeRequestParser(info);

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

    var pokemon = yield parser.parse(request);

    console.log(pokemon);
    expect(pokemon).is.not.equal(null);

  });

});
