const helper = require("node-red-node-test-helper");
const strompreisNode = require("../Strompreis.js");

describe('Strompreis Node', function () {
    afterEach(function () {
      helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "Strompreis", name: "test name" }];
        helper.load(strompreisNode, flow, function () {
          var n1 = helper.getNode("n1");
          n1.should.have.property('name', 'test name');
          done();
        });
    });

    it('should retrieve strompreis for sample account (fill Cache)', function (done) {
      this.timeout(19000);
      var flow = [
        { id: "n1", type: "Strompreis", name: "Strompreis",wires:[["n2"]] },
        { id: "n2", type: "helper" }
      ];
      helper.load(strompreisNode, flow, function () {
        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");
        n2.on("input", function (msg) {
          msg.should.have.property('payload');
          done();
        });
        n1.receive({ payload: {stromkonto:'0x7866f187f30cd52Bdbd5c4184fD3ee6168Ae0dB4'} });
      });
  });
  it('should have valid entries', function (done) {
    this.timeout(19000);
    var flow = [
      { id: "n1", type: "Strompreis", name: "Strompreis",wires:[["n2"]] },
      { id: "n2", type: "helper" }
    ];
    helper.load(strompreisNode, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        msg.should.have.property('payload');
        msg.payload.should.have.property('dailyKWH');
        msg.payload.should.have.property('pricePerKWH');
        msg.payload.should.have.property('costPerDay');
        done();
      });
      n1.receive({ payload: {stromkonto:'0x7866f187f30cd52Bdbd5c4184fD3ee6168Ae0dB4'} });
    });
   });
    it('should have invalid entries and throw exception (null msg)', function (done) {
      this.timeout(19000);
      var flow = [
        { id: "n1", type: "Strompreis", name: "Strompreis",wires:[["n2"]] },
        { id: "n2", type: "helper" }
      ];
      helper.load(strompreisNode, flow, function () {
        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");
        n2.on("input", function (msg) {
          msg.should.have.property('payload');
          should.equal(msg.payload, null);
          done();
        });
        n1.receive({ payload: {stromkonto:'0x000000000000000000000000000'} });
      });
    });
    it('Test with additionalIncome', function (done) {
      this.timeout(19000);
      var flow = [
        { id: "n1", type: "Strompreis", name: "Strompreis",wires:[["n2"]] },
        { id: "n2", type: "helper" }
      ];
      helper.load(strompreisNode, flow, function () {
        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");
        let cost1 = 0;
        n2.on("input", function (msg) {
          msg.payload.should.have.property('costPerDay');
          if(cost1 === 0) {
            cost1 =   msg.payload.costPerDay;
            n1.receive({ payload: {stromkonto:'0x7866f187f30cd52Bdbd5c4184fD3ee6168Ae0dB4',additionalIncome:123.456} });
          } else {
            should.equal((cost1 > msg.payload.costPerDay),true);
            done();
          }
        });
        n1.receive({ payload: {stromkonto:'0x7866f187f30cd52Bdbd5c4184fD3ee6168Ae0dB4'} });
      });
     });
});
