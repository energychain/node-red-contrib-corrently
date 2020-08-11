module.exports = function(RED) {
    const lib = require("./lib/strompreis.js");

    function StrompreisNode(config) {
        RED.nodes.createNode(this,config);

        var node = this;
        node.on('input', async function(msg) {
          let additionalIncome = 0;
          if(!isNaN(msg.payload)) {
            additionalIncome = msg.payload;
          }
          if(typeof msg.payload == 'object') {
            if(typeof msg.payload.additionalIncome !== 'undefined') {
              additionalIncome = msg.payload.additionalIncome;
            }
            if(typeof msg.payload.stromkonto !== 'undefined') {
              config.stromkonto = msg.payload.stromkonto;
            }
            if(typeof msg.payload.sko !== 'undefined') {
              config.stromkonto = msg.payload.sko;
            }
          }
          if(additionalIncome>1000000) additionalIncome = 0;
          config.additionalIncome = additionalIncome;

          msg.payload = await lib(config,node.context());
          node.send(msg);
        });
    }

    RED.nodes.registerType("Strompreis",StrompreisNode);
};
