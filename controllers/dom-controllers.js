// Controllers for rendering webpages to DOM

// Node Dependencies
var express = require('express');
var domRouter = express.Router();
var mysql = require('mysql');


// Import AWS S3 Get TXT File Function
var getS3Text = require('./s3-controllers.js').getS3Text;

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



// GET - Index Home Page Render
domRouter.get('/', function (req, res) {
  res.render('index');
});



// ~ ~ ~ ~ ~ Reading Routes ~ ~ ~ ~ ~

// GET - Reading Page Render
domRouter.get('/reading', function (req, res) {
  res.render('reading/reading-menu');
});



// REDIRECT - To Search Authors By Starting Letter of Lastname Page Render
domRouter.get('/search/authors', function (req, res) {
  // If no letter was selected, re-direct to A
  res.redirect('/search/authors/a');
});


// GET - Search Authors By Starting Letter of Lastname Page Render
domRouter.get('/search/authors/:letter', function (req, res){

  // Get the letter from the url parameters
  var letter = req.params.letter.toUpperCase();

  // Set up proper "%" syntax for MySQL matching
  var myLetter = letter + "%"; // ex: "A%" or "B%"

  // Read from Database (Updated DB 2020)
  connection.query('SELECT last_name, first_name FROM authors WHERE last_name LIKE ? ORDER BY last_name ASC', [myLetter], function(err, response){

    // Respond with error if database error
    if(err) throw err;

    // Render authors of said letter
    if(response.length > 0){

      // Clean repsonse to ensure it is all lowercase
      var authorNameData = [];
      for(var i = 0; i < response.length; i++){
        authorNameData.push({
          "firstName": response[i].first_name.toLowerCase(),
          "lastName": response[i].last_name.toLowerCase(),
          "displayFirstName": response[i].first_name,
          "displayLastName": response[i].last_name
        })
      }
      // Render the author names
      res.render('reading/search-authors', {hbsObject: authorNameData});

    }
    // Otherwise, no author was found
    else {
      res.render('reading/search-authors', null);
    }

  });

});



// GET - Search Authors By First or Last Name
domRouter.get('/search/authors/:type/:name', function (req, res){

  // Get the name and search type from the url parameters
  var name = req.params.name.toLowerCase();
  name = name.charAt(0).toUpperCase() + name.slice(1);
  var type = req.params.type.toLowerCase();

  // Return if parameter is not a first name or lastname
  if(type != "firstname" && type != "lastname"){
    res.render('reading/search-authors', null);
    return;
  }

  // Update "type" to DB 2020 format
  if (type == "firstname") {
    type = "first_name";
  }
  else {
    type = "last_name";
  }

  // Read from Database (Updated DB 2020)
  connection.query('SELECT last_name, first_name FROM authors WHERE ' + mysql.escapeId(type) + ' = ? ORDER BY last_name ASC', [name], function(err, response){

    // Respond with error if database error
    if(err) throw err;

    // Render authors of said letter
    if(response.length > 0){

      // Clean repsonse to ensure it is all lowercase
      var authorNameData = [];
      for(var i = 0; i < response.length; i++){
        authorNameData.push({
          "firstName": response[i].first_name.toLowerCase(),
          "lastName": response[i].last_name.toLowerCase(),
          "displayFirstName": response[i].first_name,
          "displayLastName": response[i].last_name
        })
      }
      // Render the author names
      res.render('reading/search-authors', {hbsObject: authorNameData});

    }
    // Otherwise, no author was found
    else {
      res.render('reading/search-authors', {errObject: {type: type, name: name}});
    }

  });

});




