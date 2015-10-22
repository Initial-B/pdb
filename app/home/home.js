'use strict';

angular.module('pdb')

.controller('HomeCtrl', ['$scope', 'userAPI', function($scope, userAPI) {
	//test
	$scope.userID = userAPI.getUserID();
	$scope.lastUserID = userAPI.getLastUserID();
	$scope.sessionID = userAPI.getSessionID();

	$scope.isLoggedIn = userAPI.isLoggedIn();
	$scope.userLogin = {
		username: '',
		password: ''
	};
	
	//called by loginForm
	$scope.login = function(userLogin){
		userAPI.login(userLogin.username,userLogin.password).then(
			function(response){
				if(response.data['responseCode'] == 'success'){
					location.reload();
				}//else display some login error message
			}
		);
	};
	$scope.logout = function(){
		userAPI.logout(userAPI.getUserID(), userAPI.getSessionID()).then(
			function(){
				location.reload();
			}
		);
	};
	
	$scope.getUserInfo = function(){
		userAPI.getUserInfo($scope.userID, $scope.sessionID).then(
			function(data, status){
				//TODO: do something with results involving $scope.devStats
			}
		);	
	};
	
	$scope.devStats = {
		deviceReady: false,
		userAgent: 'unknown',
		screenDimensions: 'unknown',
		windowDimensions: 'unknown',
		deviceOrientation: 'portrait',
		userEmail: '',
	};
}]);