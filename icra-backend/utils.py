import os
import shutil
from datetime import datetime

from fastapi import UploadFile
from fpdf import FPDF

# Setup Upload Directory
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    """Saves an uploaded file to the local disk"""
    try:
        file_path = os.path.join(UPLOAD_DIR, destination)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        return file_path
    finally:
        upload_file.file.close()


class PDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 12)
        self.cell(0, 10, "ICRA Insurance Invoice", 0, 1, "C")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", 0, 0, "C")


def generate_invoice_pdf(user_name, policy_name, premium, date, invoice_id):
    """Generates a PDF invoice and returns the file path"""
    pdf = PDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Invoice Details
    pdf.cell(200, 10, txt=f"Invoice ID: {invoice_id}", ln=True)
    pdf.cell(200, 10, txt=f"Date: {date}", ln=True)
    pdf.cell(200, 10, txt=f"Billed To: {user_name}", ln=True)
    pdf.ln(10)

    # Table Header
    pdf.set_fill_color(200, 220, 255)
    pdf.cell(100, 10, "Policy Name", 1, 0, "L", 1)
    pdf.cell(50, 10, "Term", 1, 0, "C", 1)
    pdf.cell(40, 10, "Amount", 1, 1, "R", 1)

    # Table Content
    pdf.cell(100, 10, policy_name, 1)
    pdf.cell(50, 10, "1 Year", 1, 0, "C")
    pdf.cell(40, 10, f"Rs. {premium}", 1, 1, "R")

    # Total
    pdf.set_font("Arial", "B", 12)
    pdf.cell(150, 10, "Total Paid", 1, 0, "R")
    pdf.cell(40, 10, f"Rs. {premium}", 1, 1, "R")

    filename = f"invoice_{invoice_id}.pdf"
    filepath = os.path.join(UPLOAD_DIR, filename)
    pdf.output(filepath)
    return filepath

