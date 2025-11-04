/**
 * Swagger API Path Definitions for Item Product Module
 */

const itemProductPaths = {
  '/item_product/get': {
    post: {
      tags: ['Item Products'],
      summary: 'Get all item products',
      description: 'Retrieve all item products with pagination, search, and sort',
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
                  enum: ['created_at', 'item_product_code', 'item_product_model', 'item_product_segment'],
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
                  message: { type: 'string', example: 'Data item product berhasil diambil' },
                  data: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ItemProduct' }
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
  '/item_product/{id}': {
    get: {
      tags: ['Item Products'],
      summary: 'Get item product by ID',
      description: 'Retrieve a single item product by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Item Product UUID',
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
                  message: { type: 'string', example: 'Data item product berhasil diambil' },
                  data: { $ref: '#/components/schemas/ItemProduct' }
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
      tags: ['Item Products'],
      summary: 'Update item product',
      description: 'Update an existing item product',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Item Product UUID',
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
            schema: { $ref: '#/components/schemas/ItemProductInput' }
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
                  message: { type: 'string', example: 'Data item product berhasil diupdate' },
                  data: { $ref: '#/components/schemas/ItemProduct' }
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
      tags: ['Item Products'],
      summary: 'Delete item product',
      description: 'Soft delete an item product (sets is_delete to true)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Item Product UUID',
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
                  message: { type: 'string', example: 'Data item product berhasil dihapus' }
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
  '/item_product': {
    post: {
      tags: ['Item Products'],
      summary: 'Create new item product',
      description: 'Create a new item product',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: { $ref: '#/components/schemas/ItemProductInput' }
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
                  message: { type: 'string', example: 'Data item product berhasil dibuat' },
                  data: { $ref: '#/components/schemas/ItemProduct' }
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

module.exports = itemProductPaths;

