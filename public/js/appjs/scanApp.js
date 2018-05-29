var app = angular.module('reviewScan',['angular-d3-word-cloud', 'smart-table', 'ui.router', 'chart.js']);
app.config(['$httpProvider','$stateProvider', '$urlRouterProvider', function($httpProvider, $stateProvider, $urlRouterProvider) {

    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    $urlRouterProvider.otherwise('/home');

    var homeState = {
        name: 'home',
        url: '/home',
        templateUrl: 'input-url.html',
        controller: 'analyzeCtrl'
    };

    var scannedState = {
        name: 'scanned',
        url: '/scanned',
        templateUrl: 'scan.html',
        controller: 'scannedCtrl'
    };

    var contactState = {
        name: 'contact',
        url: '/contact',
        templateUrl: 'contact.html',
        controller: 'contactCtrl'
    };

    var aboutState = {
        name: 'about',
        url: '/about',
        templateUrl: 'about.html'
    };

    $stateProvider.state(homeState);
    $stateProvider.state(scannedState);
    $stateProvider.state(contactState);
    $stateProvider.state(aboutState);
}]);

app.directive('searchWatchModel',function(){
    return {
        require:'^stTable',
        scope:{
            searchWatchModel:'='
        },
        link:function(scope, ele, attr, ctrl){
            scope.$watch('searchWatchModel',function(val){
                ctrl.search(val);
            });

        }
    };
});