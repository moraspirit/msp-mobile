/**
 * Created by wathmal on 5/2/16.+
 * Concluded by Malith on 26/08/16
 */
var express = require('express');
var mysql = require('mysql');
var FB = require('fb');
var cors = require('cors');

var https = require("https");
var myParser = require("body-parser");
var gcm = require('node-gcm');

//import the mongodb native drivers.
var mongodb = require('mongodb');
//"MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. (This is where your mongodb server is running)
var url = 'mongodb://mspmalith:123123@ds153765.mlab.com:53765/moraspiritpush';

var FB_ACCESS_TOKEN = 'EAAOoAjs48vsBAEDsCtu0AsStZAveePZCXaJZB8NXTFdwFrAjRYodyJ828TwAaZABen2ZB3G38oEiyExGczNSByijxjpUBLmAZCXRzsQxUPhd2KeWrSEd2SwdMqK87xxRDDMlY1IzeNtXRtAf4HlH3SoHmZAxcWjVFUZD';
FB.setAccessToken(FB_ACCESS_TOKEN);

var pool = mysql.createPool({
  host: 'moraspirit.com',
  user: 'morasp5_slug2016',
  password: '!amSLUG2016',
  database: 'morasp5_moraspirit_main_db'
});

var app = express();
app.use(cors());

// to consume post data
app.use(myParser.json());
app.use(myParser.urlencoded({extended: true}));

// TODO: comment the API methods about what is returning

app.get('/', function (req, res) {
  var query = 'SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from `msp_node_revision` NATURAL JOIN `msp_node` ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10 ';

  // using connection pool
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err);
    }
    connection.query(query, function (err, rows) {
      // release connection to pool
      connection.release();
      if (err) {
        res.status(500).json(err);
      }
      else {
        res.json(rows);
      }
    });
  });

//optimized query  SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from (select nid, title, created from `msp_node` ORDER BY created DESC LIMIT 10) as a  NATURAL JOIN `msp_node_revision`  ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ;


});

app.get('/articles', function (req, res) {

  var query = 'SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT uid, nid, title, created  from  (SELECT nid, title, created FROM `msp_node` where type=\'featured_article\' or type=\'sports_article\' ORDER BY created DESC  LIMIT 10)  a NATURAL JOIN `msp_node_revision`  b ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid';
  // using connection pool
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err);
    }
    connection.query(query, function (err, rows, fields) {
      // release connection to pool
      connection.release();
      if (err) {
        res.status(500).json(err);
      }

      else {
        res.json(rows);
      }
    });
  });
});

app.get('/articles/:articleId', function (req, res) {

  var articleId = req.params.articleId;

  var query = "SELECT  n.title, u.name,FROM_UNIXTIME(n.created,' %D %M %Y %h:%i:%p ') as created, FROM_UNIXTIME(n.timestamp,'%Y %D %M %h:%i:%p') as modified, fdb.body_value, nfi.uri FROM (SELECT uid, nid, title, created, timestamp  from  (SELECT nid, title, created FROM `msp_node` where nid = " + articleId + ")  a NATURAL JOIN `msp_node_revision`  b ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ;";

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err);
    }
    connection.query(query, function (err, rows, fields) {
      // release connection to pool
      connection.release();
      if (err) {
        res.status(500).json(err);
      }

      else {
        res.json(rows);
      }
    });
  });
});


app.get('/articlesMore/:articleOffset', function (req, res) {
  var articleOffset = parseInt(req.params.articleOffset);
  console.log("article Offset is : " + articleOffset);

  var query = "SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT uid, nid, title, created  from  (SELECT nid, title, created FROM `msp_node` where type=\'featured_article\' or type=\'sports_article\' ORDER BY created DESC  LIMIT 10 OFFSET ? )  a NATURAL JOIN `msp_node_revision`  b ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid";

  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err);
    }
    connection.query(query, [articleOffset], function (err, rows, fields) {
      // release connection to pool
      connection.release();
      if (err) {
        res.status(500).json(err);
      }

      else {
        res.json(rows);
      }
    });
  });


});


app.get('/albums', function (req, res) {
  FB.api('moraspirit.fanpage/albums?fields=name,cover_photo,likes.limit(0).summary(true),comments.limit(0).summary(true)&limit=10', function (data) {
    if (!data || data.error) {
      console.log(!res ? 'error occurred' : res.error);
      res.status(500).json(data);
    }

    else {
      res.json(data);
    }
  });


})

