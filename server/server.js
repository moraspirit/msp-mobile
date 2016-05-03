/**
 * Created by wathmal on 5/2/16.
 */
var express = require('express');
var mysql      = require('mysql');
var FB = require('fb');
var cors = require('cors');
FB.setAccessToken('EAACEdEose0cBAA0jCzZBU9tdjZAKkj3QOZBxORCbZACduOETgQDfSXl6fh4seDjPgKLX4wHD407osZCBAruniD6SVntKHiFJAuyAMQScF0cqBZBY2cL1CJSY6nPWZB9FJJIDfjfhNa9ndIJJex5fKPsaCsKbJgVITbnJuPwiXbUSwZDZD');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'mobileapp',
  password : 'abc123',
  database : 'morasp5_moraspirit_main_db'
});
var app = express();
app.use(cors());

connection.connect();

app.get('/', function (req, res) {
  // SELECT * FROM `msp_node`  LEFT JOIN `msp_users` ON msp_node.uid= msp_users.uid ORDER BY msp_node.created DESC  LIMIT 10
  // SELECT title, name, msp_node.created FROM `msp_node` LEFT JOIN `msp_users` ON msp_node.uid= msp_users.uid ORDER BY msp_node.created DESC  LIMIT 10
  // SELECT n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM `msp_node` n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM `msp_field_data_field_featured_article_image` fdffai LEFT JOIN `msp_file_managed` fm ON fdffai.field_featured_article_image_fid = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10
  // SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from `msp_node_revision` NATURAL JOIN `msp_node` ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10

  var query = 'SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from `msp_node_revision` NATURAL JOIN `msp_node` ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10 ';
  connection.query(query, function(err, rows, fields) {
    if (err) {
      res.status(500).json(err);
    }

    else {
      res.json(rows);
    }
  });


});

app.get('/articles', function (req, res) {

  var query = 'SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from `msp_node_revision` NATURAL JOIN `msp_node` ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10 ';
  connection.query(query, function(err, rows, fields) {
    if (err) {
      res.status(500).json(err);
    }

    else {
      res.json(rows);
    }
  });


});

app.get('/albums', function (req, res) {
  FB.api('moraspirit.fanpage/albums?fields=comments{comment_count},cover_photo,name&limit=10', function (data) {
    if(!data || data.error) {
      console.log(!res ? 'error occurred' : res.error);
      res.status(500).json(data);
    }

    else {
      res.json(data);
    }
  });


})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
