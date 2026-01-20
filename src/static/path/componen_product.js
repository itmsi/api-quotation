/**
 * Swagger API Path Definitions for Componen Product Module
 */

const componenProductPaths = {
  '/componen_product/get': {
    post: {
      tags: ['Componen Products'],
      summary: 'Get all componen products',
      description: 'Retrieve all componen products with pagination, search, and sort',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  default: 1,
                  example: 1
                },
                limit: {
                  type: 'integer',
                  default: 10,
                  example: 10
                },
                search: {
                  type: 'string',
                  default: '',
                  example: ''
                },
                sort_by: {
                  type: 'string',
                  enum: ['created_at', 'code_unique', 'componen_product_name', 'segment', 'msi_model', 'msi_product', 'volume', 'componen_product_unit_model'],
                  default: 'created_at',
                  example: 'created_at'
                },
                sort_order: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  default: 'desc',
                  example: 'desc'
                },
                company_name: {
                  type: 'string',
                  nullable: true,
                  description: 'Filter by company name (bisa NaN, nullable, string kosong, null)',
                  example: 'ITI edit'
                }
              }
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
                  message: { type: 'string', example: 'Data componen product berhasil diambil' },
                  data: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ComponenProduct' }
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/componen_product/{id}': {
    get: {
      tags: ['Componen Products'],
      summary: 'Get componen product by ID',
      description: 'Retrieve a single componen product by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Componen Product UUID',
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
                  message: { type: 'string', example: 'Data componen product berhasil diambil' },
                  data: { $ref: '#/components/schemas/ComponenProduct' }
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
        }
      }
    },
    put: {
      tags: ['Componen Products'],
      summary: 'Update componen product',
      description: 'Update an existing componen product',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Componen Product UUID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/ComponenProductInput' }
          }
        }
      },
      responses: {
        200: {
          description: 'Updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Data componen product berhasil diupdate' },
                  data: { $ref: '#/components/schemas/ComponenProduct' }
                }
              }
            }
          }
        },
        404: {
          description: 'Not found'
        }
      }
    },
    delete: {
      tags: ['Componen Products'],
      summary: 'Delete componen product',
      description: 'Soft delete a componen product (sets is_delete to true)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Componen Product UUID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        200: {
          description: 'Deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Data componen product berhasil dihapus' }
                }
              }
            }
          }
        },
        404: {
          description: 'Not found'
        }
      }
    }
  },
  '/componen_product': {
    post: {
      tags: ['Componen Products'],
      summary: 'Create new componen product',
      description: 'Create a new componen product',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/ComponenProductInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Data componen product berhasil dibuat' },
                  data: { $ref: '#/components/schemas/ComponenProduct' }
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
        }
      }
    }
  },
  '/componen_product/import-csv': {
    post: {
      tags: ['Componen Products'],
      summary: 'Import componen products from CSV',
      description: `Import multiple componen products from CSV file. 
      
**Format CSV yang diharapkan:**
Header CSV harus berisi kolom-kolom berikut:
\`msi_code,truck_type,segment,segment_type,msi_model,unit_model,engine,horse_power,wheel_number,volume_cbm,market_price,gvw,wheelbase,engine_brand_model,max_torque,displacement,emission_standard,engine_guard,gearbox_transmission,fuel_tank,Tyre\`

**Mapping Data:**
- \`msi_code\` → \`code_unique\`
- \`truck_type\` → \`msi_model\`
- \`segment\` → \`segment\`
- \`segment_type\` → \`componen_type\` (OFF ROAD REGULAR=1, ON ROAD REGULAR=2, OFF ROAD IRREGULAR=3)
- \`msi_model\` → \`msi_product\`
- \`unit_model\` → \`componen_product_unit_model\`
- \`engine\` → \`engine\`
- \`horse_power\` → \`horse_power\`
- \`wheel_number\` → \`wheel_no\`
- \`volume_cbm\` → \`volume\`
- \`market_price\` → \`market_price\`
- \`selling_price_star_1\` sampai \`selling_price_star_5\` = '0'

**Spesifikasi akan dibuat otomatis untuk:**
GVW, Unit Model, Horse Power, Cargobox/Vessel, Wheelbase, Engine Brand Model, Max Torque, Displacement, Emission Standard, Engine Guard, Gearbox Transmission, Fuel Tank, Tyre`,
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['file'],
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: 'CSV file dengan format yang sesuai. Maksimal 10MB.'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Import berhasil',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ImportCSVResponse' }
            }
          }
        },
        400: {
          description: 'Validation error atau file tidak valid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        500: {
          description: 'Server error',
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

module.exports = componenProductPaths;

