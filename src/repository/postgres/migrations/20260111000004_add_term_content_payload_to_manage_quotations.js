/**
 * Migration: Add term_content_payload to manage_quotations table
 */

exports.up = function (knex) {
    return knex.schema.table('manage_quotations', function (table) {
        table.text('term_content_payload').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('manage_quotations', function (table) {
        table.dropColumn('term_content_payload');
    });
};
