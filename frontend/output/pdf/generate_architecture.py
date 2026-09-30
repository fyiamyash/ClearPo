from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


OUT = "/Users/yashmeshram/Desktop/projects/clearPo/frontend/output/pdf/ClearPo Architecture.pdf"
W, H = A4
MARGIN = 54
INK = colors.HexColor("#202A33")
BODY = colors.HexColor("#343A40")
MUTED = colors.HexColor("#68717A")
BLUE = colors.HexColor("#315E86")
PALE = colors.HexColor("#F3F6F8")
LINE = colors.HexColor("#D7DDE2")
WHITE = colors.white

styles = {
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=10.5, leading=15.2, textColor=BODY),
    "small": ParagraphStyle("small", fontName="Helvetica", fontSize=9, leading=12.5, textColor=MUTED),
    "step": ParagraphStyle("step", fontName="Helvetica", fontSize=10, leading=14.2, textColor=BODY),
}


def para(c, text, x, top, width, style="body"):
    p = Paragraph(text, styles[style])
    _, height = p.wrap(width, H)
    p.drawOn(c, x, top - height)
    return top - height


def page(c, number):
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(.6)
    c.line(MARGIN, 42, W - MARGIN, 42)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(MARGIN, 27, "ClearPo architecture overview")
    c.drawRightString(W - MARGIN, 27, str(number))


def heading(c, text, x, y, size=16):
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x, y, text)


def section(c, number, name, body, x, top, width):
    c.setFillColor(BLUE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x, top - 11, number)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x + 29, top - 11, name)
    return para(c, body, x + 29, top - 20, width - 29, "step") - 15


def diagram_box(c, x, y, w, h, title, subtitle):
    c.setFillColor(PALE)
    c.setStrokeColor(LINE)
    c.setLineWidth(.8)
    c.roundRect(x, y, w, h, 5, fill=1, stroke=1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 8.3)
    c.drawCentredString(x + w / 2, y + h - 15, title)
    p = Paragraph(subtitle, ParagraphStyle("d", fontName="Helvetica", fontSize=7.1, leading=9, textColor=BODY, alignment=1))
    _, ph = p.wrap(w - 12, h - 20)
    p.drawOn(c, x + 6, y + h - 22 - ph)


def arrow(c, x1, y1, x2, y2):
    c.setStrokeColor(BLUE)
    c.setFillColor(BLUE)
    c.setLineWidth(1.2)
    c.line(x1, y1, x2, y2)
    c.line(x2, y2, x2 - 5, y2 + 3)
    c.line(x2, y2, x2 - 5, y2 - 3)


def architecture_diagram(c, x, y, width):
    heading(c, "Architecture", x, y + 223, 13)
    box_y, box_h, gap = y + 142, 58, 17
    widths = [99, 108, 108, 112]
    titles = ["Invoice PDF", "Express API", "BullMQ queues", "Workers"]
    subtitles = [
        "Uploaded from the browser",
        "Receives files and starts a flow",
        "Jobs and live event messages",
        "Email sync, PDF extraction, reconciliation",
    ]
    xpos = [x]
    for i in range(1, 4):
        xpos.append(xpos[-1] + widths[i - 1] + gap)
    for xx, ww, title_text, subtitle in zip(xpos, widths, titles, subtitles):
        diagram_box(c, xx, box_y, ww, box_h, title_text, subtitle)
    for i in range(3):
        arrow(c, xpos[i] + widths[i] + 2, box_y + box_h / 2, xpos[i + 1] - 4, box_y + box_h / 2)

    dep_y, dep_h, dep_gap = y + 53, 48, 17
    dep_width = (width - dep_gap * 3) / 4
    dependencies = [
        ("Local files", "PDFs are stored on disk"),
        ("PostgreSQL", "Invoice and review data"),
        ("Local model", "Turns PDF text into fields"),
        ("Odoo", "ERP records are checked"),
    ]
    for i, (title_text, subtitle) in enumerate(dependencies):
        diagram_box(c, x + i * (dep_width + dep_gap), dep_y, dep_width, dep_h, title_text, subtitle)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(x, y + 32, "The workers use these services as each invoice moves through the flow.")
    c.drawString(x, y + 15, "The backend also sends live progress to the front end through server sent events.")


c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("ClearPo Architecture Overview")
c.setAuthor("Yash Meshram")

