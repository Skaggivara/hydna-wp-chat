const MAX_PER_CHANNEL = {MAX_PER_CHANNEL};
const MAX_PER_DOMAIN = {MAX_PER_DOMAIN};
const CONTROL_PASSWD = "{CONTROL_PASSWD}";

behavior("/control", {
    open: function(event){
        if(event.token != CONTROL_PASSWD){
            event.deny("wrong password");
        }
        event.allow(event.connection.id);
    },
    emit: function(event){
        
        var parts = event.data.split(":");
        var action = parts.shift();
        var payload = parts.join(":");
        
        switch(action){
            case "api.active_channels":
                
                event.domain.findall('active-channels:*', function(err, items){
                    if(!err){
                        event.channel.emit(JSON.stringify({active_channels: items}), event.connection);
                    }
                });
                
            break;
            
            case "api.user_count_total":
                
                event.domain.get('users-online-count', function(err, value){
                    var count = 0;
                    if (!err) {
                        count = value;
                    }
                    event.channel.emit(JSON.stringify({user_count_total: value}), event.connection);
                });
                
            
            break;
            
            case "api.active_user_count_total":
                
                event.domain.get('users-active-count', function(err, value){
                    var count = 0;
                    if (!err) {
                        count = value;
                    }
                    event.channel.emit(JSON.stringify({active_user_count_total: count}), event.connection);
                });
                
        
            break;
        }
    }
});

behavior("/articles/{uid}", {
    
    open: function(event){
        // if channel is controller channel
        
        if(event.token.length > 0){
            
            var token_title = event.token.split(":");
            
            if(token_title.length < 2){
                return event.deny('You need to provide a page title and nick');
            }
            
            var nick = token_title.shift();
            var title = token_title.join(":");
            
            event.channel.incr('users-online-count', MAX_PER_CHANNEL, function(err, v){
                if (!err){
                        
                    event.channel.set('page-title', title);
                    event.channel.set('users:' + event.connection.id, event.connection.id+":"+nick);
                
                    event.channel.emit(JSON.stringify({me: event.connection.id}), event.connection);
                    
                    event.domain.incr('users-online-count', MAX_PER_DOMAIN, function(err, v){
                        event.channel.emit(JSON.stringify({user_count_channel:v}));
                        
                        event.domain.getChannel("/control").emit(JSON.stringify({user_count_channel:v, channel:event.channel.path}));
                    });
                    
                    event.allow(event.connection.id);
                    
                }else{
                    event.deny('Max connections per channel');
                }
            });
        }
    },

    close: function(event){
        event.channel.del('users:' + event.connection.id);
        
        event.channel.decr('users-online-count', 0, function(err,v){
            if(!err){
                
                event.channel.emit(JSON.stringify({user_count_channel: v}), event.connection);
                
                event.domain.getChannel("/control").emit(JSON.stringify({user_count_channel:v, channel:event.channel.path}));
                
            }
        });
        
        event.domain.decr('users-online-count', 0, function(err,v){});
        
        event.channel.get('active-users:' + event.connection.id, function(err, value){
            if(!err){
                event.channel.del('active-users:' + event.connection.id);
                event.channel.decr('users-active-count', 0, function(err, val){
                    if(!err){
                        if(val == 0){
                            event.channel.del('active-channels:'+event.channel.path);
                        }
                        
                        event.domain.decr('users-active-count', 0, function(err,v){});
                    }
                });
            }
        });
        
        event.channel.emit(JSON.stringify({user_left:event.connection.id}));     
        
    },
    
    emit: function(event){
        
        var parts = event.data.split(":");
        var action = parts.shift();
        var payload = parts.join(":");
        
        switch(action){
            case "api.users":
                event.channel.findall('active-users:*', function(items){
                    event.channel.emit(JSON.stringify({users_on_channel: items}), event.connection);
                });    
            break;
            
            case "api.name_change":
                
                event.channel.set('users:' + event.connection.id, event.connection.id+":"+parts[0]);
                event.channel.emit(JSON.stringify({user_name_change: event.connection.id+":"+parts[0]}));
            
            break;
            
            case "api.user_count":
                
                event.channel.get('users-online-count', function(err, value){
                    if (!err) {
                        event.channel.emit(JSON.stringify({user_count_channel: value}), event.connection);
                    }
                });
            
            break;
            
            case "api.latest":
            
                var count = parseInt(parts[0]);
                if(count < 1){ count == 1;}
                
                event.channel.range('latest', 0, count, function(err, items) {
                    // only emit if the list has been initialized.
                    if (!err) {
                        // emit a JSON object containing the last 10 emits to the channel.
                        event.channel.emit(JSON.stringify({ latest_messages: items }), event.connection);
                    }
                });
                
            break;
            
            case "api.title":
                
                event.channel.get('page-title', function(err, value){
                    if (!err) {
                        event.channel.emit(JSON.stringify({title_channel: value}), event.connection);
                    }   
                });
            
            break;
            
            // everytime a user joins
            case "api.join":
                
                event.channel.get('users:'+event.connection.id, function(err, value){
                    if(!err){
                        
                        event.channel.incr('users-active-count', MAX_PER_CHANNEL, function(err, v){});
                        event.domain.incr('users-active-count', MAX_PER_DOMAIN, function(err, v){});
                        
                        event.channel.emit(JSON.stringify({user_joined: value}));
                        
                        event.channel.get('page-title', function(err, title){
                            var t = "Unknown";
                            if(!err){
                                t = title;
                            }
                            event.domain.set('active-channels:'+event.channel.path, event.channel.path+":"+t);
                        });
                        
                        event.channel.set('active-users:' + event.connection.id, value, function(err){
                            
                            if(!err){
                                event.channel.findall('active-users:*', function(err, items){
                                    
                                    if(!err){
                                        event.channel.emit(JSON.stringify({users_on_channel: items}), event.connection);
                                    }
                                });
                            }
                        });
                    }
                }); 
            
            break;
            
            // everytime user sends message they also push to stream
            case "api.push":
                
                event.channel.push("latest", new Date().getTime()+":"+payload, function(err, v){});
                event.domain.incr('messages-sent', 200000, function(err, v){});
                event.channel.incr('messages-sent', 200000, function(err, v){});
                
            break;
        }
    }
});