/**
 * Migration: Drop mst_product tables
 */

exports.up = function (knex) {
    return knex.schema
        .dropTableIfExists('mst_specification_values')
        .dropTableIfExists('mst_product_dimensi')
        .dropTableIfExists('mst_product_model')
        .dropTableIfExists('mst_feature_child_product')
        .dropTableIfExists('mst_feature_product')
        .dropTableIfExists('mst_360_product')
        .dropTableIfExists('mst_flayer_product')
        .dropTableIfExists('mst_gallery_product')
        .dropTableIfExists('mst_specification_labels')
        .dropTableIfExists('mst_product')
        .dropTableIfExists('mst_specifications')
        .dropTableIfExists('mst_type_product');
};

exports.down = function (knex) {
    // Recreating these tables is complex and requires the original schema definitions.
    // Ideally, one would reverse the drop, but for a mass deletion request, 
    // it's often accepted to leave down empty or throw an error.
    return Promise.resolve();
};