// GET - Author's Bio Page (contains the Picture, Bio, Letters, Map)
domRouter.get('/authors/:lastname/:firstname', function (req, res) {

  // Collect parameters
  var lastName = req.params.lastname.toLowerCase();
  var firstName = req.params.firstname.toLowerCase();

  // Clean parameters
  var displayLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
  var displayFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // Fix O'Sullivan / O'Mara
  if (displayLastName.charAt(1)=="'") {
    displayLastName = displayLastName.substring(0,2) + displayLastName[2].toUpperCase() + displayLastName.substring(3);
  }

  // Get Author Records (Updated DB 2020)
  var stmt = "SELECT record_name AS filename, page_count AS pages, year, month, day " +
            "FROM records r, authors a " +
            "WHERE r.author_id = a.id " +
            "AND a.last_name=? AND a.first_name=? " +
            "ORDER BY year, month, day,record_name";
  connection.query(stmt, [lastName, firstName], function(err, response) {
    if(err) throw err;

    // Get Author Bio Information
    connection.query('SELECT author_bio_meta.bio_attribute, author_bio.bio_attrib_value ' +
      'FROM author_bio ' +
      'INNER JOIN authors ON authors.id = author_bio.author_id ' +
      'INNER JOIN author_bio_meta ON author_bio.author_bio_meta_id = author_bio_meta.id ' +
      'WHERE authors.last_name = ? AND authors.first_name = ? '+
      'ORDER BY authors.id, author_bio_meta.sort_key;', [lastName, firstName], function(err2, response2) {
        if(err2) throw err2;

        // Clean response to display error message if no files found
        var fileResponse;
        if (response.length == 0) {
          fileResponse = null;
          defaultFileName = "Sorry. No Letters Available.";
          defaultFilePages = 1;
          awsDefaultFileName = "No+Letter+Found";
          authorBioData = null;
        }
        // Otherwise, give back the response
        else {
          fileResponse = response;
          defaultFileName = response[0].filename;
          defaultFilePages = response[0].pages;
          awsDefaultFileName = defaultFileName.replace(/ /g, "+");
          authorBioData = response2;
        }


        // Get Text File Data from AWS S3
        getS3Text(defaultFileName, function(awsText) {

          // Note that /n (enter key) needs to be changed to <br>
          var defaultFileText = awsText.replace(/\n/g, "<br>");

          // Note that /t (tab key) needs to be changed to a tab, using a <i> tag and CSS
          defaultFileText = defaultFileText.replace(/\t/g, '<i style="padding-left: 5em";></i>')

          // Create page render object
          var authorAndFileData = {
            firstName: firstName,
            lastName: lastName,
            displayFirstName: displayFirstName,
            displayLastName: displayLastName,
            defaultFileName: defaultFileName,
            defaultFilePages: defaultFilePages,
            defaultFileText: defaultFileText,
            awsDefaultFileName: awsDefaultFileName,
            letterData: fileResponse,
            authorBioData: authorBioData
          }

          // Render Author's Bio Page
          res.render('reading/view-author', {hbsObject: authorAndFileData});

        }); // end S3 query

      }); // end MySQL query 2

  }); // end MySQL query 1

});




// GET - Search All Letters Page Render
domRouter.get('/search/letters', function (req, res) {

  // Default view of the search letters page
  res.render('reading/search-letters', null);

});




// POST - Search All Letters in Database of selected criteria
domRouter.post('/search/letters', function (req, res) {

  var branch = req.body.branch;
  var sex = req.body.sex;
  var year = req.body.year;

  // Set up proper "%" syntax for MySQL matching
  var myYear = year + "%"; // ex: "1941%" or "1942%" or "%"
  var myServiceBranch = branch + "%"; // ex: "Army%" or "Army (British)%" or "%"
  var mySex = sex + "%"; // ex: "M%" or "F%" or "%"

  // Read Database (Updated DB 2020)
  var stmt = "SELECT record_name AS filename " +
              "FROM records r, authors a " +
              "WHERE a.sex LIKE ? AND a.service_branch LIKE ? AND year LIKE ? " +
              "AND a.id = r.author_id " +
              "ORDER BY record_name ASC ";
  // connection.query('SELECT filename FROM letters WHERE gender LIKE ? AND service_branch LIKE ? AND ts_dateguess LIKE ? ORDER BY filename ASC', [mySex, myServiceBranch, myYear], function(err, response) {
  connection.query(stmt, [mySex, myServiceBranch, myYear], function(err, response) {
  if(err) throw err;

    // Clean response to display error message if no files found
    var fileResponse;
    if (response.length == 0) {
      fileResponse = null;
    }
    else {
      fileResponse = response;
    }

    // Clean up search terms
    var displaySex;
    if (sex == "F") {
      displaySex = "women";
    }
    else if (sex == "M") {
      displaySex = "men";
    }
    else {
      displaySex = "anyone";
    }

    var displayBranch;
    if (branch == "") {
      displayBranch = "any service branch";
    }
    else if (branch == "No Military Service") {
        displayBranch = "no service background";
    }
    else {
      displayBranch = "the " + branch;
    }

    var displayYear;
    if (year == "") {
      displayYear = "any year";
    }
    else {
      displayYear = year;
    }


    // Create page render object
    var letterAndFileData = {
      branch: displayBranch,
      sex: displaySex,
      year: displayYear,
      letterData: fileResponse
    }

    // Render Letter Search Results
    res.render('reading/search-letters', {hbsObject: letterAndFileData});

  });

});




