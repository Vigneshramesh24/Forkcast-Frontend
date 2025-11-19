#!/usr/bin/env python3
"""
Quick test script for the 5 FastAPI endpoints
Run: python quick_test.py
"""

import requests
import json
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"

print("🚀 FastAPI Endpoint Tests\n")

# Test 1: Extract JSON from PDF
print("1️⃣  POST /extract-json")
print("-" * 50)

pdf_files = list(Path("docs").glob("*.pdf"))
if not pdf_files:
    print("❌ No PDF files in docs/ folder")
else:
    pdf_path = pdf_files[0]
    print(f"📄 Uploading: {pdf_path.name}")
    
    with open(pdf_path, "rb") as f:
        files = {"pdf": f}
        try:
            response = requests.post(f"{BASE_URL}/extract-json", files=files, timeout=10)
            if response.status_code == 200:
                data = response.json()
                pdf_id = data.get("pdf_id")
                print(f"✅ Success!")
                print(f"   PDF ID: {pdf_id}")
                print(f"   Filename: {data.get('filename')}")
                print(f"   Timestamp: {data.get('timestamp')}\n")
            else:
                print(f"❌ Error: {response.status_code}\n")
        except Exception as e:
            print(f"❌ Connection error: {e}\n")

# Test 2: List all PDFs
print("2️⃣  GET /pdfs")
print("-" * 50)
try:
    response = requests.get(f"{BASE_URL}/pdfs", timeout=10)
    if response.status_code == 200:
        pdfs = response.json()
        print(f"✅ Success! Found {len(pdfs)} PDF(s):")
        for pdf in pdfs:
            print(f"   - {pdf['filename']} (ID: {pdf['pdf_id'][:8]}...)")
        print()
    else:
        print(f"❌ Error: {response.status_code}\n")
except Exception as e:
    print(f"❌ Connection error: {e}\n")

# Test 3: Get specific PDF report
print("3️⃣  GET /pdf/{pdf_id}")
print("-" * 50)
try:
    response = requests.get(f"{BASE_URL}/pdfs", timeout=10)
    if response.status_code == 200:
        pdfs = response.json()
        if pdfs:
            pdf_id = pdfs[0]["pdf_id"]
            print(f"📋 Fetching report for PDF ID: {pdf_id[:8]}...")
            
            response = requests.get(f"{BASE_URL}/pdf/{pdf_id}", timeout=10)
            if response.status_code == 200:
                report = response.json()
                print(f"✅ Success!")
                if "restaurant_report" in report:
                    print(f"   Top level keys: {list(report['restaurant_report'].keys())[:3]}...")
                print()
            else:
                print(f"❌ Error: {response.status_code}\n")
except Exception as e:
    print(f"❌ Error: {e}\n")

# Test 4: Chat endpoint
print("4️⃣  POST /chat")
print("-" * 50)
pdf_files = list(Path("docs").glob("*.pdf"))
if not pdf_files:
    print("❌ No PDF files in docs/ folder\n")
else:
    pdf_path = pdf_files[0]
    print(f"📄 Using PDF: {pdf_path.name}")
    print(f"❓ Question: 'What is the restaurant name?'")
    
    with open(pdf_path, "rb") as f:
        files = {"pdf_files": f}
        data = {"question": "What is the restaurant name?"}
        try:
            response = requests.post(f"{BASE_URL}/chat", data=data, files=files, timeout=30)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success!")
                print(f"   Answer: {result.get('answer', 'N/A')[:80]}...")
                print(f"   Context chunks: {result.get('context_count', 0)}")
                print(f"   Chat ID: {result.get('chat_id', 'N/A')[:8]}...")
                print()
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"   {response.text}\n")
        except Exception as e:
            print(f"❌ Error: {e}\n")

# Test 5: Chat history
print("5️⃣  GET /chat-history")
print("-" * 50)
try:
    response = requests.get(f"{BASE_URL}/chat-history", timeout=10)
    if response.status_code == 200:
        history = response.json()
        print(f"✅ Success! Chat history has {len(history)} entry(ies):")
        for chat in history[:3]:  # Show first 3
            print(f"   Q: {chat['question'][:50]}...")
            print(f"   A: {chat['answer'][:50]}...")
        if len(history) > 3:
            print(f"   ... and {len(history) - 3} more")
        print()
    else:
        print(f"❌ Error: {response.status_code}\n")
except Exception as e:
    print(f"❌ Connection error: {e}\n")

print("=" * 50)
print("✨ Tests complete!")
print("\n📖 View API docs at: http://127.0.0.1:8000/docs")
