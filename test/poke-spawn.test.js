'use strict';
var expect    = require("chai").expect;
var Spawn = require('../src/poke-spawn.js');
var moment = require('moment');

console.log(Spawn);



describe("Spawn Time Calculation", function() {
  describe("Type 201", function() {
    it("should handle last modified time at adjacent segment properly at specific time", function() {
      //prepare
      // Sat Aug 27 2016 23:59:54 GMT+0800
      var now = moment(1472313594451);
      var start = moment(1472313594451).subtract(moment.duration(1000 * 3));
      var currentmin = start.minute();

      // the spawn time will always in adjacent time segment
      var spawnMin =  (currentmin + 30) % 60; // simulate another segment


      var spawn = new Spawn(start.valueOf(),spawnMin,201, function(){return moment(1472313594451);}); // type 201
      var output = spawn.toString();
      console.log(output);
      expect(output.indexOf('To')).not.equal(-1);
      expect(output.indexOf('Next')).equal(-1);

      expect(output.indexOf('DEFECT_201')).not.equal(-1);
    });

    it("should handle last modified time at same segment properly at specific time", function() {
      //prepare
      // Sat Aug 27 2016 23:59:54 GMT+0800
      var now = moment(1472313594451);
      var start = moment(1472313594451).subtract(moment.duration(1000 * 3));
      var currentmin = start.minute()

      // the spawn time will always in adjacent time segment
      var spawnMin =  (currentmin -1 +60) % 60; // simulate same segment


      var spawn = new Spawn(start.valueOf(),spawnMin,201, function(){return moment(1472313594451);}); // type 201
      var output = spawn.toString();
      console.log(output);
      expect(output.indexOf('To')).not.equal(-1);
      expect(output.indexOf('Next')).not.equal(-1);

    });


    it("should handle last modified time at adjacent segment properly at any time", function() {
      //prepare
      //console.log(new Date());

      for(var min = 0; min < 60; min++){
        var now = moment().minute(min);
        //console.log(now.toString());
        var start = moment().minute(min);
        var currentmin = start.minute()

        // the spawn time will always in adjacent time segment
        var spawnMin =  (currentmin + 30) % 60; // simulate another segment


        var spawn = new Spawn(start.valueOf(),spawnMin,201, function(){return moment().minute(min);}); // type 201
        var output = spawn.toString();
        //console.log(output);
        expect(output.indexOf('To')).not.equal(-1);
        expect(output.indexOf('Next')).equal(-1);
        expect(output.indexOf('DEFECT_201')).not.equal(-1);
      }


    });

    it("should handle last modified time at same segment properly at any time", function() {
      for(var min = 0; min < 60; min++){
        var now = moment().minute(min);
        //console.log(now.toString());
        var start = moment().minute(min);
        var currentmin = start.minute()

        // the spawn time will always in adjacent time segment
        var spawnMin =  (currentmin -1 +60) % 60; // simulate same segment


        var spawn = new Spawn(start.valueOf(),spawnMin,201, function(){return moment().minute(min);}); // type 201
        var output = spawn.toString();
        //console.log(output);
        expect(output.indexOf('To')).not.equal(-1);
        expect(output.indexOf('Next')).not.equal(-1);
      }
    });

    it('should handle spawn time which close in previous hour, type 101', function(){
      var now = moment('2016-08-26 00:01:00.000');
      var start = moment('2016-08-25 23:59:00.000');
      var currentmin = start.minute();

      var spawn = new Spawn(start.valueOf(),currentmin,101, function(){return moment('2016-08-26 00:01:00.000');});
      var output = spawn.toString();
      //console.log(output);
      expect(output.indexOf('To')).not.equal(-1);
    });

    it('should handle spawn time which close in previous hour, type 102', function(){
      var now = moment('2016-08-26 00:01:00.000');
      var start = moment('2016-08-25 23:59:00.000');
      var currentmin = start.minute();

      var spawn = new Spawn(start.valueOf(),currentmin,102, function(){return moment('2016-08-26 00:01:00.000');});
      var output = spawn.toString();
      //console.log(output);
      expect(output.indexOf('To')).not.equal(-1);
    });

    it('should handle spawn time which close in previous hour, type 103', function(){
      var now = moment('2016-08-26 00:01:00.000');
      var start = moment('2016-08-25 23:59:00.000');
      var currentmin = start.minute();

      var spawn = new Spawn(start.valueOf(),currentmin,103, function(){return moment('2016-08-26 00:01:00.000');});
      var output = spawn.toString();
      //console.log(output);
      expect(output.indexOf('To')).not.equal(-1);
    });

    it('should handle spawn time which close in previous hour, type 104', function(){
      var now = moment('2016-08-26 00:01:00.000');
      var start = moment('2016-08-25 23:59:00.000');
      var currentmin = start.minute();

      var spawn = new Spawn(start.valueOf(),currentmin,104, function(){return moment('2016-08-26 00:01:00.000');});
      var output = spawn.toString();
      //console.log(output);
      expect(output.indexOf('To')).not.equal(-1);
    });
  });

});
