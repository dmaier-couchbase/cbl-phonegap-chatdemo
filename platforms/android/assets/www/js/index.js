$(document).ready( function(){
                
                console.log('Ready');
                                
                $('#sendButton').click(function(){
                    
                    console.log("Button clicked");    
                    
                    var date = new Date();
                    var dateStr = date.toLocaleDateString() + "," + date.toLocaleTimeString();

                    var user = $('#userName').val();
                    var msg =  $('#msgText').val();
                    
                    
                    console.log('User = ' + user);
                    console.log('Msg = ' + msg);
                    
                    $('#chatMessages').prepend('<tr>' + '<td>' + msg + '</td>'  + '</tr>');
                    $('#chatMessages').prepend('<tr>' + '<td><i>' + dateStr + '<br/>' + user + '</i></td>' + '</tr>');

                                    
                });
            });