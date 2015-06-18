/**
 * Module dependencies.
 */

var util = require('util');
var BasePoller = require('../basePoller');
var url = require('url');
var request = require('request');
var config = require('config');

/**
 * KVS Poller, to check kvs.io services.
 *
 * @param {Mixed} Poller Target (e.g. URL)
 * @param {Number} Poller timeout in milliseconds. Without response before this duration, the poller stops and executes the error callback.
 * @param {Function} Error/success callback
 * @api   public
 */
function Kvspoller(target, timeout, callback) {
  Kvspoller.super_.call(this, target, timeout, callback);
}

util.inherits(Kvspoller, BasePoller);

Kvspoller.type = 'kvs';

Kvspoller.validateTarget = function(target) {
  return true;
//  var reg = new RegExp('udp:\/\/(.*):(\\d{1,5})');
//  return reg.test(target);
};

Kvspoller.prototype.initialize = function() {
  var host = this.target
  var u = url.parse(host);

  this.target = {
    'address': u.hostname || u.path
  };
};

/**
 * Launch the actual polling
 *
 * @api   public
 */

Kvspoller.prototype.poll = function() {
  Kvspoller.super_.prototype.poll.call(this);
  var kvs_url = "http://" + this.target.address + "/" + config.kvs.bucket + "/" + config.kvs.key;
  var poller = this;
  this.request = request(kvs_url, function(err, res, body) {
    if (err) {
      poller.onErrorCallback({name: "Error", message: poller.target.address + " errored: " + err})
    } else if (body == config.kvs.value) {
      poller.timer.stop();
      poller.debug(poller.getTime() + 'ms - Got response from ' + poller.target);
      poller.callback(undefined, poller.getTime(), poller.target);
    } else {
      poller.onErrorCallback({name: "WrongValue", message: poller.target.address + " returned '" + body + "' instead of '" + config.kvs.value + "'"});
    }
  });
  
  this.request.on('error', this.onErrorCallback.bind(this));
};

/**
 * Timeout callback
 *
 * @api   private
 */
Kvspoller.prototype.timeoutReached = function() {
  Kvspoller.super_.prototype.timeoutReached.call(this);
};

module.exports = Kvspoller;
