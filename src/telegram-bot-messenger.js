'use strict';
var debug = require('debug')('telegram-bot-messenger');


var TelegramBot = require('node-telegram-bot-api');
var telegram_token = '239593793:AAHw32Ug9h3X2n9K5tn9gJpVBVqFxr30Vag';
var telegram_chat_id = '@twcustome1';

class TelegramBotMessenger{
  constructor(config){
    /*
    {
			"active": "True",
			"type":"telegram",
			"bot_token":"239593793:AAHw32Ug9h3X2n9K5tn9gJpVBVqFxr30Vag",
			"chat_id":"@twcustome1",
			"title": "<pkmn> (<id>) <addr>",
			"url": "<gmaps>",
			"body": "to <12h_time> (<time_left> remains)!"
		}
    */
    debug(`[+] creating telegram bot [chat_id:${config.chat_id}]`);
    this.bot_token = config.bot_token;
    this.chat_id = config.chat_id ;
    this.bot = new TelegramBot(telegram_token, {polling: false});
    debug('[+] creating telegram bot done');
  }



  handleSpawn(pokemon){
    debug('[+] handle pokemon spawn');

    return new Promise(function(resolve,reject){

      this.bot.sendLocation(this.chat_id, pokemon.latitude, pokemon.longitude, {disable_notification: !pokemon.notify})
        .then((success)=>{
          debug(`[+] finish sending map`);

          this.bot.sendMessage(this.chat_id, pokemon.message, {parse_mode:'HTML', disable_notification: !pokemon.notify})
            .then(success=>{
              debug(`[+] finish sending message`);
              resolve(success);
            },error=>{
              debug(`[-] failed sending message ${error}`);
              reject(error);
            });

        },
        (failed)=>{
          debug(`[-] failed sending map ${failed}`);
          reject(failed);
        }
      );

    }.bind(this));
  }
};

module.exports = TelegramBotMessenger;
