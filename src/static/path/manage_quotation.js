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
            example: {
              page: 1,
              limit: 10,
              search: '',
              sort_by: 'created_at',
              sort_order: 'desc'
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
              manage_quotation_no: 'QUO-2025-002',
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
              manage_quotation_items: [
                {
                  item_product_id: '123e4567-e89b-12d3-a456-426614174004',
                  unit_code: '1234567890',
                  unit_model: 'Model 2',
                  segment: 'Segment 2',
                  msi_model: 'MSI Model 2',
                  wheel_no: 'Wheel No 2',
                  engine: 'Engine 2',
                  horse_power: '150',
                  quantity: 2,
                  price: '150000',
                  total: '300000',
                  description: 'Updated notes about the item'
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
              manage_quotation_no: 'QUO-2025-001',
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
              manage_quotation_items: [
                {
                  item_product_id: '123e4567-e89b-12d3-a456-426614174004',
                  unit_code: '1234567890',
                  unit_model: 'Model 1',
                  segment: 'Segment 1',
                  msi_model: 'MSI Model 1',
                  wheel_no: 'Wheel No 1',
                  engine: 'Engine 1',
                  horse_power: '100',
                  quantity: 1,
                  price: '100000',
                  total: '100000',
                  description: 'Additional notes about the item'
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

