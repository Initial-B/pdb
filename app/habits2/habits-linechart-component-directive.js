angular.module('pdb.habits2')
//.controller('ChartComponentController', ['$scope', 'habitsAPI', 'userAPI',
//	function($scope, habitsAPI, userAPI) {
.controller('ChartComponentController', ['habitsAPI', 'userAPI',
	function(habitsAPI, userAPI) {
		var _this = this;
		this.habitTimeframe = 30;//days prior to today
		this.filter = 'daily';//daily or moving2WeekAverage
		this.habitsLineChart = null;
		
		this.update = function(){
			var startDate = '0000-00-00';//default startDate ("all time")
			var recentHabitLogs = null;
			if(_this.habitTimeframe){
				startDate = habitsAPI.daysAgoToDate(_this.habitTimeframe);
			}
			//get habit logs then update chart
			habitsAPI.getHabitLogs(startDate).then(
				function(response){
					if(response
					&& response.data
					&& response.data['responseCode'] == 'success'){
						recentHabitLogs = response.data['habitLogs'];
					}//else display some error message?
					var labels = [];
					var data = [];
					var count = 0;
					for(var key in recentHabitLogs){
						labels[count] = recentHabitLogs[key]['logDate'];
						data[count] = recentHabitLogs[key]['score'];
						count++;
					}
					updateChart(labels, data);
					
				}
			);
		};
				
		this.test1 = function test1(){
			setDataType('average');
			console.log('habitTimeframe: ' + habitTimeframe
			+ ' filter: ' + filter);
		};
		
	//======== private functions ============
		function updateChart(labels, data){
			console.log('updating chart component');
			var ctx = document.getElementById("habitsLineChart");
			//destroy old chart instance, if exist
			if(_this.habitsLineChart){
				_this.habitsLineChart.destroy();
			}
			_this.habitsLineChart = new Chart(ctx, {
				type: 'line',
				data: {
					labels: labels,
					datasets: [{
						label: 'Habit Score',
						data: data
					}]
				},
				options:{
					legend:{display: false},
					scales:{
						yAxes:[{ticks:{beginAtZero:true}}],
						xAxes:[{
							ticks:{
								autoSkip: false, //let the callback do label skipping
								maxRotation: 45,
								//called on tick, return value is set as label
								callback: function(tickValue, index, ticks) {
									//if there are more than 8 labels, only show every 4th
									if(ticks.length > 8){
										if((index % 4) === 1
										|| index === 1){
											return tickValue;
										}else{
											return '';
										}
									}else{
										return tickValue;
									}
								}
							}
						}]
					}
				}
			});
		};
		
		function setHabitTimeframe(daysAgo){
			habitTimeframe = parseInt(daysAgo);
			console.log('new habit timeframe: ' + habitTimeframe);
		};
		
		function setFilter(f){
			filter = f;
		};
		
	//====== init =======
		this.update();
	
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
});
