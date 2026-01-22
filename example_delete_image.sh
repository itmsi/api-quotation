#!/bin/bash

# Contoh Curl untuk Menghapus Image pada Componen Product
# ID Product: f52c9b61-4c37-454f-a3b9-947702e4fd0d

# STEP 1: Ambil data product terlebih dahulu untuk melihat image_id yang ada
echo "=== STEP 1: Get Product Data untuk melihat images yang ada ==="
curl -X 'GET' \
  'http://localhost:9565/api/quotation/componen_product/f52c9b61-4c37-454f-a3b9-947702e4fd0d' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjBiNTcyNTgtNWYzMy00ZTAzLTgxZjctY2Q3MGQ4MzNiNWM1IiwiZW1wbG95ZWVfaWQiOiJmMGI1NzI1OC01ZjMzLTRlMDMtODFmNy1jZDcwZDgzM2I1YzUiLCJpYXQiOjE3Njg5NjUyNjMsImV4cCI6MTc2OTA1MTY2MywiYXVkIjoic3RyaW5nIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIn0.adI1O2BGvuNH3Rmphcqv-j5pLYKrjLUEOL0khU1IeUM'

echo -e "\n\n=== STEP 2: Hapus salah satu image (ganti IMAGE_ID dengan image_id dari response di atas) ==="
# Ganti IMAGE_ID dan IMAGE_URL dengan nilai dari response GET di atas
curl -X 'PUT' \
  'http://localhost:9565/api/quotation/componen_product/f52c9b61-4c37-454f-a3b9-947702e4fd0d' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjBiNTcyNTgtNWYzMy00ZTAzLTgxZjctY2Q3MGQ4MzNiNWM1IiwiZW1wbG95ZWVfaWQiOiJmMGI1NzI1OC01ZjMzLTRlMDMtODFmNy1jZDcwZDgzM2I1YzUiLCJpYXQiOjE3Njg5NjUyNjMsImV4cCI6MTc2OTA1MTY2MywiYXVkIjoic3RyaW5nIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIn0.adI1O2BGvuNH3Rmphcqv-j5pLYKrjLUEOL0khU1IeUM' \
  -H 'Content-Type: multipart/form-data' \
  -F 'code_unique=CP-0055' \
  -F 'images=[{"image_id":"GANTI_DENGAN_IMAGE_ID_DARI_RESPONSE","image_url":"GANTI_DENGAN_IMAGE_URL_DARI_RESPONSE","image_id_to_delete":"GANTI_DENGAN_IMAGE_ID_DARI_RESPONSE"}]'

echo -e "\n\n=== Contoh: Hapus image + Upload image baru ==="
curl -X 'PUT' \
  'http://localhost:9565/api/quotation/componen_product/f52c9b61-4c37-454f-a3b9-947702e4fd0d' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZjBiNTcyNTgtNWYzMy00ZTAzLTgxZjctY2Q3MGQ4MzNiNWM1IiwiZW1wbG95ZWVfaWQiOiJmMGI1NzI1OC01ZjMzLTRlMDMtODFmNy1jZDcwZDgzM2I1YzUiLCJpYXQiOjE3Njg5NjUyNjMsImV4cCI6MTc2OTA1MTY2MywiYXVkIjoic3RyaW5nIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIn0.adI1O2BGvuNH3Rmphcqv-j5pLYKrjLUEOL0khU1IeUM' \
  -H 'Content-Type: multipart/form-data' \
  -F 'code_unique=CP-0055' \
  -F 'images[0]=@Logo-BNI.jpg;type=image/jpeg' \
  -F 'image_count=1' \
  -F 'images=[{"image_id":"GANTI_DENGAN_IMAGE_ID","image_url":"GANTI_DENGAN_IMAGE_URL","image_id_to_delete":"GANTI_DENGAN_IMAGE_ID"}]'

