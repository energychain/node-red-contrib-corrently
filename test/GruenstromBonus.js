const helper = require("node-red-node-test-helper");
const GruenstromBonusNode = require("../GruenstromBonus.js");

describe('GruenstromBonus Node', function () {
    afterEach(function () {
      helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "GruenstromBonus", name: "test name" }];
        helper.load(GruenstromBonusNode, flow, function () {
          var n1 = helper.getNode("n1");
          n1.should.have.property('name', 'test name');
          done();
        });
    });

    it('should retrieve GruenstromBonus for sample account (fill Cache)', function (done) {
      this.timeout(19000);
      var flow = [
        { id: "n1", type: "GruenstromBonus", name: "GruenstromBonus",wires:[["n2"]] },
        { id: "n2", type: "helper" }
      ];
      helper.load(GruenstromBonusNode, flow, function () {
        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");
        n2.on("input", function (msg) {
          msg.should.have.property('payload');
          should.equal((msg.payload.soll > 0),true);
          done();
        });
        n1.receive({ payload: {stromkonto:'0x7866f187f30cd52Bdbd5c4184fD3ee6168Ae0dB4'} });
      });
  });

});
