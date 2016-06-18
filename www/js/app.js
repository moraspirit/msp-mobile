// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter'  is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

// create the constant module
angular.module('starter.constants', []).constant('API_HOST', 'https://6b4e8525.ngrok.io');

angular.module('starter',
  ['ionic', 'ionic.service.core',
    'starter.controllers',
    'ngCordova',
    'ionic.service.push', 'ionic-material', 'ionicLazyLoad', 'starter.constants']
)

/*.controller('DashCtrl', function($scope, $ionicPush, $ionicPlatform) {
 $ionicPlatform.ready(function () {
 $ionicPush.init({
 "debug": true,
 "onNotification": function (notification) {
 var payload = notification.payload;
 console.log(notification, payload);
 },
 "onRegister": function (data) {
 console.log(data.token);
 }
 });

 $ionicPush.register();
 });
 })*/

/*
 .config(['$ionicAppProvider', function($ionicAppProvider) {
 $ionicAppProvider.identify({
 app_id: 'bafdfdc6',
 api_key: '811677f18d99b6126c55560dc9f74f75a209c3ff08d0a828',
 dev_push: true
 });
 }])

*/
  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      /* if (window.cordova && window.cordova.plugins.Keyboard) {
       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
       cordova.plugins.Keyboard.disableScroll(true);

       }
       if (window.StatusBar) {
       // org.apache.cordova.statusbar required
       StatusBar.styleDefault();
       }*/
      $ionicPlatform.ready(function () {
       /* var push = new Ionic.Push({
          "debug": true,
          "onNotification": function (notification) {
            var payload = notification.payload;
            console.log(notification, payload);
          },
          "onRegister": function (data) {
            console.log(data.token);
          },
          "pluginConfig": {
            "ios": {
              "badge": true,
              "sound": true
            },
            "android": {
              "iconColor": "#343434"
            }
          }
        });

        var callback = function(pushToken) {
          console.log(pushToken.token);
        }

        push.register(callback);

*/
      });

    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'

      })

      .state('app.articles', {
        url: '/articles',
        views: {
          'menuContent': {
            templateUrl: 'templates/articles.html',
            controller: 'ArticlesController'
          }
        }
      })
      .state('app.article-full', {
        url: '/articles/:id',
        views: {
          'menuContent': {
            templateUrl: 'templates/article-full.html',
            controller: 'ArticleController'
          },
          'fabContent': {
            // template: '<button id="fab-tweet" class="button button-fab button-fab-top-right expanded button-energized-900 flap"><i class="icon ion-social-twitter"></i></button>',
            // controller: function ($timeout) {
            //   $timeout(function () {
            //     document.getElementById('fab-tweet').classList.toggle('on');
            //   }, 200);
            // }
          }
        }
      })

      .state('app.album', {
        url: '/album',
        views: {
          'menuContent': {
            templateUrl: 'templates/album.html',
            controller: 'AlbumController'
          }
        }
      })
      .state('app.notifications', {
        url: '/notifications',
        views: {
          'menuContent': {
            templateUrl: 'templates/notifications.html',
          }
        }
      })

      .state('app.slug', {
        url: '/slug',
        views: {
          'menuContent': {
            templateUrl: 'templates/slug.html',
            controller: 'RecentScoresCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/articles');
  });

