/**
 * Seeder: componen_products data (from componen_products_202511111110.sql)
 */

const fs = require('fs')
const path = require('path')

exports.seed = async function seedComponenProducts(knex) {
  await knex.raw('TRUNCATE TABLE componen_products CASCADE')

  const sqlFileName = 'componen_products_202511111110.sql'
  const projectRoot = path.join(__dirname, '../../../..')
  const candidatePaths = [
    path.join(projectRoot, 'sql_product', sqlFileName),
    path.join(__dirname, '../../../../Downloads', sqlFileName),
    path.join(process.env.HOME || process.env.USERPROFILE || '', 'Downloads', sqlFileName),
    `/Users/falaqmsi/Downloads/${sqlFileName}`,
  ]

  const sqlFilePath = candidatePaths.find((possiblePath) => possiblePath && fs.existsSync(possiblePath))

  if (!sqlFilePath) {
    throw new Error(`File SQL ${sqlFileName} tidak ditemukan. Lokasi yang dicek: ${candidatePaths.join(', ')}`)
  }

  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
  const statements = sqlContent
    .split('INSERT INTO')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => `INSERT INTO ${part}`)

  /* eslint-disable no-restricted-syntax */
  for (const statement of statements) {
    try {
      /* eslint-disable no-await-in-loop */
      await knex.raw(statement)
      /* eslint-enable no-await-in-loop */
    } catch (error) {
      console.error('Gagal mengeksekusi statement:', error.message)
      throw error
    }
  }
  /* eslint-enable no-restricted-syntax */
}


