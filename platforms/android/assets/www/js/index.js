/**
 *+ Global variables and constants
 **
 **
 **
 **
 */

/**
 * Constants
 */
var LOG_TO_UI = false;
var DEBUG_IN_BROWSER = true;
var DB_NAME = "test_chatdemo_5";
var DB_URL = "";

/**
 *+ Intialization
 **
 **
 **
 **
 */

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
    //initDebug();
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
   
    
     $('#rooms').change(function(){
      
         log("The room changed");
         
         var room = $('#rooms').val();
         
         initChatMessagesView(room);
         
     });
    
    
     $('#sendButton').click(function(){
                    
        log("Button clicked");    
        
        //Get the input from the view
        var room = $('#rooms').val();     
        var date = new Date();
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
                "messages" : [ msgKey ]        
            };
         
            log("Room = " + JSON.stringify(roomInitValue));    
                
            //Create or update the room
            //-- Retrieve the room
            var url = DB_URL + "/" + roomKey;
            
            log("The room URL is: " + url);
            
            doGet(
                    url,
                    function(data) {
                        
                        log("Retrieved room: " + JSON.stringify(data));
                        
                        //Add the new message to the room
                        var roomValue = data;
                        roomValue.messages.push(msgKey);
                        
                        log("room = " + JSON.stringify(roomValue));
                        
                        doPut(url,
                                  roomValue,
                                  function(data) {log("Updated room " + JSON.stringify(data))},
                                  function(res, status, err) { log("ERROR: Could not update the room document. " + err + ";" + JSON.stringify(res) ) }
                              );
                        
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
            
            //Create the chat message
            var msgUrl = DB_URL + "/" + msgKey;
            
            doPut(msgUrl,
                  msgValue,
                  function(data) {log("Created message: " + JSON.stringify(data))},
                  function(res, status, err) { log("ERROR: Could not create the message document. " + err + ";" + JSON.stringify(res) ) }
            );
        }
         
        //Set the view 
        addMessageToView(msg, date, user);
                                    
    });
}

/**
 * Called to double check if Couchbase Lite is accessible at all
 */
function checkDBReady()
{
    doGet(
            DB_URL,
            function(data) {
                            
                log("Accessed DB: " + JSON.stringify(data));
                
                initViews();
                                             
            },
            function(res, status, err) {log("ERROR: " + JSON.stringify(res))}
        );   
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
                {},
                function(data) {

                    log("Created DB: " + JSON.stringify(data));
                    checkDBReady();
                
                },
                function(res, status, err) { 
                    
                    log("ERROR: Could not create DB. Is it already existent?: " + err);
                    checkDBReady(); 
                }
            );
        });
        
    }
}


/**
 * Initialize the views
 */
function initViews() {
    
    log("Initializing views");
    
    //Get the selected room
    var room = $('#rooms').val();
    
    initChatMessagesView(room);
    
}

/**
 * To initialize the chat messages view dependent on the room
 */
function initChatMessagesView(room)
{
    clearMessagesView();
    
    log("Initializing chat messages view");
    
    var roomKey = "room::" + room;
    var roomUrl = DB_URL + "/" + roomKey;
    
    log("roomUrl = " + roomUrl);
    
    //Get from Couchbase Lite
    if (window.cblite)   
    {
        log("Getting messages of the room ");
        
         doGet(
                    roomUrl,
                    function(data) {
                        
                        log("Retrieved room: " + JSON.stringify(data));
                        
                        for (i = 0; i < data.messages.length; i++) { 
                        
                            var msgKey = data.messages[i];
                            
                            var msgURL = DB_URL + "/" + msgKey;
                            
                            log("Getting message " + msgKey);
                            
                            doGet(
                               msgURL,
                               function(data) {
                                
                                    log ("Message = " + JSON.stringify(data));
                                   
                                    var date = new Date(data.date);
                                    var user = data.user;
                                    var msg = data.msg;
                                   
                                   addMessageToView(msg, date, user);
                               
                               },
                               function(res, status, err) { log("ERROR: Could not get the message;" + JSON.stringify(res)) }
                            
                            );
                            
                        }                        
                        
                    },
                    function(res, status, err) { log("ERROR: Could not get the room;" + JSON.stringify(res));}
         );
    }
}

/**
 * Adds a message to the view
 */
function addMessageToView(msg, date, user) {
    
    var dateStr = date.toLocaleDateString() + "," + date.toLocaleTimeString();
    
    $('#chatMessages').prepend('<tr>' + '<td class="cellvalue">' + msg + '</td>'  + '</tr>');
    $('#chatMessages').prepend('<tr>' + '<td class="cellheader">' + dateStr + ' ' + user + '</td>' + '</tr>');
}


function clearMessagesView() {
    
       $('#chatMessages').empty();
}

/**
 * Helper to execute a HTTP PUT
 */
function doPut(purl, pdata, callback, errCallback)
{
    var strdata = JSON.stringify(pdata);
    
    var request = {
        url: purl,
        processData : false,
        type: 'PUT',
        data: strdata,
        contentType: "application/json",
        success: callback,
        error: errCallback
    };
    
    log("Requesting " + JSON.stringify(request)); 

    $.ajax(request);
}



/**
 *+ Business logic
 **
 **
 ** TODO: Refactor the app to use createMessage, createRoom, ... at all
 ** ...
 */



/**
 *+ Helpers
 **
 **
 **
 **
 */

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
    
