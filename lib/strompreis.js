module.exports = async function Strompreis(config,cache) {
    const axios = require("axios");
    if((cache.get("stromkonto") === null)||(typeof cache.get("stromkonto") === 'undefined')||(cache.get("stromkonto") !== config.stromkonto)) {
        cache.set("commissioning");
        cache.set("consumptionAccount");
        cache.set("shares");
        cache.set("dailyconsumption");
        cache.set("ap");
        cache.set("stromkonto",config.stromkonto);
    }
    let commissioning = cache.get("commissioning");
    if((commissioning === null)||(typeof cache.get("commissioning") === 'undefined')) {
      commissioning = await axios.get("https://api.corrently.io/core/commissioning?account="+config.stromkonto);
      commissioning = commissioning.data;
      cache.set("commissioning",commissioning);
    }

    let consumptionAccount = cache.get("consumptionAccount");
    let depotAccount = cache.get("depotAccount");
    let location = cache.get("location");
    if((consumptionAccount === null)||(typeof cache.get("consumptionAccount") === 'undefined')) {
      for(let i=0;i<commissioning.length;i++) {
        if(commissioning[i].product=='0x59E45255CC3F33e912A0f2D7Cc36Faf4B09e7e22') {
          consumptionAccount = commissioning[i].quitance;
          location =  commissioning[i].location;
          cache.set("consumptionAccount",consumptionAccount);
          cache.set("location", location);
        }
        if(commissioning[i].product=='0x8dd8eddF4f8133f468867c551C17ad7324B411C6') {
          depotAccount = commissioning[i].quitance;
          cache.set("depotAccount",depotAccount);
        }
      }
    }

    // Retrieve Number of Shares (kWh per year)
    let shares = 0;
    if((typeof cache.get("shares") === "undefined")||(typeof cache.get("shares_updated") === "undefined")||(cache.get("shares_updated") < new Date().getTime()-3600000)) {
      let depot = await axios.get("https://api.corrently.io/core/depot?account="+depotAccount);
      depot = depot.data;

      for(let i=0; i<depot.assets.length;i++) {
        shares += depot.assets[i].shares;
      }
      cache.set("shares",shares);
      cache.set("shares_updated",new Date().getTime());
    } else {
      shares = cache.get("shares");
    }

    // Retrieve Consumption information
    let dailyconsumption = 0;
    if((typeof cache.get("dailyconsumption") === "undefined")||(typeof cache.get("dailyconsumption_updated") === "undefined")||(cache.get("dailyconsumption_updated") < new Date().getTime()-900000)) {
      let reading = await axios.get("https://api.corrently.io/core/reading?&history=3600000&account="+consumptionAccount);
      reading = reading.data;

      let dstart = reading.history[0].timeStamp;
      let dend = reading.history[reading.history.length-1].timeStamp;

      let rstart = reading.history[0]["1.8.0"];
      let rend = reading.history[reading.history.length-1]["1.8.0"];

      dailyconsumption = Math.round( (rend-rstart) / ((dend-dstart)/86400000) );
      cache.set("dailyconsumption",dailyconsumption);
      cache.set("dailyconsumption_updated",new Date().getTime());
    } else {
      dailyconsumption = cache.get("dailyconsumption");
    }

    // Retrieve TarifInformation
    let ap = 0;
    if((typeof cache.get("ap") === "undefined")||(typeof cache.get("ap_updated") === "undefined")||(cache.get("ap_updated") < new Date().getTime()-86400000)) {
        let tarif = await axios.get("https://api.corrently.io/core/tarif?&zip="+location);
        tarif = tarif.data;
        ap = tarif[0].ap/100;
        cache.set("ap",ap);
        cache.set("ap_updated",new Date().getTime());
    } else {
      ap = cache.get("ap");
    }

    // Do Calculation
    let dailygeneration = shares/365;
    let price_per_day = (dailyconsumption * ap) - (dailygeneration * ap);
    let price_per_kwh = price_per_day / dailyconsumption;
    return {
      pricePerKWH: price_per_kwh,
      savingPerKWH: ap - price_per_kwh,
      savingPercentage: 100-((price_per_kwh / ap)*100),
      costPerDay: price_per_day/1000,
      dailyKWH:dailyconsumption/1000
    }
  }
