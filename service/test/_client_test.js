// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

var assert = require('chai').assert;
var Amqp = require('../lib/amqp.js');
var Client = require('../lib/client.js');
var Message = require('azure-iot-common').Message;
var SimulatedAmqp = require('./amqp_simulated.js');
var transportSpecificTests = require('./_client_common_testrun.js');

describe('Client', function () {
  describe('#constructor', function () {
    /*Tests_SRS_NODE_IOTHUB_CLIENT_05_001: [The Client constructor shall throw ReferenceError if the transport argument is falsy.]*/
    it('throws when transport is falsy', function () {
      assert.throws(function () {
        return new Client();
      }, ReferenceError, 'transport is \'undefined\'');
    });
  });

  describe('#fromConnectionString', function () {
    var connStr = 'HostName=a.b.c;SharedAccessKeyName=name;SharedAccessKey=key';

    /*Tests_SRS_NODE_IOTHUB_CLIENT_05_002: [The fromConnectionString method shall throw ReferenceError if the connStr argument is falsy.]*/
    it('throws when value is falsy', function () {
      assert.throws(function () {
        return Client.fromConnectionString();
      }, ReferenceError, 'connStr is \'undefined\'');
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_05_003: [Otherwise, it shall derive and transform the needed parts from the connection string in order to create a new instance of the default transport (azure-iothub.Transport).]*/
    it('creates an instance of the default transport', function () {
      var client = Client.fromConnectionString(connStr);
      assert.instanceOf(client._transport, Amqp);
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_05_004: [The fromConnectionString method shall return a new instance of the Client object, as by a call to new Client(transport).]*/
    it('returns an instance of Client', function () {
      var client = Client.fromConnectionString(connStr);
      assert.instanceOf(client, Client);
    });
  });

  describe('#fromSharedAccessSignature', function () {
    var token = 'SharedAccessSignature sr=hubName.azure-devices.net&sig=signature&skn=keyname&se=expiry';

    /*Tests_SRS_NODE_IOTHUB_CLIENT_05_005: [The fromSharedAccessSignature method shall throw ReferenceError if the sharedAccessSignature argument is falsy.]*/
    it('throws when value is falsy', function () {
      assert.throws(function () {
        return Client.fromSharedAccessSignature();
      }, ReferenceError, 'sharedAccessSignature is \'undefined\'');
    });

    it('correctly populates the config structure', function() {
      var client = Client.fromSharedAccessSignature(token);
      assert.equal(client._transport._config.hubName, 'hubName');
      assert.equal(client._transport._config.host, 'hubName.azure-devices.net');
      assert.equal(client._transport._config.keyName, 'keyname');
      assert.equal(client._transport._config.sharedAccessSignature, token);
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_05_006: [Otherwise, it shall derive and transform the needed parts from the shared access signature in order to create a new instance of the default transport (azure-iothub.Transport).]*/
    it('creates an instance of the default transport', function () {
      var client = Client.fromSharedAccessSignature(token);
      assert.instanceOf(client._transport, Amqp);
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_05_007: [The fromSharedAccessSignature method shall return a new instance of the Client object, as by a call to new Client(transport).]*/
    it('returns an instance of Client', function () {
      var client = Client.fromSharedAccessSignature(token);
      assert.instanceOf(client, Client);
    });
  });

  describe('#send', function () {
    var testSubject;

    beforeEach('prepare test subject', function () {
      testSubject = new Client({}, {});
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_05_013: [The send method shall throw ReferenceError if the deviceId or message arguments are falsy.]*/
    it('throws if deviceId is falsy', function () {
      assert.throws(function () {
        testSubject.send();
      }, ReferenceError, 'deviceId is \'undefined\'');
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_05_013: [The send method shall throw ReferenceError if the deviceId or message arguments are falsy.]*/
    it('throws if message is falsy', function () {
      assert.throws(function () {
        testSubject.send('id');
      }, ReferenceError, 'message is \'undefined\'');
    });

    it('does not throw if done is falsy', function () {
      assert.doesNotThrow(function () {
        testSubject.send('id', new Message('msg'));
      }, ReferenceError);
    });
  });

  describe('#invokeDeviceMethod', function() {
    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_005: [The `invokeDeviceMethod` method shall throw a `ReferenceError` if `deviceId` is `null`, `undefined` or an empty string.]*/
    [undefined, null, ''].forEach(function(badDeviceId) {
      it('throws if \'deviceId\' is \'' + badDeviceId + '\'', function() {
        var client = new Client({}, {});
        assert.throws(function() {
          client.invokeDeviceMethod(badDeviceId, 'method', { foo: 'bar' }, 42, function() {});
        }, ReferenceError);
      });
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_006: [The `invokeDeviceMethod` method shall throw a `ReferenceError` if `methodName` is `null`, `undefined` or an empty string.]*/
    [undefined, null, ''].forEach(function(badMethodName) {
      it('throws if \'methodName\' is \'' + badMethodName + '\'', function() {
        var client = new Client({}, {});
        assert.throws(function() {
          client.invokeDeviceMethod('deviceId', badMethodName, { foo: 'bar' }, 42, function() {});
        }, ReferenceError);
      });
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_007: [The `invokeDeviceMethod` method shall throw a `TypeError` if `methodName` is not a `string`.]*/
    [{}, function(){}, 42].forEach(function(badMethodType) {
      it('throws if \'methodName\' is of type \'' + badMethodType + '\'', function() {
        var client = new Client({}, {});
        assert.throws(function() {
          client.invokeDeviceMethod('deviceId', badMethodType, { foo: 'bar' }, 42, function() {});
        }, TypeError);
      });
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_009: [The `invokeDeviceMethod` method shall initialize a new instance of `DeviceMethod` with the `methodName` and `timeout` values passed in the arguments.]*/
    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_010: [The `invokeDeviceMethod` method shall use the newly created instance of `DeviceMethod` to invoke the method with the `payload` argument on the device specified with the `deviceid` argument .]*/
    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_013: [The `invokeDeviceMethod` method shall call the `done` callback with a `null` first argument, the result of the method execution in the second argument, and the transport-specific response object as a third argument.]*/
    it('uses the DeviceMethod client to invoke the method', function(testCallback) {
      var fakeResult = { foo: 'bar' };
      var fakeResponse = { statusCode: 200 };
      var fakeRestClient = {
        executeApiCall: function(method, path, headers, body, timeout, callback) {
          callback(null, fakeResult, fakeResponse);
        }
      };
      var client = new Client({}, fakeRestClient);

      client.invokeDeviceMethod('deviceId', 'method', {}, 42, function(err, result, response) {
        assert.isNull(err);
        assert.equal(result, fakeResult);
        assert.equal(response, fakeResponse);
        testCallback();
      });
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_012: [The `invokeDeviceMethod` method shall call the `done` callback with a standard javascript `Error` object if the request failed.]*/
    it('works when payload and timeout are omitted', function(testCallback) {
      var fakeError = new Error('fake error');
      var fakeRestClientFails = {
        executeApiCall: function(method, path, headers, body, timeout, callback) {
          callback(fakeError);
        }
      };
      var client = new Client({}, fakeRestClientFails);

      client.invokeDeviceMethod('deviceId', 'method', function(err) {
        assert.equal(err, fakeError);
        testCallback();
      });
    });

    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_011: [The `payload` and `timeout` arguments are optional, meaning that:
    - If payload is a function and timeout and done are undefined, payload shall be used as the callback, the actual payload shall be null, and the the timeout should be set to the default (30 seconds)
    - If timeout is a function, and done is undefined, timeout shall be used as the callback and the actual timeout shall be set to the default (30 seconds). the payload shall be set to the value of the payload argument.]*/
    it('works when payload and timeout are omitted', function(testCallback) {
      var fakeRestClient = {
        executeApiCall: function(method, path, headers, body, timeout, callback) {
          callback();
        }
      };
      var client = new Client({}, fakeRestClient);

      client.invokeDeviceMethod('deviceId', 'method', testCallback);
    });

    it('throws a TypeError if payload is a function and timeoutInSeconds and done are not undefined', function() {
      var client = new Client({}, {});
      assert.throws(function() {
        client.invokeDeviceMethod('deviceId', 'method', function() {}, 'foo', 'bar');
      }, TypeError);
    });
    
    it('throws a TypeError if payload is a function and timeoutInSeconds and done are not undefined', function() {
      var client = new Client({}, {});
      assert.throws(function() {
        client.invokeDeviceMethod('deviceId', 'method', { foo: 'bar' }, function() {}, 'foo');
      }, TypeError);
    });

    it('works when timeout is omitted', function(testCallback) {
      var fakeRestClient = {
        executeApiCall: function(method, path, headers, body, timeout, callback) {
          callback();
        }
      };
      var client = new Client({}, fakeRestClient);

      client.invokeDeviceMethod('deviceId', 'method', {}, testCallback);
    });
  });

  describe('#open', function() {
    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_004: [The `disconnect` event shall be emitted when the client is disconnected from the server.]*/
    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_002: [If the transport successfully establishes a connection the `open` method shall subscribe to the `disconnect` event of the transport.]*/
    it('subscribes to the \'disconnect\' event once connected', function(done) {
      var simulatedAmqp = new SimulatedAmqp();
      var client = new Client(simulatedAmqp, {});
      client.open(function() {
        client.on('disconnect', function() {
          done();
        });

        simulatedAmqp.emit('disconnect');
      });
    });
  });

  describe('#close', function() {
    /*Tests_SRS_NODE_IOTHUB_CLIENT_16_003: [The `close` method shall remove the listener that has been attached to the transport `disconnect` event.]*/
    it('unsubscribes for the \'disconnect\' event when disconnecting', function(done) {
      var simulatedAmqp = new SimulatedAmqp();
      var client = new Client(simulatedAmqp, {});
      var disconnectReceived = false;
      client.open(function() {
        client.on('disconnect', function() {
          disconnectReceived = true;
        });
        client.close(function() {
          simulatedAmqp.emit('disconnect');
          assert.isFalse(disconnectReceived);
          done();
        });
      });
    });
  });
});

var fakeRegistry = {
  create: function(device, done) { done(); },
  delete: function(deviceId, done) { done(); }
};

describe('Over simulated AMQP', function () {
  var opts = {
    transport: function () { return new SimulatedAmqp(); },
    connectionString: process.env.IOTHUB_CONNECTION_STRING,
    registry: fakeRegistry
  };
  transportSpecificTests(opts);
});