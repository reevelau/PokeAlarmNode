'use strict';

var expect    = require("chai").expect;
var MessageProcessor = require('../src/message-processor.js');

class StorePointStoreMock{
  getSpawnPointById(id){
    return {
     "pausetime": 45,
     "spawntime": 44.71126667037606,
     "pauses": 1,
     "lat": 22.371488725702473,
     "lng": 114.17770148157952,
     "phasetime": 60,
     "type": 101,
     "id": 3574493908757
    };
  }
}

describe("Spawn Time Calculation", function() {
  it('should process a message',function(){
      var pokemon = {
        id : 1,
        name: 'HelloWorld',
        enable : true,
        notify: true,
        latitude: 123.123123,
        longitude: 321.321321,
        geoCoderAddr: undefined,
        last_modified_time: 0,
        time_until_hidden_ms: 0,
        disappear_time: 0,
        spawnpointId: 1,
        encounter_id: '12',
        message: '',
        timeInfo: 'To: 10:52:51 pm (14 minutes, 59 seconds remains)',
        stype: 101
      };
      var spawnpointstore_mock = new StorePointStoreMock();

      var mprocess = new MessageProcessor(spawnpointstore_mock);
      mprocess.process(pokemon);
      expect(pokemon.message).to.not.equal('');
      console.log(pokemon.message);
  });
});
