# node-red-contrib-corrently

![npm](https://img.shields.io/npm/dw/node-red-contrib-corrently)

Work with the Corrently Energy (Power) Ecosystem in Germany from:
- Node RED
- Command Line
- Embedded into your Code/System

This is early stage development.

## Installation

### Node-RED (Node)
```shell
cd ~/.node-red/
npm install --save node-red-contrib-corrently
```

### Standalone (Module or Command Line)
```shell
npm install -g node-red-contrib-corrently
```

## Node: Strompreis

### Use from Commandline (CLI)
```shell
corrently.stromkonto <Stromkonto>
```

### Use as module
```javascript
const Corrently = new require("node-red-contrib-corrently")();

const app=async function() {
	console.log(await Corrently.Strompreis('0x7866f187f30cd52Bdbd5c4184fD3ee6168Ae0dB4'));
}

app();
```

## Funding
This module is part of the Corrently Ecosystem which looks for funding in Germany:  https://www.stromdao.de/crowdfunding/info
![STROMDAO - Corrently Crowdfunding](https://squad.stromdao.de/nextcloud/index.php/s/Do4pzpM7KndZxAx/preview)
