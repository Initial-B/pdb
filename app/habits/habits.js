'use strict';

angular.module('pdb.habits', [])

.controller('HabitsCtrl', ['$scope', 'habitsAPI',
	function($scope, habitsAPI) {
		
		$scope.habitLogEntry = {
			logDate: '',
			score: 0.00
		};
		
		$scope.submitHabitLogEntry = function(habitLog){
			habitsAPI.submitHabitLog(habitLog);
		};
		
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