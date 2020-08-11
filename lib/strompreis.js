module.exports = async function Strompreis(config,cache) {
    const axios = require("axios");
    if((cache.get("stromkonto") === null)||(typeof cache.get("stromkonto") === 'undefined')||(cache.get("stromkonto") !== config.stromkonto)) {
        await cache.set("commissioning");
        await cache.set("consumptionAccount");
        await cache.set("shares");
        await cache.set("dailyconsumption");
        await cache.set("ap");
        await cache.set("stromkonto",config.stromkonto);
    }
    let commissioning = await cache.get("commissioning");
    if((commissioning === null)||(typeof await cache.get("commissioning") === 'undefined')) {
      commissioning = await axios.get("https://api.corrently.io/core/commissioning?account="+config.stromkonto);
      commissioning = commissioning.data;
      await cache.set("commissioning",commissioning);
    }

    let consumptionAccount = await cache.get("consumptionAccount");
    let depotAccount = await cache.get("depotAccount");
    let location = await cache.get("location");
    let ja = await cache.get("ja");
    if((ja === null)||(typeof await cache.get("ja") === 'undefined')) {
      for(let i=0;i<commissioning.length;i++) {
        if(commissioning[i].product=='0x59E45255CC3F33e912A0f2D7Cc36Faf4B09e7e22') {
          consumptionAccount = commissioning[i].quitance;
          location =  commissioning[i].location;
          await cache.set("consumptionAccount",consumptionAccount);
          await cache.set("location", location);
        }
        if(commissioning[i].product=='0x8dd8eddF4f8133f468867c551C17ad7324B411C6') {
          ja =  commissioning[i].ja * 1;
          await cache.set("ja",ja);
          location =  commissioning[i].location;
          await cache.set("location", location);
          depotAccount = commissioning[i].quitance;
          await cache.set("depotAccount",depotAccount);
        }
      }
    }

    // Retrieve Number of Shares (kWh per year)
    let shares = 0;
    if((typeof await cache.get("shares") === "undefined")||(typeof await cache.get("shares_updated") === "undefined")||(await cache.get("shares_updated") < new Date().getTime()-3600000)) {
      let depot = await axios.get("https://api.corrently.io/core/depot?account="+depotAccount);
      depot = depot.data;

      for(let i=0; i<depot.assets.length;i++) {
        shares += depot.assets[i].shares;
      }
      await cache.set("shares",shares);
      await cache.set("shares_updated",new Date().getTime());
    } else {
      shares = await cache.get("shares");
    }

    // Retrieve Consumption information
    let dailyconsumption = 0;
    if((consumptionAccount !== null) && (typeof consumptionAccount !== 'undefined') && ( consumptionAccount.length > 24)) {
      if((typeof await cache.get("dailyconsumption") === "undefined")||(typeof await cache.get("dailyconsumption_updated") === "undefined")||(await cache.get("dailyconsumption_updated") < new Date().getTime()-900000)) {
        let reading = await axios.get("https://api.corrently.io/core/reading?&history=3600000&account="+consumptionAccount);
        reading = reading.data;
        if(typeof reading.history == 'undefined') return null;

        let dstart = reading.history[0].timeStamp;
        let dend = reading.history[reading.history.length-1].timeStamp;

        let rstart = reading.history[0]["1.8.0"];
        let rend = reading.history[reading.history.length-1]["1.8.0"];

        dailyconsumption = Math.round( (rend-rstart) / ((dend-dstart)/86400000) );
        await cache.set("dailyconsumption",dailyconsumption);
        await cache.set("dailyconsumption_updated",new Date().getTime());
      } else {
        dailyconsumption = await cache.get("dailyconsumption");
      }
    } else {
      dailyconsumption = (ja*1000) / 365;
    }
    // Retrieve TarifInformation
    let ap = 0;
    if((typeof await cache.get("ap") === "undefined")||(typeof await cache.get("ap_updated") === "undefined")||(cache.get("ap_updated") < new Date().getTime()-86400000)) {
        let tarif = await axios.get("https://api.corrently.io/core/tarif?&zip="+location);
        tarif = tarif.data;
        ap = tarif[0].ap/100;
        await cache.set("ap",ap);
        await cache.set("ap_updated",new Date().getTime());
    } else {
      ap = await cache.get("ap");
    }
    // Do Calculation
    let dailygeneration = shares/365;
    let price_per_day = (dailyconsumption * ap) - ((dailygeneration * ap) + (config.additionalIncome));
    let price_per_kwh = price_per_day / dailyconsumption;
    return {
      pricePerKWH: price_per_kwh,
      savingPerKWH: ap - price_per_kwh,
      savingPercentage: 100-((price_per_kwh / ap)*100),
      costPerDay: price_per_day/1000,
      dailyKWH:dailyconsumption/1000
    };
  };
