/**
 * Swagger Schema Definitions for Customer Module
 */

const cutomerSchemas = {
  Cutomer: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      name: {
        type: 'string',
        description: 'Name of the customer',
        example: 'John Doe'
      },
      email: {
        type: 'string',
        format: 'email',
        nullable: true,
        description: 'Email of the customer',
        example: 'john.doe@example.com'
      },
      phone: {
        type: 'string',
        nullable: true,
        description: 'Phone number of the customer',
        example: '+6281234567890'
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
        example: '2025-01-01T00:00:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2025-01-01T.t00:00:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp (null if not deleted)',
        example: null
      }
    }
  },
  CutomerInput: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 100,
        description: 'Name of the customer',
        example: 'John Doe'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Email of the customer',
        example: 'john.doe@example.com'
      },
      phone: {
        type: 'string',
        maxLength: 20,
        description: 'Phone number of the customer',
        example: '+6281234567890'
      }
    }
  },
  CutomerFilterInput: {
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
        description: 'Search term for name, email, or phone',
        example: 'john'
      },
      sort_by: {
        type: 'string',
        enum: ['created_at', 'name', 'email', 'phone'],
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

module.exports = cutomerSchemas;

