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
      manage_quotation_shipping_term: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Shipping term',
        example: ''
      },
      manage_quotation_franco: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Franco',
        example: ''
      },
      manage_quotation_lead_time: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Lead time',
        example: ''
      },
      status: {
        type: 'string',
        enum: ['draft', 'submit'],
        description: 'Quotation status',
        example: 'submit',
        default: 'submit'
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
      },
      manage_quotation_items: {
        type: 'array',
        description: 'Array of quotation items',
        items: { $ref: '#/components/schemas/ManageQuotationItem' }
      },
      manage_quotation_item_accessories: {
        type: 'array',
        description: 'Array of quotation item accessories',
        items: { $ref: '#/components/schemas/ManageQuotationItemAccessory' }
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
      manage_quotation_shipping_term: {
        type: 'string',
        maxLength: 255,
        nullable: true,
        description: 'Shipping term',
        example: ''
      },
      manage_quotation_franco: {
        type: 'string',
        maxLength: 255,
        nullable: true,
        description: 'Franco',
        example: ''
      },
      manage_quotation_lead_time: {
        type: 'string',
        maxLength: 255,
        nullable: true,
        description: 'Lead time',
        example: ''
      },
      status: {
        type: 'string',
        enum: ['draft', 'submit'],
        description: 'Quotation status',
        example: 'submit',
        default: 'submit'
      },
      manage_quotation_items: {
        type: 'array',
        description: 'Array of quotation items',
        items: { $ref: '#/components/schemas/ManageQuotationItemInput' }
      },
      manage_quotation_item_accessories: {
        type: 'array',
        description: 'Array of quotation item accessories',
        items: { $ref: '#/components/schemas/ManageQuotationItemAccessoryInput' }
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
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Componen product ID reference',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      unit_code: {
        type: 'string',
        nullable: true,
        description: 'Unit code (from item_products.item_product_code)',
        example: '1234567890'
      },
      unit_model: {
        type: 'string',
        nullable: true,
        description: 'Unit model (from item_products.item_product_model)',
        example: 'Model 1'
      },
      segment: {
        type: 'string',
        nullable: true,
        description: 'Segment (from item_products.item_product_segment)',
        example: 'Segment 1'
      },
      msi_model: {
        type: 'string',
        nullable: true,
        description: 'MSI model (from item_products.item_product_msi_model)',
        example: 'MSI Model 1'
      },
      wheel_no: {
        type: 'string',
        nullable: true,
        description: 'Wheel number (from item_products.item_product_wheel_no)',
        example: 'Wheel No 1'
      },
      engine: {
        type: 'string',
        nullable: true,
        description: 'Engine (from item_products.item_product_engine)',
        example: 'Engine 1'
      },
      horse_power: {
        type: 'string',
        nullable: true,
        description: 'Horse power (from item_products.item_product_horse_power)',
        example: '100'
      },
      item_product_market_price: {
        type: 'string',
        nullable: true,
        description: 'Market price (from item_products.item_product_market_price)',
        example: '95000'
      },
      item_product_image: {
        type: 'string',
        nullable: true,
        description: 'Product image (from item_products.item_product_image)',
        example: 'https://example.com/image.jpg'
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
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Componen product ID reference',
        example: '123e4567-e89b-12d3-a456-426614174004'
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
  ManageQuotationItemAccessory: {
    type: 'object',
    properties: {
      manage_quotation_item_accessory_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for quotation item accessory',
        example: '123e4567-e89b-12d3-a456-426614174005'
      },
      manage_quotation_id: {
        type: 'string',
        format: 'uuid',
        description: 'Parent quotation ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      accessory_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Accessory ID reference',
        example: '123e4567-e89b-12d3-a456-426614174006'
      },
      accessory_part_number: {
        type: 'string',
        nullable: true,
        description: 'Accessory part number (from accessories.accessory_part_number)',
        example: 'ACC-001'
      },
      accessory_part_name: {
        type: 'string',
        nullable: true,
        description: 'Accessory part name (from accessories.accessory_part_name)',
        example: 'Brake Pad'
      },
      accessory_specification: {
        type: 'string',
        nullable: true,
        description: 'Accessory specification (from accessories.accessory_specification)',
        example: 'Ceramic Brake Pad'
      },
      accessory_brand: {
        type: 'string',
        nullable: true,
        description: 'Accessory brand (from accessories.accessory_brand)',
        example: 'Brand X'
      },
      accessory_remark: {
        type: 'string',
        nullable: true,
        description: 'Accessory remark (from accessories.accessory_remark)',
        example: 'High quality'
      },
      accessory_region: {
        type: 'string',
        nullable: true,
        description: 'Accessory region (from accessories.accessory_region)',
        example: 'Asia'
      },
      accessory_full_description: {
        type: 'string',
        nullable: true,
        description: 'Accessory full description (from accessories.accessory_description)',
        example: 'This is an accessory description'
      },
      quantity: {
        type: 'integer',
        description: 'Quantity',
        example: 1
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Item accessory description',
        example: 'Additional notes about the accessory'
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
  ManageQuotationItemAccessoryInput: {
    type: 'object',
    properties: {
      accessory_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Accessory ID reference',
        example: '123e4567-e89b-12d3-a456-426614174006'
      },
      quantity: {
        type: 'integer',
        description: 'Quantity',
        example: 1
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Item accessory description',
        example: 'Additional notes about the accessory'
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

