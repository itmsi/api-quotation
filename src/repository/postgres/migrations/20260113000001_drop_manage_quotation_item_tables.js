/**
 * Migration: Drop manage_quotation_item_accessories and manage_quotation_item_specifications tables
 * 
 * Kedua tabel ini dihapus karena sudah digantikan dengan kolom JSONB di tabel manage_quotation_items:
 * - specification_properties (JSONB) - menggantikan manage_quotation_item_specifications
 * - accesories_properties (JSONB) - menggantikan manage_quotation_item_accessories
 * 
 * Migration ini akan menghapus:
 * - Tabel manage_quotation_item_accessories
 * - Tabel manage_quotation_item_specifications
 * - Foreign key constraints ke manage_quotations, accessories, dan componen_products
 * - Index yang terkait
 */

exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('manage_quotation_item_specifications')
    .then(() => {
      return knex.schema.dropTableIfExists('manage_quotation_item_accessories');
    });
};

exports.down = function (knex) {
  return knex.schema
    .createTable('manage_quotation_item_accessories', (table) => {
      // Primary Key with UUID
      table.uuid('manage_quotation_item_accessory_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      
      // Foreign Key
      table.uuid('manage_quotation_id').notNullable();
      
      // Foreign Key to accessories
      table.uuid('accessory_id').nullable();
      
      // Foreign Key to componen_products
      table.uuid('componen_product_id').nullable();
      
      // Data fields
      table.integer('quantity').notNullable();
      table.text('description').nullable();
      
      // Additional fields
      table.string('accessory_part_number', 255).nullable();
      table.string('accessory_part_name', 255).nullable();
      table.string('accessory_specification', 255).nullable();
      table.string('accessory_brand', 255).nullable();
      table.string('accessory_remark', 255).nullable();
      table.string('accessory_region', 255).nullable();
      table.string('accessory_description', 255).nullable();
      
      // Audit fields
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.uuid('created_by').nullable();
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.uuid('updated_by').nullable();
      table.timestamp('deleted_at').nullable();
      table.uuid('deleted_by').nullable();
      table.boolean('is_delete').defaultTo(false);
      
      // Foreign key constraints
      table.foreign('manage_quotation_id')
        .references('manage_quotation_id')
        .inTable('manage_quotations')
        .onDelete('CASCADE');
      
      table.foreign('accessory_id')
        .references('accessory_id')
        .inTable('accessories')
        .onDelete('SET NULL');

      table.foreign('componen_product_id')
        .references('componen_product_id')
        .inTable('componen_products')
        .onDelete('SET NULL');
      
      // Indexes for better query performance
      table.index(['manage_quotation_id'], 'idx_manage_quotation_item_accessories_quotation_id');
      table.index(['accessory_id'], 'idx_manage_quotation_item_accessories_accessory_id');
      table.index(['componen_product_id'], 'idx_mq_item_accessories_componen_product_id');
      table.index(['deleted_at'], 'idx_manage_quotation_item_accessories_deleted_at');
      table.index(['is_delete'], 'idx_manage_quotation_item_accessories_is_delete');
      table.index(['created_at'], 'idx_manage_quotation_item_accessories_created_at');
    })
    .then(() => {
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
    });
};

