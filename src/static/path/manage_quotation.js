/**
 * Swagger API Path Definitions for Manage Quotation Module
 */

const manageQuotationPaths = {
  '/manage-quotation/get': {
    post: {
      tags: ['Manage Quotation'],
      summary: 'Get all manage quotations',
      description: 'Retrieve all manage quotations with pagination, search, and sorting',
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ManageQuotationFilterInput' },
            examples: {
              getAllStatuses: {
                summary: 'Get all quotations (all statuses)',
                description: 'Get all quotations without filtering by status',
                value: {
                  page: 1,
                  limit: 10,
                  search: '',
                  sort_by: 'created_at',
                  sort_order: 'desc',
                  status: ''
                }
              },
              getDraftOnly: {
                summary: 'Get draft quotations only',
                description: 'Filter quotations with status draft',
                value: {
                  page: 1,
                  limit: 10,
                  search: '',
                  sort_by: 'created_at',
                  sort_order: 'desc',
                  status: 'draft'
                }
              },
              getSubmitOnly: {
                summary: 'Get submit quotations only',
                description: 'Filter quotations with status submit',
                value: {
                  page: 1,
                  limit: 10,
                  search: '',
                  sort_by: 'created_at',
                  sort_order: 'desc',
                  status: 'submit'
                }
              },
              getRejectOnly: {
                summary: 'Get reject quotations only',
                description: 'Filter quotations with status reject',
                value: {
                  page: 1,
                  limit: 10,
                  search: '',
                  sort_by: 'created_at',
                  sort_order: 'desc',
                  status: 'reject'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ManageQuotation' }
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/manage-quotation/pdf/{id}': {
    get: {
      tags: ['Manage Quotation'],
      summary: 'Get manage quotation by ID for PDF',
      description: 'Retrieve a single manage quotation by ID for PDF generation',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Manage Quotation UUID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ManageQuotation' }
                }
              }
            }
          }
        },
        404: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/manage-quotation/{id}': {
    get: {
      tags: ['Manage Quotation'],
      summary: 'Get manage quotation by ID',
      description: 'Retrieve a single manage quotation by ID',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Manage Quotation UUID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ManageQuotation' }
                }
              }
            }
          }
        },
        404: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },
    put: {
      tags: ['Manage Quotation'],
      summary: 'Update manage quotation by ID',
      description: 'Update an existing manage quotation',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Manage Quotation UUID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ManageQuotationInput' },
            example: {
              customer_id: '7dbe5e70-87c4-4761-82de-9d9f54eea45f',
              employee_id: '3659340c-46b0-43f5-bf5c-d1d0222eb7f9',
              manage_quotation_date: '2025-01-15',
              manage_quotation_valid_date: '2025-01-30',
              manage_quotation_grand_total: '1200000',
              manage_quotation_ppn: '132000',
              manage_quotation_delivery_fee: '60000',
              manage_quotation_other: '30000',
              manage_quotation_payment_presentase: '40',
              manage_quotation_payment_nominal: '480000',
              manage_quotation_description: 'Updated notes about the quotation',
              manage_quotation_shipping_term: '',
              manage_quotation_franco: '',
              manage_quotation_lead_time: '',
              bank_account_name: 'John Doe',
              bank_account_number: '1234567890',
              bank_account_bank_name: 'Bank Mandiri',
              term_content_id: '123e4567-e89b-12d3-a456-426614174000',
              term_content_directory: '<p>halo ini test</p>',
              status: 'draft',
              include_aftersales_page: false,
              include_msf_page: true,
              manage_quotation_items: [
                {
                  componen_product_id: '123e4567-e89b-12d3-a456-426614174004',
                  code_unique: 'CU-002',
                  segment: 'Segment A',
                  msi_model: 'MSI Model 2',
                  wheel_no: 'Wheel-02',
                  engine: 'Engine 2',
                  volume: '2500',
                  horse_power: '150',
                  market_price: '180000',
                  componen_product_name: 'Excavator Arm Deluxe',
                  quantity: 2,
                  price: '150000',
                  total: '300000',
                  description: 'Updated notes about the item',
                  order_number: 1,
                  manage_quotation_item_accessories: [
                    {
                      accessory_id: '123e4567-e89b-12d3-a456-426614174004',
                      quantity: 1,
                      description: 'Updated notes about the accessory',
                      accessory_part_number: 'ACC-001',
                      accessory_part_name: 'Brake Pad Deluxe',
                      accessory_specification: 'Ceramic Brake Pad',
                      accessory_brand: 'Brand X',
                      accessory_remark: 'High quality',
                      accessory_region: 'Asia',
                      accessory_description: 'Accessory description for quotation'
                    }
                  ],
                  manage_quotation_item_specifications: [
                    {
                      manage_quotation_item_specification_label: 'model',
                      manage_quotation_item_specification_value: 'SX32434534534'
                    }
                  ]
                },
                {
                  componen_product_id: '123e4567-e89b-12d3-a456-426614174005',
                  code_unique: 'CU-003',
                  segment: 'Segment B',
                  msi_model: 'MSI Model 3',
                  wheel_no: 'Wheel-03',
                  engine: 'Engine 3',
                  volume: '3000',
                  horse_power: '200',
                  market_price: '220000',
                  componen_product_name: 'Excavator Bucket',
                  quantity: 1,
                  price: '200000',
                  total: '200000',
                  description: 'Second item in quotation',
                  order_number: 2,
                  manage_quotation_item_accessories: [],
                  manage_quotation_item_specifications: []
                }
              ]
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ManageQuotation' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Manage Quotation'],
      summary: 'Delete manage quotation by ID',
      description: 'Soft delete a manage quotation',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Manage Quotation UUID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Data berhasil dihapus' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/manage-quotation': {
    post: {
      tags: ['Manage Quotation'],
      summary: 'Create new manage quotation',
      description: 'Create a new manage quotation with items',
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ManageQuotationInput' },
            example: {
              customer_id: '7dbe5e70-87c4-4761-82de-9d9f54eea45f',
              employee_id: '3659340c-46b0-43f5-bf5c-d1d0222eb7f9',
              manage_quotation_date: '2025-01-15',
              manage_quotation_valid_date: '2025-01-30',
              manage_quotation_grand_total: '1000000',
              manage_quotation_ppn: '110000',
              manage_quotation_delivery_fee: '50000',
              manage_quotation_other: '20000',
              manage_quotation_payment_presentase: '50',
              manage_quotation_payment_nominal: '500000',
              manage_quotation_description: 'Additional notes about the quotation',
              manage_quotation_shipping_term: '',
              manage_quotation_franco: '',
              manage_quotation_lead_time: '',
              bank_account_name: 'John Doe',
              bank_account_number: '1234567890',
              bank_account_bank_name: 'Bank Mandiri',
              term_content_id: '123e4567-e89b-12d3-a456-426614174000',
              term_content_directory: '<p>halo ini test</p>',
              status: 'submit',
              include_aftersales_page: true,
              include_msf_page: false,
              manage_quotation_items: [
                {
                  componen_product_id: '123e4567-e89b-12d3-a456-426614174004',
                  code_unique: 'CU-001',
                  segment: 'Segment 1',
                  msi_model: 'MSI Model 1',
                  wheel_no: 'Wheel-01',
                  engine: 'Engine 1',
                  volume: '2000',
                  horse_power: '100',
                  market_price: '95000',
                  componen_product_name: 'Excavator Arm',
                  quantity: 1,
                  price: '100000',
                  total: '100000',
                  description: 'Additional notes about the item',
                  order_number: 1,
                  manage_quotation_item_accessories: [
                    {
                      accessory_id: '123e4567-e89b-12d3-a456-426614174004',
                      quantity: 1,
                      description: 'Additional notes about the item',
                      accessory_part_number: '',
                      accessory_part_name: '',
                      accessory_specification: '',
                      accessory_brand: '',
                      accessory_remark: '',
                      accessory_region: '',
                      accessory_description: ''
                    }
                  ],
                  manage_quotation_item_specifications: [
                    {
                      manage_quotation_item_specification_label: 'model',
                      manage_quotation_item_specification_value: 'SX32434534534'
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ManageQuotation' },
                  message: { type: 'string', example: 'Data berhasil dibuat' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  },
  '/manage-quotation/{id}/restore': {
    post: {
      tags: ['Manage Quotation'],
      summary: 'Restore manage quotation by ID',
      description: 'Restore a soft deleted manage quotation',
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Manage Quotation UUID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/ManageQuotation' },
                  message: { type: 'string', example: 'Data berhasil direstore' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        404: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    }
  }
};

module.exports = manageQuotationPaths;

