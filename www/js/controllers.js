angular.module('starter.controllers', ['starter.constants', 'ionic.service.core', 'ionic.service.push', 'ionic-cache-src']).factory('CoolFactory', CoolFactory)

  .filter('URLmaker', function () {
    return function (input) {
      // do some bounds checking here to ensure it has that index.
      if (input) {
        var splittedString = input.split('/');
        return 'http://moraspirit.com/sites/default/files/styles/teaser_image/public/' + splittedString[2] + '/' + splittedString[3] + '/' + splittedString[4];
      }
    };
  })

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $ionicBackdrop) {
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
      navIcons.addEventListener('click', function () {
        this.classList.toggle('active');
      });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function () {
      document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function () {
      document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function () {
      var content = document.getElementsByTagName('ion-content');
      for (var i = 0; i < content.length; i++) {
        if (content[i].classList.contains('has-header')) {
          content[i].classList.toggle('has-header');
        }
      }
    };

    $scope.setExpanded = function (bool) {
      $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function (location) {
      var hasHeaderFabLeft = false;
      var hasHeaderFabRight = false;

      switch (location) {
        case 'left':
          hasHeaderFabLeft = true;
          break;
        case 'right':
          hasHeaderFabRight = true;
          break;
      }

      $scope.hasHeaderFabLeft = hasHeaderFabLeft;
      $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function () {
      var content = document.getElementsByTagName('ion-content');
      for (var i = 0; i < content.length; i++) {
        if (!content[i].classList.contains('has-header')) {
          content[i].classList.toggle('has-header');
        }
      }

    };

    $scope.hideHeader = function () {
      $scope.hideNavBar();
      $scope.noHeader();
    };

    $scope.showHeader = function () {
      $scope.showNavBar();
      $scope.hasHeader();
    };

    $scope.clearFabs = function () {
      var fabs = document.getElementsByClassName('button-fab');
      if (fabs.length && fabs.length > 1) {
        fabs[0].remove();
      }
    };
  })

  .controller('AlbumController', function ($scope, $stateParams, $http, CoolFactory) {

    $scope.data = {};
    $scope.data.albums = [];
    $scope.permissionToLoadMore = false;
    $scope.goToAlbum = function (id) {
      navigator.vibrate(20);
      window.open('https://www.facebook.com/moraspirit.fanpage/photos/?tab=album&album_id=' + id);
    };



    $scope.doRefresh = function () {
      CoolFactory.hitTheServer('/albums/', '')
        .then(function (data) {
          $scope.data.albums = data.data.data;
          $scope.permissionToLoadMore = true;
        });

      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    };


    CoolFactory.hitTheServer('/albums/', '')
      .success(function (data) {

        console.log(data.data);
        $scope.data.albums = data.data;
        window.localStorage.setItem('albums', JSON.stringify(data.data));

        $scope.permissionToLoadMore = true;
      })
      .error(function () {
        console.log("No internet connection! retrieving data from cache");
        if (window.localStorage.getItem('albums') !== undefined) {
          $scope.data.albums = JSON.parse(window.localStorage.getItem('albums'));
          $scope.permissionToLoadMore = true;
        }
      });

    $scope.hasMoreData = true;

    // infinity scroll

    //initial values
    $scope.numberOfItemsToDisplay = 10;
    $scope.articleOffset = 1;

    $scope.items = [];

    $scope.loadMore = function () {
      if (!$scope.permissionToLoadMore) {
        return;
      }
      $scope.numberOfItemsToDisplay += 10;
      $scope.articleOffset += 10;

      CoolFactory.hitTheServer('/albumsMore/', $scope.articleOffset).success(function (items) {

        if (items.data.length > 0) {
          items.data.forEach(function (entry) {
            $scope.data.albums.push(entry);
          });
        } else {
          $scope.hasMoreData = false;
          console.log("All the albums are loaded!! no more to load...");
        }

        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.$on('$stateChangeSuccess', function () {
      $scope.loadMore();
    });


  })

  .controller('RecentScoresCtrl', function ($scope, $state) {


    $scope.notifications = JSON.parse(window.localStorage.getItem('pushNotifications'));

  })

  .controller('ArticlesController', function ($http, API_HOST, $scope, $stateParams, ionicMaterialInk, CoolFactory, $cordovaSocialSharing) {
    //ionicMaterialInk.displayEffect();
    $scope.data = {};
    $scope.data.articles = [];
    $scope.permissionToLoadMore = false;
    //CoolFactory.$inject = ['$http', 'API_HOST'];

    $scope.doRefresh = function () {
      CoolFactory.hitTheServer('/articles', '')
        .then(function (rows) {
          $scope.data.articles = rows.data;
        });

      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    };

    CoolFactory.hitTheServer('/articles/', '')
      .success(function (data) {
        window.localStorage.setItem('articles', JSON.stringify(data));
        $scope.data.articles = data;
        $scope.permissionToLoadMore = true;
      })
      .error(function () {
        console.log("No internet connection! retrieving data from cache");
        if (window.localStorage.getItem('articles') !== undefined) {
          $scope.data.articles = JSON.parse(window.localStorage.getItem('articles'));
          $scope.permissionToLoadMore = true;
        }
      });

    $scope.hasMoreData = true;

    // infinity scroll

    //initial values
    $scope.numberOfItemsToDisplay = 10;
    $scope.articleOffset = 1;

    $scope.items = [];

    $scope.loadMore = function () {
      if (!$scope.permissionToLoadMore) {
        return;
      }
      $scope.numberOfItemsToDisplay += 10;
      $scope.articleOffset += 10;

      CoolFactory.hitTheServer('/articlesMore/', $scope.articleOffset).success(function (items) {
        if (items.length > 0) {
          items.forEach(function (entry) {
            $scope.data.articles.push(entry);
          });
        } else {
          $scope.hasMoreData = false;
          console.log("All the articles are loaded!! no more to load...");
        }

        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.$on('$stateChangeSuccess', function () {
      $scope.loadMore();
    });


    // Share via native share sheet
    $scope.shareAnywhere = function (message, subject, file, link) {

      //vibrate
      navigator.vibrate(20);

      $cordovaSocialSharing
        .share(message, subject, file, link)
        .then(function (result) {
          //alert("Success " + result);
        }, function (err) {
          alert("Cannot share right now! " + err);
        });
    }

  })

  .controller('ArticleController', function ($http, $scope, $stateParams, CoolFactory) {

    //article id
    var id = $stateParams.id;
    $scope.article = null;
    CoolFactory.hitTheServer('/articles/', id)
      .success(function (data) {
        window.localStorage.setItem('articles'+id, JSON.stringify(data[0]));
        $scope.article = data[0];
        //console.log(rows.data);
      })
      .error(function () {

        if (window.localStorage.getItem('articles'+id) !== undefined) {
          $scope.article = JSON.parse(window.localStorage.getItem('articles'+id));
        }

      //console.log(rows.data);
    });

  })

  .controller('RatingsCtrl', function ($scope) {

    $scope.rankings = [
      {
        "img": "img/uni_logos/ruh.jpg",
        "name": "Uni two",
        "points": 1002,
        "position": 2
      },
      {
        "img": "img/uni_logos/uom.png",
        "name": "Uni one",
        "points": 1001,
        "position": 1
      },
      {
        "img": "img/uni_logos/University_of_Peradeniya_crest.png",
        "name": "Uni three",
        "points": 1003,
        "position": 3
      }
    ];

    /*$scope.rankings = null;

    CoolFactory.hitTheServer('/rankings/', '')
      .success(function (data) {

        data = bindImage(data);
        window.localStorage.setItem('rankings', JSON.stringify(data));
        $scope.rankings = data;
      })
      .error(function () {
        if (window.localStorage.getItem('rankings') !== undefined) {
          $scope.rankings = JSON.parse(window.localStorage.getItem('rankings'));
        }
      });
*/


  })


  .controller('AboutCtrl', function ($scope) {

  })


// functions to do the http requests using the API_HOST string ( API_HOST = link of the NODE server)
function CoolFactory($http, API_HOST) {
  var services = {};
  services.hitTheServer = function (route, id) {
    return $http.get(API_HOST + route + id);
  };
  return services;
}

// function to add 'img' attribute to each object in JSON array
function bindImage(data){
  data.forEach(function(record){
    record.img = 'img/uni_logos/' + record.name + '.jpg';
  }
  );
  return data;
}
