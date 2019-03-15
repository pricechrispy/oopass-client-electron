
// See README.md

const { app, BrowserWindow, Menu, Tray, globalShortcut } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;
let app_tray = null;
let app_description = 'SPHINX Electron Client';

let browser_window_properties = {
    show: false,
    width: 320,
    height: 240,
    frame: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    icon: __dirname + '/img/icon.png',
    webPreferences: {
        //devTools: true,
        devTools: false,
        nodeIntegration: true,
        nodeIntegrationInWorker: false,
        //preload: 'js/test.js'
    }
};

global.browser_window_properties_default = Object.assign( {}, browser_window_properties );

let handle_window_closed = function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
};

let handle_application_closed = function() {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if ( process.platform !== 'darwin' )
    {
        app.quit();
    }
};

let handle_application_will_quit = function() {
    globalShortcut.unregisterAll();
};

let handle_tray_click_open = function() {
    if ( !win.isVisible() )
    {
        win.setSize( browser_window_properties.width, browser_window_properties.height );
        win.show();
    }
};

let handle_global_shortcut = function() {
    handle_tray_click_open();
};

let create_browser_window = function() {
    if ( win === null )
    {
        // Create the browser window.
        win = new BrowserWindow( browser_window_properties );
        
        // Set additional properties.
        win.setMenuBarVisibility(false);

        // Load the index.html of the app.
        win.loadFile('index.html');

        // Open the DevTools if allowed in window properties.
        win.webContents.openDevTools({ mode: 'detach' });

        // Emitted when the window is closed.
        win.on( 'closed', handle_window_closed );
        win.once( 'ready-to-show', handle_tray_click_open );
    }
    
    app_tray = new Tray( browser_window_properties.icon );
    app_tray.setToolTip( app_description );
    app_tray.setTitle( app_description );
    
    const app_tray_context_menu = Menu.buildFromTemplate([
        { label: 'Open', click: handle_tray_click_open },
        { type: 'separator' },
        { label: 'Exit', role: 'quit' }
    ]);
    
    app_tray.setContextMenu( app_tray_context_menu );
    
    const ret = globalShortcut.register( 'CommandOrControl+Shift+2', handle_global_shortcut );
    
    if ( !ret )
    {
        console.log('[ERROR]: GLOBAL SHORTCUT REGISTRATION FAILED');
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on( 'ready', create_browser_window );

// Quit when all windows are closed.
app.on( 'window-all-closed', handle_application_closed );

// On macOS it's common to re-create a window in the app when the
// dock icon is clicked and there are no other windows open.
app.on( 'activate', create_browser_window );

app.on( 'will-quit', handle_application_will_quit );
