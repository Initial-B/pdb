'use strict';

angular.module('pdb.login', [])

.controller('LoginModalCtrl', ['$scope','userAPI', 
	function($scope, userAPI){
	  this.cancel = $scope.$dismiss;

	  this.submit = function (userID, password) {
		userAPI.login(userID, password).then(function (user) {
		  $scope.$close(user);
		});
	  };
	}
]);