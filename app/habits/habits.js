'use strict';

//angular.module('pdb.habits', ['chart.js'])
angular.module('pdb.habits', ['chart.js'])
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
		
		//TEST: chart.js test vals
		  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
		  $scope.series = ['Series A', 'Series B'];
		  $scope.data = [
			[65, 59, 80, 81, 56, 55, 40],
			[28, 48, 40, 19, 86, 27, 90]
		  ];
		  $scope.onClick = function (points, evt) {
			console.log(points, evt);
		  };
	}
]);