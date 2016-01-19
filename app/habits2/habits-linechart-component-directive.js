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
			
			var combinedData = {
				labels: [],
				data: []
			};
			if(_this.filter === 'moving2WeekAverage'){
				combinedData = getMoving2WeekAverageData(startDate);
			}else{
				combinedData = getDailyData(startDate);
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
			//var start = moment("2016-01-04","YYYY-MM-DD");
			//var end = moment("2016-01-11","YYYY-MM-DD");

			getMoving2WeekAverageData(_this.habitTimeframe);
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
		
		function getMoving2WeekAverageData(startDate){
			var combinedData = {
				labels: [],
				data: []
			};
			//use startDate to get labels starting from startDate - 14days
			var adjustedStartDate = moment(startDate,"YYYY-MM-DD").subtract(14, 'days');
			
			//get habit logs
			habitsAPI.getHabitLogs(adjustedStartDate.format('YYYY-MM-DD')).then(
				function(response){
					if(response
					&& response.data
					&& response.data['responseCode'] == 'success'){
						recentHabitLogs = response.data['habitLogs'];
					}//else display some error message?
					var logs = [];//assoc. array [logDate => score]
					for(var key in recentHabitLogs){
						logs[recentHabitLogs[key]['logDate']] = recentHabitLogs[key]['score'];
					}
					//DEBUG
					console.log('logs: ' + PDB.utils.stringifySafe(logs));
					
					var averageScores = [];//assoc. array [date => 2weekAvgScore]
					
					//calculate first 2-week average
					
					//calculate sum of first two weeks
					var sum = 0;
					var date = moment(adjustedStartDate);//d will be iterated
					while(date.diff(startDate,'days') >= 1){
						if(logs[date.format('YYYY-MM-DD')]){
							sum +=logs[date.format('YYYY-MM-DD')];
						}
						date.add(1, 'days');
					}
					console.log('sum of first 14 days of logs: ' + sum);
					
					//calculate 2wk average for each day between startDate and now
					var avgPeriodStartDate = moment(adjustedStartDate);
					var date = moment(startDate);
					while(date.diff(startDate,'days') >= 1){
						averageScores[d.format('YYYY-MM-DD')] = sum/14;
						//DEBUG
						console.log('average score for '
							+ date.format('YYYY-MM-DD')
							+ ': ' + sum/14);
						//iterate sum
							//subtract first score from sum
							sum -= logs(avgPeriodStartDate.format('YYYY-MM-DD'));
							//add score of date that was just averaged
							if(logs[d.format('YYYY-MM-DD')]){
								sum += logs[date.format('YYYY-MM-DD')];
							}
						//iterate dates
							avgPeriodStartDate.add(1, 'days');
							date.add(1, 'days');
					}
					//DEBUG
					console.log('averageScores[]: '
						+ PDB.utils.stringifySafe(averageScores));
				}
			);
		};
		function getDailyData(startDate){
		
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
