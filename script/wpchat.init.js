
jQuery(function($){
    
    /*
    console.log("ready");
    
    var channel_num = 5;
    
    var nick = "Isak";
    var page_title = "Some title of page";
    
    var channel = new HydnaChannel('testivara.hydna.net/'+channel_num+'?'+nick +":" + page_title, 'rw');
    
    channel.onsignal = function(e){
        console.log("signal: "+e.message);
    }
    
    channel.onmessage = function(e){
        console.log("data:"+e.data );
    }
    
    channel.onopen = function(){
        console.log("we are connected...");
        channel.send("hi");
    }
    
    channel.onerror = function(e){
        console.log(e);
        console.log("error in connecting...");
    }
    
    channel.onclose = function(){
        console.log("we were closed down");
    }*/
    

    $('.wp-chat-container').hydnachat();
    
});
