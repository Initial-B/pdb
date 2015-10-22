'use strict';

angular.module('pdb.constructed', [])

.controller('ConstructedCtrl', ['$scope', 'gamesAPI',
	function($scope, gamesAPI) {
		/*
		
		$scope.constructedEntry = {
			ownClass: '',
			deckID: '',
			opponentClass: '',
			coin: false,
			result: '',
			comments: '',
			seasonID: 0
		};
		$scope.hsClasses = gamesAPI.HS_CLASSES;
		
		$scope.getRecentMatches = function(){
			gamesAPI.getConstructedMatches(0).then(
				function(response){
					if(response.data['responseCode'] == 'success'){
						$scope.recentMatches = response.data['constructedMatches'];
					}//else display some error message
				}
			);
		};
		
		$scope.submitConstructedMatch = function(entry){
			gamesAPI.submitConstructedMatch(entry);
		};
		*/
}]);