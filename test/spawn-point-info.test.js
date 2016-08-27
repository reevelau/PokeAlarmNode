

var SpawnPointInfo = require('../src/spawn-point-info.js');
var store = new SpawnPointInfo('spawn_point_store.json');

store.initialize().then(function(){
  var sp = store.getSpawnPointById(3574494530843);
  console.log(sp);
}, function(){
  console.log('failed');
});
