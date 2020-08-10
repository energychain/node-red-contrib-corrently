module.exports = function(RED) {
    const lib = require("./lib/strompreis.js");

    function StrompreisNode(config) {
        RED.nodes.createNode(this,config);

        var node = this;
        node.on('input', async function(msg) {
          msg.payload = await lib(config,node.context());
          node.send(msg);
        });
    }

    RED.nodes.registerType("Strompreis",StrompreisNode);
}
