exports.up = function (knex) {
    return knex.raw('ALTER TABLE componen_products DROP CONSTRAINT IF EXISTS componen_type_check')
        .then(() => {
            return knex.raw(`
        ALTER TABLE componen_products 
        ADD CONSTRAINT componen_type_check 
        CHECK (componen_type IS NULL OR componen_type IN (1, 2, 3, 4, 5))
      `);
        });
};

exports.down = function (knex) {
    return knex.raw('ALTER TABLE componen_products DROP CONSTRAINT IF EXISTS componen_type_check')
        .then(() => {
            // Revert back to original constraint (1, 2, 3)
            return knex.raw(`
        ALTER TABLE componen_products 
        ADD CONSTRAINT componen_type_check 
        CHECK (componen_type IS NULL OR componen_type IN (1, 2, 3))
      `);
        });
};
