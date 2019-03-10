
// See README.md

const { app, BrowserWindow, session } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;

let browser_window_properties = {
    width: 1280,
    height: 720,
    frame: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    icon: __dirname + '/img/icon.png',
    webPreferences: {
        devTools: true,
        nodeIntegration: true,
        nodeIntegrationInWorker: false,
        //preload: 'js/test.js'
    }
};

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
        win.webContents.openDevTools();

        // Emitted when the window is closed.
        win.on( 'closed', handle_window_closed );
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
