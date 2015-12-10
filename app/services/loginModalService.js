(function () {
    'use strict';

    var serviceID = 'loginModal';
	
	angular.module('pdb').factory(serviceID, ['$modal','$rootScope',loginModal]);
	function loginModal($modal,$rootScope, callbackFunction){

	  function assignCurrentUser (loginResponse) {
		//$rootScope.currentUser = loginResponse;
		console.log('[loginModalService.js assignCurrentUser()] loginResponse: '
			+ PDB.utils.stringifySafe(loginResponse));
		return loginResponse;
	  };

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