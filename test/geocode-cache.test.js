'use strict';
var expect    = require("chai").expect;
var Gecode = require('../src/geocode-cache.js');
var coder = new Gecode();

describe("Geocoder cache", function() {
  it('should cache miss, check log messsage', function(){

    return coder.reverse(22.369729,114.173661).then((success)=>{
      //console.log(success);
      expect(success).to.be.instanceof(Array);
    });
  });

  it('should cache hit, check log messsage', function(){

    return coder.reverse(22.369729,114.173661).then((success)=>{
      //console.log(success);
      expect(success).to.be.instanceof(Array);
    });
  });
});
