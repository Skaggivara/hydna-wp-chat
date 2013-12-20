//You need an anonymous function to wrap around your function to avoid conflict
(function($){

    var me = {};
    
    function createCookie(name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }else{
            var expires = "";
        }
        document.cookie = name+"="+value+expires+"; path=/";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function eraseCookie(name) {
        createCookie(name,"",-1);
    }
    
    $.fn.extend({ 
         
        hydnachat: function(options) {
            
            var defaults = {
                domain: "",
                title: "",
                uid: "",
                username: null,
                join_label: "Join the discussion",
                hide_label: "Hide the discussion",
                connecting_label: "Connecting...",
                no_domain_error_msg: "No hydna domain found, please update in plugin settings",
                connected_label: "Welcome to join the discussion",
                max_preview: 30
            };

            
            function is_touch_device(){
                return !!('ontouchstart' in window) || !!('onmsgesturechange' in window);
            }

            /*
            if (options && typeof(options) == 'string') {
                if (options == 'mymethod1') {
                    myplugin_method1( arg );
                }else if (options == 'mymethod2') {
                    myplugin_method2( arg );
                }
                return;
            }*/
            

            var options = $.extend(defaults, options);
            options.is_touch = is_touch_device();
            //Iterate over the current set of matched elements

            var instances = [];

            function update_name(instance, id, name){
                for(var i = 0; i < instances.length; i++){
                    if(instances[i] != instance){
                        instances[i]._update_name(id, name);
                    }
                }
            }

            return this.each(function() {
                
                instances.push(this);

                var o = options;
                
                o.domain = $(this).data('domain');
                o.title = $(this).data('title');
                o.uid = $(this).data('slug');

                //code to be inserted here
                var chat_window = $(".wp-chat-window", this);
                var chat_list = $(".wp-chat-messages ul", this);
                var user_list = $(".wp-chat-users ul", this);
                var input = $(".wp-chat-input-field", this);
                var send_btn = $(".wp-chat-send-btn", this);
                var join_btn = $(".wp-chat-start-btn", this);
                var form = $("form", this);
                var status = $(".wp-chat-status-label", this);
                var change_btn = $(".wp-name-change-btn", this);
                var reset_btn = $(".wp-name-reset-btn", this);
                
                var joined = false;
                
                var users = []; 
               
                function _limitlength(msg, length){
                    if(msg.length > length){
                        return msg.substr(0, length - 3) + "...";
                    }
                    
                    return msg;
                }
                
                function _rendermsg(nick, message){
                    _render("<li><span class='time'>"+_time()+"</span> <strong>"+nick+"</strong> "+message+"</li>");    
                }
                
                function _render(what){
                    chat_list.append(what);
                    
                    var height = $(".wp-chat-messages")[0].scrollHeight;
                    $(".wp-chat-messages").scrollTop(height);
                }
                
                function _rendererror(message){
                    _render("<li><span class='error'>"+message+"</li>");
                }

                function _update_name(id, name){
                    console.log("updating name...");
                }
                
                function _renderusers(){
                    var l = "";
                    
                    for(var i = 0; i < users.length; i++){
                        //console.log(users[i].id +":"+ me.id);
                        if(users[i].id == me.id){
                            l += "<li style='color:"+users[i].color+"'>"+users[i].nick+" (you)</li>";
                        }else{
                            l += "<li style='color:"+users[i].color+"'>"+users[i].nick+"</li>";
                        }
                    }
                    
                    user_list.html(l);
                }
                
                function _send(){
                    if (input.val()) {
                        
                        var msg = input.val();
                        
                        channel.send(JSON.stringify({
                            nick: me.nick,
                            id: me.id,
                            message: input.val()
                        }));
                        
                        channel.emit("api.push:"+msg);
                       
                        input.val('');
                    }
                }
                
                function _nickgen() {
                    var consonants = 'bcddfghklmmnnprssttv';
                    var vocals = 'aaeeiioouuy';
                    var length = 4 + Math.floor(Math.random() * 4);
                    var nick = [];
                    var pool;
                    for (var i = 0; i < length; i++) {
                        pool = (i % 2 ? vocals : consonants);
                        nick.push(pool.charAt(Math.floor(Math.random() * pool.length)));
                    }
                    return nick.join('');
                }
                
                function _time(){
                    var d = new Date();
                    var h = d.getHours();
                    var m = d.getMinutes();
                    return (h < 12?'0' + h:h) + ':' + (m < 10?'0' + m:m);
                }

                //var nick = readCookie('wp_chat_nick');
                var nick = null;

                if(nick){
                    me = {nick: nick, id: '0'};
                }else{
                    nick = _nickgen();
                    me = {nick: nick, id: '0'};
                    createCookie('wp_chat_nick', nick, 30);
                }

                //console.log(o.domain+"/articles/"+o.uid+"?"+me.nick+":"+o.title);
                
                var channel = new HydnaChannel(o.domain+"/articles/"+o.uid+"?"+me.nick+":"+o.title, "rwe");
                //console.log(o.domain + ":"+ o.domain.length);
                if(o.domain.length == 0){
                    status.html(o.no_domain_error_msg);
                }else{
                    status.html(o.connecting_label);
                    join_btn.attr("disabled", "disabled");
                    
                    channel.onopen = function(e){
                        join_btn.removeAttr("disabled");
                        status.html(options.connected_label);
                        channel.emit("api.user_count");
                        me.id = e.data;
                    }
                    channel.onclose = function(e){
                        console.log("we are closed down...");
                    }
                    
                    channel.onsignal = function(e){
                        //console.log(e);
                        try{
                            
                            var payload = JSON.parse(e.data);
                            
                            if(payload.me){
                                me.id = payload.me;
                                //console.log(me.id);
                                users.push({nick:me.nick, id:me.id, color: '#'+(Math.random()*0xFFFFFF<<0).toString(16)});
                                _renderusers();
                            }
                            
                            if(payload.user_joined){
                                var parts = payload.user_joined.split(":");
                                var userid = parts[0];
                                var username = parts[1];
                                
                                if(userid != me.id){
                                    users.push({nick:username, id:userid, color: '#'+(Math.random()*0xFFFFFF<<0).toString(16)});
                                    _rendermsg(username, "Joined the discussion");
                                    _renderusers();
                                }
                                
                                if(chat_window.is(":visible")){
                                    status.html(users.length+" user"+((users.length > 1) ? "s": "")+" discussing '"+limitlength(options.title, 25)+"'");
                                }
                            }
                            
                            if(payload.user_left){

                                for(var i = 0; i < users.length; i++){
                                    if(users[i].id == payload.user_left){
                                        _rendermsg(users[i].nick, "Left the discussion");
                                        users.splice(i, 1);
                                        _renderusers();
                                        break;
                                    }
                                }
                                if(chat_window.is(":visible")){
                                    status.html(users.length+" user"+((users.length > 1) ? "s": "")+" discussing '"+_limitlength(options.title, 25)+"'");
                                }
                                
                            }
                            
                            if(payload.users_on_channel){
                                
                                //console.log(payload.users_on_channel);
                                
                                //status.html(payload.users_on_channel.length+" user"+((payload.users_on_channel.length > 1) ? "s": "")+" discussing '"+limitlength(options.title, 25)+"'");
                                
                                //console.log("payload-length"+payload.users_on_channel.length);

                                for(var i = 0; i < payload.users_on_channel.length; i++){

                                    var match = false;
                                    var parts = payload.users_on_channel[i].split(":");
                                    var userid = parts[0];
                                    var username = parts[1];
                                    for(var j = 0; j < users.length; j++){
                                        if(users[j].id == userid){
                                            match = true;
                                        }
                                    }
                                    
                                    if(!match){
                                        users.push({nick:username, id:userid, color: '#'+(Math.random()*0xFFFFFF<<0).toString(16)});
                                    }
                                }
                                _renderusers();
                            }
                            
                            if(payload.user_name_change){
                                
                                var parts = payload.user_name_change.split(":");
                                var userid = parts[0];
                                var username = parts[1];
                                for(var i = 0; i < users.length; i++){
                                    if(users[i].id == userid){
                                        _rendermsg(users[i].nick, "changed name to <strong>"+username+"</strong>");
                                        users[i].nick = username;
                                        if(userid == me.id){
                                            users[i].nick = username;
                                        }
                                        _renderusers();
                                        break;
                                    }
                                }
                                _renderusers();
                            }
                            
                            if(payload.user_count_channel){
                                // here we need to do check is it already says welcome then
                                if(!chat_window.is(":visible")){
                                    var current_status = status.html();
                                    
                                    if(current_status.indexOf(options.connected_label) != -1){
                                        status.html(options.connected_label+", (" +payload.user_count_channel+") user"+((payload.user_count_channel > 1) ? "s": "")+" online");
                                    }
                                }
                            }
                            
                        }catch(e){}
                    }
                    
                    channel.onerror = function(e){
                        console.log(e);
                    }
                    
                    channel.onmessage = function(e){
                        
                        try{
                            var payload = JSON.parse(e.data);
                            
                        }catch(e){
                            return;
                        }
                        
                        thenick = payload.nick.replace(/<([^>]+)>/g,'');
                        message = payload.message.replace(/<([^>]+)>/g,'');
                        
                        _rendermsg(thenick, message);
                        
                        if(!chat_window.is(":visible")){
                            status.html("<span class='desc'><strong>"+thenick+"</strong> just said:</span> " +_limitlength(message, options.max_preview));
                            status.fadeTo(200, 0.5).fadeTo(200, 1.0).fadeTo(200, 0.5).fadeTo(200, 1.0);
                        }
                        
                    }
                    
                    form.submit(function(e) {
                        e.preventDefault();
                        _send();
                    });
                    
                    send_btn.on("click", function(e){
                        e.preventDefault();
                        _send();
                        input.focus();
                    })
                    
                    join_btn.on("click", function(e){
                        e.preventDefault();
                        
                        if(chat_window.is(":visible")){
                            chat_window.hide();
                            join_btn.html(options.join_label);
                        }else{
                            chat_window.show();
                            join_btn.html(options.hide_label);
                            
                            if($("li", chat_list).length < 2){
                               $("li", chat_list).html("Welcome to the discussion <strong>"+me.nick+"</strong>");
                            }
                            if(!joined){
                                joined = true;
                                channel.emit("api.join");
                            }else{
                                channel.emit("api.users");
                            }
                            
                            status.html("Welcome to the discussion <strong>"+me.nick+"</strong>");
                            
                            input.focus();
                            
                            var height = $(".wp-chat-messages")[0].scrollHeight;
                            $(".wp-chat-messages").scrollTop(height);
                            
                        }
                    });
                    
                    change_btn.on("click", function(e){
                        e.preventDefault();
                        var new_name = prompt("Please enter your new name", me.nick);
                        if (new_name!=null && new_name!=""){
                            channel.emit("api.name_change:"+new_name);
                            me.nick = new_name;
                            input.focus();

                            createCookie('wp_chat_nick', new_name);
                        }
                    });
                    
                    reset_btn.on("click", function(e){
                        e.preventDefault();
                        //console.log("attempting clear");
                        //channel.emit("api.clear");
                        // send message to all
                        console.log("reset clicked... lets try name change");
                        update_name(me.id, "john");

                    });
                }
            });
        }
    });      
})(jQuery);
