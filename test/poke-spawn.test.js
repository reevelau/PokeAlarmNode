'use strict';
var expect    = require("chai").expect;
var Spawn = require('../src/poke-spawn.js');
var moment = require('moment');

console.log(Spawn);



describe("Spawn Time Calculation", function() {
  describe("Type 201", function() {
    it("should handle last modified time at adjacent segment properly", function() {
      //prepare
      var start = moment().subtract(moment.duration(1000 * 3));
      var currentmin = start.minute()

      // the spawn time will always in adjacent time segment
      var spawnMin =  (currentmin + 30) % 60; // simulate another segment


      var spawn = new Spawn(start.valueOf(),spawnMin,201); // type 201
      var output = spawn.toString();
      expect(output.indexOf('To')).not.equal(-1);
      expect(output.indexOf('Next')).not.equal(-1);
    });

    it("should handle last modified time at same segment properly", function() {
      //prepare
      var start = moment().subtract(moment.duration(1000 * 3));
      var currentmin = start.minute()

      // the spawn time will always in adjacent time segment
      var spawnMin =  (currentmin -1 +60) % 60; // simulate same segment


      var spawn = new Spawn(start.valueOf(),spawnMin,201); // type 201
      var output = spawn.toString();
      console.log(output)
      expect(output.indexOf('To')).not.equal(-1);
      expect(output.indexOf('Next')).not.equal(-1);
    });
  });

});
