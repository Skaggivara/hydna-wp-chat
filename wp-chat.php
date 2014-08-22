<?php
/* 
Plugin Name: WP Chat
Plugin URI: http://www.hydna.com 
Description: Enable real-time chat under each article with this plugin. 
Version: 1.0 
Author: hydna 
Author URI: http://www.hydna.com 
License: GPL2
*/

if(!class_exists('WP_Chat')) {
    
    class WP_Chat
    {
        public function __construct(){
            add_action('admin_init', array(&$this, 'admin_init'));
            add_action('admin_menu', array(&$this, 'admin_menu'));
            add_action('wp_enqueue_scripts', array(&$this, 'public_scripts'));
            add_filter('the_content', array(&$this, 'filter_content'));
            add_filter('the_excerpt', array(&$this, 'filter_excerpt'));
        }

        public function init_settings(){
            
            register_setting('wp_chat_options_group', 'wp_chat_domain', array(&$this, 'validate_domain'));
            register_setting('wp_chat_options_group', 'wp_chat_admin_pass');
            register_setting('wp_chat_options_group', 'wp_chat_max_conn');
            register_setting('wp_chat_options_group', 'wp_chat_max_post');
            register_setting('wp_chat_options_group', 'wp_chat_theme');
            register_setting('wp_chat_options_group', 'wp_chat_excerpt');
            
            add_option('wp_chat_domain','');
            add_option('wp_chat_admin_pass', $this->random_password());
            add_option('wp_chat_max_conn', '30');
            add_option('wp_chat_max_post', '30');
            add_option('wp_chat_theme', 'light');
            add_option('wp_chat_excerpt', 'on');
        }

        public function validate_domain($domain)
        {
            if($domain == ''){
                //add_settings_error('wp_chat_domain', 'wp_chat_domain', 'You need to provide a valid hydna domain for this plugin to work, get one for free at <a href="https://www.hydna.com/account/create/">hydna.com</a>.', 'error');
            
            }
            return $domain;
        }

        public function admin_init(){
            $this->init_settings();
            $this->admin_scripts();
        }

        public function admin_menu(){
            add_options_page('WP Chat Settings', 'WP Chat', 'manage_options', 'wp_chat', array(&$this, 'plugin_settings_page'));
        }

        public function public_scripts(){
            wp_enqueue_style('wp-chat-style', plugins_url('style/wpchat.css', __FILE__));
            wp_enqueue_script('hydna', 'http://cdnjs.cloudflare.com/ajax/libs/hydna/1.0.0/hydna.js', array(), '1.0.0', true);
            wp_enqueue_script('hydna-chat-plugin', plugins_url('script/hydnachat.jquery.js', __FILE__), array('jquery', 'hydna'), '1.0.0', true);
            wp_enqueue_script('wp-chat-init', plugins_url('script/wpchat.init.js', __FILE__), array('jquery', 'hydna', 'hydna-chat-plugin'), '1.0.0', true);

        }

        public function admin_scripts(){
            wp_enqueue_style('wp-chat-admin-style', plugins_url('style/wpchat-admin.css', __FILE__));
            wp_enqueue_script('ace', plugins_url('script/ace.min.js', __FILE__ ), array(), '1.0.0', true);
            wp_enqueue_script('ace_mode', plugins_url('script/mode-javascript.js', __FILE__), array('ace'), '1.0.0', true);
            wp_enqueue_script('ace_theme', plugins_url('script/theme-solarized_dark.js', __FILE__), array('ace'), '1.0.0', true);
            wp_enqueue_script('wp-chat-admin', plugins_url('script/wpchat_admin.init.js', __FILE__ ), array('jquery','ace'), '1.0.0', true);

        }

    
        public function chat_template($title, $postname, $domain, $theme) {
            $tmp = "<div class='wp-chat-container ".$theme."' data-title='".$title."' data-domain='".$domain."' data-slug='".$postname."'>
            <div class='wp-chat-window'>
                <div class='wp-chat-messages'>
                    <ul>
                        <li>Welcome to the discussion</li>
                    </ul>
                </div>
                <div class='wp-chat-users'>
                    <h3>Users</h3>
                    <ul></ul>
                    <button class='wp-name-change-btn'>Change your name</button><br>
                    <button class='wp-name-reset-btn'>Reset</button>
                </div>
            
                <div class='wp-chat-controls cf'>
                    <form action='.' method='post'>
                        <input class='wp-chat-input-field' type='text' id='wp-chat-2' placeholder='Your thoughts'/>
                        <button class='wp-chat-send-btn'>send</button>
                    </form>
                </div>
            </div>
            <div class='wp-chat-status cf'>
                <div class='wp-chat-status-label'>Connecting...</div>
                <button class='wp-chat-start-btn'>Join the conversation</button>
            </div>
        </div>";
            
            return $tmp;

        }

        public function random_password() {
            $alphabet = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
            $pass = array(); //remember to declare $pass as an array
            $alphaLength = strlen($alphabet) - 1; //put the length -1 in cache
            for ($i = 0; $i < 8; $i++) {
                $n = rand(0, $alphaLength);
                $pass[] = $alphabet[$n];              
            }
            return implode($pass); //turn the array into a string
        }       
        
        public function filter_content($content){
            global $post;
    
            $domain = get_option('wp_chat_domain');
            $theme = get_option('wp_chat_theme');
            $content = $content . $this->chat_template($post->post_title, $post->post_name, $domain, $theme);
            return $content;
        }

        public function filter_excerpt($content){
            global $wpdb, $post;
            // new content will be added after each post
            $use_in_excerpt = get_option('wp_chat_excerpt');
            $domain = get_option('wp_chat_domain');
            $theme = get_option('wp_chat_theme');
            if($use_in_excerpt == 'on'){
                $content = $content . $this->chat_template($post->post_title, $post->post_name, $domain, $theme);
            }
            return $content;

        }

        public function plugin_settings_page(){
            if(!current_user_can('manage_options')){
                wp_die(__('You do not have sufficient permissions to access this page'));
            }
            
            include(sprintf("%s/templates/settings.php", dirname(__FILE__))); 
        }

        public static function activate(){
            
        }

        public static function deactivate(){
            
        }
    }
}

if(class_exists('WP_Chat')) { 
    // Installation and uninstallation hooks 
    register_activation_hook(__FILE__, array('WP_Chat', 'activate')); 
    register_deactivation_hook(__FILE__, array('WP_Chat', 'deactivate')); 
    // instantiate the plugin class 
    $wp_chat = new WP_Chat();

    if(isset($wp_chat)) {
        function plugin_settings_link($links){
            $settings_link = '<a href="options-general.php?page=wp_chat">Settings</a>';
            array_unshift($links, $settings_link);
            return $links;
        }

        $plugin = plugin_basename(__FILE__);
        add_filter('plugin_action_links_'.$plugin, 'plugin_settings_link');
    } 
}
?>
