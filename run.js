module.exports = () => {
    return {
        Strompreis: async function(sko) {
          const storage = require('node-persist');

          await storage.init({dir: './.node-persist/'+sko});

          let config = {
            stromkonto: sko,
            additionalIncome: 0
          };
          const lib = require("./lib/strompreis.js");
          let result = await lib(config,storage);
          return result;
        },
        GruenstromIndex: async function(plz) {
          const storage = require('node-persist');

          await storage.init({dir: './.node-persist/'+plz});

          let config = {
            plz: plz
          };
          const lib = require("./lib/gsi.js");
          let result = await lib(config,storage);
          return result;
        }
   };
};