app.get('/albumsMore/:articleOffset', function (req, res) {
  var articleOffset = req.params.articleOffset;
  console.log("article Offset is : " + articleOffset);
  FB.api('moraspirit.fanpage/albums?fields=name,cover_photo,likes.limit(0).summary(true),comments.limit(0).summary(true)&limit=10&offset=' + articleOffset, function (data) {

    if (!data || data.error) {
      console.log(!res ? 'error occurred' : res.error);
      res.status(500).json(data);
    }

    else {
      res.json(data);
    }
  });

});


// API call from MoraSpirit PushPanel IONIC app
app.post('/push', function (req, res) {

  // var pushAdminID = req.params.pushAdminID; check this for authentication ??? -- nee a proper way

  // set the notification data
  var title = req.body.title;
  var msg = req.body.message;
  var timeStamp = (new Date()).toLocaleString();
  var jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxMDFhNWUyYy1hODE2LTQwZGItYWFiZS0yNmI4MDIyZDQ1OTgifQ.2tajbRdGiauVBg2Ui4M0Th32cebalo1e6NEscO-vpiI'    // API Token - taken from ionic.io

  // var tokens = ["cgvSXqLECxM:APA91bE30GkbLW_vjTMFf4whL64iaZPK4xROecaxcqXaAn_yoVY1F2WwufFz3IkDu26csxEIo8Y0YOdH6vGZnzsiduy1rKPUIL3Sc3gR_R0fRtlFr_IqN2VxoQB58yW0azzOMA2D2rWL"];   // these should be saved inside the server when each app is being registered with push notifi. service
  var profile = 'moraspirit';  // security-profile-name


  // Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      // Get the documents collection
      var collection = db.collection('device_tokens');

      // retrieve device tokens
      collection.find({}).toArray(function (err, result) {
        if (err) {
          console.log(err);
        } else if (result.length) {

          var tokens = [];
          result.forEach(function (document) {
            tokens.push(document.token);
          });

          console.log(tokens);


          var apiKey = "AIzaSyCKWUYkrXOfPXTCtw6eJvlNh-n2WZw7fOk";
          var service = new gcm.Sender(apiKey);
          var message = new gcm.Message();
          message.addData('title', title);
          message.addData('message', msg);
          message.addData('content-available', 1);
          message.addData('payload', {time: timeStamp});


          // this should be improved to a counter.....
          var min = Math.ceil(1);
          var max = Math.floor(1000);
          var notId = Math.floor(Math.random() * (max - min)) + min;
          console.log(notId);

          message.addData('notId', notId);

          /***
           * For Inbox Stacking -  will use this after phonegap push plugin developers resolves ISSUE #314
           */
          //message.addData('style', 'inbox');
          // message.addData('summaryText', 'There are %n% notifications');


          service.sendNoRetry(message, {registrationTokens: tokens}, function (err, response) {
            if (err) {
              console.log('problem with request: ' + err);
            }
            else {
              console.log("Notification sent successfully!");
              console.log('response: ' + JSON.stringify(response));
              res.send("success");
            }
          });


        } else {
          console.log('No devices are registered yet!!');
        }
      });


      //Close connection
      db.close();
    }
  });


});

// retrieve device token from mobile phone
app.post('/saveDeviceToken', function (req, res) {
  var token = req.body.token;

  console.log(token);


  // save the token in db
  // Use connect method to connect to the Server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      //HURRAY!! We are connected. :)
      console.log('Connection established to', url);

      // Get the documents collection
      var collection = db.collection('device_tokens');

      var deviceTokenJSONobject = {token: token};

      // insert deviceToken in to db
      collection.updateOne({token: token}, deviceTokenJSONobject, {upsert: true}, function (err, result) {
        if (err) {
          console.log("Error while saving device token in db" + err);
          res.send("error");
        } else if (result.modifiedCount == 1) {

          console.log('The device is already registered');
          res.send("success");
        }
        else {
          console.log('Successfully saved new device token in db');
          res.send("success");
        }
      });

      //Close connection
      db.close();
    }
  });

});

app.listen(3000, function () {
  console.log('MoraSpirit Mobile APP API is listening on port 3000!');
});
