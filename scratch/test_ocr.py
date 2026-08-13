import sys
from pdf2image import convert_from_path
import pytesseract

def main():
    pdf_path = sys.argv[1]
    pages = convert_from_path(pdf_path, 300)
    for i, page in enumerate(pages):
        print(f"--- PAGE {i+1} ---")
        text = pytesseract.image_to_string(page)
        print(text)

if __name__ == "__main__":
    main()
