const express = require('express')
// const { verifyToken } = require('../../middlewares')

const routing = express();
const API_TAG = '/api/quotation';

/* RULE
naming convention endpoint: using plural
Example:
- GET /api/quotation/examples
- POST /api/quotation/examples
- GET /api/quotation/examples/:id
- PUT /api/quotation/examples/:id
- DELETE /api/quotation/examples/:id
*/

// Example Module (Template untuk module Anda)
// const exampleModule = require('../../modules/example')
// routing.use(`${API_TAG}/examples`, exampleModule)

// Cutomer Module
const cutomerModule = require('../../modules/cutomer')
routing.use(`${API_TAG}/customer`, cutomerModule)

// Sales Module
const salesModule = require('../../modules/sales')
routing.use(`${API_TAG}/sales`, salesModule)

// Bank Account Module
const bankAccountModule = require('../../modules/bank_account')
routing.use(`${API_TAG}/bank-account`, bankAccountModule)

// Manage Quotation Module
const manageQuotationModule = require('../../modules/manage_quotation')
routing.use(`${API_TAG}/manage-quotation`, manageQuotationModule)

// Term Content Module
const termContentModule = require('../../modules/term_content')
routing.use(`${API_TAG}/term_content`, termContentModule)

// Item Product Module
const itemProductModule = require('../../modules/itemProduct')
routing.use(`${API_TAG}/item_product`, itemProductModule)

// Tambahkan routes module Anda di sini
// Example:
// const yourModule = require('../../modules/yourModule')
// routing.use(`${API_TAG}/your-endpoint`, yourModule)

module.exports = routing;
