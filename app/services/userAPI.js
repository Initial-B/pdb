(function () {
    'use strict';

    var serviceID = 'userAPI';
	var ns = 'pdb.' + serviceID;
	
	angular.module('pdb').factory(serviceID, ['$http', '$modal','$rootScope', userAPI]);
	function userAPI($http, $modal, $rootScope){
		//set userID and sessionID from localStorage, using empty string if not set
		var userID = (window.localStorage[ns + '.userID'] ? 
			window.localStorage[ns + '.userID'] : '');
		var sessionID = (window.localStorage[ns + '.sessionID'] ?
			window.localStorage[ns + '.sessionID'] : '');
		//last userID, used to pre-fill login field
		var lastUserID = (window.localStorage[ns + '.lastUserID'] ? 
			window.localStorage[ns + '.lastUserID'] : '');
		
		
		function getUserID(){return userID;};
		function setUserID(uID){
			userID = uID;
			window.localStorage[ns + '.userID'] = uID;
		};
		
		function getSessionID(){return sessionID;};
		function setSessionID(sID){
			sessionID = sID;
			window.localStorage[ns + '.sessionID'] = sID;
		};
		
		function getLastUserID(){return lastUserID;};
		function setLastUserID(uID){
			lastUserID = uID;
			window.localStorage[ns + '.lastUserID'] = uID;
		};
		
		function isLoggedIn(){
			return !(getUserID()==='' || getSessionID()==='');
		};
		
		

		function login(uID, password){
			//console.log('entered userAPI with userID: ' + uID + ' password: ' + password);
			return $http({
				url: 'http://apsis.me/PDB/lib/SessionUtil/SessionUtil_cc.php',
				method: 'POST',
				//withCredentials: true,
				data: {
					action: 'login',
					userID: uID,
					password: password
				}
			}).then(
				function(response){
					if(response.data['responseCode'] == 'success'){
						setUserID(uID);
						setLastUserID(uID);
						setSessionID(response.data['sessionID']);
					}
					return response;
				}
			).catch(
				function(response) {
					console.log('status: ' + response.status + ' data: ' + JSON.stringify(response.data));
					return response;
				}
			);
		};
		
		//end current user session and set userID to empty string
		function logout(uID, sID){
			return $http({
				url: 'http://apsis.me/PDB/lib/SessionUtil/SessionUtil_cc.php',
				method: 'POST',
				//withCredentials: true,
				data: {
					action: 'logout',
					userID: uID,
					sessionID: sID
				}
			}).then(
				function(response) {
					setSessionID('');
					setUserID('');
					console.log('logout response: ' + response.data);
					return response;
				}
			).catch(
				function(response) {
					setSessionID('');
					console.log('logout response status: ' + response.status + ' data: ' + JSON.stringify(response.data));
					return response;
				}
			);
		};
		
		function getUserInfo(uID, sID){
			return $http({
				url: 'http://apsis.me/PDB/lib/SessionUtil/SessionUtil_cc.php',
				method: 'POST',
				//withCredentials: true,
				data: {
					action: 'getUserInfo',
					userID: uID,
					sessionID: sID
				}
			});
		};
		
		//return the deferred loginResponse from loginModal()
		function loginPrompt(){
			/*
			function assignCurrentUser (loginResponse) {
				//$rootScope.currentUser = loginResponse;
				console.log('[userAPI.js assignCurrentUser()] loginResponse: '
					+ PDB.utils.stringifySafe(loginResponse));
				return loginResponse;
			};
			*/
			var instance = $modal.open({
			  templateUrl: 'login/loginModalTemplate.html',
			  controller: 'LoginModalCtrl',
			  controllerAs: 'LoginModalCtrl'
			});
			//return instance.result.then(assignCurrentUser);
			return instance.result;
		};

		return{
			getUserID: getUserID,
			setUserID: setUserID,
			getLastUserID: getLastUserID,
			setLastUserID: setLastUserID,
			getSessionID: getSessionID,
			setSessionID: setSessionID,
			isLoggedIn: isLoggedIn,
			login: login,
			logout: logout,
			getUserInfo: getUserInfo,
			loginPrompt: loginPrompt
		};
	};
	
})();