/**
 * Add properties fields to manage_quotation_items table
 */
exports.up = async function (knex) {
    const hasSpec = await knex.schema.hasColumn('manage_quotation_items', 'specification_properties');
    const hasAcc = await knex.schema.hasColumn('manage_quotation_items', 'accesories_properties');

    return knex.schema.alterTable('manage_quotation_items', function (table) {
        if (!hasSpec) {
            table.jsonb('specification_properties').nullable().defaultTo('{}').comment('Properties for specifications snapshot');
        }
        if (!hasAcc) {
            table.jsonb('accesories_properties').nullable().defaultTo('{}').comment('Properties for accessories snapshot including joined data');
        }
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('manage_quotation_items', function (table) {
        table.dropColumn('specification_properties');
        table.dropColumn('accesories_properties');
    });
};
