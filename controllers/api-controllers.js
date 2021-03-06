// Controllers for querying data from MySQL

// Node Dependencies
var express = require('express');
var apiRouter = express.Router();
var mysql = require('mysql');


// Import DB Connection JSON (used if on localhost)
var dbInfo = require('../models/dbInfo.json');


// MySQL Connections
// ===========================================================

// Declare Global Connection variable depending on environment
var connection;

// If deployed, use JawsDB
if(process.env.NODE_ENV == 'production') {
  connection = mysql.createConnection(process.env.JAWSDB_URL);
}
// Otherwise, use localhost connection
else {
  connection = mysql.createConnection(dbInfo);
}

// Connect to the Database
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});

// ===========================================================


// API - Retrieve Lat & Long Coordinates of selected Author (Lastname, Firstname) from MySQL
apiRouter.get('/api/map/author/:lastname/:firstname', function (req, res) {

  // Collect parameters
  var lastname = req.params.lastname;
  var firstname = req.params.firstname;

  // Read Database (Updated DB 2020)
  var stmt = "SELECT * " +
              "FROM authors a, records r, location_data loc " +
              "WHERE a.first_name = ? AND a.last_name = ? " +
              "AND r.id = loc.record_id AND a.id = r.author_id " +
              "ORDER BY year, month, day";
  // connection.query('SELECT * FROM letters, locdata WHERE firstname = ? AND lastname = ? AND letters.id = locdata.locationid ORDER BY ts_dateguess ASC', [firstname, lastname], function(err, response){
  connection.query(stmt, [firstname, lastname], function(err, response){

    if(err) throw err;

    // Export to Client Side
    res.json(response);

  });

});



// API - Retrieve Lat & Long Coordinates of All Letters
apiRouter.get('/api/map/search', function (req, res) {

  // Read Database (Updated DB 2020)
  var stmt = "SELECT * " +
              "FROM authors a, records r, location_data loc " +
              "WHERE r.id = loc.record_id AND a.id = r.author_id " +
              "ORDER BY year, month, day, lng, lat";
  // connection.query('SELECT * FROM letters, locdata WHERE letters.id = locdata.locationid ORDER BY ts_dateguess ASC, lng ASC, lat ASC', function(err, response){
  connection.query(stmt, function(err, response){
    if(err) throw err;

    // Export to Client Side
    res.json(response);

  });

});



// API - Retrieve Lat & Long Coordinates of selected Year, Branch, and Sex
apiRouter.post('/api/map/search', function (req, res) {

  // Collect parameters
  var year = req.body.year;
  var branch = req.body.branch;
  var sex = req.body.sex;

  // Set up proper "%" syntax for MySQL matching
  var myYear = year + "%"; // ex: "1941%" or "1942%" or "%"
  var myServiceBranch = branch + "%"; // ex: "Army%" or "Army (British)%" or "%"
  var mySex = sex + "%"; // ex: "M%" or "F%" or "%"

  // Read Database (Updated DB 2020)
  var stmt = "SELECT * " +
              "FROM authors a, records r, location_data loc " +
              "WHERE r.id = loc.record_id AND a.id = r.author_id " +
              "AND a.sex LIKE ? AND a.service_branch LIKE ? AND r.year LIKE ? " +
              "ORDER BY year, month, day, lng, lat";
  // connection.query('SELECT * FROM letters, locdata WHERE letters.id = locdata.locationid AND gender LIKE ? AND service_branch LIKE ? AND ts_dateguess LIKE ? ORDER BY ts_dateguess ASC, lng ASC, lat ASC', [mySex, myServiceBranch, myYear] , function(err, response){
  connection.query(stmt, [mySex, myServiceBranch, myYear] , function(err, response){
    if(err) throw err;

    // Export to Client Side
    res.json(response);

  });

});


// ----------------------------------------------------
// Export routes
module.exports = apiRouter;