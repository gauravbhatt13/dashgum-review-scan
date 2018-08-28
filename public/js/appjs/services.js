var app = angular.module('reviewScan');
app.service('analyzeService', function ($http, $q) {
    var analyzedData = {};

    this.analyze = function (url) {
        var analysisResponse = undefined;
        if(!analysisResponse){
            var deferred = $q.defer();

            var postMsg = {url:url};
            $http({
                method: 'POST',
                url: url.includes('flipkart') ? '/flipkartScan':'scan',
                data: postMsg,
                headers: {'Content-Type': 'application/json'}
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error);
            });
            analysisResponse = deferred.promise;
        }
        return $q.when(analysisResponse);
    };

    this.setAnalyzedData = function (data) {
        analyzedData = data;
    };

    this.getAnalyzedData = function () {
        return analyzedData;
    };
});

app.service('contactService', function ($http, $q) {
    this.submitContact = function (contact) {
        var deferred = $q.defer();
        var contactResponse = undefined;
        $http({
            method: 'POST',
            url: '/users/contact',
            data: contact,
            headers: {'Content-Type': 'application/json'}
        }).then(function (response) {
            deferred.resolve(response.data);
        }, function (error) {
            deferred.reject(error);
        });
        contactResponse = deferred.promise;
        return $q.when(contactResponse);
    };
});

app.factory('MockDataFactory', function ($resource) {

    return $resource(':filename.json', {
        filename: '@filename'
    }, {headers: { 'Cache-Control': 'no-store' }});

});
