'use strict';

angular.module('pdb.login', [])

.controller('LoginModalCtrl', ['$scope','userAPI', 
	function($scope, userAPI){
		this.cancel = function(reason){
			$scope.$dismiss(reason);//result promise is rejected. use $dismiss(reason) to reject with an error
		};
	  this.submit = function (userID, password) {
		userAPI.login(userID, password)
		.then(function (user) {
			console.log('[loginModal.js] completed userAPI.login with result: '
				+	PDB.utils.stringifySafe(user));
			$scope.$close(user);//result promise is resolved
		});
		//.catch(function(){
		//	console.log('[loginModal.js] caught login'
		//});
		
	  };
	}
]);