'use strict';

angular.module('pdb')

.controller('HomeCtrl', ['$scope', 'userAPI', 'habitsAPI', function($scope, userAPI, habitsAPI) {
	//test
	$scope.userID = userAPI.getUserID();
	$scope.lastUserID = userAPI.getLastUserID();
	$scope.sessionID = userAPI.getSessionID();

	$scope.isLoggedIn = userAPI.isLoggedIn();
	$scope.userLogin = {
		username: userAPI.getLastUserID(),
		password: ''
	};
	
	$scope.devStats = {
		deviceReady: false,
		userAgent: 'unknown',
		screenDimensions: 'unknown',
		windowDimensions: 'unknown',
		deviceOrientation: 'portrait',
		userEmail: '',
		averageHabitScore: 0,
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
			function(response){
				console.log('getUserInfo response: ' + PDB.utils.stringifySafe(response));
			//TODO: do something with results involving $scope.devStats				
				if(response
				&& response.data
				&& response.data['responseCode'] == 'success'){
					habitsAPI.averageScore(14).then(function(result){
						$scope.devStats.averageHabitScore = parseFloat(result).toFixed(2);
						console.log('[home.js] $scope.devStats.averageHabitScore: '
						+ PDB.utils.stringifySafe($scope.devStats.averageHabitScore));
					});
				}
				
			}
		);	
	};

}]);