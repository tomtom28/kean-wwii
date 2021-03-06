// On Page Load, Hit the API for Letter Text and load click listeners
$(document).ready(function(){

  // Immediately on Page Load
  // ======================================================

  // Check for a hashed location (i.e. user is returning from AWS Image Viewer)
  if (window.location.hash != "" && window.location.hash != "#1"){

    // Get Page Number that was last viewed
    var prevLetterNumber = window.location.hash;
    prevLetterNumber = prevLetterNumber.slice(1);

    // Get Total Page Numbers available
    var lastLetterImageNumber = $('#lastLetterNumber').text();

    // Get the File Name from the title
    var fileName = $('#view-letter').text();
    var awsArchiveImageName = fileName.replace(/ /g, "+") + "+" + prevLetterNumber + "-" + lastLetterImageNumber;
    var awsArchiveImageURL = "https://s3.amazonaws.com/kean-wwii-scrapbook/archives/" + awsArchiveImageName + ".jpg";

    // Change the archive selection to match the former
    $('#currentLetterNumber').text(prevLetterNumber);
    $("#letterImage").attr("src", awsArchiveImageURL);

  }



  // Click Listeners
  // ======================================================

  // Click Listener for Left Click on Archive
  $('#transcript-button-left').on('click', function(){

    // Get Current Image SRC
    var currentLetterImageURL = $("#letterImage").attr("src");

    // Render Loading Gif before any changes for better user experience
    $('#letterImage').attr({
      src: '/assets/images/Loading.gif',
      alt: 'Loading Archive'
    });

    // Image Related Variables
    var rootLetterImageName;
    var currentLetterImageNumber;
    var lastLetterImageNumber;

    // If a valid image URL, use the URL to generate next image
    if (currentLetterImageURL != "/assets/images/Image-Not-Found.png") {

      // Split URL to get image file name
      var currentLetterImageName = currentLetterImageURL.split("/");
      currentLetterImageName = currentLetterImageName[5];

      console.log(currentLetterImageName)

      // Split File Name to get end , i.e. "1-x.png"
      currentLetterImagePosition = currentLetterImageName.split("+");
      var end = currentLetterImagePosition.length - 1;

      // Split File Name to get root image name (ends with a "+")
      rootLetterImageName = "";
      for(var i=0; i<end; i++){
        rootLetterImageName += currentLetterImagePosition[i] + "+";
      }
      console.log(rootLetterImageName)

      // Split File Name to get current image position
      currentLetterImagePosition = currentLetterImagePosition[end].split("-");
      currentLetterImageNumber = parseInt(currentLetterImagePosition[0]);

      // Split File Name to get last image position
      lastLetterImageNumber = currentLetterImagePosition[1].split(".jpg");
      lastLetterImageNumber = parseInt(lastLetterImageNumber[0]);

    }
    // Otherwise, use the Select dropdown and page html to get the next image
    else {

      // Get Letter Name from dropdown and create root image name via join
      rootLetterImageName = $('#view-letter').html();
      rootLetterImageName = rootLetterImageName.split(" ").join("+") + "+";

      // Get current and last image numbers via html already on page
      currentLetterImageNumber = $('#currentLetterNumber').html();
      currentLetterImageNumber = parseInt(currentLetterImageNumber);
      lastLetterImageNumber = $('#lastLetterNumber').html();
      lastLetterImageNumber = parseInt(lastLetterImageNumber);

    }

    // Go Back 1 file name only if current postion is greater than 1
    if(currentLetterImageNumber > 1) {
      var newLetterImageURL = "https://s3.amazonaws.com/kean-wwii-scrapbook/archives/" + rootLetterImageName + (currentLetterImageNumber - 1) + "-" + lastLetterImageNumber + ".jpg";
      console.log(newLetterImageURL);
      $("#currentLetterNumber").html(currentLetterImageNumber - 1);
      $("#letterImage").attr("src", newLetterImageURL);
    }
    else {
      $("#letterImage").attr("src", currentLetterImageURL);
    }

  });



  // Click Listener for Right Click on Archive
  $('#transcript-button-right').on('click', function(){

    // Get Current Image SRC
    var currentLetterImageURL = $("#letterImage").attr("src");

    // Render Loading Gif before any changes for better user experience
    $('#letterImage').attr({
      src: '/assets/images/Loading.gif',
      alt: 'Loading Archive'
    });

    // Image Related Variables
    var rootLetterImageName;
    var currentLetterImageNumber;
    var lastLetterImageNumber;

    // If a valid image URL, use the URL to generate next image
    if (currentLetterImageURL != "/assets/images/Image-Not-Found.png") {

      // Split URL to get image file name
      var currentLetterImageName = currentLetterImageURL.split("/");
      currentLetterImageName = currentLetterImageName[5];

      console.log(currentLetterImageName)

      // Split File Name to get end , i.e. "1-x.png"
      currentLetterImagePosition = currentLetterImageName.split("+");
      var end = currentLetterImagePosition.length - 1;

      // Split File Name to get root image name (ends with a "+")
      rootLetterImageName = "";
      for(var i=0; i<end; i++){
        rootLetterImageName += currentLetterImagePosition[i] + "+";
      }
      console.log(rootLetterImageName)

      // Split File Name to get current image position
      currentLetterImagePosition = currentLetterImagePosition[end].split("-");
      currentLetterImageNumber = parseInt(currentLetterImagePosition[0]);

      // Split File Name to get last image position
      lastLetterImageNumber = currentLetterImagePosition[1].split(".jpg");
      lastLetterImageNumber = parseInt(lastLetterImageNumber[0]);

    }
    // Otherwise, use the Select dropdown and page html to get the next image
    else {

      // Get Letter Name from dropdown and create root image name via join
      rootLetterImageName = $('#view-letter').html();
      rootLetterImageName = rootLetterImageName.split(" ").join("+") + "+";

      // Get current and last image numbers via html already on page
      currentLetterImageNumber = $('#currentLetterNumber').html();
      currentLetterImageNumber = parseInt(currentLetterImageNumber);
      lastLetterImageNumber = $('#lastLetterNumber').html();
      lastLetterImageNumber = parseInt(lastLetterImageNumber);

    }

    // Go Forward 1 file name only if current postion is greater than 1
    if(currentLetterImageNumber < lastLetterImageNumber) {
      var newLetterImageURL = "https://s3.amazonaws.com/kean-wwii-scrapbook/archives/" + rootLetterImageName + (currentLetterImageNumber + 1) + "-" + lastLetterImageNumber + ".jpg";
      console.log(newLetterImageURL);
      $("#currentLetterNumber").html(currentLetterImageNumber + 1);
      $("#letterImage").attr("src", newLetterImageURL);
    }
    else {
      $("#letterImage").attr("src", currentLetterImageURL);
    }

  });



  // Archive Double Click ==> View Archive Text on AWS (full screen)
  $('#letterText').dblclick(function() {

    // Step 0 - Check if there is actaully a transcript
    if ( isBadLink($("#letterText").html()) ) {
      alert("Transcript Not Available");
      return;
    }

    // Hash the page # to the URL
    // window.location.hash = $('#currentLetterNumber').text();
    location.replace( "#" + $('#currentLetterNumber').text() );

    // Get the File Name from the title
    var fileName = $('#view-letter').text();
    var awsArchiveTextURL = fileName.replace(/ /g, "%20");
    awsArchiveTextURL = " https://s3.amazonaws.com/kean-wwii-scrapbook/transcripts/" + awsArchiveTextURL + ".txt";

    // Navigate to AWS Link
    var win = window.location = awsArchiveTextURL;
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website.');
    }
  });



  // Archive Double Click ==> View Archive Image on AWS (full screen)
  $( "#letterImage" ).dblclick(function() {

    // Step 0 - Check if there is actaully a photo
    if ( isBadLink($('#letterImage').attr("src")) ) {
      alert("Image Not Available");
      return;
    }

    // Hash the page # to the URL
    // window.location.hash = $('#currentLetterNumber').text();
    location.replace( "#" + $('#currentLetterNumber').text() );

    var awsImageLink = $("#letterImage").attr("src");
    // var win = window.open(awsImageLink, '_blank');
    var win = window.location = awsImageLink;
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website.');
    }
  });



  // Better for mobile ==> Click link to View Archive Image on AWS (full screen)
  $('#viewFullSizedArchive').on('click', function() {

    // Step 0 - Check if there is actaully a photo
    if ( isBadLink($('#letterImage').attr("src")) ) {
      alert("Image Not Available");
      return;
    }

    // Hash the page # to the URL
    // window.location.hash = $('#currentLetterNumber').text();
    location.replace( "#" + $('#currentLetterNumber').text() );

    var awsImageLink = $("#letterImage").attr("src");
    // var win = window.open(awsImageLink, '_blank');
    var win = window.location = awsImageLink;
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website.');
    }
  });



  // Better for mobile ==> Click link to View Archive Text on AWS (full screen)
  $('#viewFullSizedTranscribe').on('click', function() {

    // Step 0 - Check if there is actaully a transcript
    if ( isBadLink($("#letterText").html()) ) {
      alert("Transcript Not Available");
      return;
    }

    // Hash the page # to the URL
    // window.location.hash = $('#currentLetterNumber').text();
    location.replace( "#" + $('#currentLetterNumber').text() );

    // Get the File Name from the title
    var fileName = $('#view-letter').text();
    var awsArchiveTextURL = fileName.replace(/ /g, "%20");
    awsArchiveTextURL = " https://s3.amazonaws.com/kean-wwii-scrapbook/transcripts/" + awsArchiveTextURL + ".txt";

    // Navigate to AWS Link
    var win = window.location = awsArchiveTextURL;
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website.');
    }
  });


  // Prevent User from going to broken AWS URL
  function isBadLink(link) {
    // Bad Image
    if (link == "/assets/images/Image-Not-Found.png") {
      return true;
    }
    // Bad Transcript
    else if (link == "Transcript not available at this time.") {
      return true;
    }
    // Otherwise return false
    return false;
  };


  // Error Image Handler (change to default)
  $("#letterImage").on("error", function(){
    $("#letterImage").attr("src", "/assets/images/Image-Not-Found.png");
  });



});
