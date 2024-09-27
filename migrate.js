// @ts-ignore
import Migrations from 'migrations';
  // @ts-ignore
import db from './app/db.server.js';
import sp from 'synchronized-promise';

console.log(sp(db.shopifyMigration.findMany, { timeouts: 1000000})())

function ShopifyMeta() {
    this.get = () => ({
      migrations: sp(db.shopifyMigration.findMany, { timeouts: 1000000})() ?? []
    })
    this.set = ({ migrations }) => {
      sp(db.shopifyMigration.deleteMany)()
      migrations.forEach(m => sp(db.shopifyMigration.create)(m));
    };
};

const migration = new Migrations({
  // @ts-ignore
  dir: './migrations', // directory with migration files
  // @ts-ignore
  meta: new ShopifyMeta(), // meta information storage
  // @ts-ignore
  template: '', // template used by `--create` flag to generate a new migration file
});

export default migration;

migration.run();