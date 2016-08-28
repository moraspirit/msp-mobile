angular.module('moraSpirit',

  ['ionic', 'ionic.service.core',
    'moraSpirit.controllers',
    'ngCordova', 'nl2br',
    'ionic.service.push', 'ionic-material', 'ionicLazyLoad', 'ionic-cache-src']
)
  .constant('API_HOST', 'http://139.59.0.34:3000')
  .constant('GCM_SENDER_ID', '101029977116')

  .run(function ($ionicPlatform, $state, $http, $log, GCM_SENDER_ID) {
    $ionicPlatform.ready(function () {
      navigator.splashscreen.hide();

      // Clear the badge number automatically if the user taps on the app icon
      // cordova.plugins.notification.badge.configure({ autoClear: true });

      var push = PushNotification.init({
        android: {
          senderID: GCM_SENDER_ID,
          sound: true,
          vibrate: true,
          iconColor: 'lightgray',
          clearNotifications: false
        },
        ios: {
          alert: "true",
          badge: "true",
          sound: "true"
        },
        windows: {}
      });

      push.on('registration', function (data) {
        var deviceToken = data.registrationId;
        $log.log("registration ID is  " + deviceToken);
        var jsonObject = {token: deviceToken};

        // send deviceToken to the server API
        $http.post('http://6126f222.ngrok.io' + '/saveDeviceToken', JSON.stringify(jsonObject))
          .then(function (response) {
              $log.log("sent device token to API server successfully! response: " + response.status)
            }
            , function (response) {
              $log.log("Failed to send device token to API! response: " + response.status)
            });
      });
      // this block will run only when the app is on (in the foreground or in the background)
      // this block will run as soon as you open the app when there is push notification have sent to the device
      push.on('notification', function (data) {
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image,
        // data.additionalData

        // save the notification locally
        saveNotification(data.title, data.message, data.additionalData.payload.time);
        if ($state.current.name == 'app.notifications') {
          $state.go($state.current, {}, {reload: true});
        }

        // this block should call when a notification comes  -- move this block to the right place in the project
        /*     cordova.plugins.notification.badge.increase(1, function(badge){
         console.log('badge is now setup!!! as ' + badge);
         }, Object);*/

        // clear notifications badge - this block should call when the "recent" view is opened  -- move this block to the right place in the project
        /*   cordova.plugins.notification.badge.clear(function (badge) {
         console.log("notification badge is cleared");
         });
         */

        // when the notification was received while the app was in the foreground
        if (data.additionalData.foreground) {
          console.log("App was in the foreground");

          // make a toast message.
          window.plugins.toast.showWithOptions(
            {
              message: data.message,
              duration: "20000", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
              position: "bottom",
              addPixelsY: -40,  // added a negative value to move it up a bit (default 0)
              styling: {
                opacity: 0.75, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
                backgroundColor: '#000000', // make sure you use #RRGGBB. Default #333333
                textColor: '#FFFFFF', // Ditto. Default #FFFFFF
                textSize: 16, // Default is approx. 13.
                cornerRadius: 16, // minimum is 0 (square). iOS default 20, Android default 100
                horizontalPadding: 20, // iOS default 16, Android default 50
                verticalPadding: 16 // iOS default 12, Android default 30
              }
            },
            // on success
            function (result) {
              $log.log("Toast message successful");
              navigator.vibrate(500);
              // if the toast was touched
              if (result && result.event) {
                $log.log("The toast was tapped");
                navigator.vibrate([20, 20]);
                // route and go to the "recent" view
                $state.go('app.notifications');
              }
            },
            // on failure
            function () {
              $log.error("Toast message error")
            }
          );
        }
        // true if the application is started (it was not  in the back ground) by clicking on the push notification, false if the app is already started.
        if (data.additionalData.coldstart) {
          console.log("The app was started after the  push is clicked");
          //direct the route to the recent view
          $state.go('app.notifications');
        }
      });

      push.on('error', function (e) {
        $log.warn("can't register for the push notification service ERROR: " + e.message);
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
        cache: false,
        url: '/notifications',
        views: {
          'menuContent': {
            templateUrl: 'templates/notifications.html',
            controller: 'NotificationsCtrl'
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
      })
      .state('app.rankings', {
        url: '/rankings',
        views: {
          'menuContent': {
            templateUrl: 'templates/rankings.html',
            controller: 'RatingsCtrl'
          }
        }
      })
      .state('app.about', {
        url: '/about',
        views: {
          'menuContent': {
            templateUrl: 'templates/about.html',
            controller: 'AboutCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/articles');
  });

/**
 * Save a notification locally
 * @param topic
 * @param message
 * @param time
 * @returns {null}
 */
function saveNotification(topic, message, time) {
  var notification = {topic: topic, message: message, time: time};
  var tempArray = [];
  var notificationsArray = JSON.parse(window.localStorage.getItem('pushNotifications'));

  if (notificationsArray && notificationsArray.length > 20) {
    notificationsArray.shift();
  }
  if (notificationsArray) {
    //check for duplicates
    for (var key in notificationsArray) {
      if (notificationsArray[key].time == time) {
        return null;
      }
    }
    notificationsArray.push(notification);
    window.localStorage.setItem('pushNotifications', JSON.stringify(notificationsArray));
    $log.log("Notification saved in the app!");
  }
  else {
    tempArray.push(notification);
    window.localStorage.setItem('pushNotifications', JSON.stringify(tempArray));
    $log.log("Notification saved in the app!");
  }
}
