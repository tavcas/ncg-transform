// @ts-ignore
const Migrations = require('migrations');
  // @ts-ignore
const MetaFile = require('migrations/lib/meta/file');
const shopify = require('app/shopify.server');

function ShopifyMetafield({ namespace, key}) {
    this.opts = opts;
    this.get = () => {};
    this.set = () => {};
};


module.exports = new Migrations({
  // @ts-ignore
  dir: __dirname + '/migrations', // directory with migration files
  // @ts-ignore
  meta: new MetaFile({path: __dirname + '/migrations.json'}), // meta information storage
  // @ts-ignore
  template: '', // template used by `--create` flag to generate a new migration file
});

module.exports.run();