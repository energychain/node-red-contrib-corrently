module.exports = function(RED) {
    const lib = require("./lib/gsi.js");

    function GSINode(config) {
        RED.nodes.createNode(this,config);

        var node = this;
        node.on('input', async function(msg) {
          let additionalIncome = 0;
          if((typeof msg.payload === "string") && (msg.payload.length === 5)) {
            config.plz = msg.payload;
          }

          msg.payload = await lib(config,node.context());
          node.send(msg);
        });
    }

    RED.nodes.registerType("GruenstromIndex",GSINode);
};
