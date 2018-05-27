var app = angular.module('reviewScan');
app.controller('analyzeCtrl', function ($scope, analyzeService, usSpinnerService, $state) {
    $scope.url = '';
    $scope.scan = function () {
        $scope.rowCollection = [];
        usSpinnerService.spin('spinner-1');
        analyzeService.analyze($scope.url).then(function (data) {
            var wordCloud = [];
            for (var key in data.wordDict) {
                var word = {};
                // check if the property/key is defined in the object itself, not in parent
                if (data.wordDict.hasOwnProperty(key)) {
                    word.text = key;
                    word.size = data.wordDict[key] * 5;
                }
                wordCloud.push(word);
            }
            $scope.imgSrc = data.imageSrc;
            var analyzedData = {};
            var rowData = {};
            rowData.prodName = data.prodName;
            rowData.totalReviewCount = data.totalReviewCount;
            rowData.starRatings = data.starRatings;
            analyzedData.rowCollection = [rowData];
            analyzedData.words = wordCloud;
            analyzedData.height = 400;
            analyzedData.width = 300;
            analyzedData.rotate = rotate;
            analyzedData.random = random;
            analyzedData.useTooltip = true;
            analyzedData.useTransition = true;
            analyzedData.reviews = data.reviews;
            usSpinnerService.stop('spinner-1');
            analyzeService.setAnalyzedData(analyzedData);
            $state.go('scanned');

        });

        function random() {
            return 0.4; // a constant value here will ensure the word position is fixed upon each page refresh.
        }

        function rotate() {
            return ~~(Math.random() * 2) * 1;
        }
    }
});
app.controller('scannedCtrl', function ($scope, analyzeService) {
    var analyzedData = analyzeService.getAnalyzedData();
    $scope.query = '';
    $scope.rowCollection = analyzedData.rowCollection;
    $scope.words = analyzedData.words;
    $scope.height = analyzedData.height;
    $scope.width = analyzedData.width;
    $scope.rotate = analyzedData.rotate;
    $scope.random = analyzedData.random;
    $scope.useTooltip = analyzedData.useTooltip;
    $scope.useTransition = analyzedData.useTransition;
    $scope.reviewCollection = analyzedData.reviews;
    $scope.resetFilter = function(){
        $scope.query = '';
    };
    $scope.wordClicked = function(word) {
        $scope.$apply(function () {
            $scope.query = word.text;
        });
    }
});

app.controller('contactCtrl', function ($scope, contactService) {
    var submitContact = function () {

    };
});