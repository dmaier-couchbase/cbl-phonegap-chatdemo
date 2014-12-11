/**
 * Constants
 */
var LOG_TO_UI = true;
var DEBUG_IN_BROWSER = false;
var DB_NAME = "test_chatdemo_1";
var DB_URL = "";

/**
 * Application state vars
 */
var usesCBLite = false;

/**
 * Required event listener to check when the device is ready.
 */
document.addEventListener("deviceready", onDeviceReady, false);


/**
 * Log something to the UI
 */
function log(msg) {
    
    if (LOG_TO_UI == true)
    {    
        $('#logMessages').append('DEBUG: '+msg+'<br/>');
    }
    else
    {
        console.log(msg);
    }
}

/**
 *  Called when the document is ready and the initialization was not yet called. Preffered method if running the standalone web application
 */
$(document).ready( function(){
    
   
    log("The document is ready");
    init();
});


/**
 * Called when the PhoneGap application is ready. Preferred way if running in a PhoneGap container
 */
function onDeviceReady() {

    log("The device is ready");
    initCouchbaseLite();
};


/**
 * Initialize the application
 */
function init() {
    
    initEventHandlers();
}

/**
 * Makes sure that the CBLite code runs for debugging purposes in the browser
 */
function initDebug() {
    
    if (DEBUG_IN_BROWSER == true)
    {
            if (!window.cblite)
            {
                window.cblite = {};
                window.cblite.getURL = function(callback) {
          
                    err = {};
                    url = "http://61c9d8b6-9c13-458f-880b-456679df325f:bd04f604-8af3-4de3-8a3b-cefa86d42fc1@localhost:5984/";
            
                    callback(err, url);
                };
            }
    }
}

/**
 * Initialize the application's event handlers
 */
function initEventHandlers() {
   
     $('#sendButton').click(function(){
                    
        log("Button clicked");    
        
        //Get the input from the view
        var room = $('#rooms').val();     
        var date = new Date();
        var dateStr = date.toLocaleDateString() + "," + date.toLocaleTimeString();
        var user = $('#userName').val();
        var msg =  $('#msgText').val().replace(/\n/g, '<br />');
         
        initDebug();
         
        //Store to Couchbase Lite 
        if (window.cblite)
        {
            log("Storing to Couchbase Lite");
                
            //Init the objects to store
            var msgKey = "msg::" + room + "::" + user + "::" + date.getTime();
            var msgValue = {
                "_id" : msgKey,
                "room" : room,
                "date" : date.getTime(),
                "user" : user,
                "msg" : msg
            };
         
            log("Message = " + JSON.stringify(msgValue));
            
            var roomKey = "room::" + room;
            var roomInitValue = {
                "messages" : [msgKey]        
            };
         
            log("Room = " + JSON.stringify(roomInitValue));    
                
            //Retrieve the room
            //var url = DB_URL + "/" + "test_room";
            var url = DB_URL + "/" + roomKey;
            
            log("The room URL is: " + url);
            
            doGet(
                    url,
                    function(data) {
                        
                        log("Retrieved room: " + JSON.stringify(data));
                        
                    },
                    function(res, status, err) {
                        
                        //Create a new room if not found
                        if (err == "Not Found")
                        {
                            log("The room document was not existent, creating it.");
                            log("The room url is: " + url);
                            
                            doPut(url,
                                  roomInitValue,
                                  function(data) {log("Created room: " + JSON.stringify(data))},
                                  function(res, status, err) { log("ERROR: Could not create the room document. " + err + ";" + JSON.stringify(res) ) }
                                 );
                        }   
                    }
            );
            
        }
         
        //Set the view 
        $('#chatMessages').prepend('<tr>' + '<td class="cellvalue">' + msg + '</td>'  + '</tr>');
        $('#chatMessages').prepend('<tr>' + '<td class="cellheader">' + dateStr + ' ' + user + '</td>' + '</tr>');
                                    
    });
}

/**
 * Initialize Couchbase lite
 */
function initCouchbaseLite() {
    
    //Check if Couchbase Lite is available
    if (!window.cblite) {
        
        log('Couchbase Lite not installed, running in browser');
    }
    else
    {
        log("Found Couchbase Lite PhoneGap plug-in");
       
        window.cblite.getURL(function(err, url) {
          
            if (err) {
                log("Error launching Couchbase Lite: " + err)
            } else {
                log("Couchbase Lite running at " + url);
            }
            
            DB_URL = url + DB_NAME;
            
            log("The DB URL is " + DB_URL);
            
            //Create a database        
            doPut(
                DB_URL,
                "",
                function(data) {log("Created DB: " + JSON.stringify(data))},
                function(res, status, err) { log("ERROR: Could not create DB. Is it already existent?: " + err)
                
                    doGet(
                        DB_URL,
                        function(data) {
                            
                            log("Accessed DB: " + JSON.stringify(data));
                                                        
                        },
                        function(res, status, err) {log("ERROR: " + err);}
                    );
                
                }
            );
        });
        
    }
}

/**
 * Helper to execute a HTTP PUT
 */
function doPut(purl, pdata, callback, errCallback)
{
    var request = {
        url: purl,
        type: 'PUT',
        data: pdata,
        contentType: "application/json",
        success: callback,
        error: errCallback
    };
    
    log("Requesting " + JSON.stringify(request)); 

    $.ajax(request);
}

/**
 * Helper to execute a HTTP POST
 */
function doPost(purl, pdata, callback, errCallback)
{   
    $.post(purl, pdata, callback, 'json').fail(errCallback);
}



/**
 * Helper to execute a HTTP GET
 */
function doGet(purl, callback, errCallback)
{   
    $.getJSON(purl).done(callback).fail(errCallback);
}
    
