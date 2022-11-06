module.exports = async function GSI(config,cache) {
    const axios = require("axios");
    let gsi = null;
    if((typeof await cache.get("gsi") === "undefined")||(typeof await cache.get("gsi_updated") === "undefined")||(await cache.get("gsi_updated") < new Date().getTime()-3600000)) {
      gsi = await axios.get("https://api.corrently.io/v2.0/gsi/prediction?src=node-red-contrib-corrently&v=1.0.1&zip="+config.plz);
      gsi = gsi.data;

      await cache.set("gsi",gsi);
      await cache.set("gsi_updated",new Date().getTime());
    } else {
      gsi = await cache.get("gsi");
    }
    return gsi;
  };
