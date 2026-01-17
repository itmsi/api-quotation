/**
 * Migration: Add specification_properties to componen_products table
 */

exports.up = function (knex) {
    return knex.schema.table('componen_products', function (table) {
        table.jsonb('specification_properties').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('componen_products', function (table) {
        table.dropColumn('specification_properties');
    });
};
