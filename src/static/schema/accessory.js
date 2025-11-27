/**
 * Swagger Schema Definitions for Accessory Module
 */

const accessorySchemas = {
  Accessory: {
    type: 'object',
    properties: {
      accessory_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      accessory_part_number: {
        type: 'string',
        nullable: true,
        description: 'Accessory part number',
        example: 'ACC-001'
      },
      accessory_part_name: {
        type: 'string',
        nullable: true,
        description: 'Accessory part name',
        example: 'Brake Pad'
      },
      accessory_specification: {
        type: 'string',
        nullable: true,
        description: 'Accessory specification',
        example: 'Ceramic Brake Pad'
      },
      accessory_brand: {
        type: 'string',
        nullable: true,
        description: 'Accessory brand',
        example: 'Brand X'
      },
      accessory_remark: {
        type: 'string',
        nullable: true,
        description: 'Accessory remark',
        example: 'High quality'
      },
      accessory_region: {
        type: 'string',
        nullable: true,
        description: 'Accessory region',
        example: 'Asia'
      },
      accessory_description: {
        type: 'string',
        nullable: true,
        description: 'Accessory description',
        example: 'This is an accessory description'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-02-23T00:00:00.000Z'
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
        example: '2025-02-23T00:00:00.000Z'
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
      },
      accessories_island_detail: {
        type: 'array',
        description: 'List of accessories island detail',
        items: {
          $ref: '#/components/schemas/AccessoriesIslandDetail'
        }
      }
    }
  },
  AccessoriesIslandDetail: {
    type: 'object',
    properties: {
      accessories_island_detail_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      island_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Island UUID',
        example: '123e4567-e89b-12d3-a456-426614174006'
      },
      accessories_id: {
        type: 'string',
        format: 'uuid',
        description: 'Accessory UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      accessories_island_detail_quantity: {
        type: 'integer',
        description: 'Quantity',
        example: 1
      },
      accessories_island_detail_description: {
        type: 'string',
        nullable: true,
        description: 'Description',
        example: 'Description text'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-11-27T00:00:00.000Z'
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
        example: '2025-11-27T00:00:00.000Z'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Updater UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }
    }
  },
  AccessoryInput: {
    type: 'object',
    properties: {
      accessory_part_number: {
        type: 'string',
        maxLength: 255,
        description: 'Accessory part number',
        example: 'ACC-001'
      },
      accessory_part_name: {
        type: 'string',
        maxLength: 255,
        description: 'Accessory part name',
        example: 'Brake Pad'
      },
      accessory_specification: {
        type: 'string',
        maxLength: 255,
        description: 'Accessory specification',
        example: 'Ceramic Brake Pad'
      },
      accessory_brand: {
        type: 'string',
        maxLength: 255,
        description: 'Accessory brand',
        example: 'Brand X'
      },
      accessory_remark: {
        type: 'string',
        maxLength: 255,
        description: 'Accessory remark',
        example: 'High quality'
      },
      accessory_region: {
        type: 'string',
        maxLength: 255,
        description: 'Accessory region',
        example: 'Asia'
      },
      accessory_description: {
        type: 'string',
        description: 'Accessory description',
        example: 'This is an accessory description'
      },
      accessories_island_detail: {
        type: 'array',
        description: 'List of accessories island detail',
        items: {
          $ref: '#/components/schemas/AccessoriesIslandDetailInput'
        }
      }
    }
  },
  AccessoriesIslandDetailInput: {
    type: 'object',
    properties: {
      island_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Island UUID',
        example: '123e4567-e89b-12d3-a456-426614174006'
      },
      accessories_island_detail_quantity: {
        type: 'integer',
        minimum: 0,
        description: 'Quantity',
        example: 1
      },
      accessories_island_detail_description: {
        type: 'string',
        nullable: true,
        description: 'Description',
        example: 'Description text'
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

module.exports = accessorySchemas;

