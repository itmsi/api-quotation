/**
 * Update manage_quotation numeric columns to decimal(25,5)
 */
exports.up = function (knex) {
    return knex.schema.alterTable('manage_quotations', function (table) {
        table.decimal('manage_quotation_grand_total', 25, 5).alter();
        table.decimal('manage_quotation_payment_nominal', 25, 5).alter();
        table.decimal('manage_quotation_grand_total_before', 25, 5).alter();
        table.decimal('manage_quotation_mutation_nominal', 25, 5).alter();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('manage_quotations', function (table) {
        table.decimal('manage_quotation_grand_total', 15, 2).alter();
        table.decimal('manage_quotation_payment_nominal', 15, 2).alter();
        table.decimal('manage_quotation_grand_total_before', 15, 2).alter();
        table.decimal('manage_quotation_mutation_nominal', 15, 2).alter();
    });
};
