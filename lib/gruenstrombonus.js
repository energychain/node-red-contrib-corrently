module.exports = async function GSB(config,cache) {
    const axios = require("axios");

    if((cache.get("stromkonto") === null)||(typeof cache.get("stromkonto") === 'undefined')||(cache.get("stromkonto") !== config.stromkonto)) {
        await cache.set("balance");
        await cache.set("stromkonto",config.stromkonto);
    }

    let balance = await cache.get("balance");
    if((typeof await cache.get("balance") === "undefined")||(typeof await cache.get("balance_updated") === "undefined")||(await cache.get("balance_updated") < new Date().getTime()-3600000)) {
      balance = await axios.get("https://api.corrently.io/core/stromkonto?account="+config.stromkonto);
      balance = balance.data;

      await cache.set("balance",balance);
      await cache.set("balance_updated",new Date().getTime());
    } else {
      balance = await cache.get("balance");
    }

    return balance.result;
};
