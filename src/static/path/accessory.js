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
  }
};

module.exports = accessoryPaths;

