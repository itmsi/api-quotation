/**
 * Swagger Schema Definitions for Bank Account Module
 */

const bankAccountSchemas = {
  BankAccount: {
    type: 'object',
    properties: {
      bank_account_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      bank_account_name: {
        type: 'string',
        nullable: true,
        description: 'Name of the bank account',
        example: 'Bank Mandiri'
      },
      bank_account_number: {
        type: 'string',
        nullable: true,
        description: 'Account number',
        example: '1234567890'
      },
      bank_account_type: {
        type: 'string',
        nullable: true,
        description: 'Type of bank account',
        example: 'Savings'
      },
      bank_account_balance: {
        type: 'number',
        nullable: true,
        description: 'Account balance',
        example: 1000000.00
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
        example: '2025-01-01T00:00:00.000Z'
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
  BankAccountInput: {
    type: 'object',
    properties: {
      bank_account_name: {
        type: 'string',
        maxLength: 255,
        description: 'Name of the bank account',
        example: 'Bank Mandiri'
      },
      bank_account_number: {
        type: 'string',
        maxLength: 255,
        description: 'Account number',
        example: '1234567890'
      },
      bank_account_type: {
        type: 'string',
        maxLength: 255,
        description: 'Type of bank account',
        example: 'Savings'
      },
      bank_account_balance: {
        type: 'number',
        description: 'Account balance',
        example: 1000000.00
      }
    }
  },
  BankAccountFilterInput: {
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
        description: 'Search term for name, number, or type',
        example: 'mandiri'
      },
      sort_by: {
        type: 'string',
        enum: ['created_at', 'bank_account_name', 'bank_account_number', 'bank_account_type'],
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
  }
};

module.exports = bankAccountSchemas;

