
jQuery(function($){
    
   var editor = ace.edit("code-editor");     
   editor.setTheme("ace/theme/solarized_dark");

   var JavaScriptMode = require("ace/mode/javascript").Mode;
   editor.getSession().setMode(new JavaScriptMode());
   editor.setReadOnly(true);

});
