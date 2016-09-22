const Lab = require('lab');
const Code = require('code');

const server = require('../index');

const lab = exports.lab = Lab.script();

lab.experiment('pmp-manager', () => {

  lab.test('it should return 200 - GET /', (done) => {
    const options = {
      method: 'GET',
      url: '/'
    };

    server.inject(options, (response) => {
      Code.expect(response).to.be.an.object();
      Code.expect(response.statusCode).to.equal(200);
      done();
    });
  });
});
