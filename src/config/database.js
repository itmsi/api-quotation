const knex = require('knex')

const knexfile = require('../knexfile')

const env = process.env.NODE_ENV || 'development'
const configCore = knexfile[env]

const pgCore = knex(configCore)

// Export as function for old pattern (db as function)
const db = pgCore

// Export both patterns
module.exports = db
module.exports.pgCore = pgCore
