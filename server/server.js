/**
 * Created by wathmal on 5/2/16.
 */
var express = require('express');
var mysql = require('mysql');
var FB = require('fb');
var cors = require('cors');

var https = require("https");

FB.setAccessToken('EAAOoAjs48vsBAEDsCtu0AsStZAveePZCXaJZB8NXTFdwFrAjRYodyJ828TwAaZABen2ZB3G38oEiyExGczNSByijxjpUBLmAZCXRzsQxUPhd2KeWrSEd2SwdMqK87xxRDDMlY1IzeNtXRtAf4HlH3SoHmZAxcWjVFUZD');

var pool = mysql.createPool({
  host: 'moraspirit.com',
  user: 'morasp5_slug2016',
  password: '!amSLUG2016',
  database: 'morasp5_moraspirit_main_db'
});

var app = express();
app.use(cors());

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

app.get('/push/:notification', function (req, res) {

  // var pushAdminID = req.params.pushAdminID; check this for authentication ??? -- nee a proper way

  // set the notification data
  var notification = req.params.notification;
  var parsedNotification = notification.split(":");
  var title = parsedNotification[1];
  var message = parsedNotification[2];
  var timeStamp = (new Date()).toLocaleString();

  var jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxMDFhNWUyYy1hODE2LTQwZGItYWFiZS0yNmI4MDIyZDQ1OTgifQ.2tajbRdGiauVBg2Ui4M0Th32cebalo1e6NEscO-vpiI'    // API Token - taken from ionic.io
  var tokens = ["cgvSXqLECxM:APA91bE30GkbLW_vjTMFf4whL64iaZPK4xROecaxcqXaAn_yoVY1F2WwufFz3IkDu26csxEIo8Y0YOdH6vGZnzsiduy1rKPUIL3Sc3gR_R0fRtlFr_IqN2VxoQB58yW0azzOMA2D2rWL"];   // these should be saved inside the server when each app is being registered with push notifi. service
  var profile = 'moraspirit';  // security-profile-name

  var msg = {
    "tokens": tokens,
    "profile": profile,
    "notification": {
      "title": title,
      "message": message,
      "payload": {
        "time": timeStamp
      }
    }
  };
  var myData = JSON.stringify(msg);

  var options = {
    hostname: 'api.ionic.io',
    port: 443,   // bcs https
    path: '/push/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt
    }
  };
  var req = https.request(options, function (res) {
    //console.log('Status: ' + res.statusCode);
    // console.log('Headers: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (body) {
      console.log("Notification sent successfully!");
      console.log('Body: ' + body);
    });
  });
  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });
// write data to request body
  req.write(myData);
  req.end();

});

app.listen(3000, function () {
  console.log('MoraSpirit Mobile APP API is listening on port 3000!');
});
