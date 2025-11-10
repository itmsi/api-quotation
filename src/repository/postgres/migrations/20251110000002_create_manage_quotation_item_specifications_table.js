/**
 * Migration: Create manage_quotation_item_specifications table
 */

exports.up = function(knex) {
  return knex.schema.createTable('manage_quotation_item_specifications', (table) => {
    table
      .uuid('manage_quotation_item_specification_id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('manage_quotation_id').notNullable();
    table.uuid('componen_product_id').nullable();
    table.string('manage_quotation_item_specification_label', 255).nullable();
    table.string('manage_quotation_item_specification_value', 255).nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
    table.boolean('is_delete').defaultTo(false);

    table
      .foreign('manage_quotation_id')
      .references('manage_quotation_id')
      .inTable('manage_quotations')
      .onDelete('CASCADE');

    table
      .foreign('componen_product_id')
      .references('componen_product_id')
      .inTable('componen_products')
      .onDelete('SET NULL');

    table.index(['manage_quotation_id'], 'idx_mq_item_spec_manage_quotation_id');
    table.index(['componen_product_id'], 'idx_mq_item_spec_componen_product_id');
    table.index(['deleted_at'], 'idx_mq_item_spec_deleted_at');
    table.index(['is_delete'], 'idx_mq_item_spec_is_delete');
    table.index(['created_at'], 'idx_mq_item_spec_created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('manage_quotation_item_specifications');
};


