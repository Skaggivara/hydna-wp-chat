<?php 

$behavior = file_get_contents(plugin_dir_path( __FILE__ )."behavior.js");

$behavior = str_replace('{CONTROL_PASSWD}', get_option('wp_chat_admin_pass'), $behavior);
$behavior = str_replace('{MAX_PER_CHANNEL}', get_option('wp_chat_max_post'), $behavior);
$behavior = str_replace('{MAX_PER_DOMAIN}', get_option('wp_chat_max_conn'), $behavior);

?>

<div class='wrap'>
    <?php echo screen_icon(); ?>
    <h2>WP Chat options</h2>
    <p>To use this plugin, you need a hydna account, you can get one for free at <a href='https://www.hydna.com/account/create/'>https://www.hydna.com/account/create/</a>.</p>
    
    <p>When you have your hydna domain, please enter it below.</p>

    <p>You also need to paste the behavior code in the editor below into your domains behavior on your domains dashboard on <?php if(get_option('wp_chat_domain') == ''): ?><a href='https://www.hydna.com/account/domains'>https://www.hydna.com/account/domains</a><?php else: ?><a href='https://www.hydna.com/account/domains/<?php echo get_option('wp_chat_domain'); ?>/#behavior-editor'>https://www.hydna.com/account/domains/<?php echo get_option('wp_chat_domain'); ?>/#behavior-editor</a><?php endif; ?>.</p>
    
    <form action="options.php" method='post'>
        <?php @settings_fields('wp_chat_options_group'); ?>
        <?php @do_settings_fields('wp_chat_options_group'); ?>
        <table class='form-table'>
    
        <tr valign='top'>
            <th scope='row'>Hydna domain</th>
            <td><input type='text' value='<?php echo get_option('wp_chat_domain'); ?>' name='wp_chat_domain' id='wp_chat_dmain' placeholder='Your hydna domain' /><p class='description'>Get a free domain at <a href='http://www.hydna.com'>hydna.com</a>.</p>
            </td>
        </tr>
    
        <tr valign='top'>
            <th scope='row'>Administrator password</th>
            <td><input type='text' value='<?php echo get_option('wp_chat_admin_pass'); ?>' name='wp_chat_admin_pass' id='wp_chat_admin_pass' placeholder='Your hydna admin password' maxlength='10' /><p class='description'>As an administrator you can follow all the conversations taking place on your site.</p></td>
            </tr>
    
            <tr valign='top'>
                <th scope='row'>Max connections</th>
                <td><input value='<?php echo get_option('wp_chat_max_conn'); ?>' name='wp_chat_max_conn' id='wp_chat_max_conn' type='number' min='30' max='100000' step='10' /><p class='description'>Get a free domain at <a href='http://www.hydna.com'>hydna.com</a>.</p></td>
                </tr>
    
            <tr valign='top'>
                <th scope='row'>Max connections per post</th>
                <td><input type='number' min='2' max='100000' step='1' value='<?php echo get_option('wp_chat_max_post'); ?>' name='wp_chat_max_post' id='wp_chat_max_post' /><p class='description'>Get a free domain at <a href='http://www.hydna.com'>hydna.com</a>.</p></td>
            </tr>

            <tr valign='top'>
                <th scope='row'>Excerpt</th>
                <td><label for='wp_chat_excerpt'>
                
                <?php $use_excerpt = get_option('wp_chat_excerpt'); ?>
                <?php if($use_excerpt == 'on'): ?><input type='checkbox' checked='checked' name='wp_chat_excerpt' id='wp_chat_excerpt'/><?php else: ?><input type='checkbox' name='wp_chat_excerpt' id='wp_chat_excerpt' /><?php endif; ?> Show in excerpt</label></td></tr>

            <tr valign='top'>
                <th scope='row'>Theme</th>
                <td><select name='wp_chat_theme' id='wp_chat_theme'>
                
                <?php if(get_option('wp_chat_theme') == 'light'): ?>
                <option value='light' selected='selected'>Light</option>
                <option value='dark'>Dark</option>
                <?php else: ?>
                <option value='light'>Light</option>
                <option value='dark' selected='selected'>Dark</option>
                <?php endif; ?>
                </select><p class='description'>Get a free domain at <a href='http://www.hydna.com'>hydna.com</a>.</p></td>
            </tr> 

        </table>
        
        <?php @submit_button(); ?>
    
        <p class='description'>Copy the code below and paste it into your hydna domains behavior <?php if(get_option('wp_chat_domain') == ''): ?><a href='https://www.hydna.com/account/domains'>https://www.hydna.com/account/domains</a><?php else: ?><a href='https://www.hydna.com/account/domains/<?php echo get_option('wp_chat_domain'); ?>/#behavior-editor'>https://www.hydna.com/account/domains/<?php echo get_option('wp_chat_domain'); ?>/#behavior-editor</a><?php endif; ?>.</p>

        <div id='code-editor'><?php echo $behavior; ?></div>

    </form>
</div>
