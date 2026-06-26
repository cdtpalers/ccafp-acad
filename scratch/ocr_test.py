import sys
import os
import pytesseract
from pdf2image import convert_from_path

pdf_path = "public/week4(def)/1CL/WIT431.pdf"

try:
    images = convert_from_path(pdf_path)
    full_text = ""
    for i, img in enumerate(images):
        text = pytesseract.image_to_string(img)
        full_text += f"\n--- Page {i+1} ---\n{text}"
    
    with open("scratch/wit431_ocr.txt", "w") as f:
        f.write(full_text)
    print("OCR completed successfully. Text saved to scratch/wit431_ocr.txt")
except Exception as e:
    print(f"Error: {e}")