// GET - Mapping of All Letters in Database of selected criteria
domRouter.get('/search/map', function (req, res) {
  res.render('reading/search-map');
});



// GET - View a Single Letter and Transribe (selected from the map or letter search pages)
domRouter.get('/view/letter/:filename', function (req, res) {

  // Get filename from parameters
  var fileName = req.params.filename;

  // Read Database (Updated DB 2020)
  var stmt = "SELECT record_name AS filename, page_count AS pages, year, month, day " +
              "FROM records " +
              "WHERE record_name = ?";
  // connection.query('SELECT letters.filename, archives.pages, letters.letterdate, letters.ts_dateguess FROM letters, archives WHERE letters.filename = ? AND letters.filename = archives.filename', [fileName], function(err, response) {
  connection.query(stmt, [fileName], function(err, response) {
    if(err) throw err;

    // Clean response to display error message if no files found
    if (response.length == 0) {
      filePages = 1;
      awsFileName = "No+Letter+Found";
    }
    // Otherwise, give back the response
    else {
      filePages = response[0].pages;
      awsFileName = fileName.replace(/ /g, "+");
    }

    // Get Text File Data from AWS S3
    getS3Text(fileName, function(awsText) {

      // Note that /n (enter key) needs to be changed to <br>
      var fileText = awsText.replace(/\n/g, '<br>');

      // Note that /t (tab key) needs to be changed to a tab, using a <i> tag and CSS
      fileText = fileText.replace(/\t/g, '<i style="padding-left: 5em";></i>')

      // Create page render object
      var authorAndFileData = {
        fileName: fileName,
        filePages: filePages,
        fileText: fileText,
        awsFileName: awsFileName
      }

      // Render Author's Bio Page
      res.render('reading/view-letter', {hbsObject: authorAndFileData});

    }); // end S3 query

  }); // end MySQL query

});


// ~ ~ ~ ~ ~ Scrapbooking Routes ~ ~ ~ ~ ~

// GET - Scrapbooking (landing page)
domRouter.get('/scrapbooking', function (req, res) {
  res.render('scrapbooking/scrapbooking-menu');
});

// GET - Static Page - Scrapbooking - Nancy Thompson
domRouter.get('/scrapbooking/nancy-thompson', function (req, res) {
  res.render('scrapbooking/nancy-thompson');
});

// GET - Static Page - Scrapbooking - N.S.T.C
domRouter.get('/scrapbooking/nstc', function (req, res) {
  res.render('scrapbooking/nstc');
});

// GET - Static Page - Scrapbooking - Project History
domRouter.get('/scrapbooking/project-history', function (req, res) {
  res.render('scrapbooking/project-history');
});

// GET - Static Page - Scrapbooking - The Scrapbook
domRouter.get('/scrapbooking/the-scrapbook', function (req, res) {
  res.render('scrapbooking/the-scrapbook');
});

// GET - Static Page - Scrapbooking - The Serviceman's New
domRouter.get('/scrapbooking/servicemens-news', function (req, res) {
  res.render('scrapbooking/servicemens-news');
});



// ~ ~ ~ ~ ~ Experiencing Routes ~ ~ ~ ~ ~

// GET - Experiencing (landing page)
domRouter.get('/experiencing', function (req, res) {
  res.render('experiencing/experiencing-menu');
});

// GET - Static Page - Experiencing - Homefront
domRouter.get('/experiencing/homefront', function (req, res) {
  res.render('experiencing/homefront');
});

// GET - Static Page - Experiencing - Race
domRouter.get('/experiencing/race', function (req, res) {
  res.render('experiencing/race');
});

// GET - Static Page - Experiencing - Wartime
domRouter.get('/experiencing/wartime', function (req, res) {
  res.render('experiencing/wartime');
});

// GET - Static Page - Experiencing - Women
domRouter.get('/experiencing/women', function (req, res) {
  res.render('experiencing/women');
});


// ----------------------------------------------------
// Export routes
module.exports = domRouter;
