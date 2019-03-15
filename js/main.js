
let _node_version = process.versions.node;
let _chrome_version = process.versions.chrome;
let _electron_version = process.versions.electron;
let _jquery_version = $().jquery;

console.log( 'Node v' + _node_version );
console.log( 'Chrome v' + _chrome_version );
console.log( 'Electron v' + _electron_version );
console.log( 'jQuery v' + _jquery_version );

let _nrequire = window.nodeRequire;

const { BrowserWindow } = _nrequire('electron').remote;

let win = _nrequire('electron').remote.getCurrentWindow();
let win_settings = null;

let browser_window_properties_settings = Object.assign( {}, _nrequire('electron').remote.getGlobal('browser_window_properties_default') );

browser_window_properties_settings.parent = win;
browser_window_properties_settings.modal = true;
browser_window_properties_settings.height = 180;

let handle_window_closed_settings = function() {
    win_settings = null;
};

let handle_settings_show = function() {
    if ( !win_settings.isVisible() )
    {
        win_settings.setSize( browser_window_properties_settings.width, browser_window_properties_settings.height );
        win_settings.show();
    }
};

let handle_open_settings = function() {
    if ( win_settings === null )
    {
        // Create the browser window.
        win_settings = new BrowserWindow( browser_window_properties_settings );
        
        // Set additional properties.
        win_settings.setMenuBarVisibility(false);

        // Load the index.html of the app.
        win_settings.loadFile('settings.html');

        // Open the DevTools if allowed in window properties.
        win_settings.webContents.openDevTools({ mode: 'detach' });

        // Emitted when the window is closed.
        win_settings.on( 'closed', handle_window_closed_settings );
        win_settings.once( 'ready-to-show', handle_settings_show );
    }
};

let handle_win_hide = function() {
    win.hide();
};

let handle_get_password = function() {
    $( 'span', this ).html('Please<br>Wait...');
};

$('.action-hide').on( 'click', handle_win_hide );
$('.action-settings').on( 'click', handle_open_settings );
$('.main .take-action').on( 'click', handle_get_password );

let current_size = win.getSize();
let current_width = current_size[0];
let current_height = current_size[1];

let height_shim = $(document).height() - $(window).height();
//let height_shim = current_height_content - current_height;

console.log( win.getSize() );
console.log( height_shim );

if ( height_shim > 0 )
{
    //win.setSize( current_width, current_height + 20 );
    win.setSize( current_width, current_height + height_shim + 20 );
}

console.log( win.getSize() );
