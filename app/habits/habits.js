'use strict';

angular.module('pdb.habits', ['chart.js', 'ngMessages'])
/*
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
*/
.controller('HabitsCtrl', ['$scope', 'habitsAPI', 'userAPI',
	function($scope, habitsAPI, userAPI) {
	
		var model = this;
		
		$scope.habitLogEntry = {
			logDate: '',
			scoreInputType: 'points',
			score: '',
			maxScore: ''
		};
		
		$scope.testInput = '1';

		//DEBUG: test button functions
		$scope.test1 = function(){
		
			console.log('[habits.js] calling loginPrompt');
			//console.log(userAPI.loginPrompt());
			userAPI.loginPrompt().then(function(loginResponse){
				alert('loginResponse: ' + PDB.utils.stringifySafe(loginResponse));
			});
		};
		$scope.test2 = function(){

		};
		
		$scope.habitTimeframe = 30;

		//submit habit log form using HabitsAPI
		$scope.submitHabitLogEntry = function(){
			//TODO: validate form inputs
			
			var calculatedScore;
			if($scope.habitLogEntry.scoreInputType == 'percent'){
				$scope.habitLogEntry.maxScore = 100;
			}	
			calculatedScore = 100 * $scope.habitLogEntry.score / $scope.habitLogEntry.maxScore;
			
			console.log('creating habitLogEntry from form fields score: '
				+ $scope.habitLogEntry.score + ' scoreInputType: ' + $scope.habitLogEntry.scoreInputType
				+ ' maxScore: ' + $scope.habitLogEntry.maxScore);
			
			//create habitLogentry
			var habitLogEntry = {
				logDate: $scope.habitLogEntry.logDate,
				score: calculatedScore
			}
			console.log('submitting habit log entry with logDate: ' + habitLogEntry.logDate
			+ ' score: ' + habitLogEntry.score);
			habitsAPI.submitHabitLog(habitLogEntry).then(
				function(response){
					if(response.data['responseCode'] == 'success'){
						console.log('reloading page');
						document.location.reload(true);
						//$scope.getRecentHabitLogs($scope.habitTimeframe);
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
				startDate = habitsAPI.daysAgoToDate(daysAgo);
			}
			
			habitsAPI.getHabitLogs(startDate).then(
				function(response){
					//console.log('getHabitLogs response: '
					// + PDB.utils.stringifySafe(response));
					if(response
					&& response.data
					&& response.data['responseCode'] == 'success'){
						$scope.recentHabitLogs = response.data['habitLogs'];
					}//else display some error message
					
					updateHabitsLineChart();
				}
			);
		};
		
		//returns true if value is a positive float or is not set
		//TODO: this should work for general usage, but need to make tighter (along with utils.isNumber)
		$scope.checkScoreFormat = function(value){
			if(value === undefined
			|| value === null
			|| value === ''){
				return true;
			}else if(PDB.utils.isNumber(parseFloat(value))
			&& parseFloat(value) >=0){
				return true;
			}
			return false;
		};
		
//private functions
	
	//update line chart using $scope.recentHabitLogs
	var updateHabitsLineChart = function(){
		var labels = [];
		var data = [];
		var count = 0;
		for(var key in $scope.recentHabitLogs){
			labels[count] = $scope.recentHabitLogs[key]['logDate'];
			data[count] = $scope.recentHabitLogs[key]['score'];
			count++;
		}
		
		$scope.labels = labels;
		$scope.data = data;
		
		//TEST
		var ctx = document.getElementById("habitsLineChart");
		//console.log('chart context: ' + ctx);
		
		//destroy old chart instance, if exist
		if($scope.habitsLineChart){
			$scope.habitsLineChart.destroy();
		}
		$scope.habitsLineChart = new Chart(ctx, {
			type: 'line',
			//type: 'bar',
			data: {
				//labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
				labels: labels,
				datasets: [{
					label: 'Habit Score',
					//data: [12, 19, 3, 5, 2, 3]
					data: data
				}]
			},
			options:{
				scales:{
					yAxes:[{
						ticks:{beginAtZero:true}
					}],
					xAxes:[{
						ticks:{
							autoSkip: false //let the callback do the skipping
							//maxRotation: 45,
							/*
							callback: function(tickValue, index, ticks) {
								//console.log('[ticks.callback] entry point');
								//if there are more than 10 labels, only show every 4th
								if(ticks.length > 10){
									if((index % 4) === 1
									|| index === 1){
										return tickValue;
									}else{
										//console.log('index ' + index
										//+ ' blanked. tickValue: ' + tickValue);
										return '';
									}
								}
							}
							*/
						}
					}]
				}
			}
		});
	};
	
	//init functions

		//initial page setup: show habit scores for past month
		$scope.getRecentHabitLogs($scope.habitTimeframe);
	}
])
/*
	validation directives
	TODO: combine input disabler code into these directives
*/
.directive("scoreInput", function() {
    return {
        restrict: "A",  
        require: 'ngModel',
        link: function(scope, element, attributes, ngModel) {		
			//number format validator
			ngModel.$validators.scoreformat = function(modelValue){
				if(!scope.checkScoreFormat(modelValue)){
					return false;
				}
				return true;
			};
			
			//point score validator
			// - returns false if score is greater than maxScore
			ngModel.$validators.pointscore = function(modelValue) {
				var maxScore = scope.habitLogEntry.maxScore;
				if(scope.habitLogEntry.scoreInputType === 'points'){
					if(scope.checkScoreFormat(maxScore)
					&& scope.checkScoreFormat(modelValue)
					&& parseFloat(modelValue) > parseFloat(maxScore)){
						return false;
					}
				}
				return true;
			};
			//percent score validator
			// - returns false if score is greater than 100
            ngModel.$validators.percentscore = function(modelValue) {
				if(scope.habitLogEntry.scoreInputType === 'percent'){
					if(scope.checkScoreFormat(modelValue)
					&& modelValue > 100){
						return false;
					}
				}
				return true;
            };
        }
    };
})
.directive("maxScoreInput", function() {
    return {
        restrict: "A",  
        require: 'ngModel',
        link: function(scope, element, attributes, ngModel) {
			//number format validator
			ngModel.$validators.maxscoreformat = function(modelValue){	
				if(!scope.checkScoreFormat(modelValue)){
					return false;
				}
				return true;
			};
		}
    };
})
.directive("validateNoSpace", function() {
    return {
        restrict: "A",  
        require: 'ngModel',
        link: function(scope, element, attributes, ngModel) {		
			//modelValue is invalid if it has whitespace
			ngModel.$validators.nospace = function(modelValue){
				if(modelValue
				&& modelValue != modelValue.replace(/ /g,'')){
					console.log('testInput: ' + modelValue + ' is invalid');
					return false;
				}
				console.log('testInput: ' + modelValue + ' is valid');
				return true;
			};
		}
    };
});