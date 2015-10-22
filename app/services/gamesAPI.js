(function () {
    'use strict';

    var serviceID = 'gamesAPI';
	var ns = 'hearthboard.' + serviceID;
	
	angular.module('pdb').factory(serviceID, ['$http', 'userAPI', gamesAPI]);
	function gamesAPI($http, userAPI){
		
		var HS_CLASSES = [
				'Druid','Hunter','Mage',
				'Paladin','Priest','Rogue',
				'Shaman','Warlock','Warrior'
			];
			
		function submitConstructedMatch(match){
			/*
				required: ownClass, opponentClass, coin, result
				- Controller can autofill ownClass on deck selection, and specify defaults for all values
			*/
			var userID = userAPI.getUserID();
			var sessionID = userAPI.getSessionID();
			console.log('submitting constructed match with userID: ' + userID + ' sessionID: ' + sessionID + ' ownClass: ' + match.ownClass + ' opponentClass: ' + match.opponentClass + ' coin: ' + match.coin + ' result: ' + match.result);
			return $http({
				url: 'http://apsis.me/Hearthboard/lib/Constructed/Constructed_cc.php',
				method: 'POST',
				data: {
					action: 'submitConstructedMatch',
					userID: userID,
					sessionID: sessionID,
					ownClass: match.ownClass,
					deckID: (match.deckID ? match.deckID : ''),
					opponentClass: match.opponentClass,
					coin: match.coin,
					result: match.result,
					comments: (match.comments ? match.comments : ''),
					seasonID: (match.seasonID ? match.seasonID : 0)
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
		
		//returns the current user's constructed match history for the specified season
		//	if seasonID is 0, returns all matches
		function getConstructedMatches(seasonID){
			var userID = userAPI.getUserID();
			var sessionID = userAPI.getSessionID();
			console.log('getting constructed matches for userID: ' + userID  + ' seasonID: ' + seasonID + ' sessionID: ' + sessionID);
			return $http({
				url: 'http://apsis.me/Hearthboard/lib/Constructed/Constructed_cc.php',
				method: 'POST',
				data: {
					action: 'getConstructedMatches',
					userID: userID,
					sessionID: sessionID,
					seasonID: (seasonID ? seasonID : 0)
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
		
		return{
			HS_CLASSES: HS_CLASSES,
			submitConstructedMatch: submitConstructedMatch,
			getConstructedMatches: getConstructedMatches
		}
	};
})();