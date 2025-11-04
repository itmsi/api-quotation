/**
 * Swagger Schema Definitions for Item Product Module
 */

const itemProductSchemas = {
  ItemProduct: {
    type: 'object',
    properties: {
      item_product_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      item_product_code: {
        type: 'string',
        nullable: true,
        description: 'Product code',
        example: 'PROD-001'
      },
      item_product_model: {
        type: 'string',
        nullable: true,
        description: 'Product model',
        example: 'Model XYZ'
      },
      item_product_segment: {
        type: 'string',
        nullable: true,
        description: 'Product segment',
        example: 'Segment A'
      },
      item_product_msi_model: {
        type: 'string',
        nullable: true,
        description: 'MSI model',
        example: 'MSI-001'
      },
      item_product_wheel_no: {
        type: 'string',
        nullable: true,
        description: 'Wheel number',
        example: 'WHEEL-001'
      },
      item_product_engine: {
        type: 'string',
        nullable: true,
        description: 'Engine type',
        example: 'Engine V8'
      },
      item_product_horse_power: {
        type: 'string',
        nullable: true,
        description: 'Horse power',
        example: '200 HP'
      },
      item_product_market_price: {
        type: 'string',
        nullable: true,
        description: 'Market price',
        example: '10000000'
      },
      item_product_selling_price_star_1: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 1',
        example: '9500000'
      },
      item_product_selling_price_star_2: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 2',
        example: '9000000'
      },
      item_product_selling_price_star_3: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 3',
        example: '8500000'
      },
      item_product_selling_price_star_4: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 4',
        example: '8000000'
      },
      item_product_selling_price_star_5: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 5',
        example: '7500000'
      },
      item_product_description: {
        type: 'string',
        nullable: true,
        description: 'Product description',
        example: 'This is a product description'
      },
      item_product_image: {
        type: 'string',
        nullable: true,
        description: 'Product image URL',
        example: 'https://example.com/image.jpg'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-02-16T00:00:00.000Z'
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Creator UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2025-02-16T00:00:00.000Z'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Updater UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp (null if not deleted)',
        example: null
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Deleter UUID',
        example: null
      },
      is_delete: {
        type: 'boolean',
        description: 'Soft delete flag',
        example: false
      }
    }
  },
  ItemProductInput: {
    type: 'object',
    properties: {
      item_product_code: {
        type: 'string',
        maxLength: 255,
        description: 'Product code',
        example: 'PROD-001'
      },
      item_product_model: {
        type: 'string',
        maxLength: 255,
        description: 'Product model',
        example: 'Model XYZ'
      },
      item_product_segment: {
        type: 'string',
        maxLength: 255,
        description: 'Product segment',
        example: 'Segment A'
      },
      item_product_msi_model: {
        type: 'string',
        maxLength: 255,
        description: 'MSI model',
        example: 'MSI-001'
      },
      item_product_wheel_no: {
        type: 'string',
        maxLength: 255,
        description: 'Wheel number',
        example: 'WHEEL-001'
      },
      item_product_engine: {
        type: 'string',
        maxLength: 255,
        description: 'Engine type',
        example: 'Engine V8'
      },
      item_product_horse_power: {
        type: 'string',
        maxLength: 255,
        description: 'Horse power',
        example: '200 HP'
      },
      item_product_market_price: {
        type: 'string',
        maxLength: 255,
        description: 'Market price',
        example: '10000000'
      },
      item_product_selling_price_star_1: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 1',
        example: '9500000'
      },
      item_product_selling_price_star_2: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 2',
        example: '9000000'
      },
      item_product_selling_price_star_3: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 3',
        example: '8500000'
      },
      item_product_selling_price_star_4: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 4',
        example: '8000000'
      },
      item_product_selling_price_star_5: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 5',
        example: '7500000'
      },
      item_product_description: {
        type: 'string',
        description: 'Product description',
        example: 'This is a product description'
      },
      item_product_image: {
        type: 'string',
        format: 'binary',
        description: 'Product image file (jpg, jpeg, png, gif, webp)'
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

module.exports = itemProductSchemas;

