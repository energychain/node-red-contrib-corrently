#!/usr/bin/env node

const storage = require('node-persist');
const lib = require("./lib/gsi.js");

const app = async function(plz) {
    await storage.init({dir: './.node-persist/'+plz});

    let config = {
      plz: plz
    };
    let result = await lib(config,storage);
    console.log(result);
    return;
};

if(process.argv.length < 3) {
  console.warn("Please specify zip code (Postleitzahl) as argument");
} else {
  app(process.argv[2]);
}
