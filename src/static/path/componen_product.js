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
  }
};

module.exports = componenProductPaths;

