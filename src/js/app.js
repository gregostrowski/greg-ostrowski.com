var app = angular.module('website', [])
    .factory('instagram', ['$http', function ($http){
        var url = function (max_id) {
            var access_token = "51213996.baa4240.d7e89f9c1fac405e94f9cd2347cb468b";
            return 'https://api.instagram.com/v1/users/self/media/recent/?' + (max_id ? ('max_id='+max_id + '&') : '') + 'access_token='+ access_token + '&callback=JSON_CALLBACK&count=33';
        };
        return {
            getSelfFeed: function(callback, max_id) {                 
                $http.jsonp(url(max_id))
                    .success(function(response) {
                        callback(response);
                    });
            }
        }
    }])
    .controller('IGDisplayController', function IGDisplayController($scope, instagram, $window, $sce) {
        $scope.width;
        $scope.rows = 2;
        $scope.defaultImgWidth = 200;
        $scope.imgDimensions = 0;
        $scope.containerWidth = 0; //pictures.length * imgWidth
        $scope.pictures = [];
        
        var findMobile = {
            Android: function() {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: function() {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: function() {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: function() {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: function() {
                return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
            },
            any: function() {
                return (findMobile.Android() || findMobile.BlackBerry() || findMobile.iOS() || findMobile.Opera() || findMobile.Windows());
            }
        };
        
        $scope.isMobile = findMobile.any();
        
        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }

        function getPictures(max_id) {
            instagram.getSelfFeed(getPicturesSuccessful, max_id);
        }
        
        function getPicturesSuccessful(response) {
            $scope.pictures = $scope.pictures.concat(response.data);
            
            if(response.pagination){
                $scope.pagination = response.pagination;
            }
            
            setTimeout(function () {
                new ElastiStack( document.getElementById( 'elasticstack' ) );
            }, 200);
        }
        
        function activate(){ 
            getPictures();
        }
        
        activate();
 });
