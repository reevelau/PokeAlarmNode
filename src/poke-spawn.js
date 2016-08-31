'use strict';

var moment = require('moment');
var _ = require('lodash');
var debug = require('debug')('poke-spawn');
var humanizeDuration = require('humanize-duration');
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

const time15minInMs = 15 * 60 * 1000;
// private : used to convert duration in minutes to duration in millisecond
function convert_min_to_ms(min){
  return Math.floor(min * 60 * 1000);
};

function get_diff_by_minute_number(num1,num2){
  var bigger = num1>num2?num1: num2;
  var smaller = num1<num2? num1: num2;
  return Math.min( bigger - smaller, 60 - bigger + smaller );
};

// private : get spawn duration by type
function get_spawn_duration(type){
  var ret;
  switch(type){
    case SPAWN_1x30:
      ret = moment.duration(2 * time15minInMs);
      break;
    case SPAWN_1x45:
      ret = moment.duration(3 * time15minInMs);
      break;
    case SPAWN_1x60:
      ret = moment.duration(4 * time15minInMs);
      break;
    case SPAWN_1x15:
    default:
      ret = moment.duration(time15minInMs);
      break;
  };

  return ret;
};

// private : given now(moment), spawn duration and spawn time in min to deduce nearest spawn time
function get_nearest_spawn_time(spawn_duration, spawn_point_time_in_min, now){
  //debug(`get_nearest_spawn_time([spawn_duration:${spawn_duration}], [spawn_point_time_in_min:${spawn_point_time_in_min}], [now:${now}])`);
  var spawn_time = now;
  var cur_min = now.minute();
  var spawn_min = Math.floor(spawn_point_time_in_min);
  if(cur_min - spawn_min< 0){
    spawn_time.subtract(spawn_duration);
    spawn_time.startOf('hour');
    spawn_time.add(moment.duration( convert_min_to_ms(spawn_point_time_in_min )));
  }
  else{
    spawn_time.minute(spawn_point_time_in_min);
  }
  return spawn_time;
};

// priate: deduce spawn time by type and now (moment)
function get_nearest_spawn_time_by_type(spawn_point_time_in_min, type, now){
  var ret = 0;
  var spawnDuration = get_spawn_duration(type);
  debug(`get_nearest_spawn_time_by_type([spawn_point_time_in_min:${spawn_point_time_in_min}],[type:${type}],[now:${now.toString()}])`);
  if(type === SPAWN_2x15){
    var second_spawn_point_time_in_min = (spawn_point_time_in_min + 30) %60;

    var curMin = now.minute();

    if( get_diff_by_minute_number(curMin, spawn_point_time_in_min)
          <  get_diff_by_minute_number(curMin, second_spawn_point_time_in_min)){
      debug(`[+] using primary spawn time for type_201`);
      ret = get_nearest_spawn_time(spawnDuration, spawn_point_time_in_min, now);
    }
    else{
      debug(`[+] using secondary spawn time for type_201`);
      ret = get_nearest_spawn_time(spawnDuration, second_spawn_point_time_in_min, now);
    }
  }
  else{
    // others
    ret = get_nearest_spawn_time(spawnDuration, spawn_point_time_in_min, now);
  }
  debug(`get_nearest_spawn_time_by_type [ret:${ret.toString()}]`)
  return ret;
};

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
    //debug(`parameters: [last_modified_time:${last_modified_time}] [spawnPointTime:${spawnPointTime}] [type:${type}] [now:${this.getNow().toString()}]`);
    this.startTime = get_nearest_spawn_time_by_type(spawnPointTime,type, this.getNow());
    this.spawn_type = type;
    this.spawnPointTime = spawnPointTime;
  }

  toString(){
    var spawn_time = this.cal_spawn_time();
    var ret = '';

    spawn_time.forEach((time)=>{
      if(time.isWithin()){
        var remains = Math.floor(time.remainings().asMilliseconds() /1000) *1000;
        console.log(remains)
        var dura =   humanizeDuration(remains);
        ret += `To: ${time.end.format('h:mm:ss a')} (${dura} remains)`;
      }
      else{
        ret += `\nNext: (start:${time.start.format('h:mm:ss a')}) (end:${time.end.format('h:mm:ss a')})`;
      }
    });

    if(this.spawn_type === SPAWN_2x15 &&spawn_time.length!=2){
      ret += `\n#DEFECT_201`;
    }
    return ret;
  };

  cal_spawn_time(){
    var ret = [];
    var start,duration;
    var time15minInMs = 15 * 60 * 1000;
    switch(this.spawn_type){

      case 101:
        start = moment(this.startTime);
        duration = moment.duration(time15minInMs); // 15min
        ret.push(new SpawnTime(start, duration, this.getNow));
        break;
      case 102:
        start= moment(this.startTime);
        duration= moment.duration(2 * time15minInMs); // 30min
        ret.push(new SpawnTime(start, duration, this.getNow));
        break;
      case 103:
        start= moment(this.startTime);
        duration= moment.duration(3 * time15minInMs); // 45min
        ret.push(new SpawnTime(start, duration, this.getNow));
        break;
      case 104:
        start= moment(this.startTime);
        duration= moment.duration(4 * time15minInMs); // 60min
        ret.push(new SpawnTime(start, duration, this.getNow));
        break;
      case 201:
        start= moment(this.startTime);
        duration = moment.duration(time15minInMs); // 15min
        ret.push(new SpawnTime(start, duration, this.getNow));

        var startMin = start.minute();
        var spawnMin = Math.floor(this.spawnPointTime);

        if(startMin === spawnMin){
          // using primary
          var start2 = moment(this.startTime).add(moment.duration(2*time15minInMs));
          var duration2 = moment.duration(time15minInMs); // 15min
          ret.push(new SpawnTime(start2, duration2, this.getNow));
        }
        else{
          debug(`DEFECT_201! pokemongo-map always scrapes at second phrase of 201`);
        }
        break;
      default: // for type 1, -1 and other

        start= moment(this.startTime),
        duration= moment.duration(15 * 60 * 1000) // 15min
        ret.push(new SpawnTime(start, duration, this.getNow));
        break;
    }

    return ret;
  };
};

module.exports = Spawn;
