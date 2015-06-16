/**
 * Module dependencies.
 */

var util = require('util');
var netPing = require ("ping");
var BasePoller = require('../basePoller');
var url = require('url');
/**
 * Ping Poller, to check services via ICMP ECHO
 *
 * @param {Mixed} Poller Target (e.g. URL)
 * @param {Number} Poller timeout in milliseconds. Without response before this duration, the poller stops and executes the error callback.
 * @param {Function} Error/success callback
 * @api   public
 */
function Pingpoller(target, timeout, callback) {
  Pingpoller.super_.call(this, target, timeout, callback);
}

util.inherits(Pingpoller, BasePoller);

Pingpoller.type = 'ping';

Pingpoller.validateTarget = function(target) {
  return true;
//  var reg = new RegExp('udp:\/\/(.*):(\\d{1,5})');
//  return reg.test(target);
};

Pingpoller.prototype.initialize = function() {
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
Pingpoller.prototype.poll = function() {
  Pingpoller.super_.prototype.poll.call(this);
  var ping = new Buffer(JSON.stringify({'command': 'ping'}));
  var poller = this;
  netPing.sys.probe(poller.target.address, function(isAlive) {
    if (isAlive) {
      poller.timer.stop();
      poller.debug(poller.getTime() + 'ms - Got response from ' + poller.target);
      poller.callback(undefined, poller.getTime(), poller.target);
    } else {
      poller.onErrorCallback({name: "NotAlive", message: poller.target.address + " did not respond."})
    }
  });
};

/**
 * Timeout callback
 *
 * @api   private
 */
Pingpoller.prototype.timeoutReached = function() {
  Pingpoller.super_.prototype.timeoutReached.call(this);
};

module.exports = Pingpoller;
