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
*/
//percentile must be between 0.00 and 100.00
.directive("percentile", function() {
	return {
		restrict: "A",
		require: "?ngModel",
		link: function(scope, element, attributes, ngModel) {
			ngModel.$validators.percentile = function(scorePercentile) {
				//console.log('validating percentile score: ' + scorePercentile);
				return (scorePercentile >= 0 && scorePercentile <= 100);
			}
		}
	};
})	
/*
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
		$scope.habitLogEntryForm = {
			logDate: '',
			scorePercentile: null,
			scorePercentileDisabled: false,
			scoreLower: null,
			scoreLowerDisabled: false,
			scoreUpper: null,
			scoreUpperDisabled: false,
			logDateValidation: {
				error: false,
				message: ''
			},
			scoreValidation: {
				error: false,
				message: ''
			}
		};
		
		/*
		- if a percentile score is entered, the X-out-of-Y fields will be disabled
		- if either X or Y is entered, then the percentile field will be disabled
		- if percentile is blank (empty or whitespace only), then X and Y will be enabled
		- if both X and Y are blank, then percentile will be enabled
		
		TODO: update scoreValidationMessage 
		*/
		$scope.$watch('habitLogEntryForm.scorePercentile',
			function handleScoreChange(newValue, oldValue ) {
				if(newValue != null){
					if(newValue.trim() != ''){
						$scope.habitLogEntryForm.scoreLowerDisabled = true;
						$scope.habitLogEntryForm.scoreUpperDisabled = true;
					}else{
						$scope.habitLogEntryForm.scoreLowerDisabled = false;
						$scope.habitLogEntryForm.scoreUpperDisabled = false;
					}
				}
			}
		);
		$scope.$watch('habitLogEntryForm.scoreLower',
			function handleScoreLowerChange(newValue, oldValue ) {
				if(newValue != null){
					if(newValue.trim() != ''){
						$scope.habitLogEntryForm.scorePercentileDisabled = true;
					}else if($scope.habitLogEntryForm.scoreUpper.trim() == ''){
						$scope.habitLogEntryForm.scorePercentileDisabled = false;
					}
				}
			}
		);
		$scope.$watch('habitLogEntryForm.scoreUpper',
			function handleScoreUpperChange(newValue, oldValue ) {
				if(newValue != null){
					if(newValue.trim() != ''){
						$scope.habitLogEntryForm.scorePercentileDisabled = true;
					}else if($scope.habitLogEntryForm.scoreLower.trim() == ''){
						$scope.habitLogEntryForm.scorePercentileDisabled = false;
					}
				}
			}
		);	
		$scope.submitHabitLogEntryForm = function(habitLogEntryForm){
			//TODO: validate form inputs
			
			var calculatedScore;
			if(habitLogEntryForm.scorePercentile != null
			&& habitLogEntryForm.scorePercentile != '')
				calculatedScore = habitLogEntryForm.scorePercentile;
			else
				calculatedScore = 100 * (habitLogEntryForm.scoreLower / habitLogEntryForm.scoreUpper);
			
			//create habitLog 
			var habitLogEntry = {
				logDate: habitLogEntryForm.logDate,
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