/**
 * Migration: Create customers table
 * Note: This migration is tracked in the database but the actual implementation
 * may have been moved to use dblink from gate_sso
 */

exports.up = function(knex) {
  // This migration is intentionally empty as customers table
  // is managed via dblink from gate_sso database
  return Promise.resolve();
};

exports.down = function(knex) {
  // This migration is intentionally empty
  return Promise.resolve();
};

