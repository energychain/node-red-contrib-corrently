const helper = require("node-red-node-test-helper");
const strompreisNode = require("../GSI.js");

describe('GruenstromIndex Node', function () {
    afterEach(function () {
      helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "GruenstromIndex", name: "test name" }];
        helper.load(strompreisNode, flow, function () {
          var n1 = helper.getNode("n1");
          n1.should.have.property('name', 'test name');
          done();
        });
    });

    it('should retrieve GruenstromIndex for 69256 Mauer', function (done) {
      this.timeout(25000);
      var flow = [
        { id: "n1", type: "GruenstromIndex", name: "GruenstromIndex",wires:[["n2"]] },
        { id: "n2", type: "helper" }
      ];
      helper.load(strompreisNode, flow, function () {
        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");
        n2.on("input", function (msg) {
          msg.should.have.property('payload');
          done();
        });
        n1.receive({ payload: '69256' });
      });
  });

});
