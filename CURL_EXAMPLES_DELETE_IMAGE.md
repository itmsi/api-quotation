# Contoh Curl untuk Delete Image pada Componen Product

## Cara Menghapus Image yang Sudah Ada

Untuk menghapus image yang sudah ada, Anda perlu mengirim field `images` sebagai JSON string di body request dengan format:

```json
[
  {
    "image_id": "uuid-image-yang-ada",
    "image_url": "url-image-yang-ada",
    "image_id_to_delete": "uuid-image-yang-ada"  // UUID yang sama dengan image_id = akan dihapus
  },
  {
    "image_id": "uuid-image-lain",
    "image_url": "url-image-lain",
    "image_id_to_delete": ""  // Kosong = tidak dihapus
  }
]
```

## Contoh 1: Hanya Hapus Image (Tanpa Upload Baru)

```bash
curl -X 'PUT' \
  'http://localhost:9565/api/quotation/componen_product/f52c9b61-4c37-454f-a3b9-947702e4fd0d' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: multipart/form-data' \
  -F 'code_unique=CP-0055' \
  -F 'images=[{"image_id":"123e4567-e89b-12d3-a456-426614174000","image_url":"https://example.com/image1.jpg","image_id_to_delete":"123e4567-e89b-12d3-a456-426614174000"}]'
```

**Penjelasan:**
- `image_id`: UUID dari image yang sudah ada (dari response GET sebelumnya)
- `image_url`: URL dari image yang sudah ada
- `image_id_to_delete`: UUID yang sama dengan `image_id` = image ini akan dihapus

## Contoh 2: Hapus Image + Upload Image Baru

```bash
curl -X 'PUT' \
  'http://localhost:9565/api/quotation/componen_product/f52c9b61-4c37-454f-a3b9-947702e4fd0d' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: multipart/form-data' \
  -F 'code_unique=CP-0055' \
  -F 'images[0]=@Logo-BNI.jpg;type=image/jpeg' \
  -F 'image_count=1' \
  -F 'images=[{"image_id":"123e4567-e89b-12d3-a456-426614174000","image_url":"https://example.com/image1.jpg","image_id_to_delete":"123e4567-e89b-12d3-a456-426614174000"}]'
```

**Penjelasan:**
- Upload image baru dengan `images[0]=@file.jpg`
- Hapus image lama dengan `images=[{...}]` yang berisi `image_id_to_delete`

## Contoh 3: Hapus Multiple Images

```bash
curl -X 'PUT' \
  'http://localhost:9565/api/quotation/componen_product/f52c9b61-4c37-454f-a3b9-947702e4fd0d' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: multipart/form-data' \
  -F 'code_unique=CP-0055' \
  -F 'images=[{"image_id":"uuid-1","image_url":"url-1","image_id_to_delete":"uuid-1"},{"image_id":"uuid-2","image_url":"url-2","image_id_to_delete":"uuid-2"}]'
```

## Cara Mendapatkan image_id

1. **GET by ID** untuk melihat images yang ada:
```bash
curl -X 'GET' \
  'http://localhost:9565/api/quotation/componen_product/f52c9b61-4c37-454f-a3b9-947702e4fd0d' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

2. Response akan berisi:
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "image_id": "123e4567-e89b-12d3-a456-426614174000",
        "image_url": "https://example.com/image1.jpg"
      },
      {
        "image_id": "123e4567-e89b-12d3-a456-426614174001",
        "image_url": "https://example.com/image2.jpg"
      }
    ],
    "image_count": 2
  }
}
```

3. Gunakan `image_id` dari response untuk menghapus image tersebut.

## Catatan Penting

- Field `images` harus berupa JSON string yang valid
- `image_id_to_delete` harus sama dengan `image_id` dari image yang ingin dihapus
- Jika `image_id_to_delete` kosong atau null, image tidak akan dihapus
- Image baru yang diupload akan di-append ke array (tidak replace)
- Image yang dihapus akan dihapus dari array berdasarkan `image_id_to_delete`

