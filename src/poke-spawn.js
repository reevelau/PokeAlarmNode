'use strict';

var moment = require('moment');
var _ = require('lodash');
var debug = require('debug')('poke-spawn');
const SPAWN_UNDEF = -1,
  SPAWN_DEF = 1,
  SPAWN_1x0 = 100,
  SPAWN_1x15 = 101,
  SPAWN_1x30 = 102,
  SPAWN_1x45 = 103,
  SPAWN_1x60 = 104,
  SPAWN_2x0 = 200,
  SPAWN_2x15 = 201,
  VSPAWN_2x15 = 2011;

class SpawnTime{
  constructor(start,duration, nowProvider){
    this.start = start;
    this.duration = duration;
    this.end = moment(start.valueOf() + duration.asMilliseconds());

    if(nowProvider){
      this.getNow = nowProvider;
    }
    else{
      this.getNow = function(){
        return moment();
      }
    }
  }

  isWithin(){
    var now = this.getNow();
    var greaterStart = this.start.valueOf() <= now.valueOf();
    var lesserEnd = now.valueOf() <= this.end.valueOf();
    if(greaterStart && lesserEnd){
      return true;
    }
    else{
      return false;
    }
  }

  remainings(){
    var now = this.getNow();
    return moment.duration(this.end - now);
  }
};

class Spawn{
  constructor(last_modified_time, spawnPointTime, type, nowProvider){

    var mod = moment(last_modified_time).startOf('hour').add(moment.duration(spawnPointTime * 60000));

    if(nowProvider){
      this.getNow = nowProvider;
    }
    else{
      this.getNow = function(){
        return moment();
      }
    }
    this.startTime = mod;
    this.spawn_type = type;
  }

  toString(){
    var spawn_time = this.cal_spawn_time();
    var ret = '';

    spawn_time.forEach((time)=>{
      if(time.isWithin()){
        ret += `To: ${time.end.format('h:mm:ss a')} (${time.remainings().humanize()} remains)`;
      }
      else{
        ret += `\nNext: (start:${time.start.format('h:mm:ss a')}) (end:${time.end.format('h:mm:ss a')})`;
      }
    });

    if(this.spawn_type === SPAWN_2x15 &&spawn_time.length!=2){
      ret += `\nDEFECT_201`;
    }
    return ret;
  };


  cal_spawn_time(){
    var ret = [];
    var start,duration;
    var time15minInMs = 15 * 60 * 1000;
    switch(this.spawn_type){
      case 1:
        break;
      case 101:
        start = moment(this.startTime);
        duration = moment.duration(time15minInMs); // 15min
        ret.push(new SpawnTime(start, duration));
        break;
      case 102:
        start= moment(this.startTime);
        duration= moment.duration(2 * time15minInMs); // 30min
        ret.push(new SpawnTime(start, duration));
        break;
      case 103:
        start= moment(this.startTime);
        duration= moment.duration(3 * time15minInMs); // 45min
        ret.push(new SpawnTime(start, duration));
        break;
      case 104:
        start= moment(this.startTime);
        duration= moment.duration(4 * time15minInMs); // 60min
        ret.push(new SpawnTime(start, duration));
        break;
      case 201:
        start= moment(this.startTime);
        duration = moment.duration(time15minInMs); // 15min
        var end = moment(start.valueOf() + time15minInMs);

        var now = this.getNow();

        if(start.valueOf() <= now.valueOf() && now.valueOf() <= end.valueOf()){
          var start2 = moment(start.valueOf() + 2 * time15minInMs); // second start
          ret.push(new SpawnTime(start, duration, this.getNow));
          ret.push(new SpawnTime(start2, duration, this.getNow));
        }
        else{
          var start2;
          // this if clasuse is highly convoluted with the calculation of this.startTime in constructor
          // Constructor has set a fix reference to startTime and doesn't consider
          // whether we have pass it or not

          if(start.minute() < this.getNow().minute())
          {
            // when we have passed the spawn point of current hour
            // the current spawn should be happened 30min after the original spawn time
            start2 = moment(start.valueOf() + 2 * time15minInMs); // second start
          }
          else{
            // when we have not passed the spawn time of current hour and we are not within spawn time
            // the current spawen should be happened 30min before the original spawn time
            start2 = moment(start.valueOf() - 2 * time15minInMs); // second start
          }
          ret.push(new SpawnTime(start2, duration, this.getNow));
          // there is only 1 remaining time segment for this spawn!.
          debug(`DEFECT_201! pokemongo-map always scrapes at second phrase of 201`);
        }
        break;
      default: // for type 1, -1 and other

        start= moment(this.last_modified_time),
        duration= moment.duration(15 * 60 * 1000) // 15min
        ret.push(new SpawnTime(start, duration));
        break;
    }

    return ret;
  };
};

module.exports = Spawn;
