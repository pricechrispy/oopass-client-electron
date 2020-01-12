
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

// for CRYPTOGRAPHIC OPERATIONS
const crypto = _nrequire('crypto');
const BigInteger = _nrequire('bigi');
const ecurve = _nrequire('ecurve');
const seedrandom = _nrequire('seedrandom');

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
        type: 'number',
        maximum: 65535,
        minimum: 1,
        default: 51200
    },
    cache_master_password_time: {
        type: 'number',
        maximum: 120,
        minimum: 0,
        default: 5
	},
    requested_chars: {
        type: 'string',
        default: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'
    },
    requested_length: {
        type: 'number',
        maximum: 128,
        minimum: 6,
        default: 16
    }
};

const application_settings = new Store( {schema} );

// initialize ecc options
const hmac_options = {
    algorithm:  'sha256',
    key:        '123456789abcdef03456789abcdef012'
};

// https://en.bitcoin.it/wiki/Secp256k1
const ec_options = ecurve.getCurveByName('secp256k1');

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
//let height_shim = current_height_content - current_height;

//console.log( win.getSize() );
//console.log( height_shim );

if ( height_shim > 0 )
{
    //win.setSize( current_width, current_height + 20 );
    win.setSize( current_width, current_height + height_shim + 20 );
}

//console.log( win.getSize() );

