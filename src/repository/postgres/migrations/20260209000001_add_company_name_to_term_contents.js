/**
 * Migration: Add company_name to term_contents table
 */

exports.up = function (knex) {
    return knex.schema.table('term_contents', function (table) {
        table.string('company_name', 255).nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('term_contents', function (table) {
        table.dropColumn('company_name');
    });
};
