'use strict';

//angular.module('pdb.habits', ['chart.js'])
angular.module('pdb.habits', ['chart.js'])
.config(['ChartJsProvider', function (ChartJsProvider) {
	// Configure all charts
	ChartJsProvider.setOptions({
		//colours: ['#FF5252', '#FF8A80'],
		//esponsive: false
	});
	// Configure all line charts
	ChartJsProvider.setOptions('Line', {	
		bezierCurve : false, //Whether the line is curved between points
		datasetFill: false //whether to fill the dataset with a color
	});
}])
.controller('HabitsCtrl', ['$scope', 'habitsAPI',
	function($scope, habitsAPI) {
		$scope.chartUtils = PDB.chartUtils;
		
		$scope.habitLogEntry = {
			logDate: '',
			score: 0.00
		};
		
		$scope.submitHabitLogEntry = function(habitLog){
			habitsAPI.submitHabitLog(habitLog);
		};
		
		//TODO: startDate field or hardcode currentDate minus 7 days
		$scope.getRecentHabitLogs = function(){
			console.log('entered $scope.getRecentHabitLogs()');
			habitsAPI.getHabitLogs('2015-11-02').then(
				function(response){
					if(response.data['responseCode'] == 'success'){
						$scope.recentHabitLogs = response.data['habitLogs'];
						console.log('recentHabitLogs: ' + JSON.stringify($scope.recentHabitLogs));
					}//else display some error message
					
					//TEST: set recentHabitLogs as chart data on scope
					var labels = [];
					var data = [[]];
					var count = 0;
					console.log('reading recentHabitLogs');
					for(var key in $scope.recentHabitLogs){
						labels[count] = $scope.recentHabitLogs[key]['logDate'];
						data[0][count] = $scope.recentHabitLogs[key]['score'];
						count++;
					}
					$scope.labels = labels;
					$scope.data = data;
					$scope.series = ['Habit Logs'];
				}
			);
		};
		
		//TODO: chart labels filter function in PDB.chartUtils
		
		//TEST: chart.js test vals
		  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
		  $scope.data = [[65, 59, 80, 81, 56, 55, 40]];
		  
		  $scope.series = ['Series A'];
		  /*
		  $scope.data = [
			[65, 59, 80, 81, 56, 55, 40],
			[28, 48, 40, 19, 86, 27, 90]
		  ];
		  */
		  $scope.onClick = function (points, evt) {
			console.log(points, evt);
		  };
	}
]);