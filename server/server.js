/**
 * Created by wathmal on 5/2/16.
 */
var express = require('express');
var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'mobileapp',
  password : 'abc123',
  database : 'morasp5_moraspirit_main_db'
});
var app = express();
connection.connect();

app.get('/', function (req, res) {
  // SELECT * FROM `msp_node`  LEFT JOIN `msp_users` ON msp_node.uid= msp_users.uid ORDER BY msp_node.created DESC  LIMIT 10
  // SELECT title, name, msp_node.created FROM `msp_node` LEFT JOIN `msp_users` ON msp_node.uid= msp_users.uid ORDER BY msp_node.created DESC  LIMIT 10
  // SELECT n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM `msp_node` n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM `msp_field_data_field_featured_article_image` fdffai LEFT JOIN `msp_file_managed` fm ON fdffai.field_featured_article_image_fid = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10
  // SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from `msp_node_revision` NATURAL JOIN `msp_node` ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10

  var query = 'SELECT n.nid, n.title, u.name, n.created, fdb.body_summary, nfi.uri FROM (SELECT * from `msp_node_revision` NATURAL JOIN `msp_node` ) n LEFT JOIN `msp_field_data_body` fdb ON fdb.entity_id = n.nid LEFT JOIN (SELECT * FROM (SELECT entity_id, `field_featured_article_image_fid` AS fidd FROM `msp_field_data_field_featured_article_image` UNION SELECT entity_id, `field_sports_image_fid` AS fidd FROM `msp_field_revision_field_sports_image`) AS fi LEFT JOIN `msp_file_managed` fm ON fi.fidd = fm.fid) nfi ON nfi.entity_id = n.nid LEFT JOIN `msp_users` u ON n.uid= u.uid ORDER BY n.created DESC  LIMIT 10 ';
  connection.query(query, function(err, rows, fields) {
    if (err) throw err;

    res.send(JSON.stringify(rows));
  });


});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
