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
/*
.directive("score", function() {
	return {
		restrict: "A",
		require: ['^form', 'ngModel'],
		link: function(scope, element, attributes, controllers) {
		var form = controllers[0];
		var ngModel = controllers[1];
			ngModel.$validators.scorePercent = function(scorePercent) {
				if(!element.prop("disabled")
				&& scorePercent != null){
				//console.log('validating score on form: ' + JSON.stringify(form.));
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
*/
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
	
		var model = this;
		$scope.chartUtils = PDB.chartUtils;
		
		$scope.habitLogEntryForm = {
			logDate: '',
			scoreInputType: 'points',
			score: '',
			maxScore: ''
		};
		

		//DEBUG: test button function
		$scope.test = function(){
			console.log(
//			'HabitsCtrl.testForm.testInput: ' + HabitsCtrl.testForm.testInput +
			' $scope.testForm.testInput: ' + $scope.testInput +
			' model.testForm.testInput: ' + model.testInput);
			console.log('$scope: ' + PDB.utils.stringifySafe($scope));
			//console.log('score: ' + $scope.habitLogEntryForm.score
			//+ ' scoreInputType: ' + $scope.habitLogEntryForm.scoreInputType);
		};
		
		$scope.habitTimeframe = 30;

		//submit habit log form using HabitsAPI
		$scope.submitHabitLogEntryForm = function(){
			//TODO: validate form inputs
			
			var calculatedScore;
			if($scope.habitLogEntryForm.scoreInputType == 'percent'){
				$scope.habitLogEntryForm.maxScore = 100;
			}
			
			calculatedScore = 100 * $scope.habitLogEntryForm.score / $scope.habitLogEntryForm.maxScore;
			
			//$scope.$apply();
			console.log('creating habitLogEntry from form fields score: '
				+ $scope.habitLogEntryForm.score + ' scoreInputType: ' + $scope.habitLogEntryForm.scoreInputType
				+ ' maxScore: ' + $scope.habitLogEntryForm.maxScore);
			
			//create habitLogentry
			var habitLogEntry = {
				logDate: $scope.habitLogEntryForm.logDate,
				score: calculatedScore
			}
			console.log('submitting habit log entry with logDate: ' + habitLogEntry.logDate
			+ ' score: ' + habitLogEntry.score);
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
						console.log('recentHabitLogs: ' + JSON.stringify($scope.recentHabitLogs));
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
		
		//returns true if value is a positive float or is not set
		$scope.checkScoreFormat = function(value){
			if(value === undefined
			|| value === null
			|| value === ''){
				return true;
			}else if(PDB.utils.isFloat(value)
			&& parseFloat(value) >=0){
				return true;
			}
			return false;
		};
		
	//private functions

		

	//init functions

		//initial page setup: show habit scores for past month
		$scope.getRecentHabitLogs($scope.habitTimeframe);

		/*
		 $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
		 $scope.data = [[65, 59, 80, 81, 56, 55, 40]];
		 $scope.series = ['Series A'];
		 */
	}
])
.directive("scoreInput", function() {
    return {
        restrict: "A",  
        require: 'ngModel',
        link: function(scope, element, attributes, ngModel) {
			console.log('validating score field with modelValue: ' + modelValue
			+ ' and scoreInputType: ' + scope.habitLogEntryForm.scoreInputType);
			
			var maxScore = scope.habitLogEntryForm.maxScore;
			
			//number format validator
			ngModel.$validators.scoreFormat = function(modelValue){
				if(!scope.checkScoreFormat(modelValue)){
					return false;
				}
				return true;
			};
			
			//point score validator
			// - returns false if score is greater than maxScore
			ngModel.$validators.pointScore = function(modelValue) {
				if(scope.habitLogEntryForm.scoreInputType === 'points'){
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
            ngModel.$validators.percentScore = function(modelValue) {
				if(scope.habitLogEntryForm.scoreInputType === 'percent'){
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
			console.log('validating maxScore field with modelValue: ' + modelValue);
			//number format validator
			ngModel.$validators.scoreFormat = function(modelValue){
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
			//console.log('creating validators for ngModel: ' + PDB.utils.stringifySafe(ngModel));
			
			//modelValue is invalid if it has whitespace
			ngModel.$validators.nospace = function(modelValue){
				//console.log('validating testInput: ' + modelValue + ' in ngModel: '
				// + PDB.utils.stringifySafe(ngModel));
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