let handle_window_closed_settings = function() {
    win_settings = null;
    
    console.log( application_settings.store );
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

let remove_css_runtime_classes = function( _index, _class ) {
    return 'runtime-background-red runtime-background-green runtime-background-blue runtime-background-yellow';
};

let handle_get_password = function() {
    let button = $( this );
    let button_span = $( 'span', this );
    button.removeClass( remove_css_runtime_classes );
    button.addClass('runtime-background-yellow');
    button_span.html('Please<br>Wait...');
    
    let _master_password = $('#master-password').val();
    let _auth_domain = $('#auth-domain').val();
    let _auth_user = $('#auth-user').val();
    let _auth_offset = 0;
    
    let _setting_api_key_email = application_settings.get('api_key_email');
    let _setting_server_host = application_settings.get('server_host');
    let _setting_server_port = application_settings.get('server_port');
    
    let _available_chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    let _setting_requested_length = application_settings.get('requested_length');
    let _setting_requested_chars = application_settings.get('requested_chars');
    
    // random value used to blind on send, and deblind on receive
    let randomRho_bigi = new BigInteger();
    
    
    // Set default extension settings
    let client_version = '1.1.0';
    let protocol_version = '2.0.*';
    
    let node_socket_options   = {
        // NodeJS Server Master
        host: _setting_server_host,
        port: _setting_server_port
    };
    
    let node_socket_connection_string = 'wss://' + node_socket_options.host + ':' + node_socket_options.port;
    
    let handle_node_socket_received_beta = function( event )
    {
        let data = event.data;
        
        let data_array = data.toString().split(",");
        
        if ( data_array.length === 2 )
        {
            let beta_x_str = data_array[0];
            let beta_y_str = data_array[1];
            
            console.log( 'RECEIVED X,Y CURVE POINTS (' + beta_x_str + ', ' + beta_y_str + ')' );
            
            let beta_x = BigInteger.fromHex( beta_x_str );
            let beta_y = BigInteger.fromHex( beta_y_str );
            
            let beta_point = ecurve.Point.fromAffine( ec_options, beta_x, beta_y );
            
            let is_beta_point_member = ec_options.isOnCurve( beta_point );

            if ( is_beta_point_member )
            {
                console.log( 'Point is a member of curve' );
                
                
                // CANCEL OUT RANDOM LARGE VALUE IN BETA THAT WAS USED TO BLIND ALPHA
                
                // aka: rwd = H'(x)^k = (beta)^(1/rho)
                let rho_inv = randomRho_bigi.modInverse( ec_options.n );
                let rwd_point = beta_point.multiply( rho_inv ); //ecc point multiplication (beta)^(1/rho)
                
                console.log( 'rwd_point.toString():' );
                console.log( rwd_point.toString() );
                
                
                // GENERATE HMAC SHA256 OF RESULTING X,Y PAIR ON CURVE AND MASTER PASSWORD AS RESULT OF OPRF EXCHANGE
                
                let rwd_x = rwd_point.affineX.toBuffer(32);
                let rwd_y = rwd_point.affineY.toBuffer(32);
                
                let rwd = rwd_x.toString('hex') + rwd_y.toString('hex') + _master_password;
                
                const rwd_hmac_sha256 = crypto.createHmac( hmac_options.algorithm, _auth_domain );
                rwd_hmac_sha256.update( rwd );
                
                rwd = rwd_hmac_sha256.digest('hex');
                
                let hashed = rwd;
                
                console.log( 'Resolved Beta:' );
                console.log( hashed );
                
                
                // MAP RESULT TO CONFIGURABLE PASSWORD ALPHABET
                
                let generate_seeded_random_bytes_from_hashed = new seedrandom( hashed );
                let pass = '';
                
                for ( i = 0; i < _setting_requested_length; i++ )
                {
                    pass += _setting_requested_chars[ Math.floor( generate_seeded_random_bytes_from_hashed() * _setting_requested_chars.length ) ];
                }
                
                
                // SAVE TO CLIPBOARD WITH TIMER TO CLEAR
                
                clipboard.writeText( pass );
                
                button.removeClass( remove_css_runtime_classes );
                button.addClass('runtime-background-green');
                button_span.html('Copied to Clipboard!');
                
                window.setTimeout( function() {
                    clipboard.writeText('_');
                    //clipboard.writeText(' ');
                    //clipboard.writeText('');
                    //clipboard.clear();
                    
                    button.removeClass( remove_css_runtime_classes );
                    button_span.html('Password<br>Cleared');
                }, 15000 );
            }
            else
            {
                console.log( 'Point is NOT a member of curve' );
                
                button.removeClass( remove_css_runtime_classes );
                button.addClass('runtime-background-red');
                button_span.html('There was a<br>communication<br>error');
            }
        }
        else if ( data === 'invalid' )
        {
            console.log( 'Point SENT is NOT a member of curve' );
            
            button.removeClass( remove_css_runtime_classes );
            button.addClass('runtime-background-red');
            button_span.html('Error<br>Please<br>retry');
        }
        
        console.log( 'Closing socket connection' );
        
        this.removeEventListener( 'message', handle_node_socket_received_beta );
        this.close();
    };
    
    let handle_node_socket_opened = function( event )
    {
        console.log('Socket opened');
        console.log( event );
        
        this.send('__client_' + client_version + '_connected__');
    };
    
    let handle_node_socket_error = function( event )
    {
        console.log('Socket error');
        console.log( event );
        
        button.removeClass( remove_css_runtime_classes );
        button.addClass('runtime-background-red');
        button_span.html('There was a<br>network<br>error');
    }
    
    let handle_node_socket_data = function( event )
    {
        let data = event.data;
        let message = 'Data received: "' + data.toString() + '"';
        
        console.log( message );
        
        if ( data.toString() === '__protocol_' + protocol_version + '_connected__' )
        {
            this.removeEventListener( 'message', handle_node_socket_data );
            
            this.addEventListener( 'message', handle_node_socket_received_beta );
            
            
            // GENERATE USER HASH TO BE BLINDED AND SENT TO SERVER
            
            //generate hash( username+domain+ctr+password )
            let hashForOPRF = _auth_user + _auth_domain + _auth_offset + _master_password;
            
            const oprf_hmac_sha256 = crypto.createHmac( hmac_options.algorithm, hmac_options.key );
            oprf_hmac_sha256.update( hashForOPRF );
            
            hashForOPRF = oprf_hmac_sha256.digest('hex');
            
            console.log( 'hashForOPRF:' );
            console.log( hashForOPRF );
            
            
            // GENERATE RANDOM LARGE VALUE FOR USE IN BLINDING OUR USER HASH
            
            let randomRho = new BigInteger();
            randomRho = BigInteger.ONE;
            
            let random_seed = new Uint32Array(2); // 32 bit integers x 2
            
            // ensure binary length >= (256+80=336 bits) 42bytes of entropy: function bnByteLength() {return this.bitLength() >> 3}
            // note: native JavaScript only supports integers up to 53 bits.
            let interations_required = 0;
            let a = new BigInteger();
            let b = new BigInteger();
            
            while ( randomRho.bitLength() < 336 )
            {
                console.log( 'Current bitlength: ' + randomRho.bitLength().toString() );
                
                window.crypto.getRandomValues( random_seed );
                
                a.fromString( random_seed[0].toString() );
                b.fromString( random_seed[1].toString() );
                
                randomRho = randomRho.multiply( a.multiply( b ) );
                
                interations_required++;
            }
            
            console.log( 'Generated at least 42 bytes of entropy, iterations required: ' + interations_required.toString() );
            
            //let randomRho_hex = randomRho.toString(16); // convert base 16
            
            //// pad if necessary for well formed hex
            //if ( randomRho_hex.length % 2 != 0 )
            //{
            //    randomRho_hex = '0' + randomRho_hex;
            //}
            
            //randomRho_bigi = BigInteger.fromHex( randomRho_hex );
            randomRho_bigi = randomRho;
            
            console.log( 'randomRho:' );
            console.log( randomRho );
            console.log( 'randomRho_bigi:' );
            console.log( randomRho_bigi );
            
            
            // GENERATE BLINDED ALPHA
            
            // generate alpha = (hashForAlpha)^randomRho
            // aka: alpha=H'(x)^rho
            // power represented as point multiplication on the curve
            
            // user hmac sha256 as integer
            let hash_bigi = BigInteger.fromHex( hashForOPRF );
            //let hash_buffer = hash_bigi.toBuffer(33);
            
            //// set type for lib, see https://github.com/cryptocoinjs/ecurve/blob/master/lib/point.js#L246
            //hash_buffer[0] = 0x02;
            
            console.log( 'hash_bigi:' );
            console.log( hash_bigi );
            //console.log( 'hash_buffer:' );
            //console.log( hash_buffer );
            //console.log('hash_buffer.length:');
            //console.log(hash_buffer.length);
            //console.log('Math.floor((curve.p.bitLength() + 7) / 8):');
            //console.log(Math.floor((ec_options.p.bitLength() + 7) / 8));
            
            // get x,y pair on curve using user hmac as X
            // Bitcoin keys use the secp256k1 (info on 2.7.1) parameters.
            // Public keys are generated by: Q=dG where Q is the public key, d is the private key, and G is a curve parameter.
            // A public key is a 65 byte long value consisting of a leading 0x04 and X and Y coordinates of 32 bytes each.
            // http://www.secg.org/collateral/sec2_final.pdf
            // aka: Q = alpha_point; d = hash_bigi; G = ec_options.G
            
            //let alpha_point = ec_options.pointFromX( false, hash_bigi ); // false = not assume y coord odd
            //let alpha_point = ecurve.Point.decodeFrom( ec_options, hash_buffer );
            let alpha_point = ec_options.G.multiply( hash_bigi );
            
            console.log( 'alpha_point.affineX: ' );
            console.log( alpha_point.affineX );
            console.log( 'alpha_point.affineY: ' );
            console.log( alpha_point.affineY );
            console.log( 'ec_options.isOnCurve( alpha_point ): ');
            console.log( ec_options.isOnCurve( alpha_point ) );
            
            // point multiply with random large value, assumed reduction by ec_options.p
            let alpha_mult = alpha_point.multiply( randomRho_bigi );
            
            console.log( 'alpha_mult.affineX: ' );
            console.log( alpha_mult.affineX );
            console.log( 'alpha_mult.affineY: ' );
            console.log( alpha_mult.affineY );
            console.log( 'ec_options.isOnCurve( alpha_mult ): ');
            console.log( ec_options.isOnCurve( alpha_mult ) );
            
            // get x,y pair after point multiplication as 32byte==256bit length strings
            let alpha_x = alpha_mult.affineX.toBuffer(32);
            let alpha_y = alpha_mult.affineY.toBuffer(32);
            
            // will send x,y pair to server for decoding
            let alpha = alpha_x.toString('hex') + ',' + alpha_y.toString('hex');
            
            
            // GENERATE UNIQUE USER ID TO ASSOCIATE EMAIL FOR GEOIP VIOLATION NOTIFICATIONS
            
            //let user_identifier = client_api_key;
            let user_identifier = '';
            
            // add username to hash if found
            console.log( 'adding username to user_identifier: ' + _auth_user );
            
            user_identifier += _auth_user;
            
            console.log( 'adding domain to user_identifier: ' + _auth_domain );
            
            user_identifier += _auth_domain;
            
            
            // keyed hash of user_identifier into hex string
            const user_identifier_hmac_sha256 = crypto.createHmac( hmac_options.algorithm, _auth_offset.toString() );
            user_identifier_hmac_sha256.update( user_identifier );
            
            user_hash_hex = user_identifier_hmac_sha256.digest('hex');
            
            
            // SEND VALUES TO SERVER
            
            console.log('Sending Alpha + User Identifer + User Email');
            console.log( 'Alpha: ' + alpha );
            console.log( 'User Identifer: ' + user_hash_hex );
            console.log( 'User Email: ' + _setting_api_key_email );
            
            let request_data = alpha + ',' + user_hash_hex + ',' + _setting_api_key_email;
            
            this.send( request_data );
        }
    };
    
    if ( _master_password.length < 6 )
    {
        button.removeClass( remove_css_runtime_classes );
        button.addClass('runtime-background-red');
        button_span.html('Password<br>Must Be<br>Longer >=6');
    }
    else if ( _auth_domain.length < 1 )
    {
        button.removeClass( remove_css_runtime_classes );
        button.addClass('runtime-background-red');
        button_span.html('Location<br>Must Be<br>Longer >=1');
    }
    else if ( _auth_user.length < 1 )
    {
        button.removeClass( remove_css_runtime_classes );
        button.addClass('runtime-background-red');
        button_span.html('Service<br>Must Be<br>Longer >=1');
    }
    else
    {
        console.log( 'Attempting socket connection to: ' + node_socket_connection_string );
        
        let node_socket = new WebSocket( node_socket_connection_string );
        
        node_socket.addEventListener( 'error', handle_node_socket_error );
        node_socket.addEventListener( 'open', handle_node_socket_opened );
        node_socket.addEventListener( 'message', handle_node_socket_data );
    }
};

let master_password_timer_id = null;
let cache_master_password_time = parseInt( application_settings.get('cache_master_password_time'), 10 ) * 60;

let set_notice_timer = function()
{
    $('.notice span').html('Master Password will be cleared in ' + cache_master_password_time.toString() + 's...');
};

let manage_master_password_timer = function()
{
    cache_master_password_time -= 1;
    
    if ( cache_master_password_time < 0 )
    {
        clearInterval( master_password_timer_id );
        master_password_timer_id = null;
        
        $('#master-password').val('');
        $('.notice span').html('Master Password cleared');
    }
    else
    {
        set_notice_timer();
    }
};

let handle_master_password_changed = function()
{
    if ( master_password_timer_id !== null )
    {
        clearInterval( master_password_timer_id );
        master_password_timer_id = null;
    }
    
    cache_master_password_time = parseInt( application_settings.get('cache_master_password_time'), 10 ) * 60;
    
    set_notice_timer();
    
    master_password_timer_id = setInterval( manage_master_password_timer, 1000 );
};

$('.action-hide').on( 'click', handle_win_hide );
$('.action-settings').on( 'click', handle_open_settings );
$('.main .take-action').on( 'click', handle_get_password );

$('#master-password').on( 'change', handle_master_password_changed );
$('#master-password').on( 'keyup', handle_master_password_changed );
