'use strict';

var Spawn = require('./poke-spawn.js');
var moment = require('moment');

console.log(Spawn);

var start = moment().subtract(moment.duration(1000 * 60 *5));
console.log(start.toDate());
var spawn = new Spawn(start.valueOf(), 201);
console.log(spawn.toString());
