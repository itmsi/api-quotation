/**
 * Swagger API Path Definitions for Componen Product Specification Module
 */

const componenProductSpecificationPaths = {
  '/componen_product/specification/get': {
    post: {
      tags: ['Componen Product Specifications'],
      summary: 'Get componen product specifications',
      description: 'Retrieve componen product specifications with pagination, search, and sort',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ComponenProductSpecificationListRequest' }
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
                  message: { type: 'string', example: 'Data componen product specification berhasil diambil' },
                  data: { $ref: '#/components/schemas/ComponenProductSpecificationListResponse' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/componen_product/specification': {
    post: {
      tags: ['Componen Product Specifications'],
      summary: 'Create componen product specification',
      description: 'Create a new componen product specification',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ComponenProductSpecificationInput' }
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
                  message: { type: 'string', example: 'Data componen product specification berhasil dibuat' },
                  data: { $ref: '#/components/schemas/ComponenProductSpecification' }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error'
        }
      }
    }
  },
  '/componen_product/specification/{id}': {
    get: {
      tags: ['Componen Product Specifications'],
      summary: 'Get componen product specification by ID',
      description: 'Retrieve a single componen product specification by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Componen product specification UUID',
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
                  message: { type: 'string', example: 'Data componen product specification berhasil diambil' },
                  data: { $ref: '#/components/schemas/ComponenProductSpecification' }
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
    put: {
      tags: ['Componen Product Specifications'],
      summary: 'Update componen product specification',
      description: 'Update an existing componen product specification',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Componen product specification UUID',
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
            schema: { $ref: '#/components/schemas/ComponenProductSpecificationInput' }
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
                  message: { type: 'string', example: 'Data componen product specification berhasil diupdate' },
                  data: { $ref: '#/components/schemas/ComponenProductSpecification' }
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
      tags: ['Componen Product Specifications'],
      summary: 'Delete componen product specification',
      description: 'Soft delete a componen product specification',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Componen product specification UUID',
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
                  message: { type: 'string', example: 'Data componen product specification berhasil dihapus' }
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
  }
};

module.exports = componenProductSpecificationPaths;


