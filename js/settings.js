
/*
OOPASS Electron Client
Copyright (C) 2019  Christopher Price (pricechrispy, crprice)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>
*/

// See README.md

let _node_version = process.versions.node;
let _chrome_version = process.versions.chrome;
let _electron_version = process.versions.electron;
let _jquery_version = $().jquery;

console.log( 'Node v' + _node_version );
console.log( 'Chrome v' + _chrome_version );
console.log( 'Electron v' + _electron_version );
console.log( 'jQuery v' + _jquery_version );

let _nrequire = window.nodeRequire;

const { clipboard } = _nrequire('electron');
const { BrowserWindow } = _nrequire('electron').remote;

// for APPLICATION SETTINGS
const Store = _nrequire('electron-store');

// initialize application settings
const schema = {
    api_key_email: {
        type: 'string',
        format: 'email'
    },
    server_host: {
        type: 'string',
        default: ''
    },
    server_port: {
        type: 'string',
        default: ''
    },
    cache_master_password_time: {
        type: 'number',
        maximum: 120,
        minimum: 0,
        default: 5
	}
};

const application_settings = new Store( {schema} );

// setup window
let win = _nrequire('electron').remote.getCurrentWindow();
let win_settings = null;

let browser_window_properties_settings = Object.assign( {}, _nrequire('electron').remote.getGlobal('browser_window_properties_default') );

browser_window_properties_settings.parent = win;
browser_window_properties_settings.modal = true;
browser_window_properties_settings.height = 180;

let current_size = win.getSize();
let current_width = current_size[0];
let current_height = current_size[1];

let height_shim = $(document).height() - $(window).height();

if ( height_shim > 0 )
{
    win.setSize( current_width, current_height + height_shim + 20 );
}

let handle_setting_changed = function() {
    if ( application_settings.get( $( this ).attr('name') ) !== $( this ).val() )
    {
        application_settings.set( $( this ).attr('name'), $( this ).val() );
    }
};

$('input').on( 'change', handle_setting_changed );
$('input').on( 'keyup', handle_setting_changed );
