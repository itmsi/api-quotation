/**
 * Migration: Add images and image_count columns to componen_products table
 * Menambahkan kolom images (text/json untuk array of string) dan image_count (integer) ke tabel componen_products
 */

exports.up = async function (knex) {
  const tableExists = await knex.schema.hasTable('componen_products');
  if (!tableExists) {
    return;
  }

  const hasImages = await knex.schema.hasColumn('componen_products', 'images');
  const hasImageCount = await knex.schema.hasColumn('componen_products', 'image_count');

  return knex.schema.alterTable('componen_products', (table) => {
    // Tambah images jika belum ada (text untuk menyimpan JSON array of string)
    if (!hasImages) {
      table.text('images').nullable();
    }

    // Tambah image_count jika belum ada (integer untuk jumlah images)
    if (!hasImageCount) {
      table.integer('image_count').nullable().defaultTo(0);
    }
  });
};

exports.down = async function (knex) {
  const tableExists = await knex.schema.hasTable('componen_products');
  if (!tableExists) {
    return;
  }

  const hasImages = await knex.schema.hasColumn('componen_products', 'images');
  const hasImageCount = await knex.schema.hasColumn('componen_products', 'image_count');

  return knex.schema.alterTable('componen_products', (table) => {
    // Drop image_count jika ada
    if (hasImageCount) {
      table.dropColumn('image_count');
    }

    // Drop images jika ada
    if (hasImages) {
      table.dropColumn('images');
    }
  });
};

