/**
 * Swagger Schema Definitions for Manage Quotation Module
 */

const manageQuotationSchemas = {
  ManageQuotation: {
    type: 'object',
    properties: {
      manage_quotation_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      manage_quotation_no: {
        type: 'string',
        nullable: true,
        description: 'Quotation number',
        example: 'QUO-2025-001'
      },
      customer_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Customer ID',
        example: '123e4567-e89b-12d3-a456-426614174001'
      },
      employee_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Employee ID',
        example: '123e4567-e89b-12d3-a456-426614174002'
      },
      manage_quotation_date: {
        type: 'string',
        format: 'date',
        nullable: true,
        description: 'Quotation date',
        example: '2025-01-15'
      },
      manage_quotation_valid_date: {
        type: 'string',
        format: 'date',
        nullable: true,
        description: 'Valid until date',
        example: '2025-01-30'
      },
      manage_quotation_grand_total: {
        type: 'string',
        nullable: true,
        description: 'Grand total amount',
        example: '1000000'
      },
      manage_quotation_ppn: {
        type: 'string',
        nullable: true,
        description: 'PPN amount',
        example: '110000'
      },
      manage_quotation_delivery_fee: {
        type: 'string',
        nullable: true,
        description: 'Delivery fee',
        example: '50000'
      },
      manage_quotation_other: {
        type: 'string',
        nullable: true,
        description: 'Other expenses',
        example: '20000'
      },
      manage_quotation_payment_presentase: {
        type: 'string',
        nullable: true,
        description: 'Payment percentage',
        example: '50'
      },
      manage_quotation_payment_nominal: {
        type: 'string',
        nullable: true,
        description: 'Payment nominal amount',
        example: '500000'
      },
      manage_quotation_description: {
        type: 'string',
        nullable: true,
        description: 'Description',
        example: 'Additional notes about the quotation'
      },
      manage_quotation_shipping_term: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Shipping term',
        example: ''
      },
      manage_quotation_franco: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Franco',
        example: ''
      },
      manage_quotation_lead_time: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Lead time',
        example: ''
      },
      bank_account_name: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Nama pemilik rekening bank',
        example: 'John Doe'
      },
      bank_account_number: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Nomor rekening bank',
        example: '1234567890'
      },
      bank_account_bank_name: {
        type: 'string',
        nullable: true,
        maxLength: 255,
        description: 'Nama bank',
        example: 'Bank Mandiri'
      },
      term_content_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Reference ke term_contents (hanya sebagai acuan)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      term_content_directory: {
        type: 'string',
        nullable: true,
        description: 'Path file JSON yang tersimpan',
        example: 'uploads/manage_quotation_term_contents/quo-2025-001_123e4567-e89b-12d3-a456-426614174000.json'
      },
      term_content_payload: {
        type: 'object',
        nullable: true,
        description: 'Konten JSON dari file term_content_directory',
        additionalProperties: true,
        example: {
          title: 'Term & Condition',
          items: [
            'Pembayaran dilakukan 14 hari setelah invoice',
            'Pengiriman dilakukan dalam 7 hari kerja'
          ]
        }
      },
      status: {
        type: 'string',
        enum: ['draft', 'submit'],
        description: 'Quotation status',
        example: 'submit',
        default: 'submit'
      },
      include_aftersales_page: {
        type: 'boolean',
        description: 'Menandakan apakah halaman aftersales harus disertakan',
        example: true,
        default: false
      },
      include_msf_page: {
        type: 'boolean',
        description: 'Menandakan apakah halaman MSF harus disertakan',
        example: false,
        default: false
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who created the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who updated the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who deleted the record',
        example: null
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp (null if not deleted)',
        example: null
      },
      is_delete: {
        type: 'boolean',
        description: 'Soft delete flag',
        example: false
      },
      manage_quotation_items: {
        type: 'array',
        description: 'Array of quotation items',
        items: { $ref: '#/components/schemas/ManageQuotationItem' }
      }
    }
  },
  ManageQuotationInput: {
    type: 'object',
    properties: {
      customer_id: {
        type: 'string',
        format: 'uuid',
        description: 'Customer ID',
        example: '7dbe5e70-87c4-4761-82de-9d9f54eea45f'
      },
      employee_id: {
        type: 'string',
        format: 'uuid',
        description: 'Employee ID',
        example: '3659340c-46b0-43f5-bf5c-d1d0222eb7f9'
      },
      manage_quotation_date: {
        type: 'string',
        format: 'date',
        description: 'Quotation date',
        example: '2025-01-15'
      },
      manage_quotation_valid_date: {
        type: 'string',
        format: 'date',
        description: 'Valid until date',
        example: '2025-01-30'
      },
      manage_quotation_grand_total: {
        type: 'string',
        maxLength: 100,
        description: 'Grand total amount',
        example: '1000000'
      },
      manage_quotation_ppn: {
        type: 'string',
        maxLength: 100,
        description: 'PPN amount',
        example: '110000'
      },
      manage_quotation_delivery_fee: {
        type: 'string',
        maxLength: 100,
        description: 'Delivery fee',
        example: '50000'
      },
      manage_quotation_other: {
        type: 'string',
        maxLength: 100,
        description: 'Other expenses',
        example: '20000'
      },
      manage_quotation_payment_presentase: {
        type: 'string',
        maxLength: 100,
        description: 'Payment percentage',
        example: '50'
      },
      manage_quotation_payment_nominal: {
        type: 'string',
        maxLength: 100,
        description: 'Payment nominal amount',
        example: '500000'
      },
      manage_quotation_description: {
        type: 'string',
        description: 'Description',
        example: 'Additional notes about the quotation'
      },
      manage_quotation_shipping_term: {
        type: 'string',
        maxLength: 255,
        nullable: true,
        description: 'Shipping term',
        example: ''
      },
      manage_quotation_franco: {
        type: 'string',
        maxLength: 255,
        nullable: true,
        description: 'Franco',
        example: ''
      },
      manage_quotation_lead_time: {
        type: 'string',
        maxLength: 255,
        nullable: true,
        description: 'Lead time',
        example: ''
      },
      bank_account_name: {
        type: 'string',
        maxLength: 255,
        nullable: true,
        description: 'Nama pemilik rekening bank',
        example: 'John Doe'
      },
      bank_account_number: {
        type: 'string',
        maxLength: 255,
        nullable: true,
        description: 'Nomor rekening bank',
        example: '1234567890'
      },
      bank_account_bank_name: {
        type: 'string',
        maxLength: 255,
        nullable: true,
        description: 'Nama bank',
        example: 'Bank Mandiri'
      },
      term_content_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Reference ke term_contents (hanya sebagai acuan, tidak mempengaruhi data di tabel term_contents)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      term_content_directory: {
        oneOf: [
          {
            type: 'object',
            additionalProperties: true,
            description: 'Data JSON yang akan disimpan sebagai file'
          },
          {
            type: 'string',
            description: 'String JSON yang akan disimpan sebagai file'
          }
        ],
        nullable: true,
        description: 'Konten term & condition yang akan disimpan sebagai file JSON (path berbeda dengan module term_content)',
        example: {
          title: 'Term & Condition',
          items: [
            'Pembayaran dilakukan 14 hari setelah invoice',
            'Pengiriman dilakukan dalam 7 hari kerja'
          ]
        }
      },
      status: {
        type: 'string',
        enum: ['draft', 'submit'],
        description: 'Quotation status',
        example: 'submit',
        default: 'submit'
      },
      include_aftersales_page: {
        type: 'boolean',
        description: 'Menandakan apakah halaman aftersales perlu disertakan dalam dokumen',
        example: true,
        default: false
      },
      include_msf_page: {
        type: 'boolean',
        description: 'Menandakan apakah halaman MSF perlu disertakan dalam dokumen',
        example: false,
        default: false
      },
      manage_quotation_items: {
        type: 'array',
        description: 'Array of quotation items',
        items: { $ref: '#/components/schemas/ManageQuotationItemInput' }
      }
    }
  },
  ManageQuotationItem: {
    type: 'object',
    properties: {
      manage_quotation_item_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for quotation item',
        example: '123e4567-e89b-12d3-a456-426614174003'
      },
      manage_quotation_id: {
        type: 'string',
        format: 'uuid',
        description: 'Parent quotation ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Componen product ID reference',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      code_unique: {
        type: 'string',
        nullable: true,
        description: 'Kode unik komponen yang tersimpan pada item',
        example: 'CU-001'
      },
      segment: {
        type: 'string',
        nullable: true,
        description: 'Segment yang tersimpan pada item',
        example: 'Segment 1'
      },
      msi_model: {
        type: 'string',
        nullable: true,
        description: 'MSI model yang tersimpan pada item',
        example: 'MSI Model 1'
      },
      wheel_no: {
        type: 'string',
        nullable: true,
        description: 'Nomor roda yang tersimpan pada item',
        example: 'Wheel-01'
      },
      engine: {
        type: 'string',
        nullable: true,
        description: 'Mesin yang tersimpan pada item',
        example: 'Engine 1'
      },
      volume: {
        type: 'string',
        nullable: true,
        description: 'Volume yang tersimpan pada item',
        example: '2000'
      },
      horse_power: {
        type: 'string',
        nullable: true,
        description: 'Horse power yang tersimpan pada item',
        example: '100'
      },
      market_price: {
        type: 'string',
        nullable: true,
        description: 'Harga pasar yang tersimpan pada item',
        example: '95000'
      },
      componen_product_name: {
        type: 'string',
        nullable: true,
        description: 'Nama produk komponen yang tersimpan pada item',
        example: 'Excavator Arm'
      },
      cp_code_unique: {
        type: 'string',
        nullable: true,
        description: 'Kode unik komponen yang berasal dari master componen_products',
        example: 'CU-001'
      },
      cp_segment: {
        type: 'string',
        nullable: true,
        description: 'Segment dari master componen_products',
        example: 'Segment A'
      },
      cp_msi_model: {
        type: 'string',
        nullable: true,
        description: 'MSI model dari master componen_products',
        example: 'MSI-Model-A'
      },
      cp_wheel_no: {
        type: 'string',
        nullable: true,
        description: 'Wheel number dari master componen_products',
        example: 'Wheel-01'
      },
      cp_engine: {
        type: 'string',
        nullable: true,
        description: 'Engine dari master componen_products',
        example: 'Engine Master'
      },
      cp_volume: {
        type: 'string',
        nullable: true,
        description: 'Volume dari master componen_products',
        example: '2500'
      },
      cp_horse_power: {
        type: 'string',
        nullable: true,
        description: 'Horse power dari master componen_products',
        example: '120'
      },
      cp_market_price: {
        type: 'string',
        nullable: true,
        description: 'Market price dari master componen_products',
        example: '98000'
      },
      cp_componen_product_name: {
        type: 'string',
        nullable: true,
        description: 'Nama komponen dari master componen_products',
        example: 'Excavator Arm'
      },
      cp_image: {
        type: 'string',
        nullable: true,
        description: 'Gambar komponen dari master componen_products',
        example: 'https://example.com/image.jpg'
      },
      quantity: {
        type: 'integer',
        description: 'Quantity',
        example: 1
      },
      price: {
        type: 'string',
        description: 'Price',
        example: '100000'
      },
      total: {
        type: 'string',
        description: 'Total amount',
        example: '100000'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Item description',
        example: 'Additional notes about the item'
      },
      order_number: {
        type: 'integer',
        description: 'Order number untuk urutan item dalam quotation',
        example: 0,
        default: 0
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who created the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who updated the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who deleted the record',
        example: null
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp (null if not deleted)',
        example: null
      },
      is_delete: {
        type: 'boolean',
        description: 'Soft delete flag',
        example: false
      },
      manage_quotation_item_accessories: {
        type: 'array',
        nullable: true,
        description: 'Daftar accessories yang terkait dengan item quotation',
        items: { $ref: '#/components/schemas/ManageQuotationItemAccessory' }
      },
      manage_quotation_item_specifications: {
        type: 'array',
        nullable: true,
        description: 'Daftar specification yang terkait dengan item quotation',
        items: { $ref: '#/components/schemas/ManageQuotationItemSpecification' }
      }
    }
  },
  ManageQuotationItemInput: {
    type: 'object',
    properties: {
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Componen product ID reference',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      code_unique: {
        type: 'string',
        nullable: true,
        description: 'Kode unik komponen yang ingin disimpan pada item',
        example: 'CU-001'
      },
      segment: {
        type: 'string',
        nullable: true,
        description: 'Segment yang ingin disimpan pada item',
        example: 'Segment 1'
      },
      msi_model: {
        type: 'string',
        nullable: true,
        description: 'MSI model yang ingin disimpan pada item',
        example: 'MSI Model 1'
      },
      wheel_no: {
        type: 'string',
        nullable: true,
        description: 'Nomor roda yang ingin disimpan pada item',
        example: 'Wheel-01'
      },
      engine: {
        type: 'string',
        nullable: true,
        description: 'Mesin yang ingin disimpan pada item',
        example: 'Engine 1'
      },
      volume: {
        type: 'string',
        nullable: true,
        description: 'Volume yang ingin disimpan pada item',
        example: '2000'
      },
      horse_power: {
        type: 'string',
        nullable: true,
        description: 'Horse power yang ingin disimpan pada item',
        example: '100'
      },
      market_price: {
        type: 'string',
        nullable: true,
        description: 'Harga pasar yang ingin disimpan pada item',
        example: '95000'
      },
      componen_product_name: {
        type: 'string',
        nullable: true,
        description: 'Nama produk komponen yang ingin disimpan pada item',
        example: 'Excavator Arm'
      },
      quantity: {
        type: 'integer',
        description: 'Quantity',
        example: 1
      },
      price: {
        type: 'string',
        description: 'Price',
        example: '100000'
      },
      total: {
        type: 'string',
        description: 'Total amount',
        example: '100000'
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Item description',
        example: 'Additional notes about the item'
      },
      order_number: {
        type: 'integer',
        description: 'Order number untuk urutan item dalam quotation',
        example: 0,
        default: 0
      },
      manage_quotation_item_accessories: {
        type: 'array',
        nullable: true,
        description: 'Accessories yang disertakan dalam item quotation',
        items: { $ref: '#/components/schemas/ManageQuotationItemAccessoryInput' }
      },
      manage_quotation_item_specifications: {
        type: 'array',
        nullable: true,
        description: 'Specifications tambahan untuk item quotation',
        items: { $ref: '#/components/schemas/ManageQuotationItemSpecificationInput' }
      }
    }
  },
  ManageQuotationItemAccessory: {
    type: 'object',
    properties: {
      manage_quotation_item_accessory_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier for quotation item accessory',
        example: '123e4567-e89b-12d3-a456-426614174005'
      },
      manage_quotation_id: {
        type: 'string',
        format: 'uuid',
        description: 'Parent quotation ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      accessory_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Accessory ID reference',
        example: '123e4567-e89b-12d3-a456-426614174006'
      },
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Componen product ID yang ingin dikaitkan dengan accessory',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Componen product ID yang menjadi referensi accessory dalam quotation',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      accessory_part_number: {
        type: 'string',
        nullable: true,
        description: 'Accessory part number yang tersimpan pada item accessory',
        example: 'ACC-001'
      },
      accessory_part_name: {
        type: 'string',
        nullable: true,
        description: 'Accessory part name yang tersimpan pada item accessory',
        example: 'Brake Pad'
      },
      accessory_specification: {
        type: 'string',
        nullable: true,
        description: 'Accessory specification yang tersimpan pada item accessory',
        example: 'Ceramic Brake Pad'
      },
      accessory_brand: {
        type: 'string',
        nullable: true,
        description: 'Accessory brand yang tersimpan pada item accessory',
        example: 'Brand X'
      },
      accessory_remark: {
        type: 'string',
        nullable: true,
        description: 'Accessory remark yang tersimpan pada item accessory',
        example: 'High quality'
      },
      accessory_region: {
        type: 'string',
        nullable: true,
        description: 'Accessory region yang tersimpan pada item accessory',
        example: 'Asia'
      },
      accessory_description: {
        type: 'string',
        nullable: true,
        description: 'Accessory description yang tersimpan pada item accessory',
        example: 'Catatan tambahan untuk accessory'
      },
      accessory_part_number_source: {
        type: 'string',
        nullable: true,
        description: 'Accessory part number yang berasal dari master accessories',
        example: 'ACC-001'
      },
      accessory_part_name_source: {
        type: 'string',
        nullable: true,
        description: 'Accessory part name yang berasal dari master accessories',
        example: 'Brake Pad'
      },
      accessory_specification_source: {
        type: 'string',
        nullable: true,
        description: 'Accessory specification yang berasal dari master accessories',
        example: 'Ceramic Brake Pad'
      },
      accessory_brand_source: {
        type: 'string',
        nullable: true,
        description: 'Accessory brand yang berasal dari master accessories',
        example: 'Brand X'
      },
      accessory_remark_source: {
        type: 'string',
        nullable: true,
        description: 'Accessory remark yang berasal dari master accessories',
        example: 'High quality'
      },
      accessory_region_source: {
        type: 'string',
        nullable: true,
        description: 'Accessory region yang berasal dari master accessories',
        example: 'Asia'
      },
      accessory_description_source: {
        type: 'string',
        nullable: true,
        description: 'Accessory description yang berasal dari master accessories',
        example: 'This is an accessory description'
      },
      quantity: {
        type: 'integer',
        description: 'Quantity',
        example: 1
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Item accessory description',
        example: 'Additional notes about the accessory'
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who created the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who updated the record',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID who deleted the record',
        example: null
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp',
        example: '2025-01-15T10:00:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Deletion timestamp (null if not deleted)',
        example: null
      },
      is_delete: {
        type: 'boolean',
        description: 'Soft delete flag',
        example: false
      }
    }
  },
  ManageQuotationItemAccessoryInput: {
    type: 'object',
    properties: {
      accessory_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Accessory ID reference',
        example: '123e4567-e89b-12d3-a456-426614174006'
      },
      quantity: {
        type: 'integer',
        description: 'Quantity',
        example: 1
      },
      description: {
        type: 'string',
        nullable: true,
        description: 'Item accessory description',
        example: 'Additional notes about the accessory'
      },
      accessory_part_number: {
        type: 'string',
        nullable: true,
        description: 'Accessory part number yang ingin disimpan pada quotation accessory',
        example: 'ACC-001'
      },
      accessory_part_name: {
        type: 'string',
        nullable: true,
        description: 'Accessory part name yang ingin disimpan pada quotation accessory',
        example: 'Brake Pad'
      },
      accessory_specification: {
        type: 'string',
        nullable: true,
        description: 'Accessory specification yang ingin disimpan pada quotation accessory',
        example: 'Ceramic Brake Pad'
      },
      accessory_brand: {
        type: 'string',
        nullable: true,
        description: 'Accessory brand yang ingin disimpan pada quotation accessory',
        example: 'Brand X'
      },
      accessory_remark: {
        type: 'string',
        nullable: true,
        description: 'Accessory remark yang ingin disimpan pada quotation accessory',
        example: 'High quality'
      },
      accessory_region: {
        type: 'string',
        nullable: true,
        description: 'Accessory region yang ingin disimpan pada quotation accessory',
        example: 'Asia'
      },
      accessory_description: {
        type: 'string',
        nullable: true,
        description: 'Accessory description yang ingin disimpan pada quotation accessory',
        example: 'Catatan tambahan'
      }
    }
  },
  ManageQuotationItemSpecification: {
    type: 'object',
    properties: {
      manage_quotation_item_specification_id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier untuk specification item quotation',
        example: '123e4567-e89b-12d3-a456-426614174010'
      },
      manage_quotation_id: {
        type: 'string',
        format: 'uuid',
        description: 'ID quotation induk',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Referensi componen product untuk specification',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      manage_quotation_item_specification_label: {
        type: 'string',
        nullable: true,
        description: 'Label specification yang tersimpan',
        example: 'Model'
      },
      manage_quotation_item_specification_value: {
        type: 'string',
        nullable: true,
        description: 'Nilai specification yang tersimpan',
        example: 'SX32434534534'
      },
      cp_code_unique: {
        type: 'string',
        nullable: true,
        description: 'Kode unik komponen dari master componen_products',
        example: 'CU-001'
      },
      cp_componen_product_name: {
        type: 'string',
        nullable: true,
        description: 'Nama produk komponen dari master componen_products',
        example: 'Excavator Arm'
      },
      cp_segment: {
        type: 'string',
        nullable: true,
        description: 'Segment dari master componen_products',
        example: 'Segment A'
      },
      cp_msi_model: {
        type: 'string',
        nullable: true,
        description: 'MSI model dari master componen_products',
        example: 'MSI Model 1'
      },
      cp_wheel_no: {
        type: 'string',
        nullable: true,
        description: 'Wheel no dari master componen_products',
        example: 'Wheel-01'
      },
      cp_engine: {
        type: 'string',
        nullable: true,
        description: 'Engine dari master componen_products',
        example: 'Engine Master'
      },
      cp_volume: {
        type: 'string',
        nullable: true,
        description: 'Volume dari master componen_products',
        example: '2500'
      },
      cp_horse_power: {
        type: 'string',
        nullable: true,
        description: 'Horse power dari master componen_products',
        example: '120'
      },
      cp_market_price: {
        type: 'string',
        nullable: true,
        description: 'Market price dari master componen_products',
        example: '98000'
      },
      created_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID pembuat data',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      updated_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID pengubah data',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      deleted_by: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'User ID penghapus data',
        example: null
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Waktu pembuatan data',
        example: '2025-01-15T10:00:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Waktu terakhir perubahan data',
        example: '2025-01-16T10:00:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: 'Waktu penghapusan (null jika belum dihapus)',
        example: null
      },
      is_delete: {
        type: 'boolean',
        description: 'Penanda soft delete',
        example: false
      }
    }
  },
  ManageQuotationItemSpecificationInput: {
    type: 'object',
    properties: {
      componen_product_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Componen product ID untuk specification',
        example: '123e4567-e89b-12d3-a456-426614174004'
      },
      manage_quotation_item_specification_label: {
        type: 'string',
        nullable: true,
        description: 'Label specification yang akan disimpan',
        example: 'Model'
      },
      manage_quotation_item_specification_value: {
        type: 'string',
        nullable: true,
        description: 'Nilai specification yang akan disimpan',
        example: 'SX32434534534'
      }
    }
  },
  ManageQuotationFilterInput: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        description: 'Page number',
        example: 1,
        default: 1
      },
      limit: {
        type: 'integer',
        description: 'Items per page',
        example: 10,
        default: 10
      },
      search: {
        type: 'string',
        description: 'Search term for quotation number, customer_id, or employee_id',
        example: 'QUO'
      },
      sort_by: {
        type: 'string',
        enum: ['created_at', 'manage_quotation_no', 'manage_quotation_date', 'manage_quotation_valid_date'],
        description: 'Column to sort by',
        example: 'created_at',
        default: 'created_at'
      },
      sort_order: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort order',
        example: 'desc',
        default: 'desc'
      },
      status: {
        type: 'string',
        nullable: true,
        enum: ['draft', 'submit', 'reject'],
        description: 'Filter by status (draft, submit, reject). Leave empty or null to get all statuses',
        example: ''
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

module.exports = manageQuotationSchemas;

