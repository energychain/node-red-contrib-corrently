#!/usr/bin/env node

const storage = require('node-persist');
const lib = require("./lib/gruenstrombonus.js");

const app = async function(sko) {
    await storage.init({dir: './.node-persist/'+sko});

    let config = {
      stromkonto: sko
    };
    let result = await lib(config,storage);
    console.log(result);
    return;
};

if(process.argv.length < 3) {
  console.warn("Please specify stromkonto as argument");
} else {
  app(process.argv[2]);
}
