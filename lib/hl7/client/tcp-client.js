const Parser = require('../hl7/parser.js');
const net = require('net');

const VT = String.fromCharCode(0x0b);
const FS = String.fromCharCode(0x1c);
const CR = String.fromCharCode(0x0d);
const RECONNECT_TIMEOUT = 30000;
/*
  断开自动重连
  定时发送心跳包
 */
function TcpClient() {
  this.options = {}
  if (arguments.length == 2) {
    this.options.host = arguments[0];
    this.options.port = arguments[1];
  }
  if (arguments.length == 1) {
    this.options = arguments[0];
  }
  this.host = this.options.host;
  this.port = this.options.port;
  this.id = this.options.id;
  this.callback = this.options.callback;
  this.onConnect = this.options.onConnect;
  this.onClose = this.options.onClose;
  this.keepalive = this.options.keepalive;
  this.responseBuffer = "";
  this.connected = false;
  this.parser = new Parser({segmentSeperator: '\r'});

  this.heartTimeout = this.options.heartTimeout;
  this.heartMsg = this.options.heartMsg;
}

TcpClient.prototype.createClient = function() {
  if ( this.client) return;

  // console.log(new Date(), '*****CreateClient*****', this.host)

  this.timeout = RECONNECT_TIMEOUT;
  const self = this;
  let client = new net.Socket();

  function makeConnection() {
    if (self.client === client) {
      console.log(new Date(), self.id, 'Reconnecting', self.host, self.port);
      client.connect({host: self.host, port: self.port});
    }
  }

  function connectEventHandler() {
    console.log(new Date(), self.id, 'Connected', self.host);
    self.connected = true;
    if (self.onConnect) self.onConnect(self);
    if (self.heartTimeout && self.heartMsg && !self.heartInterval) {
      self.heartInterval = setInterval(()=>{
        self.send(self.heartMsg);
      }, self.heartTimeout);
    }
  }

  function dataEventHandler(data) {
    self.responseBuffer += data.toString();
    if (self.responseBuffer.substring(self.responseBuffer.length - 2, self.responseBuffer.length) == FS + CR) {
      // console.log(new Date(), self.id, self.host, 'data:\n', self.responseBuffer);
      const msg = self.responseBuffer.substring(1, self.responseBuffer.length - 2);
      const ack = self.parser.parse(msg);
      self.responseBuffer = "";
      self.callback(null, self, ack);
    }
  }

  function endEventHandler() {
    console.log(new Date(), self.id, 'End', self.host);
  }

  function timeoutEventHandler() {
    console.log('timeout');
  }

  function drainEventHandler() {
    // console.log('drain');
  }

  function errorEventHandler(err) {
    // console.log('error');
    self.callback(err, self)
  }

  function closeEventHandler() {
    // console.log(new Date(), self.id, 'Closed', self.host);
    if (self.keepalive && self.client === client) {
      if (self.onClose) {
        self.onClose(self);
      }
      self.connected = false;
      setTimeout(makeConnection, self.timeout);
    }
  }

  this.client = client;
  this.client.on('connect', connectEventHandler);
  this.client.on('data', dataEventHandler);
  this.client.on('end', endEventHandler);
  this.client.on('timeout', timeoutEventHandler);
  this.client.on('drain', drainEventHandler);
  this.client.on('error', errorEventHandler);
  this.client.on('close', closeEventHandler);
}

TcpClient.prototype.connect = function (callback) {
  // console.log(new Date(), this.id,  'Connecting', this.host);
  this.keepalive = true;
  this.createClient();
  this.client.connect({host: this.host, port: this.port})
}

TcpClient.prototype.send = function (msg, callback) {
  // console.log(new Date(), this.id,  'Sending');
  var self = this;
  self.callback = callback || self.callback;
  try {
    if (self.client && self.connected) {
      self.client.write(VT + msg.toString() + FS + CR);
    } else {
      //
    }
  } catch (e) {
    self.callback(e);
  }
}

TcpClient.prototype.close = function () {
  console.log(new Date(), this.id, 'Closing', this.host);
  var self = this;
  if (self.client) {
    self.keepalive = false;
    self.responseBuffer = "";
    self.awaitingResponse = false;
    self.client.end();
    self.client.destroy();
    delete self.client;
    clearInterval(self.heartInterval);
    self.heartInterval = null;
    if (self.onClose) {
      self.onClose(self);
    }
  }
}

module.exports = TcpClient
