module.exports = function(RED) {
    const lib = require("./lib/gruenstrombonus.js");

    function GruenstromBonusNode(config) {
        RED.nodes.createNode(this,config);

        var node = this;
        node.on('input', async function(msg) {
          if(typeof msg.payload === 'string') {
            config.stromkonto =msg.payload;
          }
          if(typeof msg.payload == 'object') {

            if(typeof msg.payload.stromkonto !== 'undefined') {
              config.stromkonto = msg.payload.stromkonto;
            }
            if(typeof msg.payload.sko !== 'undefined') {
              config.stromkonto = msg.payload.sko;
            }
          }
          msg.payload = await lib(config,node.context());
          node.send(msg);
        });
    }

    RED.nodes.registerType("GruenstromBonus",GruenstromBonusNode);
};
