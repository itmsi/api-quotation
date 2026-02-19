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
      term_content_title: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Judul term content',
        example: 'Term & Condition'
      },
      term_content_directory: {
        type: 'string',
        nullable: true,
        description: 'Path file JSON yang tersimpan',
        example: 'uploads/term_contents/quo-2025-001_123e4567-e89b-12d3-a456-426614174000.json'
      },
      company_name: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Nama perusahaan',
        example: 'PT MSI Indonesia'
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
    required: ['term_content_directory'],
    properties: {
      term_content_title: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Judul term content',
        example: 'Term & Condition'
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
      },
      company_name: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Nama perusahaan',
        example: 'PT MSI Indonesia'
      }
    }
  },
  TermContentUpdateInput: {
    type: 'object',
    properties: {
      term_content_title: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Judul term content',
        example: 'Updated Term & Condition'
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
      },
      company_name: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Nama perusahaan',
        example: 'PT MSI Indonesia'
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
        description: 'Kata kunci pencarian (title atau path)',
        example: 'Term & Condition'
      },
      company_name: {
        type: 'string',
        description: 'Filter berdasarkan nama perusahaan',
        example: 'PT MSI Indonesia'
      },
      sort_by: {
        type: 'string',
        enum: ['created_at', 'term_content_title'],
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


