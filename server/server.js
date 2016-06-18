/**
 * Created by wathmal on 5/2/16.
 */
var express = require('express');
var mysql = require('mysql');
var FB = require('fb');
var cors = require('cors');
FB.setAccessToken('EAAOoAjs48vsBAJwpXuMhANsJ5ZCnkIAv9LHvNgIco3YllaxR665VNaBEpo0D0RGjF2MuIZAqfZB5ZCeKEusCOw9NFWEgD8tZB0M7xC9lEv7OhU1Iim9yaz2Q7RwNnfR5vPT2fSewbFdbW8ZBNOypDK');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'morasp5_moraspirit_main_db'
});
var app = express();
app.use(cors());

connection.connect(function (err) {
  if (!err) {
    console.log("Database is connected ... \n\n");
  } else {
    console.log("Error connecting database ... \n\n");
  }
});

app.get('/', function (req, res) {
  // SELECT * FROM `msp_node`  LEFT JOIN `msp_users` ON msp_node.uid= msp_users.uid ORDER BY msp_node.created DESC  LIMIT 10
  // SELECT title, name, msp_node.created FROM `msp_node` LEFT JOIN `msp_users` ON msp_node.uid= msp_users.uid ORDER BY msp_node.created DESC  LIMIT 10
  // SELECT n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM `msp_node` n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM `msp_field_data_field_featured_article_image` fdffai LEFT JOIN `msp_file_managed` fm ON fdffai.field_featured_article_image_fid = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10
  // SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from `msp_node_revision` NATURAL JOIN `msp_node` ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10

  var query = 'SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from `msp_node_revision` NATURAL JOIN `msp_node` ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10 ';
  connection.query(query, function (err, rows, fields) {
    if (err) {
      res.status(500).json(err);
    }

    else {
      res.json(rows);
    }
  });
//optimized query  SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from (select nid, title, created from `msp_node` ORDER BY created DESC LIMIT 10) as a  NATURAL JOIN `msp_node_revision`  ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ;


});

app.get('/articles', function (req, res) {

  var query = 'SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT uid, nid, title, created  from  (SELECT nid, title, created FROM `msp_node` ORDER BY created DESC  LIMIT 10)  a NATURAL JOIN `msp_node_revision`  b ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid';
  connection.query(query, function (err, rows, fields) {
    if (err) {
      res.status(500).json(err);
    }

    else {
      res.json(rows);
    }
  });

});

app.get('/articles/:articleId', function (req, res) {

  var articleId = req.params.articleId;

  var query = "SELECT  n.title, u.name,FROM_UNIXTIME(n.created,' %D %M %Y %h:%i:%p ') as created, FROM_UNIXTIME(n.timestamp,'%Y %D %M %h:%i:%p') as modified, fdb.body_value, nfi.uri FROM (SELECT uid, nid, title, created, timestamp  from  (SELECT nid, title, created FROM `msp_node` where nid = " + articleId + ")  a NATURAL JOIN `msp_node_revision`  b ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ;";
  connection.query(query, function (err, rows, fields) {
    if (err) {
      res.status(500).json(err);
    }

    else {
      res.json(rows);
    }
  });

});


app.get('/articlesMore/:articleOffset', function (req, res) {
  var articleOffset = parseInt(req.params.articleOffset);
  console.log("article Offset is : " + articleOffset);

  var query = "SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT uid, nid, title, created  from  (SELECT nid, title, created FROM `msp_node` ORDER BY created DESC  LIMIT 10 OFFSET ? )  a NATURAL JOIN `msp_node_revision`  b ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid";

  connection.query(query,[articleOffset], function (err, rows, fields) {
    if (err) {
      res.status(500).json(err);
    }

    else {
      res.json(rows);
    }
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

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