# Page 1: overview and the user's architecture, redrawn for readability.
page(c, 1)
c.setFillColor(BLUE)
c.setFont("Helvetica-Bold", 9)
c.drawString(MARGIN, H - 66, "PROJECT OVERVIEW")
c.setFillColor(INK)
c.setFont("Helvetica-Bold", 25)
c.drawString(MARGIN, H - 101, "ClearPo Invoice Processing")
intro = (
    "I built ClearPo to help review invoices from the time a PDF is uploaded until a decision is made. "
    "The back end is written in TypeScript with Express. It uses background workers for the longer tasks, "
    "so file parsing and invoice checks do not have to happen inside the upload request."
)
para(c, intro, MARGIN, H - 124, W - 2 * MARGIN)
architecture_diagram(c, MARGIN, 346, W - 2 * MARGIN)
heading(c, "How the parts fit together", MARGIN, 315, 12)
para(c, "The API receives the PDF and adds a job to the queue. Workers pick up those jobs, save invoice information in PostgreSQL, and use the PDF parser, local language model, and Odoo when needed. The front end gets invoice details from the API and follows progress through a live event stream.", MARGIN, 298, W - 2 * MARGIN, "small")
c.showPage()

# Page 2: intake and extraction.
page(c, 2)
c.setFillColor(BLUE)
c.setFont("Helvetica-Bold", 9)
c.drawString(MARGIN, H - 66, "HOW AN INVOICE IS PROCESSED")
c.setFillColor(INK)
c.setFont("Helvetica-Bold", 22)
c.drawString(MARGIN, H - 98, "From upload to extracted data")
para(c, "This is the part of the flow that prepares an invoice for reconciliation.", MARGIN, H - 114, W - 2 * MARGIN, "small")

steps = [
    ("01", "Upload the PDF", "The Express upload endpoint accepts a PDF. Right now I use Multer to save the file in the back end's local uploads folder. The upload and its file details are then put on a BullMQ queue."),
    ("02", "Save the invoice record", "The email sync worker picks up the queued file details and creates the initial invoice record in PostgreSQL. This is what lets the front end show a new invoice before extraction has finished."),
    ("03", "Start the flow", "When processing is started, the API gets the invoice record from the database and adds a PDF extraction job to the queue. The worker gets the file location and reads the PDF."),
    ("04", "Read and extract the PDF", "The worker passes the file through a PDF parser to get its text. It sends that text to a small language model running locally and asks for structured invoice fields such as supplier name, invoice number, amount, and purchase order."),
    ("05", "Save the extracted fields", "When the model returns the fields, the worker saves them to PostgreSQL and publishes them to the front end. It also adds the extracted invoice to the reconciliation queue."),
]
cursor = H - 159
for num, name, body in steps:
    cursor = section(c, num, name, body, MARGIN, cursor, W - 2 * MARGIN)

heading(c, "Model choice", MARGIN, cursor - 2, 12)
para(c, "I chose a small local model to keep the project inexpensive to run and to avoid sending invoice text to an external model service. The current configuration uses a quantized Llama 3.2 3B Instruct model.", MARGIN, cursor - 19, W - 2 * MARGIN, "small")
c.showPage()

# Page 3: reconciliation, decisions, and live front end.
page(c, 3)
c.setFillColor(BLUE)
c.setFont("Helvetica-Bold", 9)
c.drawString(MARGIN, H - 66, "RECONCILIATION AND LIVE UPDATES")
c.setFillColor(INK)
c.setFont("Helvetica-Bold", 22)
c.drawString(MARGIN, H - 98, "How the final decision is made")
para(c, "Once extraction is complete, the reconciliation worker compares the invoice with the purchase order and other records in Odoo.", MARGIN, H - 114, W - 2 * MARGIN, "small")

cursor = H - 159
sections = [
    ("01", "Deterministic checks run first", "The worker checks the invoice against the purchase order, supplier, amounts, line items, payment state, and receipt information. These checks always run. When the result is clear, the system can continue without calling the agent."),
    ("02", "The agent investigates unclear cases", "If something is ambiguous, such as a supplier mismatch or a possible duplicate purchase order, the agent can investigate. I connected it to read only Odoo tools so it can look up ERP records but cannot change them or make a payment."),
    ("03", "The policy engine returns a result", "The policy engine uses the reconciliation findings and, when needed, the agent's findings to return a decision and a reason. Depending on the checks, the result can be ready for payment, require review, or be blocked."),
    ("04", "The front end follows the flow", "The front end loads invoice records from the API and listens for server sent events for the selected invoice. Status updates move the journey timeline forward. Extracted data fills in the invoice details, and the final event includes the decision and its reason."),
]
for num, name, body in sections:
    cursor = section(c, num, name, body, MARGIN, cursor, W - 2 * MARGIN)

heading(c, "Current status", MARGIN, cursor - 1, 12)
para(c, "PDFs are stored on local disk in the current version. For production, I plan to move them to blob storage and save the resulting file location with the invoice metadata. Odoo is the ERP connected to the reconciliation flow. Slack integration is still in development.", MARGIN, cursor - 18, W - 2 * MARGIN, "small")
c.save()
print(OUT)
