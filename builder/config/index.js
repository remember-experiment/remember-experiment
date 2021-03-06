const package = require('../../package.json');

module.exports = function () {
  const buildEnv = require('./buildEnv')();
  const paths = require('./paths')();
  const params = require('./params')(buildEnv);
  const client = require('./client')(paths, params);
  const server = require('./server')(paths);
  const computed = require('./computed')(params);

  return {
    paths,
    params,
    client,
    server,
    package,
    computed
  };
}
