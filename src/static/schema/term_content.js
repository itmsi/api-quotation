/**
 * Swagger Schema Definitions for Term Content Module
 */

const termContentSchemas = {
  TermContent: {
    type: 'object',
    properties: {
      term_content_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier term content',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      manage_quotation_id: {
        type: 'string',
        format: 'uuid',
        description: 'Relasi ke manage quotation',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      manage_quotation_no: {
        type: 'string',
        description: 'Nomor manage quotation',
        example: 'QUO-2025-001'
      },
      term_content_directory: {
        type: 'string',
        nullable: true,
        description: 'Path file JSON yang tersimpan',
        example: 'uploads/term_contents/quo-2025-001_123e4567-e89b-12d3-a456-426614174000.json'
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User yang membuat data',
        example: '123e4567-e89b-12d3-a456-426614174002'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User yang terakhir mengubah data',
        example: '123e4567-e89b-12d3-a456-426614174003'
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User yang menghapus data',
        example: null
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Waktu data dibuat',
        example: '2025-02-15T10:00:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Waktu data diperbarui',
        example: '2025-02-15T11:00:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Waktu data dihapus',
        example: null
      },
      is_delete: {
        type: 'boolean',
        description: 'Penanda soft delete',
        example: false
      }
    }
  },
  TermContentCreateInput: {
    type: 'object',
    required: ['manage_quotation_no', 'term_content_directory'],
    properties: {
      manage_quotation_no: {
        type: 'string',
        description: 'Nomor manage quotation',
        example: 'QUO-2025-001'
      },
      term_content_directory: {
        oneOf: [
          {
            type: 'object',
            additionalProperties: true,
            description: 'Data JSON yang akan disimpan'
          },
          {
            type: 'string',
            description: 'String JSON yang akan disimpan'
          }
        ],
        example: {
          title: 'Term & Condition',
          items: [
            'Pembayaran dilakukan 14 hari setelah invoice',
            'Pengiriman dilakukan dalam 7 hari kerja'
          ]
        }
      }
    }
  },
  TermContentUpdateInput: {
    type: 'object',
    properties: {
      manage_quotation_no: {
        type: 'string',
        description: 'Nomor manage quotation baru',
        example: 'QUO-2025-002'
      },
      term_content_directory: {
        oneOf: [
          {
            type: 'object',
            additionalProperties: true
          },
          {
            type: 'string'
          }
        ],
        description: 'Konten JSON terbaru',
        example: {
          title: 'Updated Term & Condition',
          items: [
            'Pembayaran dilakukan 7 hari setelah invoice'
          ]
        }
      }
    }
  },
  TermContentFilterInput: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        description: 'Nomor halaman',
        example: 1,
        default: 1
      },
      limit: {
        type: 'integer',
        description: 'Jumlah data per halaman',
        example: 10,
        default: 10
      },
      search: {
        type: 'string',
        description: 'Kata kunci pencarian (nomor quotation atau path)',
        example: 'QUO-2025'
      },
      sort_by: {
        type: 'string',
        enum: ['created_at', 'manage_quotation_no'],
        description: 'Kolom untuk sorting',
        example: 'created_at',
        default: 'created_at'
      },
      sort_order: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Urutan sorting',
        example: 'desc',
        default: 'desc'
      }
    }
  }
};

module.exports = termContentSchemas;


