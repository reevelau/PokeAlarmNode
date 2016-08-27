
var Messenger = require('../src/telegram-bot-messenger.js');



function *foo(){
  var bot = new Messenger({});
  yield bot.handleSpawn({
    latitude: 22.37761396037728,
    longitude: 114.17314994137853,
    message: 'hello world'
  });

  yield bot.handleSpawn({
    latitude: 22.37761396037728,
    longitude: 114.17314994137853,
    message: 'hello world 2'
  });
}

var caller = foo();

while(!caller.next().done){
  console.log('next');
}
