angular.module('pdb.habits2')
//.controller('ChartComponentController', ['$scope', 'habitsAPI', 'userAPI',
//	function($scope, habitsAPI, userAPI) {
.controller('ChartComponentController', ['habitsAPI', 'userAPI',
	function(habitsAPI, userAPI) {
		this.habitTimeframe = "30";//days prior to today
		this.filter = 'daily';//daily or moving2WeekAverage
		
		this.updateChart = function updateChart(){
			console.log('updating chart component');
		}.bind(this);
		
		function setHabitTimeframe(daysAgo){
			habitTimeframe = parseInt(daysAgo);
			console.log('new habit timeframe: ' + habitTimeframe);
		};
		
		function setFilter(f){
			filter = f;
		};
		
		this.test1 = function test1(){
			setDataType('average');
			console.log('habitTimeframe: ' + habitTimeframe
			+ ' filter: ' + filter);
		};
	}
])
.directive('chartComponent', function(){
	return{
		scope: {},
		bindToController: {
			
		},
		controller: 'ChartComponentController',
		controllerAs: 'ctrl',
		templateUrl: 'habits2/habits-linechart-component.html'
	};
})
;