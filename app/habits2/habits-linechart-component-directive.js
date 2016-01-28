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
				var endDateMoment = moment();
				var startDateMoment = moment(startDate, 'YYYY-MM-DD');
				
				getMoving2WeekAverageData(startDateMoment, endDateMoment).then(function(combinedData){
					updateChart(combinedData.labels, combinedData.data);
				});
				//DEBUG stop here until both filters get combindedData
				return;
			}else{
				getDailyData(startDate).then(function(combinedData){
					updateChart(combinedData.labels, combinedData.data);
				});
			}
		};
				
		this.test1 = function test1(){
			//var start = moment("2016-01-04","YYYY-MM-DD");
			//var end = moment("2016-01-11","YYYY-MM-DD");
			/*
			getMoving2WeekAverageData(habitsAPI.daysAgoToDate(_this.habitTimeframe))
				.then(function(averageScores){
					var count = 0;
					for(var key in averageScores){
						labels[count] = key;
						data[count] = averageScores[key];
						count++;
					}
				});
				*/
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
		
		function getMoving2WeekAverageData(startDate, endDate){
			var combinedData = {
				labels: [],
				data: []
			};
		//1. get boundary dates (endDate, startDate minus 13 days)
			endDate = endDate.startOf('day');
			var avgStartDate = moment(startDate).startOf('day').subtract(13, 'days');
			
		//2. retrieve habit logs for this time window
			return habitsAPI.getHabitLogs(avgStartDate.format('YYYY-MM-DD')).then(
				function(response){
					if(response
					&& response.data
					&& response.data['responseCode'] == 'success'){
						recentHabitLogs = response.data['habitLogs'];
					}//else display some error message?
		//3. Adjust boundary dates based on logs retrieved
		// This trims dates without logs from start + end of data.
		// In 4 and 5, remaining dates without logs will be counted as 0-score days.
					//set avgStartDate to earliest date with log
					avgStartDate = moment(recentHabitLogs[0]['logDate'],'YYYY-MM-DD');
					//set endDate to latest date with log
					endDate = moment(recentHabitLogs[recentHabitLogs.length-1]['logDate'],'YYYY-MM-DD');
					
					//create array of logs indexed by date
					var logs = [];
					for(var key in recentHabitLogs){
						logs[recentHabitLogs[key]['logDate']] = recentHabitLogs[key]['score'];
					}
					var averageScores = [];//assoc. array [date => 2weekAvgScore]
					
		//4. calculate first 2-week average
					//calculate sum of first two weeks
					var sum = 0;
					var avgEndDate = moment(avgStartDate).add(13, 'days');
					
					//sum up scores between avgStart and avgEnd (inclusive)
					var dateIter = moment(avgStartDate);//date to be iterated during loop

					while(dateIter.diff(avgEndDate,'days') <= 0){
						if(logs[dateIter.format('YYYY-MM-DD')]){
							sum += parseFloat(logs[dateIter.format('YYYY-MM-DD')]);
						}
						dateIter.add(1, 'days');
					}
					
		//5. Calculate 2wk average for each day between startDate and endDate (inclusive)
					console.log('calculating average scores between '
						+ avgEndDate.format('YYYY-MM-DD')
						+ ' and ' + endDate.format('YYYY-MM-DD'));
					while(avgEndDate.diff(endDate,'days') <= 0){
						//calculate the average for the last day of the (2 week) average window
						averageScores[avgEndDate.format('YYYY-MM-DD')] = sum/14;
						//subtract first score from sum
						if(logs[avgStartDate.format('YYYY-MM-DD')]){
							sum -= parseFloat(logs[avgStartDate.format('YYYY-MM-DD')]);
						}
						//iterate average boundary dates
						avgStartDate.add(1, 'days');
						avgEndDate.add(1, 'days');
						//average window now has new last score, so add it to the sum
						if(logs[avgEndDate.format('YYYY-MM-DD')]){
							sum += parseFloat(logs[avgEndDate.format('YYYY-MM-DD')]);
						}
					}	
					var count = 0;
					for(var key in averageScores){
						combinedData.labels[count] = key;
						combinedData.data[count] = averageScores[key];
						count++;
					}
					return combinedData;
				}
			);
		};
		
		function getDailyData(startDate){
			var combinedData = {
				labels: [],
				data: []
			};
			return habitsAPI.getHabitLogs(startDate).then(
				function(response){
					if(response
					&& response.data
					&& response.data['responseCode'] == 'success'){
						//trim start of habit logs
						recentHabitLogs = response.data['habitLogs'];
					}//else display some error message?
					var labels = [];
					var data = [];
					var count = 0;
					for(var key in recentHabitLogs){
						combinedData.labels[count] = recentHabitLogs[key]['logDate']; 
						combinedData.data[count] = recentHabitLogs[key]['score'];
						count++;
					}
					return combinedData;
				}
			);
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
