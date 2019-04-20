var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');
var sw = require('stopword');
var Ngram = require('node-ngram');
var Sentiment = require('sentiment');

var callbackCounter;
var aggregateReviews;
var responseData;
var sentiment;
var reviewPageCount;
var reviews;

router.post('/', function (req, res, next) {
    init();
    handleFewReviews(req, res);
});

var init = function () {
    callbackCounter = 0;
    aggregateReviews = '';
    responseData = {};
    reviewPageCount = 0;
    sentiment = new Sentiment();
    reviews = [];
};

var callback = function ($, res, baseUrl) {
    var elem = $('div[data-reftag="cm_cr_arp_d_paging_btm"]');
    var callUrl = $(elem).children('ul').children('li').eq(1).children('a').attr('href');
    if (callbackCounter == 5 || callUrl === undefined) {
        var replacedCharsTitle = aggregateReviews.replace(/[^a-zA-Z0-9 ]/g, "");
        var splitTitle = replacedCharsTitle.split(' ');
        var stopWordsRemovedArray = sw.removeStopwords(splitTitle);

        var ngram = new Ngram({
            n: 2
        });

        var bigram = ngram.ngram(stopWordsRemovedArray.join(' '));
        var combined = [];
        bigram.forEach(function (item) {
            combined.push(item.join(' '));
        });

        var ngramCounts = _.countBy(combined, function (word) {
            return word;
        });

        responseData.imageSrc = $('a[class="a-link-normal"]').children().eq(0).attr('src');
        responseData.prodName = $('a[data-hook="product-link"]').eq(0).text();
        responseData.totalReviewCount = $('span[data-hook="total-review-count"]').text();
        responseData.starRatings = $('div[class="a-row averageStarRatingNumerical"]').children('span').text();
        responseData.wordDict = ngramCounts;
        responseData.reviews = reviews;
        res.send(responseData);
    } else {
        $("[id^=customer_review-]").each(function (i, element) {
            createReviews($, element);
        });
        request(baseUrl + callUrl, {gzip: true}, function (error, response, html) {
            callbackCounter++;
            $ = cheerio.load(html);
            callback($, res, baseUrl);
        });
    }
};
var handleFewReviews = function (req, res) {
    var baseUrl = '';
    console.log(req.body.url);
    if (req.body.url.includes('amazon.in')) {
        baseUrl = 'https://www.amazon.in';
    } else {
        baseUrl = 'https://www.amazon.com';
    }

    request(req.body.url, {gzip: true}, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            if ($('a[data-hook="see-all-reviews-link"]').attr('href') != undefined) {

                var allReviews = baseUrl + $('a[id="acrCustomerReviewLink"]').attr('href');
                triggerSearch(baseUrl, allReviews, res, callback);
            } else {
                res.send(responseData);
            }
        }
    });
};

var triggerSearch = function (baseUrl, url, res, callback) {
    console.log('called service: ' + url);
    var dataRef = [];
    request(url, {gzip: true}, function (error, response, html) {
        try {
            $ = cheerio.load(html);
            var elem = $('div[data-reftag="cm_cr_arp_d_paging_btm"]');
            var callUrl = $(elem).children('ul').children('li').eq(1).children('a').attr('href');
            if (callUrl) {
                request(baseUrl + callUrl, {gzip: true}, function (error, response, html) {
                    $ = cheerio.load(html);
                    callback($, res, baseUrl);
                });
            } else {
                $("[id^=customer_review-]").each(function (i, element) {
                    createReviews($, element);
                });
                var replacedCharsTitle = aggregateReviews.replace(/[^a-zA-Z0-9 ]/g, "");
                var splitTitle = replacedCharsTitle.split(' ');
                var stopWordsRemovedArray = sw.removeStopwords(splitTitle);

                var ngram = new Ngram({
                    n: 2
                });

                var bigram = ngram.ngram(stopWordsRemovedArray.join(' '));
                var combined = [];
                bigram.forEach(function (item) {
                    combined.push(item.join(' '));
                });

                var ngramCounts = _.countBy(combined, function (word) {
                    return word;
                });

                responseData.imageSrc = $('a[class="a-link-normal"]').children().eq(0).attr('src');
                responseData.prodName = $('a[data-hook="product-link"]').eq(0).text();
                responseData.totalReviewCount = $('span[data-hook="total-review-count"]').text();
                responseData.starRatings = $('div[class="a-row averageStarRatingNumerical"]').children('span').text();
                responseData.wordDict = ngramCounts;
                responseData.reviews = reviews;
                res.send(responseData);
            }
            //var pageCount = $('li[data-reftag="cm_cr_arp_d_paging_btm"]').length;
            /*if (pageCount == 0) {
                callback($, res, pageCount);
            } else {
                $('li[data-reftag="cm_cr_arp_d_paging_btm"]').each(function (i, element) {
                    var callUrl = $(this).children('a').attr("href");
                    request(baseUrl + callUrl, function (error, response, html) {
                        $ = cheerio.load(html);
                        callback($, res, pageCount);
                    });
                });
            }*/
        } catch (error) {
            console.log(error);
        }
    });
};

var createReviews = function ($, element) {
    var review = {};
    review.title = $(element).children().eq(1).children('a[data-hook="review-title"]').text();
    //review.date = $(element).children().eq(1).children('span[data-hook="review-date"]').text();
    review.comment = $(element).children().eq(4).children('span[data-hook="review-body"]').text();
    var sentimentAnalysis = sentiment.analyze(review.comment);
    review.score = sentimentAnalysis.score;
    reviews.push(review);
    aggregateReviews = aggregateReviews.concat(review.title.concat(' ').concat(review.comment).concat(' '));
};

module.exports = router;
