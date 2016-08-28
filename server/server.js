/**
 * Created by wathmal on 5/2/16.+
 * Concluded by Malith on 27/08/16
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
var MONGO_URL = 'mongodb://mspmalith:123123@ds153765.mlab.com:53765/moraspiritpush';
var GCM_API_KEY = "AIzaSyCKWUYkrXOfPXTCtw6eJvlNh-n2WZw7fOk";
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

/**
 * remove this!!!
 */
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

/**
 * Returns the newest 10 articles
 */
app.get('/articles', function (req, res) {

  var query = 'SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT uid, nid, title, created  from  (SELECT nid, title, created FROM `msp_node` where type=\'featured_article\' or type=\'sports_article\' ORDER BY created DESC  LIMIT 10)  a NATURAL JOIN `msp_node_revision`  b ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid';
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err);
    }
    connection.query(query, function (err, rows, fields) {
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

/**
 * Return 10 articles published way back from the article offset
 */
app.get('/articlesMore/:articleOffset', function (req, res) {

  var articleOffset = parseInt(req.params.articleOffset);
  var query = "SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT uid, nid, title, created  from  (SELECT nid, title, created FROM `msp_node` where type=\'featured_article\' or type=\'sports_article\' ORDER BY created DESC  LIMIT 10 OFFSET ? )  a NATURAL JOIN `msp_node_revision`  b ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid";
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err);
    }
    connection.query(query, [articleOffset], function (err, rows, fields) {
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

/**
 * Returns single article for the passed ID
 */
app.get('/articles/:articleId', function (req, res) {

  var articleId = req.params.articleId;
  var query = "SELECT  n.title, u.name,FROM_UNIXTIME(n.created,' %D %M %Y %h:%i:%p ') as created, FROM_UNIXTIME(n.timestamp,'%Y %D %M %h:%i:%p') as modified, fdb.body_value, nfi.uri FROM (SELECT uid, nid, title, created, timestamp  from  (SELECT nid, title, created FROM `msp_node` where nid = " + articleId + ")  a NATURAL JOIN `msp_node_revision`  b ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ;";
  pool.getConnection(function (err, connection) {
    if (err) {
      res.status(500).json(err);
    }
    connection.query(query, function (err, rows, fields) {
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

/**
 * Return 10 facebook albums per request with following data
 * -album name
 * -cover photo  (id, created time)
 * -likes (count)
 * -comments (count)
 */
app.get('/albums', function (req, res) {
  FB.api('moraspirit.fanpage/albums?fields=name,cover_photo,likes.limit(0).summary(true),comments.limit(0).summary(true)&limit=10', function (data) {
    if (!data || data.error) {
      console.log(!res ? 'error occurred' : res.error);  // TODO: add LOG....!
      res.status(500).json(data);
    }
    else {
      res.json(data);
    }
  });
});

/**
 * Return 10 more facebook albums from the offset
 */
app.get('/albumsMore/:albumOffset', function (req, res) {
  var albumOffset = req.params.albumOffset;
  FB.api('moraspirit.fanpage/albums?fields=name,cover_photo,likes.limit(0).summary(true),comments.limit(0).summary(true)&limit=10&offset=' + albumOffset, function (data) {
    if (!data || data.error) {
      console.log(!res ? 'error occurred' : res.error);
      res.status(500).json(data);
    }
    else {
      res.json(data);
    }
  });
});

/**
 * post push notification request to the GCM
 * Moraspirit Pushpanel IONIC app calls this method
 */
app.post('/push', function (req, res) {
  // TODO: var pushAdminID = req.params.pushAdminID; check this for authentication ??? -- need a proper way

  var title = req.body.title;
  var msg = req.body.message;
  var timeStamp = (new Date()).toLocaleString();

  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);  // TODO: LOG this
    } else {
      console.log('Connection established to', MONGO_URL);   // TODO: LOG this
      var collection = db.collection('device_tokens');
      collection.find({}).toArray(function (err, result) {
        if (err) {
          console.log(err);   // TODO: LOG this
        } else if (result.length) {
          var tokens = [];
          result.forEach(function (document) {
            tokens.push(document.token);
          });
          console.log(tokens);   // TODO: LOG this
          var service = new gcm.Sender(GCM_API_KEY);
          var message = new gcm.Message();
          message.addData('title', title);
          message.addData('message', msg);
          message.addData('content-available', 1);  // activate on notification method while app is in the background
          message.addData('payload', {time: timeStamp});

          // this should be improved to a counter.....
          var min = Math.ceil(1);
          var max = Math.floor(1000);
          var notId = Math.floor(Math.random() * (max - min)) + min;
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
              console.log("Notification sent successfully!");  // TODO: LOG this
              console.log('response: ' + JSON.stringify(response));  // TODO: LOG this
              res.send("success");
            }
          });
        } else {
          console.log('No devices are registered yet!!');  // TODO: LOG this
        }
      });
      db.close();
    }
  });
});

/**
 * Retrieve device token from mobile phone
 */
app.post('/saveDeviceToken', function (req, res) {
  var token = req.body.token;
  console.log(token);  // TODO: log this

  MongoClient.connect(MONGO_URL, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);   // TODO: log this
    } else {
      console.log('Connection established to', MONGO_URL);   // TODO: log this
      var collection = db.collection('device_tokens');
      var deviceTokenJSONObject = {token: token};
      collection.updateOne({token: token}, deviceTokenJSONObject, {upsert: true}, function (err, result) {
        if (err) {
          console.log("Error while saving device token in db" + err);  // TODO: log this
          res.send("error");
        } else if (result.modifiedCount == 1) {
          console.log('The device is already registered');   // TODO: log this
          res.send("success");
        }
        else {
          console.log('Successfully saved new device token in db'); // TODO: log this
          res.send("success");
        }
      });
      db.close();
    }
  });
});

// TODO: This port should be changed (MORA can't request 3000!!!
app.listen(3000, function () {
  console.log('MoraSpirit Mobile APP API is listening on port 3000!');   // TODO: log this
});
