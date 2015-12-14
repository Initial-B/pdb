'use strict';

var PDB = PDB || {};

// Declare app level module which depends on views, and components
var pdbApp = angular.module('pdb', [
  'ui.bootstrap',
  'ui.router',
  'pdb.login',
  'pdb.finances',
  'pdb.habits',
  'pdb.version'
]);
pdbApp.config(['$stateProvider','$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
	//redirect unmatched urls to /home
	$urlRouterProvider.otherwise('/home');
    $stateProvider
		.state('home', {
			url: '/home',
			templateUrl: 'home/home.html',
			controller: 'HomeCtrl',
			data:{
				requireLogin: false
			}
		})
		.state('finances',{
			url: '/finances',
			templateUrl: 'finances/finances-main.html',
			controller: 'FinancesCtrl',
			data:{
				requireLogin: true
			}
		})
		.state('habits',{
			url: '/habits',
			templateUrl: 'habits/habits-main.html',
			controller: 'HabitsCtrl',
			data:{
				requireLogin: true
			}
		});
  }
])
//brewhouse unauthorized request implementation (need to edit routing/states before testing this)
/*
.config(['$httpProvider', function ($httpProvider) {

  $httpProvider.interceptors.push(function ($timeout, $q, $injector) {
    var loginModal, $http, $state;

    // this trick must be done so that we don't receive
    // `Uncaught Error: [$injector:cdep] Circular dependency found`
    $timeout(function () {
      loginModal = $injector.get('loginModal');
      $http = $injector.get('$http');
      $state = $injector.get('$state');
    });

    return {
      responseError: function (rejection) {
        if (rejection.status !== 401) {
          return rejection;
        }
        var deferred = $q.defer();
        loginModal()
          .then(function () {
            deferred.resolve( $http(rejection.config) );
          })
          .catch(function () {
            $state.go('home');
            deferred.reject(rejection);
          });
        return deferred.promise;
      }
    };
  });

}])
*/
.run(['$rootScope', '$state', 'userAPI',
	function($rootScope, $state, userAPI){
	
		//subscribe to ui-router's 'stateChangeStart' event
		// and call loginPrompt when unauth'd users
		// change to states that require login		
		$rootScope.$on('$stateChangeStart', function(event, toState, toParams){
			var requireLogin = toState.data.requireLogin;
			if(requireLogin){
				console.log("[app.js] requested state requires login. current userID: "
					+ userAPI.getUserID());
			}
			// if state requires login and currentUser is undefined, show login prompt
			if(requireLogin && (userAPI.getUserID() == null || userAPI.getUserID() === '')){
				event.preventDefault();
				console.log("[app.js] current userID not found, calling loginPrompt");
				userAPI.loginPrompt().then(function(){
					return $state.go(toState.name, toParams);
				}).catch(function(){//catch login errors
					return $state.go('home');
				});
			}
		});
	}
]);

//include in controllers like so: $scope.chartUtils = PDB.chartUtils;
//TODO: should this go in a separate file? a service?
PDB.chartUtils = {
	//takes an array of strings and replaces them with '', except for every Xth label
	xthLabels: function(labelsArray, x){
		//TODO: this
	}

};
PDB.utils = function(){
	function isInt(value) {
	  var x;
	  if (isNaN(value)) {
		return false;
	  }
	  x = parseFloat(value);
	  return (x | 0) === x;
	};
	
	//TODO: not clear what kind of input is expected.
	function isNumber(value) {
	  if(isNaN(value)
	  || value === null
	  || value === ''){
		return false;
	  }
	  return value === Number(value);
	};
	
	//JSON stringify-safe from https://github.com/isaacs/json-stringify-safe
	// like JSON.stringify, but doesn't throw exception on circular references
	function stringifySafe(obj, replacer, spaces, cycleReplacer) {
		return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
	};
	//serializer used by stringify-safe
	function serializer(replacer, cycleReplacer) {
	  var stack = [], keys = []

	  if (cycleReplacer == null) cycleReplacer = function(key, value) {
		if (stack[0] === value) return "[Circular ~]"
		return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
	  }

	  return function(key, value) {
		if (stack.length > 0) {
		  var thisPos = stack.indexOf(this)
		  ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
		  ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
		  if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
		}
		else stack.push(value)

		return replacer == null ? value : replacer.call(this, key, value)
	  }
	};
	return {
		isInt: isInt,
		isNumber: isNumber,
		stringifySafe: stringifySafe
	};	
}();