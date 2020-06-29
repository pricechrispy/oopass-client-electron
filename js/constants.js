
/*
OOPASS Electron Client
Copyright (C) 2019-2020  Christopher Price (pricechrispy, crprice)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>
*/

// See README.md

const _node_version = process.versions.node;
const _chrome_version = process.versions.chrome;
const _electron_version = process.versions.electron;
const _jquery_version = $().jquery;

console.log( 'Node v' + _node_version );
console.log( 'Chrome v' + _chrome_version );
console.log( 'Electron v' + _electron_version );
console.log( 'jQuery v' + _jquery_version );

const _nrequire = window.nodeRequire;

const { clipboard } = _nrequire('electron');
const { BrowserWindow } = _nrequire('electron').remote;

// for APPLICATION SETTINGS
const Store = _nrequire('electron-store');

// for CRYPTOGRAPHIC OPERATIONS
const crypto = _nrequire('crypto');
const BigInteger = _nrequire('bigi');
const ecurve = _nrequire('ecurve');
const seedrandom = _nrequire('seedrandom');

let random_seed = new Uint32Array(1); // 32 bit integer
window.crypto.getRandomValues( random_seed );

const random_32bytes = crypto.createHash('md5').update(random_seed[0].toString()).digest('hex');

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
    },
    hmac_key: {
        type: 'string',
        default: random_32bytes
    }
};

const settings_schema = { schema };

// initialize application settings
const application_settings = new Store( settings_schema );
const application_settings_schema = settings_schema.schema;

// initialize ecc options
const hmac_options = {
    algorithm:  'sha256',
    key:        application_settings.get('hmac_key') //'123456789abcdef03456789abcdef012'
};

// https://en.bitcoin.it/wiki/Secp256k1
const ec_options = ecurve.getCurveByName('secp256k1');
