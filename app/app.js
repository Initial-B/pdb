'use strict';

// Declare app level module which depends on views, and components
var pdbApp = angular.module('pdb', [
  'ui.bootstrap',
  'ui.router',
  'pdb.login',
  'pdb.constructed',
  'pdb.arena',
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
			templateUrl: 'constructed/constructed-matches.html',
			controller: 'ConstructedCtrl',
			data:{
				requireLogin: true
			}
		})
		.state('arena',{
			url: '/habits',
			templateUrl: 'arena/arena-matches.html',
			controller: 'ArenaCtrl',
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
.run(['$rootScope', '$state', 'loginModal', 'userAPI',
	function($rootScope, $state, loginModal, userAPI){
	
		//subscribe to ui-router's 'stateChangeStart' event
		// and call the loginModal service when unauth'd users
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
				console.log("[app.js] current userID not found, calling loginModal");
				loginModal().then(function(){
					return $state.go(toState.name, toParams);
				}).catch(function(){
					return $state.go('home');
				});
			}
		});
	}
]);