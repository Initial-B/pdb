angular.module('pdb.habits2')
.controller('ChartComponentController', ['$scope', 'habitsAPI', 'userAPI',
	function($scope, habitsAPI, userAPI) {
	
	
	}
])
.directive('chartComponent', function(){
	return{
		scope: {},
		bindToController: {
			
		},
		controller: 'ChartComponentController',
		controllerAs: 'ctrl',
		templateUrl: 'habits-linechart-component.html'
	};
})
;