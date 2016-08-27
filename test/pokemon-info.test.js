
var PokemonInfo = require('./pokemon-info.js');

function* foo(lang){
  var info = new PokemonInfo();
  yield info.initialize('./alarms.json', lang);
}

var caller = foo('zh_hk');

console.log(caller.next());
console.log(caller.next());


var caller = foo('en');
console.log(caller.next());
console.log(caller.next());
