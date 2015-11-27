(function () {
    'use strict';

    var serviceID = 'habitsAPI';
	var ns = 'pdb.' + serviceID;
	
	angular.module('pdb').factory(serviceID, ['$http', 'userAPI', habitsAPI]);
	function habitsAPI($http, userAPI){
	
	
		function submitHabitLog(habitLog){
			/*
				required: ownClass, opponentClass, coin, result
				- Controller can autofill ownClass on deck selection, and specify defaults for all values
			*/
			var userID = userAPI.getUserID();
			var sessionID = userAPI.getSessionID();
			console.log('submitting habit log with userID: ' + userID + ' sessionID: ' + sessionID  + ' score: ' + habitLog.score);
			return $http({
				url: 'http://apsis.me/PDB/lib/Habits/Habits_cc.php',
				method: 'POST',
				data: {
					action: 'submitHabitLog',
					userID: userID,
					sessionID: sessionID,
					logDate: habitLog.logDate,
					score: habitLog.score
				}
			}).then(
				function(response){
					console.log('server response: ' + JSON.stringify(response.data));
					if(response.data['newSessionID']){
						userAPI.setSessionID(response.data['newSessionID']);
						if(response.data['responseCode'] == 'success'){
							//do something? or handle in calling controller
						}
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
		
		//returns the current user's habit log history starting with the specified date
		//	if seasonID is 0, returns all matches
		function getHabitLogs(startDate){
			var userID = userAPI.getUserID();
			var sessionID = userAPI.getSessionID();
			console.log('getting habit logs for userID: ' + userID + " SID: " + sessionID
				+ ' startDate: ' + startDate);
			return $http({
				url: 'http://apsis.me/PDB/lib/Habits/Habits_cc.php',
				method: 'POST',
				data: {
					action: 'getHabitLogs',
					userID: userID,
					sessionID: sessionID,
					startDate: startDate,
				}
			}).then(
				function(response){
					//console.log('server response: ' + JSON.stringify(response.data));
					if(response.data['newSessionID']){
						userAPI.setSessionID(response.data['newSessionID']);
						if(response.data['responseCode'] == 'success'){
							//do something? or handle in calling controller
						}
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
	
		return{
			submitHabitLog: submitHabitLog,
			getHabitLogs: getHabitLogs
		}
	};
})();