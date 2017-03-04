// Controllers for querying data from MySQL

// Node Dependencies
var express = require('express');
var dbRouter = express.Router();
var mysql = require('mysql');


// Import DB Connection JSON
var dbInfo = require('../dbInfo.json');
// console.log(dbInfo)



// GET - Retrieve all Authors (Lastname, Firstname) from MySQL
dbRouter.get('/api/authors/all', function (req, res) {
  
  // Link in Author Data
  // Declare Database
  var connection = mysql.createConnection(
    dbInfo
  );

  // Connect to the Database
  connection.connect(function(err) {
      if (err) throw err;
      console.log("connected as id " + connection.threadId);
  });

  // Read Database
  connection.query('SELECT DISTINCT lastname, firstname FROM letters ORDER BY lastname, firstname ASC', function(err, response){
    if(err) throw err;

    // Export to CLient Side
    res.json(response);

    // Disconnect from MySQL
    connection.end();
  });

});




// GET - Retrieve selected Author (Lastname, Firstname) from MySQL
dbRouter.get('/api/letters/all/:lastname/:firstname', function (req, res) {
  
  // Collect parameters
  var lastname = req.params.lastname;
  var firstname = req.params.firstname;

  // Declare Database
  var connection = mysql.createConnection(
    dbInfo
  );

  // Connect to the Database
  connection.connect(function(err) {
      if (err) throw err;
      console.log("connected as id " + connection.threadId);
  });

  // Read Database
  connection.query('SELECT letters.filename, archives.pages, letters.letterdate, letters.ts_dateguess FROM letters, archives WHERE letters.lastname = "' + lastname + '" AND letters.firstname = "' + firstname + '" AND letters.filename = archives.filename' + ' ORDER BY letters.letterdate DESC', function(err, response){
    if(err) throw err;

    // Export to CLient Side
    res.json(response);

    // Disconnect from MySQL
    connection.end();
  });

});




// GET - Retrieve Lat & Long Coordinates of selected Author (Lastname, Firstname) from MySQL
dbRouter.get('/api/map/all/:lastname/:firstname', function (req, res) {
  
  // Collect parameters
  var lastname = req.params.lastname;
  var firstname = req.params.firstname;

  // Declare Database
  var connection = mysql.createConnection(
    dbInfo
  );

  // Connect to the Database
  connection.connect(function(err) {
      if (err) throw err;
      console.log("connected as id " + connection.threadId);
  });

  // Read Database
  connection.query('SELECT * FROM letters,locdata WHERE firstname = "' + firstname + '" AND lastname = "' + lastname + '" AND letters.id = locdata.locationid ORDER BY ts_dateguess', function(err, response){
    if(err) throw err;

    // Export to Client Side
    res.json(response);

    // Disconnect from MySQL
    connection.end();
  });

});




// ----------------------------------------------------
// Export routes
module.exports = dbRouter;