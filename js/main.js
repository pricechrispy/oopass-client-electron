
let _node_version = process.versions.node;
let _chrome_version = process.versions.chrome;
let _electron_version = process.versions.electron;
let _jquery_version = $().jquery;

console.log( 'Node v' + _node_version );
console.log( 'Chrome v' + _chrome_version );
console.log( 'Electron v' + _electron_version );
console.log( 'jQuery v' + _jquery_version );

let handle_open_settings = function() {
    
};

let handle_get_password = function() {
    $('span', this).html('Please<br>Wait...');
};

$('.action-settings').on( 'click', handle_open_settings );
$('.main .take-action').on( 'click', handle_get_password );
