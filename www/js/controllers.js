/* global  angular*/
'use strict';
angular.module('starter.controllers', [])

.controller('QRCtrl', function($scope, QRService) {

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



.controller('DashCtrl', function($scope) {
})

.controller('BletagCtrl', function($scope, BletagService) {
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

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Friends) {
  $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function($scope) {
});



