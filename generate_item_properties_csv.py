#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk membuat CSV properties untuk tabel manage_quotation_items
"""

import csv
import json
import os
from collections import defaultdict

# Path ke file CSV
BASE_PATH = "/Users/falaqmsi/Downloads"

def read_csv_to_dict(filepath, key_field):
    """Membaca CSV dan mengembalikan dictionary dengan key_field sebagai key"""
    result = {}
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = row[key_field].strip('"')
            result[key] = row
    return result

def read_csv_to_list(filepath):
    """Membaca CSV dan mengembalikan list of dictionaries"""
    result = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            result.append(row)
    return result

def clean_value(value):
    """Membersihkan nilai dari CSV (menghapus quotes dan whitespace)"""
    if value is None:
        return None
    value = str(value).strip('"').strip()
    if value == '':
        return None
    return value

def main():
    # Baca semua file CSV
    print("Membaca file CSV...")
    
    # Baca manage_quotation_items
    items = read_csv_to_list(os.path.join(BASE_PATH, "manage_quotation_items_202601131710.csv"))
    print(f"  - manage_quotation_items: {len(items)} items")
    
    # Baca manage_quotation_item_specifications
    specifications = read_csv_to_list(os.path.join(BASE_PATH, "manage_quotation_item_specifications_202601131710.csv"))
    print(f"  - manage_quotation_item_specifications: {len(specifications)} specifications")
    
    # Baca manage_quotation_item_accessories
    accessories = read_csv_to_list(os.path.join(BASE_PATH, "manage_quotation_item_accessories_202601131710.csv"))
    print(f"  - manage_quotation_item_accessories: {len(accessories)} accessories")
    
    # Baca accessories untuk mendapatkan detail
    accessories_detail = read_csv_to_dict(os.path.join(BASE_PATH, "accessories_202601131709.csv"), "accessory_id")
    print(f"  - accessories: {len(accessories_detail)} accessories")
    
    # Kelompokkan specifications berdasarkan manage_quotation_id dan componen_product_id
    specs_by_quotation_product = defaultdict(list)
    for spec in specifications:
        manage_quotation_id = clean_value(spec.get("manage_quotation_id", ""))
        componen_product_id = clean_value(spec.get("componen_product_id", ""))
        if manage_quotation_id and componen_product_id:
            key = f"{manage_quotation_id}|{componen_product_id}"
            specs_by_quotation_product[key].append({
                "componen_product_id": componen_product_id,
                "manage_quotation_item_specification_label": clean_value(spec.get("manage_quotation_item_specification_label", "")),
                "manage_quotation_item_specification_value": clean_value(spec.get("manage_quotation_item_specification_value", ""))
            })
    
    # Kelompokkan accessories berdasarkan manage_quotation_id dan componen_product_id
    accs_by_quotation_product = defaultdict(list)
    for acc in accessories:
        manage_quotation_id = clean_value(acc.get("manage_quotation_id", ""))
        accessory_id = clean_value(acc.get("accessory_id", ""))
        componen_product_id = clean_value(acc.get("componen_product_id", ""))
        
        if manage_quotation_id and accessory_id:
            # Ambil detail accessory dari accessories_202601131709.csv berdasarkan accessory_id
            acc_detail = accessories_detail.get(accessory_id, {})
            
            # Gunakan componen_product_id dari accessory atau dari item
            product_id = componen_product_id if componen_product_id else None
            
            key = f"{manage_quotation_id}|{product_id}" if product_id else manage_quotation_id
            
            acc_obj = {
                "accessory_id": accessory_id,
                "quantity": int(clean_value(acc.get("quantity", "1")) or "1"),
                "accessory_part_number": clean_value(acc_detail.get("accessory_part_number", "")),
                "accessory_part_name": clean_value(acc_detail.get("accessory_part_name", "")),
                "accessory_specification": clean_value(acc_detail.get("accessory_specification", "")),
                "accessory_brand": clean_value(acc_detail.get("accessory_brand", "")),
                "accessory_remark": clean_value(acc_detail.get("accessory_remark", "")),
                "accessory_region": clean_value(acc_detail.get("accessory_region", "")),
                "accessory_description": clean_value(acc_detail.get("accessory_description", "")),
                "componen_product_id": product_id
            }
            
            accs_by_quotation_product[key].append(acc_obj)
    
    # Buat output CSV
    output_file = os.path.join(BASE_PATH, "manage_quotation_items_properties.csv")
    
    print(f"\nMembuat file output: {output_file}")
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['manage_quotation_item_id', 'specification_properties', 'accesories_properties'])
        
        processed = 0
        for item in items:
            manage_quotation_item_id = clean_value(item.get("manage_quotation_item_id", ""))
            manage_quotation_id = clean_value(item.get("manage_quotation_id", ""))
            componen_product_id = clean_value(item.get("componen_product_id", ""))
            
            if not manage_quotation_item_id:
                continue
            
            # Cari specifications untuk item ini
            spec_key = f"{manage_quotation_id}|{componen_product_id}"
            specification_properties = specs_by_quotation_product.get(spec_key, [])
            
            # Tambahkan manage_quotation_id ke setiap specification (diambil dari manage_quotation_items)
            for spec in specification_properties:
                spec["manage_quotation_id"] = manage_quotation_id
            
            # Cari accessories untuk item ini
            # Coba dengan componen_product_id dulu
            acc_key = f"{manage_quotation_id}|{componen_product_id}"
            accesories_properties = accs_by_quotation_product.get(acc_key, [])
            
            # Jika tidak ada dengan componen_product_id, coba tanpa componen_product_id
            if not accesories_properties:
                acc_key_fallback = manage_quotation_id
                accesories_properties = accs_by_quotation_product.get(acc_key_fallback, [])
            
            # Tambahkan manage_quotation_id ke setiap accessory (diambil dari manage_quotation_items)
            for acc in accesories_properties:
                acc["manage_quotation_id"] = manage_quotation_id
            
            # Konversi ke JSON string
            spec_json = json.dumps(specification_properties, ensure_ascii=False) if specification_properties else "[]"
            acc_json = json.dumps(accesories_properties, ensure_ascii=False) if accesories_properties else "[]"
            
            writer.writerow([manage_quotation_item_id, spec_json, acc_json])
            processed += 1
    
    print(f"\nSelesai! File berhasil dibuat dengan {processed} records.")
    print(f"File: {output_file}")

if __name__ == "__main__":
    main()

