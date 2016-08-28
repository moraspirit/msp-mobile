angular.module('moraSpirit.controllers', ['ionic.service.core', 'ionic.service.push', 'ionic-cache-src'])
  .factory('CoolFactory', CoolFactory)
  .filter('URLmaker', function () {
  return function (input) {
    // do some bounds checking here to ensure it has that index.
    if (input) {
      var splittedString = input.split('/');
      return 'http://moraspirit.com/sites/default/files/styles/teaser_image/public/' + splittedString[2] + '/' + splittedString[3] + '/' + splittedString[4];
    }
  };
})
  .filter('FBurl', function () {
    return function (id) {
      if (id) {
        return 'https://www.facebook.com/moraspirit.fanpage/photos/?tab=album&album_id=' + id;
      }
    };
  })

  .controller('AppCtrl', function ($scope) {
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
      navIcons.addEventListener('click', function () {
        this.classList.toggle('active');
      });
    }

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

  .controller('AlbumController', function ($scope, $stateParams, $http, CoolFactory, $ionicLoading, $filter, $log) {
    $ionicLoading.show({template: '<ion-spinner class="spinner-assertive" icon="lines"></ion-spinner>'});
    $scope.data = {};
    $scope.data.albums = [];
    $scope.permissionToLoadMore = false;
    $scope.goToAlbum = function (id) {
      navigator.vibrate(20);
      window.open($filter('FBurl')(id));
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
        $scope.data.albums = data.data;
        window.localStorage.setItem('albums', JSON.stringify(data.data));
        $scope.permissionToLoadMore = true;
      })
      .error(function () {
        $log.info("No internet connection!");
        if (window.localStorage.getItem('albums') !== undefined) {
          $scope.data.albums = JSON.parse(window.localStorage.getItem('albums'));
          $scope.permissionToLoadMore = true;
        }
      }).finally(function () {
      $ionicLoading.hide();
    });
    $scope.hasMoreData = true;

    // infinity scroll initial values
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
          $log.info("All the albums are loaded!! no more to load...");
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };
    $scope.$on('$stateChangeSuccess', function () {
      $scope.loadMore();
    });
  })

  .controller('NotificationsCtrl', function ($scope, $ionicLoading) {
    $ionicLoading.show({template: '<ion-spinner class="spinner-assertive"  icon="lines"></ion-spinner>'});
    $scope.notifications = JSON.parse(window.localStorage.getItem('pushNotifications'));
    $ionicLoading.hide();
  })

  .controller('RecentScoresCtrl', function ($scope, $state) {
    //$ionicLoading.show({template:'<ion-spinner class="spinner-assertive"></ion-spinner>'});
    $scope.cards = [];

    $scope.img = function (uni) {
      return 'img/uni_logos/' + uni + '.png';
    };

    $scope.getTown = function (uniWon) {
      switch (uniWon) {
        case 'MOR':
          return 'Moratuwa';
        case 'SAB':
          return 'Sabaragamuwa';
        case 'PER':
          return 'Peradeniya';
        case 'COL':
          return 'Colombo';
        case 'EST':
          return 'Eastern';
        case 'SEA':
          return 'Peradeniya';
        case 'VPA':
          return 'VPA';
        case 'RHU':
          return 'Ruhuna';
        case 'UVA':
          return 'Uva';
        case 'RAJ':
          return 'Rajarata';
        case 'JAF':
          return 'Jaffna';
        case 'WAY':
          return 'Wayamba';
        case 'KEL':
          return 'Kelaniya';
        case 'SJP':
          return "J'PURA";
        default:
          return uniWon;

      }
    };

    // dummy data
    $scope.cards = [{
      match: 'RUGBY (MEN) - 1st ROUND',
      uniWon: 'COL',
      uniLost: 'SAB',
      uniWonPoints: 10,
      uniLostPoints: 5,
    },
      {
        match: 'Hockey (MEN) - 3rd ROUND',
        uniWon: 'MOR',
        uniLost: 'COL',
        uniWonPoints: 25,
        uniLostPoints: 15,
      }, {
        match: 'Swimming (Women) - Finals',
        uniWon: 'PER',
        uniLost: 'COL',
        uniWonPoints: 5,
        uniLostPoints: 4,
      }, {
        match: 'Swimming (Men) - Finals',
        uniWon: 'JAF',
        uniLost: 'COL',
        uniWonPoints: 7,
        uniLostPoints: 3,
      }, {
        match: 'Karate - Finals',
        uniWon: 'KEL',
        uniLost: 'COL',
        uniWonPoints: 7,
        uniLostPoints: 6,
      }, {
        match: 'Tykwondo - Finals',
        uniWon: 'RAJ',
        uniLost: 'COL',
        uniWonPoints: 9,
        uniLostPoints: 5,
      }, {
        match: 'Fottball- Finals',
        uniWon: 'RHU',
        uniLost: 'COL',
        uniWonPoints: 17,
        uniLostPoints: 14,
      }, {
        match: 'Netball - Finals',
        uniWon: 'SEA',
        uniLost: 'COL',
        uniWonPoints: 8,
        uniLostPoints: 4,
      }, {
        match: 'Basketball - Finals',
        uniWon: 'SJP',
        uniLost: 'COL',
        uniWonPoints: 7,
        uniLostPoints: 4,
      }, {
        match: 'Badminton - Finals',
        uniWon: 'UVA',
        uniLost: 'COL',
        uniWonPoints: 2,
        uniLostPoints: 1,
      }, {
        match: 'Elle) - Finals',
        uniWon: 'WAY',
        uniLost: 'COL',
        uniWonPoints: 2,
        uniLostPoints: 1,
      }, {
        match: 'Rugby - Mens',
        uniWon: 'EST',
        uniLost: 'COL',
        uniWonPoints: 7,
        uniLostPoints: 4,
      },
    ];


  })

  .controller('ArticlesController', function ($http, API_HOST, $scope, $stateParams, ionicMaterialInk, CoolFactory, $cordovaSocialSharing, $ionicLoading, $log) {
    $ionicLoading.show({template: '<ion-spinner class="spinner-assertive"  icon="lines"></ion-spinner>'});
    $scope.data = {};
    $scope.data.articles = [];
    $scope.permissionToLoadMore = false;

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
        $log.info("No internet connection! retrieving data from cache");
        if (window.localStorage.getItem('articles') !== undefined) {
          $scope.data.articles = JSON.parse(window.localStorage.getItem('articles'));
          $scope.permissionToLoadMore = true;
        }
      }).finally(function () {
      $ionicLoading.hide();
    });

    $scope.hasMoreData = true;
    //infinity scroll initial values
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
          $log.info("All the articles are loaded!! no more to load...");
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };
    $scope.$on('$stateChangeSuccess', function () {
      $scope.loadMore();
    });

    // Share via native share sheet
    $scope.shareAnywhere = function (message, subject, file, link) {
      navigator.vibrate(20);
      $cordovaSocialSharing
        .share(message, subject, file, link)
        .then(function () {
         $log.log('Native share window opened');
        }, function (err) {
          alert("Cannot share right now! " + err);
          $log.error("Cannot share right now! " + err);
        });
    }
  })

  .controller('ArticleController', function ($http, $scope, $stateParams, CoolFactory, $ionicLoading) {
    $ionicLoading.show({template: '<ion-spinner class="spinner-assertive"  icon="lines"></ion-spinner>'});
    var id = $stateParams.id;
    $scope.article = null;
    CoolFactory.hitTheServer('/articles/', id)
      .success(function (data) {
        window.localStorage.setItem('articles' + id, JSON.stringify(data[0]));
        $scope.article = data[0];
      })
      .error(function () {
        if (window.localStorage.getItem('articles' + id) !== undefined) {
          $scope.article = JSON.parse(window.localStorage.getItem('articles' + id));
        }
      }).finally(function () {
      $ionicLoading.hide();
    });
  })

  .controller('RatingsCtrl', function ($scope, $http, $ionicLoading) {
    $ionicLoading.show({template: '<ion-spinner class="spinner-assertive"  icon="lines"></ion-spinner>'});
    $scope.rankings = null;
    $http.get('http://sports.moraspirit.com/getscores')
      .success(function (data) {
        data = bindImageANDparsePointsTOint(data[0]);

        function compare(a, b) {
          if (a.points < b.points)
            return -1;
          if (a.points > b.points)
            return 1;
          return 0;
        }
        data.sort(compare);
        data = bindRank(data.reverse());
        window.localStorage.setItem('rankings', JSON.stringify(data));
        $scope.rankings = data;
      })
      .error(function () {
        if (window.localStorage.getItem('rankings') !== undefined) {
          $scope.rankings = JSON.parse(window.localStorage.getItem('rankings'));
        }
      }).finally(function () {
      $ionicLoading.hide();
    });
  })

  .controller('AboutCtrl', function ($scope) {
  });

