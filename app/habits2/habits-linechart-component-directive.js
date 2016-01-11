angular.module('pdb.habits2')
//.controller('ChartComponentController', ['$scope', 'habitsAPI', 'userAPI',
//	function($scope, habitsAPI, userAPI) {
.controller('ChartComponentController', ['habitsAPI', 'userAPI',
	function(habitsAPI, userAPI) {
		this.habitTimeframe = 30;//days prior to today
		this.dataType = 'daily';//daily or 2 week average
		
		this.updateChart = function updateChart(){
			console.log('updating chart component');
		}.bind(this);
		
		function setHabitTimeframe(daysAgo){
			habitTimeframe = daysAgo;
			console.log('new habit timeframe: ' + habitTimeframe);
		};
		
		function setDataType(type){
			dataType = type;
		};
		
		this.test1 = function test1(){
			setDataType('average');
			console.log('habitTimeframe: ' + habitTimeframe
			+ ' dataType: ' + dataType);
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