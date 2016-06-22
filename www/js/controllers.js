angular.module('starter.controllers', ['starter.constants','ionic.service.core', 'ionic.service.push']).factory('CoolFactory', CoolFactory)

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

  .controller('AlbumController', function ($scope, $stateParams, $timeout, $http, ionicMaterialInk, ionicMaterialMotion, CoolFactory) {
    /* $scope.$parent.showHeader();
     $scope.$parent.clearFabs();
     $scope.isExpanded = true;
     $scope.$parent.setExpanded(true);
     $scope.$parent.setHeaderFab(false);

     // Activate ink for controller
     ionicMaterialInk.displayEffect();

     ionicMaterialMotion.pushDown({
     selector: '.push-down'
     });
     ionicMaterialMotion.fadeSlideInRight({
     selector: '.animate-fade-slide-in .item'
     });*/
    $scope.data = {};
    $scope.data.albums = [];
    $scope.permissionToLoadMore = false;
    $scope.goToAlbum = function (id) {
      window.open('https://www.facebook.com/moraspirit.fanpage/photos/?tab=album&album_id=' + id);
    };

    CoolFactory.hitTheServer('/albums/', '')
      .then(function (data) {
        $scope.data.albums = data.data.data;
        $scope.permissionToLoadMore = true;
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

  .controller('RecentScoresCtrl', function ($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');

    $timeout(function () {
      ionicMaterialMotion.fadeSlideIn({
        selector: '.animate-fade-slide-in .item'
      });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();
  })

  .controller('ArticlesController', function ($http, $scope, $stateParams, ionicMaterialInk, CoolFactory, $cordovaSocialSharing) {
    //ionicMaterialInk.displayEffect();
    $scope.data = {};
    $scope.data.articles = [];
    $scope.permissionToLoadMore = false;
    //CoolFactory.$inject = ['$http', 'API_HOST'];

    CoolFactory.hitTheServer('/articles', '')
      .then(function (rows) {
        $scope.data.articles = rows.data;
        //console.log(rows.data);
        $scope.permissionToLoadMore = true;
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
        console.log("success");
        console.log(items);
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
    $scope.shareAnywhere = function(message, subject, file, link) {
      $cordovaSocialSharing
        .share(message, subject, file, link)
        .then(function(result) {
          //alert("Success " + result);
        }, function(err) {
          alert("Cannot share right now! " + err);
        });
    }

  })

  .controller('ArticleController', function ($http, $scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, CoolFactory) {

    //article id
    var id = $stateParams.id;
    $scope.article = null;
    CoolFactory.hitTheServer('/articles/', id)
      .then(function (row) {
        $scope.article = row.data[0];
        //console.log(rows.data);
      });


    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

    // Set Motion
    $timeout(function () {
      ionicMaterialMotion.slideUp({
        selector: '.slide-up'
      });
    }, 300);

    $timeout(function () {
      ionicMaterialMotion.fadeSlideInRight({
        startVelocity: 3000
      });
    }, 700);

    // Set Ink
    ionicMaterialInk.displayEffect();


  })
  .controller('DashCtrl', function($scope, $ionicPush, $ionicPlatform) {
    $ionicPlatform.ready(function() {
      $ionicPush.init({
        "debug": true,
        "onNotification": function(notification) {
          var payload = notification.payload;
          console.log(notification, payload);
        },
        "onRegister": function(data) {
          console.log(data.token);
        }
      });

      $ionicPush.register();
    });
  })
/*
  .controller('PushCtrl', function ($scope, $rootScope, $ionicUser, $ionicPush) {

    $scope.identifyUser = function () {
      var user = $ionicUser.get();
      if (!user.user_id) {
        // Set your user_id here, or generate a random one.
        user.user_id = $ionicUser.generateGUID();
      }


      // Metadata
      angular.extend(user, {
        name: 'Malith',
        bio: 'Mora Spirit Crew'
      });

      // Identify your user with the Ionic User Service
      $ionicUser.identify(user).then(function () {
        $scope.identified = true;
        console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
      });
    };

    // Registers a device for push notifications
    $scope.pushRegister = function () {
      console.log('Ionic Push: Registering user');

      // Register with the Ionic Push service.  All parameters are optional.
      $ionicPush.register({
        canShowAlert: true, //Can pushes show an alert on your screen?
        canSetBadge: true, //Can pushes update app icon badges?
        canPlaySound: true, //Can notifications play a sound?
        canRunActionsOnWake: true, //Can run actions outside the app,
        onNotification: function (notification) {
          // Handle new push notifications here

          return true;
        }
      });
    };


    $rootScope.$on('$cordovaPush:tokenReceived', function (event, data) {
      alert("Successfully registered token " + data.token);
      console.log('Ionic Push: Got token ', data.token);
      $scope.token = data.token;
    });
  })

*/



  .controller('RatingsCtrl',function($scope){

    $scope.data=[
      {
        "img":"img/uni_logos/ruh.jpg",
        "name":"Uni two",
        "points":1002,
        "position":2
      },
      {
        "img":"img/uni_logos/uom.png",
        "name":"Uni one",
        "points":1001,
        "position":1
      },
      {
        "img":"img/uni_logos/University_of_Peradeniya_crest.png",
        "name":"Uni three",
        "points":1003,
        "position":3
      }
    ];



  })



  .controller('AboutCtrl',function($scope){

  })



// functions to do the http requests using the API_HOST string ( API_HOST = link of the NODE server)
function CoolFactory($http, API_HOST) {
  var services = {};
  services.hitTheServer = function (route, id) {
    console.log(route + ", " + id);
    return $http.get(API_HOST + route + id);
  };
  return services;
}
