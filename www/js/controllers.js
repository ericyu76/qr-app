/* global  angular*/
'use strict';
angular.module('starter.controllers', [])

.controller('QRCtrl', function($scope, QRService,Utils) {

	var myurl = "";

	$scope.doScan = function(){
		
		$scope.scanResult0 = '';
		$scope.scanResult1 = '';

		var promise = QRService.scan();
		promise.then(
			function(result) {
				$scope.scanResult0 = result[0];
				$scope.scanResult1 = result[1];
				myurl = result[0];
				var scanResult = {
					scanDate: Utils.getDateFormatStr(new Date()),
					resultValue: result[0],
					resultType: result[1]
				};

				var qrHistoryData = [];
				var qrHistoryStr = localStorage.getItem("qrHistoryData");
				if(qrHistoryStr !== null){
					qrHistoryData = JSON.parse(qrHistoryStr);
				}
				qrHistoryData.push(scanResult);
				localStorage.setItem('qrHistoryData',angular.toJson(qrHistoryData));

			},
			function(error) {
				$scope.scanResult0 = error;
			}
		);
	};

	$scope.openBrowser = function(){
		 console.log('startInAppBrowser: '+myurl);
         var ref = window.open(myurl, '_blank', 'closebuttoncaption=完成,location=no,enableViewportScale=yes,toolbarposition=top');
         ref.addEventListener('loadstart', function(event) { 
         	console.debug('start: ' + event.url); 
         });
	};
})

.controller('QRHisCtrl', function($scope) {
	var qrHistoryData = null;
	var qrHistoryStr = localStorage.getItem("qrHistoryData");
	if(qrHistoryStr !== null){
		qrHistoryData = JSON.parse(qrHistoryStr);
	}
	$scope.qrHistoryData = qrHistoryData;

})

.controller('QRRecCtrl', function($scope,$stateParams) {
	var qrHistoryData = null;
	var qrHistoryStr = localStorage.getItem("qrHistoryData");
	if(qrHistoryStr !== null){
		qrHistoryData = JSON.parse(qrHistoryStr);
		var scanResult = qrHistoryData[$stateParams.arrayIndex];
		$scope.scanDate = scanResult.scanDate;
		$scope.resultValue = scanResult.resultValue;
	}

})



.controller('DashCtrl', function($scope) {
})

.controller('BletagsCtrl', function($scope, BletagService) {
	//for html ui test
	// $scope.sensorResult = BletagService.testDevices();
    
    var promise = BletagService.discoveredDevice();
	promise.then(
		function(result) {
			$scope.sensorResult = result;
		},
		function(error) {
		},
		function(result){
			$scope.sensorResult = result;
		}
	);
})

.controller('BletagCtrl', function($scope, $stateParams, BletagService) {
    $scope.serivces = BletagService.getServices($stateParams.tagId);
})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});



