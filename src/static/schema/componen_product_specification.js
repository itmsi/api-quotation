/**
 * Swagger Schema Definitions for Componen Product Specification Module
 */

const componenProductSpecificationSchemas = {
  ComponenProductSpecification: {
    type: 'object',
    properties: {
      componen_product_specification_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '2d6ab87c-e0fe-47e1-918d-442f1397b3e9'
      },
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Reference to componen product',
        example: 'a7e23db6-322e-4e4f-a43f-0b6d2d8eaa2f'
      },
      componen_product_specification_label: {
        type: 'string',
        nullable: true,
        description: 'Specification label',
        example: 'Horse Power'
      },
      componen_product_specification_value: {
        type: 'string',
        nullable: true,
        description: 'Specification value',
        example: '250 HP'
      },
      componen_product_specification_description: {
        type: 'string',
        nullable: true,
        description: 'Additional specification description',
        example: 'Spesifikasi untuk varian premium'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-11-10T12:00:00.000Z'
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
        example: '2025-11-10T12:30:00.000Z'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Updater UUID',
        example: '123e4567-e89b-12d3-a456-426614174001'
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
  ComponenProductSpecificationInput: {
    type: 'object',
    properties: {
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        description: 'Reference to componen product',
        example: 'a7e23db6-322e-4e4f-a43f-0b6d2d8eaa2f'
      },
      componen_product_specification_label: {
        type: 'string',
        maxLength: 255,
        description: 'Specification label',
        example: 'Horse Power'
      },
      componen_product_specification_value: {
        type: 'string',
        maxLength: 255,
        description: 'Specification value',
        example: '250 HP'
      },
      componen_product_specification_description: {
        type: 'string',
        description: 'Additional specification description',
        example: 'Spesifikasi untuk varian premium'
      }
    }
  },
  ComponenProductSpecificationListRequest: {
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
      search: {
        type: 'string',
        description: 'Search keyword for label/value/description',
        example: 'Horse'
      },
      sort_by: {
        type: 'string',
        enum: ['created_at', 'componen_product_specification_label', 'componen_product_specification_value'],
        description: 'Sort column',
        example: 'created_at'
      },
      sort_order: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort order',
        example: 'desc'
      },
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Filter by componen product',
        example: 'a7e23db6-322e-4e4f-a43f-0b6d2d8eaa2f'
      }
    }
  },
  ComponenProductSpecificationListResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/ComponenProductSpecification' }
      },
      pagination: { $ref: '#/components/schemas/Pagination' }
    }
  }
};

module.exports = componenProductSpecificationSchemas;


