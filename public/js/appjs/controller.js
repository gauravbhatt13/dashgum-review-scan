var app = angular.module('reviewScan');
app.controller('analyzeCtrl', function ($scope, analyzeService, $state) {
    $scope.url = '';
    $scope.spinner = false;
    $scope.scan = function () {
        $scope.rowCollection = [];
        $scope.spinner = true;
        $scope.url = $scope.url.slice($scope.url.indexOf("https"));
        analyzeService.analyze($scope.url).then(function (data) {
            $scope.spinner = false;
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
    $scope.labels = ["Positive", "Negative"];
    $scope.chartColors = ['#46BFBD', '#F7464A', '#00ADF9', '#803690', '#FDB45C', '#949FB1', '#4D5360'];
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
    var positive = 0;

    analyzedData.reviews.forEach(function (review) {
        if (review.score > 0) {
            positive++;
        }
    });


    $scope.chartData = [positive, analyzedData.reviews.length - positive];

    $scope.resetFilter = function () {
        $scope.query = '';
    };
    $scope.wordClicked = function (word) {
        $scope.$apply(function () {
            $scope.query = word.text;
        });
    }
});
app.controller('JsonUtilController', function ($scope, $http) {
    $scope.jsonTxt = '';
    $scope.errorTxt = '';
    $scope.elementFlatArray = [];
    $scope.esAddress = 'http://localhost:9201';
    $scope.indexData = {};
    $scope.indexName = 'myindex';
    $scope.indexType = 'mytype';
    $scope.searchValues = '';
    $scope.errorModal = false;

    $scope.flatJson = function () {
        $scope.elementFlatArray = [];
        $scope.indexData = {};
        if ($scope.jsonTxt === '') {
            return;
        }
        var jsonObj = JSON.parse($scope.jsonTxt);
        $scope.flatObject(jsonObj, '');
        // $scope.elementFlatArray = $scope.elementFlatArray.splice(0,200);
    };

    $scope.formatJson = function () {
        if ($scope.jsonTxt === '') {
            return;
        }

        try {
            var jsonObj = JSON.parse($scope.jsonTxt);
            $scope.jsonTxt = JSON.stringify(jsonObj, null, 4);
        } catch (err) {
            $scope.errorModal = true;
            var textArea = angular.copy($scope.jsonTxt);
            var index = err.message.search('position');
            var errPosition = err.message.substring((index + 8), (index + 11)).trim();
            $scope.errorTxt = err.message + ' : ' + textArea.substring(errPosition, errPosition + 10);
        }
    };

    $scope.flatObject = function (element, path) {
        for (var k in element) {
            if (typeof element[k] === 'object' && element[k] !== null) {
                var x = path + k + '.';
                $scope.flatObject(element[k], x);
            } else {
                if (!(element[k] === '' || element[k] === null)) {
                    $scope.elementFlatArray.push((path === '' ? {
                        selected: true,
                        key: k,
                        value: element[k]
                    } : {selected: true, key: path + k, value: element[k]}));
                }
            }
        }
    };

    $scope.toggleAll = function (state) {
        $scope.elementFlatArray.forEach(function (elem) {
            elem.selected = state;
        });
    }

    $scope.createIndex = function () {
        $scope.elementFlatArray.forEach(function (elem) {
            console.log(elem.key + ' : ' + elem.value);
            if (elem.value !== null) {
                $scope.indexData[elem.key] = elem.value;
            }
        });
        var jsonData = angular.toJson($scope.indexData);
        var httpRequest = {
            method: 'POST',
            url: $scope.esAddress + '/' + $scope.indexName + '/' + $scope.indexType,
            data: jsonData
        };
        $http(httpRequest).then(function successCallback(response) {
            console.log(response);
        }, function errorCallback(error) {
            console.log(error);
        });
    };

    $scope.isCORSEnabled = function () {
        var httpRequest = {
            method: 'HEAD',
            url: $scope.esAddress + '/' + $scope.indexName + '/' + $scope.indexType,
            data: jsonData
        };
    };

    $scope.file_changed = function (element) {
        var file = element.files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            $scope.jsonTxt = event.target.result;
            $scope.$apply();
        };
        reader.readAsText(file);
    };
});

app.controller('HomeController',
    function ($log, MockData, $scope, $state) {
        $scope.data = MockData;
        $scope.gotoBlogs = function (item) {
            $state.go('blogs', {category: item.blogCategory});
        };
    });
app.controller('contactCtrl', function ($scope, contactService) {
    $scope.contact = {};
    $scope.success = false;
    $scope.submitContact = function () {
        $scope.success = false;
        contactService.submitContact($scope.contact).then(function (data) {
            $scope.contact = {};
            $scope.success = true;
        });
    };
});
app.controller('BlogsController',
    function ($log, MockData, $stateParams, $scope, $state) {
        $scope.category = $stateParams.category;
        $scope.gotoBlog = function(blog) {
            console.log(blog);
            $state.go('showBlog', {blog:blog})
        };
        MockData['$promise'].then(function (data) {
            console.log(data);
            for (var key in data) {
                console.log('for key : ' + key + ' : ' + MockData[key].blogCategory + ' === ' + $scope.category);
                if (MockData[key].blogCategory === $scope.category) {
                    $scope.data = MockData[key].blogs;
                    break;
                }
            }
        });
    });
app.controller('ShowBlogController',
    function ($log, $stateParams, $scope) {
        $scope.blog = $stateParams.blog;
    });