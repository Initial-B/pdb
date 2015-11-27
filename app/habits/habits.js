'use strict';

angular.module('pdb.habits', ['chart.js', 'ngMessages'])
.config(['ChartJsProvider', function (ChartJsProvider) {
	// Configure all charts
	ChartJsProvider.setOptions({
		//colours: ['#FF5252', '#FF8A80'],
		//responsive: false
	});
	// Configure all line charts
	ChartJsProvider.setOptions('Line', {	
		bezierCurve : false, //Whether the line is curved between points
		datasetFill: false //whether to fill the dataset with a color
	});
}])
/*
	validation directives
	TODO: combine input disabler code into these directives
*/
//validate score based on scoreInputType
.directive("score", function() {
	return {
		restrict: "A",
		require: "ngModel",
		link: function(scope, element, attributes, ngModel) {
			ngModel.$validators.scorePercent = function(scorePercent) {
				if(!element.prop("disabled")
				&& scorePercent != null){
					console.log('validating percentage score: ' + scorePercent
						+ '  result: ' + (scorePercent >= 0 && scorePercent <= 100));
					return (scorePercent >= 0 && scorePercent <= 100);
				}else{
					console.log('scorePercent element is null, no need to validate');
					return true;
				}
				
			}
		}
	};
})
/*
//example of directive  that accesses multiple form inputs
.directive('scoreInputOption', function(){
	return{
		require: ['^form', 'ngModel'],
		restrict: 'A',
		link: function (scope, element, attrs, controllers) {
			var form = controllers[0];
			var ngModel = controllers[1];
			var scoreInputChangeListener = function(event){
				console.log('change on ' + attrs.scoreInputOption);
				if(form){
					if(attrs.scoreInputOption == 'score'){
						console.log('changing value of score to ' + ngModel.$viewValue);
						console.log('input model: ' + JSON.stringify(ngModel));
					}
				}
			};
			element.bind('change', scoreInputChangeListener)
		}
	};
})
*/
.controller('HabitsCtrl', ['$scope', 'habitsAPI',
	function($scope, habitsAPI) {
		$scope.chartUtils = PDB.chartUtils;
		
		$scope.habitTimeframe = 30;
		$scope.scoreInputType = 'points';
		$scope.score = '';
		$scope.maxScore = '';
		
		/*
		$scope.habitLogEntryForm = {
			logDate: '',
			scoreInputType: null,
			score: null,
			maxScore: 100,
		};
		*/

		$scope.submitHabitLogEntryForm = function(){
			//TODO: validate form inputs
			
			var calculatedScore;
			if($scope.scoreInputType == 'percent'){
				$scope.maxScore = 100;
			}
			
			calculatedScore = $scope.score / $scope.maxScore;
			
			//create habitLog 
			var habitLogEntry = {
				logDate: $scope.logDate,
				score: calculatedScore
			}
			
			habitsAPI.submitHabitLog(habitLogEntry).then(
				function(response){
					if(response.data['responseCode'] == 'success'){
						$scope.getRecentHabitLogs($scope.habitTimeframe);
					}
				}
			);
		};
		
		//get habit logs from $daysAgo days ago and display on chart
		$scope.getRecentHabitLogs = function(daysAgo){
			var startDate = '0000-00-00';//default startDate ("all time")
			if(!daysAgo){
				daysAgo = $scope.habitTimeframe;
			}
			if(daysAgo >= 0){
				//get formatted relative date using moment.js
				startDate = moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');
			}
			console.log('calling habitsAPI.getHabitLogs() with startDate: ' + startDate);
			
			habitsAPI.getHabitLogs(startDate).then(
				function(response){
					if(response.data['responseCode'] == 'success'){
						$scope.recentHabitLogs = response.data['habitLogs'];
						//console.log('recentHabitLogs: ' + JSON.stringify($scope.recentHabitLogs));
					}//else display some error message
					
					var labels = [];
					var data = [[]];
					var count = 0;
					//console.log('reading recentHabitLogs');
					//var debugMsg = '';
					for(var key in $scope.recentHabitLogs){
						labels[count] = $scope.recentHabitLogs[key]['logDate'];
						data[0][count] = $scope.recentHabitLogs[key]['score'];
						//debugMsg += '{' + labels[count] + ', ' + data[0][count] + '}, ';
						count++;
					}
					//console.log(debugMsg);
					
					$scope.labels = labels;
					$scope.data = data;
					$scope.series = ['Habit Score'];
				}
			);
		};
		
	//private functions
		//TODO: chart labels filter function in PDB.chartUtils
		

	//init functions

		//initial page setup: show habit scores for past month
		$scope.getRecentHabitLogs($scope.habitTimeframe);

		/*
		 $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
		 $scope.data = [[65, 59, 80, 81, 56, 55, 40]];
		 $scope.series = ['Series A'];
		 */
	}
]);