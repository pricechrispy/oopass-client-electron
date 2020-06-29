
/*
OOPASS Electron Client
Copyright (C) 2019-2020  Christopher Price (pricechrispy, crprice)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>
*/

// See README.md

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

let set_notice_error = function( message )
{
    $('.notice').html( '<span style="color: #FF0000;">' + message + '</span>' );
};

let set_notice_success = function( message )
{
    $('.notice').html( '<span style="color: #009900;">' + message + '</span>' );
};

let handle_setting_changed = function() {
    let current_input = $( this );
    let current_input_value = current_input.val();
    let current_setting = current_input.attr('name');
    let current_setting_type = application_settings_schema[ current_setting ].type;
    let current_setting_value = application_settings.get( current_setting );
    
    //if ( current_setting_value !== current_input_value )
    //{
        try
        {
            console.log('Saving setting ' + current_setting + ':' + current_setting_type + ':"' + current_input_value + '"');
            
            if ( current_setting_type === 'number' )
            {
                current_input_value = parseInt( current_input_value, 10 );
            }
            if ( current_setting === 'requested_chars' && current_input_value.length === 0 )
            {
                throw new Error('Invalid character string');
            }
            
            application_settings.set( current_setting, current_input_value );
            set_notice_success('Settings have been saved');
        }
        catch (e)
        {
            //console.log( e.name ); //Error
            //console.log( e.message ); //Config schema violation: `api_key_email` should match format "email"
            console.log( e );
            
            if ( e.message === 'Config schema violation: `api_key_email` should match format "email"')
            {
                set_notice_error('Email is incorrectly formatted');
            }
            else if ( e.message === 'Config schema violation: `cache_master_password_time` should be number')
            {
                set_notice_error('Expiration must be a number');
            }
            else if ( e.message === 'Config schema violation: `server_port` should be number')
            {
                set_notice_error('Server Port must be a number');
            }
            else if ( e.message.indexOf('Config schema violation: `cache_master_password_time` should be') !== -1 )
            {
                set_notice_error('Expiration must be between 1 and 120');
            }
            else if ( e.message.indexOf('Config schema violation: `server_port` should be') !== -1 )
            {
                set_notice_error('Server Port must be between 1 and 65535');
            }
            else if ( e.message === 'Invalid character string' )
            {
                set_notice_error('Desired character field must not be empty');
            }
            else
            {
                set_notice_error('Error saving some settings');
            }
        }
    //}
};

let load_application_setting = function( i )
{
    let current_input = $( this );
    let current_setting = current_input.attr('name');
    let current_setting_type = application_settings_schema[ current_setting ].type;
    let current_setting_value = application_settings.get( current_setting );
    
    console.log('Initializing setting ' + current_setting + ':' + current_setting_type + ':"' + current_setting_value + '"');
    current_input.val( current_setting_value );
};

$('input').each( load_application_setting );

$('input').on( 'change', handle_setting_changed );
$('input').on( 'keyup', handle_setting_changed );
