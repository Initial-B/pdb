(function () {
    'use strict';

    var serviceID = 'habitsAPI';
	var ns = 'pdb.' + serviceID;
	
	angular.module('pdb').factory(serviceID, ['$http', 'userAPI', habitsAPI]);
	function habitsAPI($http, userAPI){
		/*
			required: ownClass, opponentClass, coin, result
			- Controller can autofill ownClass on deck selection, and specify defaults for all values
		*/
		function submitHabitLog(habitLog){
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
						console.log('habitsAPI.getHabitLogs returned new sessionID: ' + response.data['newSessionID'] + ', setting as user sID');
						
						//if(response.data['responseCode'] == 'success'){
							//do something? or handle in calling controller
						//}
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
						console.log('habitsAPI.getHabitLogs returned new sessionID: ' + response.data['newSessionID'] + ', setting as user sID');
						//if(response.data['responseCode'] == 'success'){
							//do something? or handle in calling controller
						//}
					}
					//TEST: resend request on invalid session
					else if(response.data['responseMessage'] 
					&& response.data['responseMessage'].startsWith(userAPI.constants.ERROR_INVALID_SESSION)){
						console.log('invalid session, calling userAPI.loginPrompt()');
						return userAPI.loginPrompt().then(
							function successCallback(result){
								//resend request if login was successful
								//TODO: check if login successful in loginPrompt?
								if(result.data
								&& result.data.responseCode === "success"){
									console.log('[habitsAPI.js] loginPrompt result: '
									+ PDB.utils.stringifySafe(result) + ' resending getHabitLogs() request');
									return getHabitLogs(startDate);
								}
							},
							function errorCallback(reason){
								console.log('[habitsAPI.js] loginPrompt failure callback reached for reason: '
								+ PDB.utils.stringifySafe(reason));
							}
						);
					}
					return response;
				}
			).catch(
				function(response) {
					console.log('error response: ' + PDB.utils.stringifySafe(response));
					//console.log('status: ' + response.status
					//+ ' data: ' + JSON.stringify(response.data));
					return response;
				}
			);
		};
		
		
		//trims 0-score logs from start and end
		function trimHabitLogs(habitLogs, trimStart, trimEnd){
			console.log('habitsAPI.trimHabitLogs() before: ' + PDB.utils.stringifySafe(habitLogs));
			var firstNonZeroLogIndex = 0;
			var lastNonZeroLogIndex = habitLogs.length-1;
			if(trimStart){
				for(var x = 0;x < habitLogs.length;x++){
					if(parseFloat(habitLogs[x]['score']) !== 0){
						firstNonZeroLogIndex = x;
						break;
					}
				}
			}
			if(trimEnd){
				for(var x = habitLogs.length-1;x >= 0;x--){
					if(parseFloat(habitLogs[x]['score']) !== 0){
						lastNonZeroLogIndex = x;
						break;
					}
				}
			}
			var trimmedLogs = [];
			var index = 0;
			for(var x = firstNonZeroLogIndex;x <= lastNonZeroLogIndex;x++){
				trimmedLogs[index] = habitLogs[x];
				index++;
			}
			console.log('habitsAPI.trimHabitLogs() after: ' + PDB.utils.stringifySafe(trimmedLogs));
			return trimmedLogs;
		};

		
		function daysAgoToDate(daysAgo){
			return moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');
		};
		
		/*
			return the average score over the duration (inclusive)
		*/
		function averageScore(daysAgo){
			var startDate = daysAgoToDate(daysAgo);
			return getHabitLogs(startDate).then(
				function(response){
					var sum = 0;
					var averageScore = -1;
					if(response
					&& response.data
					&& response.data['responseCode'] == 'success'){
						var habitLogs = response.data['habitLogs'];
						for(var x = 0;x < habitLogs.length;x++){
							sum += parseFloat(habitLogs[x]['score']);
						}
						averageScore = sum/(habitLogs.length);
					}
					console.log('average habit score: ' + averageScore);
					return averageScore;
				});
		};
		
		return{
			submitHabitLog: submitHabitLog,
			getHabitLogs: getHabitLogs,
			trimHabitLogs: trimHabitLogs,
			daysAgoToDate: daysAgoToDate,
			averageScore: averageScore
		}
	};
})();