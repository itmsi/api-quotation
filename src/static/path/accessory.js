/**
 * Swagger API Path Definitions for Accessory Module
 */

const accessoryPaths = {
  '/accessory/get': {
    post: {
      tags: ['Accessories'],
      summary: 'Get all accessories',
      description: 'Retrieve all accessories with pagination, search, and sort',
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
                  enum: ['created_at', 'accessory_part_number', 'accessory_part_name', 'accessory_brand'],
                  default: 'created_at',
                  example: 'created_at'
                },
                sort_order: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  default: 'desc',
                  example: 'desc'
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
                  message: { type: 'string', example: 'Data accessory berhasil diambil' },
                  data: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Accessory' }
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
  '/accessory/get-data-by-id-island/{idisland}': {
    get: {
      tags: ['Accessories'],
      summary: 'Get accessories by island ID',
      description: 'Retrieve all accessories that belong to a specific island by joining accessories_island_detail with accessories table',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'idisland',
          in: 'path',
          required: true,
          description: 'Island UUID',
          schema: {
            type: 'string',
            format: 'uuid',
            example: '0b234105-e006-445b-9b00-7b8d060950ce'
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
                  message: { type: 'string', example: 'Data accessory berhasil diambil berdasarkan island' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        accessory_id: {
                          type: 'string',
                          format: 'uuid',
                          description: 'Accessory UUID',
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
                        accessories_island_detail_id: {
                          type: 'string',
                          format: 'uuid',
                          description: 'Accessories island detail UUID',
                          example: '123e4567-e89b-12d3-a456-426614174001'
                        },
                        island_id: {
                          type: 'string',
                          format: 'uuid',
                          description: 'Island UUID',
                          example: '0b234105-e006-445b-9b00-7b8d060950ce'
                        },
                        accessories_island_detail_quantity: {
                          type: 'integer',
                          description: 'Quantity for this island',
                          example: 10
                        },
                        accessories_island_detail_description: {
                          type: 'string',
                          nullable: true,
                          description: 'Island detail description',
                          example: 'Description Accessories Sumatera'
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'Accessory creation timestamp',
                          example: '2025-02-23T00:00:00.000Z'
                        },
                        created_by: {
                          type: 'string',
                          format: 'uuid',
                          nullable: true,
                          description: 'Accessory creator UUID',
                          example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'Accessory last update timestamp',
                          example: '2025-02-23T00:00:00.000Z'
                        },
                        updated_by: {
                          type: 'string',
                          format: 'uuid',
                          nullable: true,
                          description: 'Accessory updater UUID',
                          example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        island_detail_created_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'Island detail creation timestamp',
                          example: '2025-11-27T00:00:00.000Z'
                        },
                        island_detail_created_by: {
                          type: 'string',
                          format: 'uuid',
                          nullable: true,
                          description: 'Island detail creator UUID',
                          example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        island_detail_updated_at: {
                          type: 'string',
                          format: 'date-time',
                          description: 'Island detail last update timestamp',
                          example: '2025-11-27T00:00:00.000Z'
                        },
                        island_detail_updated_by: {
                          type: 'string',
                          format: 'uuid',
                          nullable: true,
                          description: 'Island detail updater UUID',
                          example: '123e4567-e89b-12d3-a456-426614174000'
                        }
                      }
                    }
                  }
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
        },
        404: {
          description: 'No accessories found for this island',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Data accessory berhasil diambil berdasarkan island' },
                  data: {
                    type: 'array',
                    example: []
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/accessory/{id}': {
    get: {
      tags: ['Accessories'],
      summary: 'Get accessory by ID',
      description: 'Retrieve a single accessory by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Accessory UUID',
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
                  message: { type: 'string', example: 'Data accessory berhasil diambil' },
                  data: { $ref: '#/components/schemas/Accessory' }
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
      tags: ['Accessories'],
      summary: 'Update accessory',
      description: 'Update an existing accessory',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Accessory UUID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AccessoryInput' }
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
                  message: { type: 'string', example: 'Data accessory berhasil diupdate' },
                  data: { $ref: '#/components/schemas/Accessory' }
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
      tags: ['Accessories'],
      summary: 'Delete accessory',
      description: 'Soft delete an accessory (sets is_delete to true)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Accessory UUID',
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
                  message: { type: 'string', example: 'Data accessory berhasil dihapus' }
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
  '/accessory': {
    post: {
      tags: ['Accessories'],
      summary: 'Create new accessory',
      description: 'Create a new accessory',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AccessoryInput' }
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
                  message: { type: 'string', example: 'Data accessory berhasil dibuat' },
                  data: { $ref: '#/components/schemas/Accessory' }
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
  '/accessory/import-csv': {
    post: {
      tags: ['Accessories'],
      summary: 'Import accessories from CSV',
      description: `Import multiple accessories from CSV file with island details.
      
**Format CSV yang diharapkan:**
Header CSV harus berisi kolom-kolom berikut:
\`msi_code,accessories_name,specification,brand,remarks,sumatera,kalimantan,sulawesi,maluku,otr\`

**Mapping Data ke Tabel Accessories:**
- \`msi_code\` → \`accessory_part_number\`
- \`accessories_name\` → \`accessory_part_name\`
- \`specification\` → \`accessory_specification\`
- \`brand\` → \`accessory_brand\`
- \`remarks\` → \`accessory_remark\`

**Mapping Data ke Tabel Accessories Island Detail:**
Kolom island (sumatera, kalimantan, sulawesi, maluku, otr) akan otomatis dibuat sebagai \`accessories_island_detail\` jika quantity > 0:
- \`sumatera\` → Island ID: \`0b234105-e006-445b-9b00-7b8d060950ce\` - Description: "Description Accessories Sumatera"
- \`kalimantan\` → Island ID: \`efb440a3-4c51-46c3-9c2b-5de7313d7751\` - Description: "Description Accessories Kalimantan"
- \`sulawesi\` → Island ID: \`a09bcb8b-3035-47ba-89c2-915c1c057ae4\` - Description: "Description Accessories Sulawesi"
- \`maluku\` → Island ID: \`52fe3eff-4610-4a6b-a9fa-866105073384\` - Description: "Description Accessories Maluku"
- \`otr\` → Island ID: \`9e9fec2b-a316-4c2b-a88e-2bde66a84218\` - Description: "Description Accessories OTR"

**Catatan:**
- File CSV maksimal 10MB
- Hanya baris dengan quantity > 0 yang akan dibuat sebagai accessories_island_detail
- Jika terjadi error pada suatu baris, baris tersebut akan dicatat di response failed dan proses akan dilanjutkan ke baris berikutnya`,
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
          description: 'Import completed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Import CSV selesai. Berhasil: 10, Gagal: 0' },
                  data: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer', example: 10 },
                      success: { type: 'integer', example: 10 },
                      failed: { type: 'integer', example: 0 },
                      details: {
                        type: 'object',
                        properties: {
                          success: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                row: { type: 'integer', example: 2 },
                                msi_code: { type: 'string', example: 'ACC-001' },
                                accessory_id: { type: 'string', format: 'uuid' }
                              }
                            }
                          },
                          failed: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                row: { type: 'integer', example: 3 },
                                msi_code: { type: 'string', example: 'ACC-002' },
                                error: { type: 'string', example: 'Error message' }
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
          }
        },
        400: {
          description: 'Validation error or file error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { 
                    type: 'string', 
                    example: 'File CSV tidak ditemukan' 
                  },
                  details: {
                    type: 'object',
                    nullable: true,
                    description: 'Additional error details'
                  }
                }
              },
              examples: {
                noFile: {
                  summary: 'No file provided',
                  value: {
                    success: false,
                    error: 'File CSV tidak ditemukan'
                  }
                },
                emptyFile: {
                  summary: 'Empty CSV file',
                  value: {
                    success: false,
                    error: 'File CSV kosong atau tidak valid'
                  }
                },
                missingColumns: {
                  summary: 'Missing required columns',
                  value: {
                    success: false,
                    error: 'Kolom CSV tidak lengkap. Kolom yang hilang: sumatera, kalimantan'
                  }
                },
                fileTooLarge: {
                  summary: 'File too large',
                  value: {
                    success: false,
                    message: 'File terlalu besar. Maksimal 10MB.',
                    error: 'File size exceeds limit'
                  }
                },
                invalidFileType: {
                  summary: 'Invalid file type',
                  value: {
                    success: false,
                    message: 'Hanya file CSV yang diizinkan',
                    error: 'File type not allowed'
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

module.exports = accessoryPaths;

