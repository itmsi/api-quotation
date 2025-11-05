/**
 * Swagger Schema Definitions for Manage Quotation Module
 */

const manageQuotationSchemas = {
  ManageQuotation: {
    type: 'object',
    properties: {
      manage_quotation_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      manage_quotation_no: {
        type: 'string',
        nullable: true,
        description: 'Quotation number',
        example: 'QUO-2025-001'
      },
      customer_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Customer ID',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      employee_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Employee ID',
        example: '123e4567-e89b-12d3-a456-426614174002'
      },
      manage_quotation_date: {
        type: 'string',
        format: 'date',
        nullable: true,
        description: 'Quotation date',
        example: '2025-01-15'
      },
      manage_quotation_valid_date: {
        type: 'string',
        format: 'date',
        nullable: true,
        description: 'Valid until date',
        example: '2025-01-30'
      },
      manage_quotation_grand_total: {
        type: 'string',
        nullable: true,
        description: 'Grand total amount',
        example: '1000000'
      },
      manage_quotation_ppn: {
        type: 'string',
        nullable: true,
        description: 'PPN amount',
        example: '110000'
      },
      manage_quotation_delivery_fee: {
        type: 'string',
        nullable: true,
        description: 'Delivery fee',
        example: '50000'
      },
      manage_quotation_other: {
        type: 'string',
        nullable: true,
        description: 'Other expenses',
        example: '20000'
      },
      manage_quotation_payment_presentase: {
        type: 'string',
        nullable: true,
        description: 'Payment percentage',
        example: '50'
      },
      manage_quotation_payment_nominal: {
        type: 'string',
        nullable: true,
        description: 'Payment nominal amount',
        example: '500000'
      },
      manage_quotation_description: {
        type: 'string',
        nullable: true,
        description: 'Description',
        example: 'Additional notes about the quotation'
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who created the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who updated the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who deleted the record',
        example: null
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp (null if not deleted)',
        example: null
      },
      is_delete: {
        type: 'boolean',
        description: 'Soft delete flag',
        example: false
      }
    }
  },
  ManageQuotationInput: {
    type: 'object',
    properties: {
      manage_quotation_no: {
        type: 'string',
        maxLength: 100,
        description: 'Quotation number',
        example: 'QUO-2025-001'
      },
      customer_id: {
        type: 'string',
        format: 'uuid',
        description: 'Customer ID',
        example: '7dbe5e70-87c4-4761-82de-9d9f54eea45f'
      },
      employee_id: {
        type: 'string',
        format: 'uuid',
        description: 'Employee ID',
        example: '3659340c-46b0-43f5-bf5c-d1d0222eb7f9'
      },
      manage_quotation_date: {
        type: 'string',
        format: 'date',
        description: 'Quotation date',
        example: '2025-01-15'
      },
      manage_quotation_valid_date: {
        type: 'string',
        format: 'date',
        description: 'Valid until date',
        example: '2025-01-30'
      },
      manage_quotation_grand_total: {
        type: 'string',
        maxLength: 100,
        description: 'Grand total amount',
        example: '1000000'
      },
      manage_quotation_ppn: {
        type: 'string',
        maxLength: 100,
        description: 'PPN amount',
        example: '110000'
      },
      manage_quotation_delivery_fee: {
        type: 'string',
        maxLength: 100,
        description: 'Delivery fee',
        example: '50000'
      },
      manage_quotation_other: {
        type: 'string',
        maxLength: 100,
        description: 'Other expenses',
        example: '20000'
      },
      manage_quotation_payment_presentase: {
        type: 'string',
        maxLength: 100,
        description: 'Payment percentage',
        example: '50'
      },
      manage_quotation_payment_nominal: {
        type: 'string',
        maxLength: 100,
        description: 'Payment nominal amount',
        example: '500000'
      },
      manage_quotation_description: {
        type: 'string',
        description: 'Description',
        example: 'Additional notes about the quotation'
      },
      manage_quotation_items: {
        type: 'array',
        description: 'Array of quotation items',
        items: { $ref: '#/components/schemas/ManageQuotationItemInput' }
      }
    }
  },
  ManageQuotationItem: {
    type: 'object',
    properties: {
      manage_quotation_item_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for quotation item',
        example: '123e4567-e89b-12d3-a456-426614174003'
      },
      manage_quotation_id: {
        type: 'string',
        format: 'uuid',
        description: 'Parent quotation ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      item_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Item product ID reference',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      unit_code: {
        type: 'string',
        nullable: true,
        description: 'Unit code',
        example: '1234567890'
      },
      unit_model: {
        type: 'string',
        nullable: true,
        description: 'Unit model',
        example: 'Model 1'
      },
      segment: {
        type: 'string',
        nullable: true,
        description: 'Segment',
        example: 'Segment 1'
      },
      msi_model: {
        type: 'string',
        nullable: true,
        description: 'MSI model',
        example: 'MSI Model 1'
      },
      wheel_no: {
        type: 'string',
        nullable: true,
        description: 'Wheel number',
        example: 'Wheel No 1'
      },
      engine: {
        type: 'string',
        nullable: true,
        description: 'Engine',
        example: 'Engine 1'
      },
      horse_power: {
        type: 'string',
        nullable: true,
        description: 'Horse power',
        example: '100'
      },
      quantity: {
        type: 'integer',
        description: 'Quantity',
        example: 1
      },
      price: {
        type: 'string',
        description: 'Price',
        example: '100000'
      },
      total: {
        type: 'string',
        description: 'Total amount',
        example: '100000'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Item description',
        example: 'Additional notes about the item'
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who created the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who updated the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who deleted the record',
        example: null
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp (null if not deleted)',
        example: null
      },
      is_delete: {
        type: 'boolean',
        description: 'Soft delete flag',
        example: false
      }
    }
  },
  ManageQuotationItemInput: {
    type: 'object',
    properties: {
      item_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Item product ID reference',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      unit_code: {
        type: 'string',
        maxLength: 100,
        nullable: true,
        description: 'Unit code',
        example: '1234567890'
      },
      unit_model: {
        type: 'string',
        maxLength: 100,
        nullable: true,
        description: 'Unit model',
        example: 'Model 1'
      },
      segment: {
        type: 'string',
        maxLength: 100,
        nullable: true,
        description: 'Segment',
        example: 'Segment 1'
      },
      msi_model: {
        type: 'string',
        nullable: true,
        description: 'MSI model',
        example: 'MSI Model 1'
      },
      wheel_no: {
        type: 'string',
        maxLength: 100,
        nullable: true,
        description: 'Wheel number',
        example: 'Wheel No 1'
      },
      engine: {
        type: 'string',
        maxLength: 100,
        nullable: true,
        description: 'Engine',
        example: 'Engine 1'
      },
      horse_power: {
        type: 'string',
        maxLength: 100,
        nullable: true,
        description: 'Horse power',
        example: '100'
      },
      quantity: {
        type: 'integer',
        description: 'Quantity',
        example: 1
      },
      price: {
        type: 'string',
        description: 'Price',
        example: '100000'
      },
      total: {
        type: 'string',
        description: 'Total amount',
        example: '100000'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Item description',
        example: 'Additional notes about the item'
      }
    }
  },
  ManageQuotationFilterInput: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        description: 'Page number',
        example: 1,
        default: 1
      },
      limit: {
        type: 'integer',
        description: 'Items per page',
        example: 10,
        default: 10
      },
      search: {
        type: 'string',
        description: 'Search term for quotation number, customer_id, or employee_id',
        example: 'QUO'
      },
      sort_by: {
        type: 'string',
        enum: ['created_at', 'manage_quotation_no', 'manage_quotation_date', 'manage_quotation_valid_date'],
        description: 'Column to sort by',
        example: 'created_at',
        default: 'created_at'
      },
      sort_order: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort order',
        example: 'desc',
        default: 'desc'
      }
    }
  },
  Pagination: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        description: 'Current page number',
        example: 1
      },
      limit: {
        type: 'integer',
        description: 'Items per page',
        example: 10
      },
      total: {
        type: 'integer',
        description: 'Total number of items',
        example: 100
      },
      totalPages: {
        type: 'integer',
        description: 'Total number of pages',
        example: 10
      }
    }
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: false
      },
      error: {
        type: 'string',
        description: 'Error message',
        example: 'Data tidak ditemukan'
      },
      details: {
        type: 'object',
        description: 'Additional error details',
        nullable: true
      }
    }
  }
};

module.exports = manageQuotationSchemas;

