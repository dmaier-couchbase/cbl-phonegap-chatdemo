/**
 * Constants
 */
var LOG_TO_UI = true;
var DB_NAME = "chatdemo";
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
    init();
};


/**
 * Initialize the application
 */
function init() {
    
    initEventHandlers();
    initCouchbaseLite();
}

/**
 * Initialize the application's event handlers
 */
function initEventHandlers() {
    
     $('#sendButton').click(function(){
                    
        log("Button clicked");    
        
        var room = $('#rooms').val();     
        var date = new Date();
        var dateStr = date.toLocaleDateString() + "," + date.toLocaleTimeString();
        var user = $('#userName').val();
        var msg =  $('#msgText').val().replace(/\n/g, '<br />');
         
        var key = "msg::" + room + "::" + user + "::" + date.getTime();
        var value = {
            "_id" : key,
            "room" : room,
            "date" : date.getTime(),
            "user" : user,
            "msg" : msg
        };
                             
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
        
        log('Couchbase Lite not installed, running as web app')
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
            
            DB_URL = url + "/" + DB_NAME;
            
            //Create a database        
            doPut(
                DB_URL,
                "",
                function(data) {log("Created DB: " + JSON.stringify(data))},
                function(req, status, err) { log("Could not create DB. Is it already existent?: " + err)
                
                    doGet(
                        DB_URL,
                        function(data) {"Accessed DB: " + log(JSON.stringify(data));},
                        function(req, status, err) {log(error);}
                    );
                
                }
            );
        });
        
    }
}

/**
 * Initialize the required rooms
 */
function initRooms() {
    
    var rooms = ['Couchbase Lite','Couchbase SyncGateway','Couchbase Server'];
    
    for (i = 0; i < rooms.length; i++) { 
        
        var key = "room::" + rooms[i];
        
        //doGet(DB_URL + "/" + DB_NAME + "/" + key, ...)
    }
    
}

/**
 * Helper to execute a HTTP PUT
 */
function doPut(purl, pdata, callback, errCallback)
{
    $.ajax({
        url: purl,
        type: 'PUT',
        data: pdata,
        contentType: "application/json",
        success: callback,
        error: errCallback
    });
}

/**
 * Helper to execute a HTTP GET
 */
function doGet(purl, callback, errCallback)
{
    $.getJSON(purl).done(callback).fail(errCallback);
}

    