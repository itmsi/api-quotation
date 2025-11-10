/**
 * Migration: Create componen_product_specifications table
 */

exports.up = function (knex) {
  return knex.schema.createTable('componen_product_specifications', (table) => {
    table
      .uuid('componen_product_specification_id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.uuid('componen_product_id').nullable();
    table.string('componen_product_specification_label', 255).nullable();
    table.string('componen_product_specification_value', 255).nullable();
    table.text('componen_product_specification_description').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
    table.boolean('is_delete').defaultTo(false);

    table
      .foreign('componen_product_id')
      .references('componen_product_id')
      .inTable('componen_products')
      .onDelete('SET NULL');

    table.index(['componen_product_id'], 'idx_componen_product_specifications_product_id');
    table.index(['created_at'], 'idx_componen_product_specifications_created_at');
    table.index(['is_delete'], 'idx_componen_product_specifications_is_delete');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('componen_product_specifications');
};


