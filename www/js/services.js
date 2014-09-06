/* global  angular, cordova*/
'use strict';
angular.module('starter.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' }
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  };
})

.factory('BletagService', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var censorValues = [
    { id: 0, name: '環境温度', value:30 },
    { id: 1, name: '紅外線温度', value:30 },
    { id: 2, name: '水平儀', value:-1 }
  ];

  var devices = [
    { id: 0, name: 'TiTag', address: "aaa", rssi:30 }
  ];

  return {
    discoveredDevice: function() {
      return devices;
    },
    allCensorValue: function() {
      return censorValues;
    }
  };
})

.factory('QRService', function($q) {
  return {
    scan: function(){
      var appKey = '/nBB9DMAEeSFe9woVdXszmxqOJtWg8aUzB69A3lnXNA';
      var deferred = $q.defer();
      cordova.exec(
        function (resultArray){
          deferred.resolve(resultArray);
        },
       function (error){
          deferred.reject(error);
       }, 
       'ScanditSDK', 
       'scan',
           [appKey,
           {'beep': true,
            '1DScanning' : true,
            '2DScanning' : true}]
       );
      return deferred.promise;
    }
  };
})
;


