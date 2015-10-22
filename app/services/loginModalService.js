(function () {
    'use strict';

    var serviceID = 'loginModal';
	
	angular.module('pdb').factory(serviceID, ['$modal','$rootScope',loginModal]);
	function loginModal($modal,$rootScope){

	  function assignCurrentUser (user) {
		$rootScope.currentUser = user;
		return user;
	  }

	  return function() {
		var instance = $modal.open({
		  templateUrl: 'login/loginModalTemplate.html',
		  controller: 'LoginModalCtrl',
		  controllerAs: 'LoginModalCtrl'
		})

		return instance.result.then(assignCurrentUser);
	  };

	};

})();