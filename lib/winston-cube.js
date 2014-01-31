var util = require('util'),
  winston = require('winston'),
  WebSocketClient = require('websocket').client;

var Cube = winston.transports.Cube = function (options) {
  this.name = 'cube';
  this.scheme = options.scheme || 'ws';
  this.host = options.host || 'localhost';
  this.port = options.port;
  this.path = options.path || '/1.0/event/put';
   
  this.level = options.level || 'info';
};

util.inherits(Cube, winston.Transport);

Cube.prototype._request = function (message, callback) {
  // construct host
  var endpoint = this.scheme + ":" + this.host + this.port + this.path;

  var client = new WebSocketClient();
  client.on('connectFailed', function (err) {
    return callback(err);
  });

  client.on('connect', function (connection) {
    // if we're connected, send the message
    connection.on('error', function (error) {
      return callback(error);
    });

    connection.on('close', function () {
      return callback(null);
    });

    connection.on('message', function (message) {
      var event;
      try {
        event = JSON.parse(message.utf8Data);
        return callback(null, event);
      } catch (e) {
        return callback(e);
      }
    });

    if(connection.connected) {
      connection.sendUTF(message);
    }
    return callback(null);
  });
};

/*
 * ###
 */
Cube.prototype.log = function (level, msg, meta, callback) {
  var self = this;
  var payload;

  if (typeof meta === 'function') {
    callback = meta;
    meta = {};
  }

  try {
    payload = JSON.stringify(msg);
  } catch (e) {
    payload = msg;
  }

  this._request(msg, callback);
};
