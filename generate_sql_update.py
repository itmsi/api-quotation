#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk membuat query SQL UPDATE dari file CSV properties
"""

import csv
import json
import os
import re

# Path ke file CSV
BASE_PATH = "/Users/falaqmsi/Downloads"

def escape_sql_string(value):
    """Escape string untuk SQL (mengganti single quote dengan double single quote)"""
    if value is None:
        return "NULL"
    # Escape single quote dengan menggantinya menjadi double single quote
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"

def generate_manage_quotations_update():
    """Generate SQL UPDATE untuk manage_quotations"""
    input_file = os.path.join(BASE_PATH, "manage_quotations_properties.csv")
    output_file = os.path.join(BASE_PATH, "update_manage_quotations.sql")
    
    if not os.path.exists(input_file):
        print(f"File tidak ditemukan: {input_file}")
        return
    
    print(f"Membaca file: {input_file}")
    
    queries = []
    queries.append("-- SQL UPDATE untuk tabel manage_quotations")
    queries.append("-- Update kolom properties dari file manage_quotations_properties.csv")
    queries.append("")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            manage_quotation_id = row.get('manage_quotation_id', '').strip('"')
            properties_json = row.get('properties', '')
            
            if not manage_quotation_id:
                continue
            
            # Escape properties JSON untuk SQL
            properties_escaped = escape_sql_string(properties_json)
            
            # Buat query UPDATE
            query = f"UPDATE manage_quotations SET properties = {properties_escaped}::jsonb WHERE manage_quotation_id = '{manage_quotation_id}';"
            queries.append(query)
            count += 1
    
    # Tulis ke file SQL
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(queries))
    
    print(f"File SQL berhasil dibuat: {output_file}")
    print(f"Total {count} query UPDATE untuk manage_quotations")

def generate_manage_quotation_items_update():
    """Generate SQL UPDATE untuk manage_quotation_items"""
    input_file = os.path.join(BASE_PATH, "manage_quotation_items_properties.csv")
    output_file = os.path.join(BASE_PATH, "update_manage_quotation_items.sql")
    
    if not os.path.exists(input_file):
        print(f"File tidak ditemukan: {input_file}")
        return
    
    print(f"Membaca file: {input_file}")
    
    queries = []
    queries.append("-- SQL UPDATE untuk tabel manage_quotation_items")
    queries.append("-- Update kolom specification_properties dan accesories_properties dari file manage_quotation_items_properties.csv")
    queries.append("")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            manage_quotation_item_id = row.get('manage_quotation_item_id', '').strip('"')
            specification_properties = row.get('specification_properties', '')
            accesories_properties = row.get('accesories_properties', '')
            
            if not manage_quotation_item_id:
                continue
            
            # Escape JSON untuk SQL
            spec_escaped = escape_sql_string(specification_properties)
            acc_escaped = escape_sql_string(accesories_properties)
            
            # Buat query UPDATE
            query = f"UPDATE manage_quotation_items SET specification_properties = {spec_escaped}::jsonb, accesories_properties = {acc_escaped}::jsonb WHERE manage_quotation_item_id = '{manage_quotation_item_id}';"
            queries.append(query)
            count += 1
    
    # Tulis ke file SQL
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(queries))
    
    print(f"File SQL berhasil dibuat: {output_file}")
    print(f"Total {count} query UPDATE untuk manage_quotation_items")

def main():
    print("=" * 60)
    print("Generate SQL UPDATE Queries")
    print("=" * 60)
    print()
    
    # Generate SQL untuk manage_quotations
    print("1. Generate SQL UPDATE untuk manage_quotations...")
    generate_manage_quotations_update()
    print()
    
    # Generate SQL untuk manage_quotation_items
    print("2. Generate SQL UPDATE untuk manage_quotation_items...")
    generate_manage_quotation_items_update()
    print()
    
    print("=" * 60)
    print("Selesai! File SQL sudah dibuat di folder Downloads")
    print("=" * 60)

if __name__ == "__main__":
    main()


