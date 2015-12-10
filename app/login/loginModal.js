'use strict';

angular.module('pdb.login', [])

.controller('LoginModalCtrl', ['$scope','userAPI', 
	function($scope, userAPI){
	  this.cancel = $scope.$dismiss;

	  this.submit = function (userID, password) {
		userAPI.login(userID, password)
		.then(function (user) {
			console.log('[loginModal.js] completed userAPI.login with result: '
				+	PDB.utils.stringifySafe(user));
			$scope.$close(user);
		});
		//.catch(function(){
		//	console.log('[loginModal.js] caught login'
		//});
		
	  };
	}
]);