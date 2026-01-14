#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script untuk membuat CSV properties untuk tabel manage_quotations
"""

import csv
import json
import os

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
    
    customers = read_csv_to_dict(
        os.path.join(BASE_PATH, "customers_202601131708.csv"),
        "customer_id"
    )
    
    employees = read_csv_to_dict(
        os.path.join(BASE_PATH, "employees_202601131708.csv"),
        "employee_id"
    )
    
    islands = read_csv_to_dict(
        os.path.join(BASE_PATH, "islands_202601131708.csv"),
        "island_id"
    )
    
    # Baca bank_accounts dan buat dictionary dengan bank_account_number sebagai key
    bank_accounts_by_number = {}
    with open(os.path.join(BASE_PATH, "bank_accounts_202601140102.csv"), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            bank_account_number = clean_value(row.get('bank_account_number', ''))
            if bank_account_number:
                bank_accounts_by_number[bank_account_number] = row
    
    # Baca manage_quotations
    manage_quotations = []
    with open(os.path.join(BASE_PATH, "manage_quotations_202601131709.csv"), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            manage_quotations.append(row)
    
    # Buat output CSV
    output_file = os.path.join(BASE_PATH, "manage_quotations_properties.csv")
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        
        # Header
        writer.writerow(['manage_quotation_id', 'properties'])
        
        # Process setiap manage_quotation
        for mq in manage_quotations:
            mq_id = clean_value(mq.get('manage_quotation_id', ''))
            if not mq_id:
                continue
            
            # Ambil data dari manage_quotation
            customer_id = clean_value(mq.get('customer_id', ''))
            employee_id = clean_value(mq.get('employee_id', ''))
            island_id = clean_value(mq.get('island_id', ''))
            term_content_id = clean_value(mq.get('term_content_id', ''))
            
            # Ambil data customer
            customer_data = customers.get(customer_id, {}) if customer_id else {}
            customer_name = clean_value(customer_data.get('customer_name', ''))
            customer_email = clean_value(customer_data.get('customer_email', ''))
            customer_phone = clean_value(customer_data.get('customer_phone', ''))
            customer_address = clean_value(customer_data.get('customer_address', ''))
            contact_person = clean_value(customer_data.get('contact_person', ''))
            
            # Ambil data employee
            employee_data = employees.get(employee_id, {}) if employee_id else {}
            employee_name = clean_value(employee_data.get('employee_name', ''))
            employee_phone = clean_value(employee_data.get('employee_phone', '')) or clean_value(employee_data.get('employee_mobile', ''))
            
            # Ambil data island
            island_data = islands.get(island_id, {}) if island_id else {}
            island_name = clean_value(island_data.get('island_name', ''))
            
            # Ambil data bank account dari manage_quotation
            bank_account_name = clean_value(mq.get('bank_account_name', ''))
            bank_account_number = clean_value(mq.get('bank_account_number', ''))
            bank_account_bank_name = clean_value(mq.get('bank_account_bank_name', ''))
            
            # Cari bank_account_id dari bank_accounts berdasarkan bank_account_number
            bank_account_id = None
            if bank_account_number:
                bank_account_data = bank_accounts_by_number.get(bank_account_number)
                if bank_account_data:
                    bank_account_id = clean_value(bank_account_data.get('bank_account_id', ''))
            
            # Set term_content_directory dan term_content_payload dengan nilai tetap
            term_content_directory = "1. Harga termasuk pengiriman ke site Customer.<div>2. Down Payment 30%, sisa pelunasan 70% Cash/Leasing sebelum unit dikirim.</div><div>3. Penawaran ini berlaku 30 hari sejak tanggal surat penawaran</div><div>4. Warranty selama 1 (satu) tahun atau 60.000 kilometer (mana yang tercapai lebih dahulu)</div>"
            term_content_payload = "{\"content\":\"1. Harga termasuk pengiriman ke site Customer.<div>2. Down Payment 30%, sisa pelunasan 70% Cash/Leasing sebelum unit dikirim.</div><div>3. Penawaran ini berlaku 30 hari sejak tanggal surat penawaran</div><div>4. Warranty selama 1 (satu) tahun atau 60.000 kilometer (mana yang tercapai lebih dahulu)</div>\"}"
            
            # Buat properties JSON
            properties = {
                "customer_id": customer_id,
                "customer_name": customer_name,
                "customer_email": customer_email,
                "customer_phone": customer_phone,
                "customer_address": customer_address,
                "contact_person": contact_person,
                "employee_id": employee_id,
                "employee_name": employee_name,
                "employee_phone": employee_phone,
                "island_id": island_id,
                "island_name": island_name,
                "bank_account_id": bank_account_id,
                "bank_account_name": bank_account_name,
                "bank_account_number": bank_account_number,
                "bank_account_bank_name": bank_account_bank_name,
                "term_content_id": term_content_id,
                "term_content_directory": term_content_directory,
                "term_content_payload": term_content_payload
            }
            
            # Convert ke JSON string
            properties_json = json.dumps(properties, ensure_ascii=False)
            
            # Tulis ke CSV
            writer.writerow([mq_id, properties_json])
    
    print(f"File berhasil dibuat: {output_file}")
    print(f"Total {len(manage_quotations)} records diproses")

if __name__ == "__main__":
    main()

