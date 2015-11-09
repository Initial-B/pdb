'use strict';

angular.module('pdb.arena', [])

.controller('ArenaCtrl', ['$scope', 'habitsAPI',
	function($scope, habitsAPI) {
		
		
		
		//TODO: startDate field or hardcode [currentDate - 7 days]
		$scope.getRecentHabitLogs = function(){
			console.log('entered $scope.getRecentHabitLogs()');
			habitsAPI.getHabitLogs('2015-11-02').then(
				function(response){
					if(response.data['responseCode'] == 'success'){
						$scope.recentHabitLogs = response.data['habitLogs'];
					}//else display some error message
				}
			);
		};

}]);