"""Factura PDF generată în cod — NU factura Stripe.

Emisă de webhook (app/webhooks.py) după checkout.session.completed și
atașată emailului de confirmare trimis prin Resend. Numerotarea e
secvențială și atomică prin colecția `counters` (next_sequence), iar
fiecare factură emisă e arhivată în colecția `invoices` ca să existe
evidența cerută de contabilitate chiar dacă emailul se pierde.

Datele vânzătorului vin din env (COMPANY_*, vezi app/config.py) — până
sunt completate pe Render, pe factură apar placeholder-ele din
artifacts/corcodusa/src/lib/company-info.ts.

PDF-ul folosește fonturile core (helvetica, latin-1), deci textul e
trecut prin _ascii() — diacriticele românești (ă î ș ț â) nu există în
latin-1 și ar crăpa altfel randarea.
"""

import unicodedata
from datetime import datetime, timezone

from fpdf import FPDF

from app.config import (
    COMPANY_ADDRESS,
    COMPANY_CUI,
    COMPANY_EMAIL,
    COMPANY_LEGAL_NAME,
    COMPANY_REG_COM,
    INVOICE_SERIES,
)
from app.db import get_database
from app.models.counter import next_sequence

_PLAN_LABELS = {
    "month": "Abonament Games Corcodusa - lunar (30 de zile)",
    "year": "Abonament Games Corcodusa - anual (365 de zile)",
}


def _ascii(text: str) -> str:
    decomposed = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in decomposed if not unicodedata.combining(ch))


def _amount_str(amount_minor: int, currency: str) -> str:
    return f"{amount_minor / 100:.2f} {currency.upper()}"


def _build_pdf(
    invoice_no: str,
    issued_at: datetime,
    buyer_name: str,
    buyer_email: str,
    plan_label: str,
    amount_minor: int,
    currency: str,
    expires_at: datetime,
) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    left = pdf.l_margin

    pdf.set_font("helvetica", "B", 22)
    pdf.cell(0, 12, "FACTURA", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 11)
    pdf.cell(0, 6, _ascii(f"Seria {INVOICE_SERIES} nr. {invoice_no}"), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, _ascii(f"Data emiterii: {issued_at.strftime('%d.%m.%Y')}"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    col_w = (pdf.w - pdf.l_margin - pdf.r_margin) / 2
    top = pdf.get_y()
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(col_w, 6, "Furnizor", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    for line in (
        COMPANY_LEGAL_NAME,
        f"CUI: {COMPANY_CUI}",
        f"Reg. Com.: {COMPANY_REG_COM}",
        COMPANY_ADDRESS,
        COMPANY_EMAIL,
    ):
        pdf.cell(col_w, 5, _ascii(line), new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(left + col_w, top)
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(col_w, 6, "Cumparator", new_x="LEFT", new_y="NEXT")
    pdf.set_font("helvetica", "", 10)
    for line in (buyer_name, buyer_email):
        pdf.cell(col_w, 5, _ascii(line), new_x="LEFT", new_y="NEXT")
    pdf.ln(10)

    pdf.set_font("helvetica", "B", 10)
    widths = (110, 15, 30, 30)
    for w, header in zip(widths, ("Denumire produs / serviciu", "Cant.", "Pret unitar", "Valoare")):
        pdf.cell(w, 7, header, border=1)
    pdf.ln()
    pdf.set_font("helvetica", "", 10)
    row = (_ascii(plan_label), "1", _amount_str(amount_minor, currency), _amount_str(amount_minor, currency))
    for w, value in zip(widths, row):
        pdf.cell(w, 7, value, border=1)
    pdf.ln(12)

    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 7, _ascii(f"Total de plata: {_amount_str(amount_minor, currency)}"), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    pdf.set_font("helvetica", "", 10)
    for line in (
        f"Platit integral cu cardul prin Stripe la data de {issued_at.strftime('%d.%m.%Y')}.",
        f"Valabilitate abonament: pana la {expires_at.strftime('%d.%m.%Y')}.",
        "Acces: https://games.corcodusa.ro",
    ):
        pdf.cell(0, 5, _ascii(line), new_x="LMARGIN", new_y="NEXT")

    return bytes(pdf.output())


async def create_invoice(
    *,
    clerk_id: str,
    buyer_name: str,
    buyer_email: str,
    interval: str | None,
    amount_minor: int,
    currency: str,
    expires_at: datetime,
    stripe_session_id: str | None,
) -> tuple[str, bytes]:
    """Alocă următorul număr de factură, generează PDF-ul și arhivează
    emiterea în colecția `invoices`. Returnează (număr, bytes PDF)."""
    seq = await next_sequence("invoices")
    invoice_no = f"{seq:04d}"
    issued_at = datetime.now(timezone.utc)
    plan_label = _PLAN_LABELS.get(interval or "", _PLAN_LABELS["month"])

    pdf_bytes = _build_pdf(
        invoice_no=invoice_no,
        issued_at=issued_at,
        buyer_name=buyer_name,
        buyer_email=buyer_email,
        plan_label=plan_label,
        amount_minor=amount_minor,
        currency=currency,
        expires_at=expires_at,
    )

    await get_database()["invoices"].insert_one(
        {
            "series": INVOICE_SERIES,
            "number": invoice_no,
            "issuedAt": issued_at,
            "clerkId": clerk_id,
            "buyerName": buyer_name,
            "buyerEmail": buyer_email,
            "planInterval": interval,
            "amount": amount_minor,
            "currency": currency.lower(),
            "subscriptionExpiresAt": expires_at,
            "stripeSessionId": stripe_session_id,
        }
    )
    return f"{INVOICE_SERIES}-{invoice_no}", pdf_bytes
