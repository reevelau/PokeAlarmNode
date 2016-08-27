'use strict';

var moment = require('moment');
var _ = require('lodash');

class SpawnTime{
  constructor(start,duration){
    this.start = start;
    this.duration = duration;
    this.end = moment(start.valueOf() + duration);
  }

  isWithin(){
    var now = moment();
    if(this.start <= now && now <= this.end){
      return true;
    }
    else{
      return false;
    }
  }

  remainings(){
    var now = moment();
    return moment.duration(this.end - now);
  }
};

class Spawn{
  constructor(last_modified_time, spawnPointTime, type){

    var mod = moment(last_modified_time).startOf('hour').add(moment.duration(spawnPointTime * 60000));

    this.last_modified_time = mod;
    this.spawn_type = type;


  }

  toString(){
    var spawn_time = this.cal_spawn_time();
    var ret = '';

    spawn_time.forEach((time)=>{
      if(time.isWithin()){
        ret += `end: ${time.end.format('h:mm:ss a')} (${time.remainings().humanize()} remains)`;
      }
      else{
        ret += `\nnext: (start:${time.start.format('h:mm:ss a')}) (end:${time.end.format('h:mm:ss a')})`;
      }
    });

    return ret;
  };


  cal_spawn_time(){
    var ret = [];
    var start,duration;
    switch(this.spawn_type){
      case 1:
        break;
      case 101:
        start = moment(this.last_modified_time);
        duration = moment.duration(15 * 60 * 1000); // 15min
        ret.push(new SpawnTime(start, duration));
        break;
      case 102:
        start= moment(this.last_modified_time);
        duration= moment.duration(2 * 15 * 60 * 1000); // 30min
        ret.push(new SpawnTime(start, duration));
        break;
      case 103:
        start= moment(this.last_modified_time);
        duration= moment.duration(3 * 15 * 60 * 1000); // 45min
        ret.push(new SpawnTime(start, duration));
        break;
      case 104:
        start= moment(this.last_modified_time);
        duration= moment.duration(4 * 15 * 60 * 1000); // 60min
        ret.push(new SpawnTime(start, duration));
        break;
      case 201:
        start= moment(this.last_modified_time),
        duration= moment.duration(15 * 60 * 1000) // 60min
        ret.push(new SpawnTime(start, duration));

        start= moment(this.last_modified_time).add(moment.duration(2 * 15 * 60 * 1000)), // 30min later
        duration= moment.duration(15 * 60 * 1000) // 60min
        ret.push(new SpawnTime(start, duration));
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
