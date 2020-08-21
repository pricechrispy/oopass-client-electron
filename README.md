<p align="center">
    <img src="img/icon.png" alt="OOPASS Electron Client Icon" width="192px"/>
</p>

# oopass-client-electron
OOPASS Electron Client 1.1.2

## Description
OOPASS Electron Client provides a client-side Electron implementation of the Oblivious Online PASSword management system utilizing the SPHINX protocol.

## Releases
For packages and documentation, visit: https://pricechrispy.github.io/oopass-client-electron/.

## Authors
Christopher Price (pricechrispy, crprice)

## License
![AGPL3](https://www.gnu.org/graphics/agplv3-with-text-162x68.png)

OOPASS Electron Client

Copyright (C) 2019-2020  Christopher Price (pricechrispy, crprice)

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>

See LICENSE.md

## Requires
* OOPASS Server 2.* (Server-side Protocol): https://github.com/pricechrispy/oopass-server-nodejs
* Electron v9.2.1 (Framework): https://github.com/electron/electron
* ecurve v1.0.6 (ECC Operations): https://github.com/cryptocoinjs/ecurve/
* seedrandom v3.0.5 (Random extension): https://github.com/davidbau/seedrandom
* electron-store v6.0.0 (Persistent storage): https://github.com/sindresorhus/electron-store

Also see package.json

This client connects to a running server-side implementation to operate, for example https://github.com/pricechrispy/oopass-server-nodejs.

## Usage
```bash
npm start
```

## Testing
```bash
npm test
```