// functions to do the http requests using the API_HOST string ( API_HOST = link of the NODE server)
function CoolFactory($http, API_HOST) {
  var services = {};
  services.hitTheServer = function (route, id) {
    return $http.get(API_HOST + route + id);
  };
  return services;
}

// function to add 'img' attribute to each object in JSON array
function bindImageANDparsePointsTOint(data) {
  data.forEach(function (record) {

      switch (record.name) {
        case 'MOR':
          record.img = 'img/uni_logos/MOR.png';
          record.name = 'UOM';
          break;
        case 'COL':
          record.img = 'img/uni_logos/COL.png';
          record.name = 'UOC';
          break;
        case 'SJP':
          record.img = 'img/uni_logos/SJP.png';
          record.name = 'USJP';
          break;
        case 'PER':
          record.img = 'img/uni_logos/PER.png';
          record.name = 'UOP';
          break;
        case 'KEL':
          record.img = 'img/uni_logos/KEL.png';
          record.name = 'UOK';
          break;
        default:
          record.img = 'img/uni_logos/' + record.name + '.png';
      }
      record.points = parseInt(record.points);
    }
  );
  return data;
}

function bindRank(data) {
  var rank = 1;
  var rankboost = 0;
  for (var i = 0; i < data.length - 1; i++) {
    data[i].rank = rank;
    if (data[i].points > data[i + 1].points) {
      rank += (rankboost + 1 );
      rankboost = 0;
    }
    else {
      rankboost++;
    }
  }
  data[data.length - 1].rank = rank;
  return data;
}

