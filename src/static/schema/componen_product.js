/**
 * Swagger Schema Definitions for Componen Product Module
 */

const componenProductSchemas = {
  ComponenProduct: {
    type: 'object',
    properties: {
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      componen_product_name: {
        type: 'string',
        nullable: true,
        description: 'Componen product name',
        example: 'Brake Component'
      },
      componen_type: {
        type: 'integer',
        nullable: true,
        enum: [1, 2, 3],
        description: 'Componen type (1: OFF ROAD REGULAR, 2: ON ROAD REGULAR, 3: OFF ROAD IRREGULAR)',
        example: 1
      },
      company_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Company ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      company_name: {
        type: 'string',
        nullable: true,
        description: 'Company name (from gate_sso.companies)',
        example: 'PT Example Company'
      },
      product_type: {
        type: 'string',
        nullable: true,
        description: 'Product type',
        example: 'OFF ROAD REGULAR'
      },
      code_unique: {
        type: 'string',
        nullable: true,
        description: 'Unique code',
        example: 'CP-001'
      },
      segment: {
        type: 'string',
        nullable: true,
        description: 'Segment',
        example: 'Segment A'
      },
      msi_model: {
        type: 'string',
        nullable: true,
        description: 'MSI model',
        example: 'MSI-001'
      },
      msi_product: {
        type: 'string',
        nullable: true,
        description: 'MSI product',
        example: 'MSI-Product-001'
      },
      wheel_no: {
        type: 'string',
        nullable: true,
        description: 'Wheel number',
        example: 'WHEEL-001'
      },
      engine: {
        type: 'string',
        nullable: true,
        description: 'Engine type',
        example: 'Engine V8'
      },
      horse_power: {
        type: 'string',
        nullable: true,
        description: 'Horse power',
        example: '200 HP'
      },
      componen_product_unit_model: {
        type: 'string',
        nullable: true,
        description: 'Componen product unit model',
        example: 'Unit Model A'
      },
      volume: {
        type: 'string',
        nullable: true,
        description: 'Volume',
        example: '20 L'
      },
      market_price: {
        type: 'string',
        nullable: true,
        description: 'Market price',
        example: '10000000'
      },
      selling_price_star_1: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 1',
        example: '9500000'
      },
      selling_price_star_2: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 2',
        example: '9000000'
      },
      selling_price_star_3: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 3',
        example: '8500000'
      },
      selling_price_star_4: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 4',
        example: '8000000'
      },
      selling_price_star_5: {
        type: 'string',
        nullable: true,
        description: 'Selling price star 5',
        example: '7500000'
      },
      image: {
        type: 'string',
        nullable: true,
        description: 'Product image URL',
        example: 'https://example.com/image.jpg'
      },
      componen_product_description: {
        type: 'string',
        nullable: true,
        description: 'Product description',
        example: 'This is a componen product description'
      },
      componen_product_specifications: {
        type: 'array',
        description: 'Daftar spesifikasi yang tersimpan untuk componen product',
        items: {
          type: 'object',
          properties: {
            componen_product_specification_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID spesifikasi komponen',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            componen_product_specification_label: {
              type: 'string',
              nullable: true,
              description: 'Label spesifikasi',
              example: 'Horse Power'
            },
            componen_product_specification_value: {
              type: 'string',
              nullable: true,
              description: 'Nilai spesifikasi',
              example: '200 HP'
            },
            componen_product_specification_description: {
              type: 'string',
              nullable: true,
              description: 'Deskripsi tambahan spesifikasi',
              example: 'Informasi tambahan mengenai horse power'
            }
          }
        }
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
      datase_specification: {
        type: 'array',
        description: 'Alias daftar spesifikasi terkait componen product (kompatibilitas mundur)',
        items: {
          type: 'object',
          properties: {
            componen_product_specification_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID spesifikasi komponen',
              example: '123e4567-e89b-12d3-a456-426614174000'
            },
            componen_product_specification_label: {
              type: 'string',
              nullable: true,
              description: 'Label spesifikasi',
              example: 'Horse Power'
            },
            componen_product_specification_value: {
              type: 'string',
              nullable: true,
              description: 'Nilai spesifikasi',
              example: '200 HP'
            },
            componen_product_specification_description: {
              type: 'string',
              nullable: true,
              description: 'Deskripsi tambahan spesifikasi',
              example: 'Informasi tambahan mengenai horse power'
            }
          }
        }
      }
    }
  },
  ComponenProductInput: {
    type: 'object',
    properties: {
      componen_type: {
        type: 'integer',
        enum: [1, 2, 3],
        description: 'Componen type (1: OFF ROAD REGULAR, 2: ON ROAD REGULAR, 3: OFF ROAD IRREGULAR)',
        example: 1
      },
      company_id: {
        type: 'string',
        format: 'uuid',
        description: 'Company ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      product_type: {
        type: 'string',
        maxLength: 255,
        description: 'Product type',
        example: 'OFF ROAD REGULAR'
      },
      componen_product_name: {
        type: 'string',
        maxLength: 255,
        description: 'Componen product name',
        example: 'Brake Component'
      },
      code_unique: {
        type: 'string',
        maxLength: 255,
        description: 'Unique code',
        example: 'CP-001'
      },
      segment: {
        type: 'string',
        maxLength: 255,
        description: 'Segment',
        example: 'Segment A'
      },
      msi_model: {
        type: 'string',
        maxLength: 255,
        description: 'MSI model',
        example: 'MSI-001'
      },
      msi_product: {
        type: 'string',
        maxLength: 255,
        description: 'MSI product',
        example: 'MSI-Product-001'
      },
      wheel_no: {
        type: 'string',
        maxLength: 255,
        description: 'Wheel number',
        example: 'WHEEL-001'
      },
      engine: {
        type: 'string',
        maxLength: 255,
        description: 'Engine type',
        example: 'Engine V8'
      },
      horse_power: {
        type: 'string',
        maxLength: 255,
        description: 'Horse power',
        example: '200 HP'
      },
      componen_product_unit_model: {
        type: 'string',
        maxLength: 255,
        description: 'Componen product unit model',
        example: 'Unit Model A'
      },
      volume: {
        type: 'string',
        maxLength: 255,
        description: 'Volume',
        example: '20 L'
      },
      market_price: {
        type: 'string',
        maxLength: 255,
        description: 'Market price',
        example: '10000000'
      },
      selling_price_star_1: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 1',
        example: '9500000'
      },
      selling_price_star_2: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 2',
        example: '9000000'
      },
      selling_price_star_3: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 3',
        example: '8500000'
      },
      selling_price_star_4: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 4',
        example: '8000000'
      },
      selling_price_star_5: {
        type: 'string',
        maxLength: 255,
        description: 'Selling price star 5',
        example: '7500000'
      },
      image: {
        type: 'string',
        format: 'binary',
        description: 'Product image file (jpg, jpeg, png, gif, webp)'
      },
      componen_product_description: {
        type: 'string',
        description: 'Product description',
        example: 'This is a componen product description'
      },
      componen_product_specifications: {
        type: 'string',
        description: 'String JSON berisi daftar spesifikasi komponen. Contoh: [{"componen_product_specification_label":"Horse Power","componen_product_specification_value":"200 HP"}]',
        example: '[{"componen_product_specification_label":"Horse Power","componen_product_specification_value":"200 HP","componen_product_specification_description":"Informasi tambahan mengenai horse power"}]'
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
  },
  ImportCSVResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Import CSV selesai. Berhasil: 10, Gagal: 0'
      },
      data: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            description: 'Total jumlah baris dalam CSV',
            example: 10
          },
          success: {
            type: 'integer',
            description: 'Jumlah baris yang berhasil diimport',
            example: 10
          },
          failed: {
            type: 'integer',
            description: 'Jumlah baris yang gagal diimport',
            example: 0
          },
          details: {
            type: 'object',
            properties: {
              success: {
                type: 'array',
                description: 'Detail baris yang berhasil diimport',
                items: {
                  type: 'object',
                  properties: {
                    row: {
                      type: 'integer',
                      description: 'Nomor baris di CSV (dimulai dari 2 karena baris 1 adalah header)',
                      example: 2
                    },
                    code_unique: {
                      type: 'string',
                      description: 'Code unique dari baris yang berhasil diimport',
                      example: 'MSI-001'
                    },
                    componen_product_id: {
                      type: 'string',
                      format: 'uuid',
                      description: 'ID componen product yang berhasil dibuat',
                      example: '123e4567-e89b-12d3-a456-426614174000'
                    }
                  }
                }
              },
              failed: {
                type: 'array',
                description: 'Detail baris yang gagal diimport',
                items: {
                  type: 'object',
                  properties: {
                    row: {
                      type: 'integer',
                      description: 'Nomor baris di CSV (dimulai dari 2 karena baris 1 adalah header)',
                      example: 3
                    },
                    code_unique: {
                      type: 'string',
                      description: 'Code unique dari baris yang gagal diimport',
                      example: 'MSI-002'
                    },
                    error: {
                      type: 'string',
                      description: 'Pesan error yang terjadi',
                      example: 'Duplicate entry for code_unique'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = componenProductSchemas;

