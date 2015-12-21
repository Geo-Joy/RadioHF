(function(){
  'use strict';

  var app = angular.module('app', ['onsen', 'angular-images-loaded', 'ngAudio']);

  // Filter to convert HTML content to string by removing all HTML tags
  app.filter('htmlToPlaintext', function() {
      return function(text) {
        return String(text).replace(/<[^>]+>/gm, '');
      }
    }
  );

  app.controller('networkController', function($scope){

    ons.ready(function(){
      StatusBar.styleBlackOpaque();
    });

    // Check if is Offline
    document.addEventListener("offline", function(){

      offlineMessage.show();

      /*
       * With this line of code you can hide the modal in 8 seconds but the user will be able to use your app
       * If you want to block the use of the app till the user gets internet again, please delete this line.
       */

      setTimeout('offlineMessage.hide()', 8000);

    }, false);

    document.addEventListener("online", function(){
      // If you remove the "setTimeout('offlineMessage.hide()', 8000);" you must remove the comment for the line above
      // offlineMessage.hide();
    });

  });



  // Radio Controller
  var radio = null;
  var isPlaying = false;

  app.controller('radioController', function($scope, $sce, ngAudio){

    $scope.radioHost = 'http://50.7.77.114'; // Replace this with your own radio stream URL
    $scope.radioPort = '8269'; // Replace this with the port of your Radio Stream
    $scope.lastFMKey = 'ab68e9a71c1bb15efaa9c706b646dee4';
    $scope.lastFM = 'http://ws.audioscrobbler.com/2.0/?method=track.search&format=json&limit=1&api_key='+$scope.lastFMKey+'&track=';

    $scope.radioURL = $scope.radioHost+':'+$scope.radioPort+'/;';
    $scope.buttonIcon = '<span class="ion-ios-play"></span>';

    $scope.radioOptions = {
      albumArt: 'images/radio/cover.png',
      songName: ''
    }

    // Let's start the Shoutcast plugin to get the Song Name
    $.SHOUTcast({
       host : '50.7.77.114', // Replace this with your own radio stream URL but remove the http
       port : $scope.radioPort,
       interval : 40000, // Refresh interval in miliseconds is equal to 40 seconds.
       stream: 1, // Replace with your stream, default is 1.
       stats : function(){
          var songTitle = this.get('songtitle');
          var albumArt = '';

          $.getJSON( $scope.lastFM+encodeURIComponent(songTitle), function( data ) {
            if(data.error){
              //console.log(data.message);
              albumArt = 'images/radio/cover.png';
            } else {
              //console.log(data); // delete this for production
              if( data.results!== undefined ){
                if(data.results.trackmatches !="\n" ){
                  if(data.results.trackmatches.track.image !== undefined){
                    albumArt = data.results.trackmatches.track.image[3]['#text'];
                  } else {
                    albumArt = 'images/radio/cover.png';
                  }
                } else {
                  albumArt = 'images/radio/cover.png';
                }
              }
            }

            $scope.$apply(function(){
              $scope.radioOptions.albumArt = albumArt;
            });

          });

          $scope.$apply(function(){
            $scope.radioOptions.songName = songTitle;
          });
       }

    }).startStats();

    if (radio!==null) {
        $scope.radio = radio;

        if(isPlaying){
          $scope.buttonIcon = '<span class="ion-ios-pause"></span>';
        } else {
          $scope.buttonIcon = '<span class="ion-ios-play"></span>';
        }
    } else {

      isPlaying = false;
        $scope.radio = ngAudio.load($scope.radioURL);
        radio = $scope.radio;
    }

    $scope.renderHtml = function (htmlCode) {
          return $sce.trustAsHtml(htmlCode);
      };

      $scope.startRadio = function(){

        if(!isPlaying){
          // Let's play it
          isPlaying = true;
        $scope.radio.play();

        $scope.buttonIcon = '<span class="ion-ios-pause"></span>';
        $scope.isFetching = true;

        } else {
          // Let's pause it
          isPlaying = false;
        $scope.radio.pause();
        $scope.buttonIcon = '<span class="ion-ios-play"></span>';

        }

      }

      // Check if is Offline
    document.addEventListener("offline", function(){

      isPlaying = false;
      $scope.radio.stop();
      $scope.buttonIcon = '<span class="ion-ios-play"></span>';
      $scope.radio = null;
      modal.show();
      setTimeout('modal.hide()', 8000);

    }, false);

    document.addEventListener("online", function(){
      $scope.radio = ngAudio.load($scope.radioURL);
      radio = $scope.radio;
    });

  });

  var pad2 = function(number){
    return (number<10 ? '0' : '') + number;
  }

  app.filter('SecondsToTimeString', function() {
    return function(seconds) {
      var s = parseInt(seconds % 60);
      var m = parseInt((seconds / 60) % 60);
      var h = parseInt(((seconds / 60) / 60) % 60);
      if (seconds > 0) {
        return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
      } else {
        return '00:00:00';
      }
    }
  });


})();

