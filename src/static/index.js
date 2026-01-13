const info = {
  description: 'Express.js API Boilerplate - Template untuk pengembangan REST API dengan fitur lengkap',
  version: '1.0.0',
  title: 'Express.js API Boilerplate Documentation',
  contact: {
    email: 'your-email@example.com'
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT'
  }
}

const servers = [
  {
    url: '/api/quotation/',
    description: 'Development server'
  },
  {
    url: 'https://gateway.motorsights.com/api/quotation/',
    description: 'Gateway server'
  }
]

// Import schemas
// Tambahkan schema module Anda di sini
// const exampleSchema = require('./schema/example');
const cutomerSchema = require('./schema/cutomer');
const salesSchema = require('./schema/sales');
const bankAccountSchema = require('./schema/bank_account');
const manageQuotationSchema = require('./schema/manage_quotation');
const termContentSchema = require('./schema/term_content');
// const itemProductSchema = require('./schema/item_product');
const componenProductSchema = require('./schema/componen_product');
// DISABLED: Module componen_product_specification sudah dinonaktifkan (tabel sudah dihapus)
// const componenProductSpecificationSchema = require('./schema/componen_product_specification');
const accessorySchema = require('./schema/accessory');

// Import paths
// Tambahkan path module Anda di sini
// const examplePaths = require('./path/example');
const cutomerPaths = require('./path/cutomer');
const salesPaths = require('./path/sales');
const bankAccountPaths = require('./path/bank_account');
const manageQuotationPaths = require('./path/manage_quotation');
const termContentPaths = require('./path/term_content');
// const itemProductPaths = require('./path/item_product');
const componenProductPaths = require('./path/componen_product');
// DISABLED: Module componen_product_specification sudah dinonaktifkan (tabel sudah dihapus)
// const componenProductSpecificationPaths = require('./path/componen_product_specification');
const accessoryPaths = require('./path/accessory');

// Combine all schemas
const schemas = {
  // ...exampleSchema,
  ...cutomerSchema,
  ...salesSchema,
  ...bankAccountSchema,
  ...manageQuotationSchema,
  ...termContentSchema,
  // ...itemProductSchema,
  ...componenProductSchema,
  // DISABLED: Module componen_product_specification sudah dinonaktifkan (tabel sudah dihapus)
  // ...componenProductSpecificationSchema,
  ...accessorySchema,
  // ...yourModuleSchema,
};

// Combine all paths
const paths = {
  // ...examplePaths,
  ...cutomerPaths,
  ...salesPaths,
  ...bankAccountPaths,
  ...manageQuotationPaths,
  ...termContentPaths,
  // ...itemProductPaths,
  ...componenProductPaths,
  // DISABLED: Module componen_product_specification sudah dinonaktifkan (tabel sudah dihapus)
  // ...componenProductSpecificationPaths,
  ...accessoryPaths,
  // ...yourModulePaths,
};

const index = {
  openapi: '3.0.0',
  info,
  servers,
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas
  }
}

module.exports = {
  index
}
