/**
 * Swagger Schema Definitions for Sales Module
 */

const salesSchemas = {
  Sales: {
    type: 'object',
    properties: {
      employee_id: {
        type: 'string',
        format: 'uuid',
        description: 'Employee unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      employee_name: {
        type: 'string',
        description: 'Name of the employee',
        example: 'John Doe'
      },
      employee_email: {
        type: 'string',
        format: 'email',
        nullable: true,
        description: 'Email of the employee',
        example: 'john.doe@example.com'
      },
      employee_phone: {
        type: 'string',
        nullable: true,
        description: 'Phone number of the employee',
        example: '+6281234567890'
      },
      department_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Department ID of the employee',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      title_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Title/Position ID of the employee',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-01-01T00:00:00.000Z'
      }
    }
  },
  SalesFilterInput: {
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
        description: 'Search term for name or email',
        example: 'john'
      },
      sort_by: {
        type: 'string',
        enum: ['created_at', 'employee_name', 'employee_email'],
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

module.exports = salesSchemas;

