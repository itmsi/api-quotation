/**
 * Migration: Add term_content_payload to term_contents table
 */

exports.up = function (knex) {
    return knex.schema.table('term_contents', function (table) {
        table.text('term_content_payload').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.table('term_contents', function (table) {
        table.dropColumn('term_content_payload');
    });
};
