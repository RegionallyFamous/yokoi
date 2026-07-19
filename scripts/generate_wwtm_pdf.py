#!/usr/bin/env python3
"""Build the public Yokoi PDF edition of the WWTM English translation."""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Flowable,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

INK = colors.HexColor("#12112F")
VIOLET = colors.HexColor("#262060")
CREAM = colors.HexColor("#FFF4D6")
PAPER = colors.HexColor("#FFF9E9")
LIME = colors.HexColor("#CCFF36")
CYAN = colors.HexColor("#51E7FF")
PINK = colors.HexColor("#FF75B5")
MUTED = colors.HexColor("#625B8C")
RULE = colors.HexColor("#D8D1C2")


def inline_markup(value: str) -> str:
    escaped = html.escape(value.strip())
    escaped = re.sub(
        r"`([^`]+)`",
        r'<font name="Courier" color="#4937BD">\1</font>',
        escaped,
    )
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", escaped)
    escaped = re.sub(r"\*([^*]+)\*", r"<i>\1</i>", escaped)
    return escaped


class CoverPage(Flowable):
    def __init__(self, width: float, height: float):
        super().__init__()
        self.width = width
        self.height = height

    def wrap(self, available_width: float, available_height: float):
        return available_width, available_height

    def draw(self):
        canvas = self.canv
        width = self.width
        height = self.height

        canvas.saveState()
        canvas.setFillColor(INK)
        canvas.rect(-25 * mm, -25 * mm, width + 50 * mm, height + 50 * mm, fill=1, stroke=0)

        canvas.setStrokeColor(colors.Color(1, 1, 1, alpha=0.07))
        canvas.setLineWidth(0.35)
        step = 12 * mm
        position = -20 * mm
        while position < width + 20 * mm:
            canvas.line(position, -20 * mm, position, height + 20 * mm)
            position += step
        position = -20 * mm
        while position < height + 20 * mm:
            canvas.line(-20 * mm, position, width + 20 * mm, position)
            position += step

        canvas.setFillColor(CYAN)
        canvas.roundRect(0, height - 26 * mm, 70 * mm, 9 * mm, 2 * mm, fill=1, stroke=0)
        canvas.setFillColor(INK)
        canvas.setFont("Courier-Bold", 7.8)
        canvas.drawString(5 * mm, height - 22.4 * mm, "YOKOI TRANSLATION ARCHIVE / 001")

        canvas.setFillColor(CREAM)
        canvas.setFont("Helvetica-Bold", 34)
        title_y = height - 66 * mm
        canvas.drawString(0, title_y, "Wonder Witch")
        canvas.drawString(0, title_y - 14 * mm, "Technical Manual")

        canvas.setFillColor(LIME)
        canvas.setFont("Helvetica-BoldOblique", 21)
        canvas.drawString(0, title_y - 29 * mm, "Technical English translation")

        canvas.setStrokeColor(PINK)
        canvas.setLineWidth(5)
        canvas.line(0, title_y - 39 * mm, width * 0.62, title_y - 39 * mm)

        canvas.setFillColor(CREAM)
        canvas.setFont("Helvetica", 11)
        canvas.drawString(0, title_y - 54 * mm, "Original first edition / interim publication / January 24, 2002")
        canvas.setFillColor(colors.Color(1, 0.957, 0.839, alpha=0.7))
        canvas.setFont("Helvetica", 9.5)
        canvas.drawString(0, title_y - 62 * mm, "Published by Digitalis / written by Atsushi Watanabe")

        note_y = 42 * mm
        canvas.setFillColor(VIOLET)
        canvas.roundRect(0, note_y, width, 42 * mm, 4 * mm, fill=1, stroke=0)
        canvas.setFillColor(CYAN)
        canvas.setFont("Courier-Bold", 8)
        canvas.drawString(7 * mm, note_y + 31 * mm, "ABOUT THIS EDITION")
        canvas.setFillColor(CREAM)
        canvas.setFont("Helvetica", 9.5)
        text = canvas.beginText(7 * mm, note_y + 22 * mm)
        text.setLeading(14)
        for line in (
            "A functional translation of all sections in the supplied 81-page Japanese manual.",
            "Repeated BIOS table labels are compacted; contracts, warnings, and conflicts are retained.",
            "Use as a research reference. The 2002 source itself warns that some claims were untested.",
        ):
            text.textLine(line)
        canvas.drawText(text)

        canvas.setFillColor(PINK)
        canvas.circle(width - 10 * mm, 12 * mm, 2.2 * mm, fill=1, stroke=0)
        canvas.setFillColor(CREAM)
        canvas.setFont("Courier-Bold", 7)
        canvas.drawRightString(width - 16 * mm, 10 * mm, "READ / VERIFY / BUILD")
        canvas.restoreState()


def build_styles():
    base = getSampleStyleSheet()
    return {
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.25,
            leading=13.2,
            textColor=INK,
            spaceAfter=7.5,
            allowWidows=0,
            allowOrphans=0,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=25,
            leading=28,
            textColor=INK,
            spaceBefore=3,
            spaceAfter=12,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=21,
            textColor=VIOLET,
            spaceBefore=14,
            spaceAfter=8,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=15.5,
            textColor=INK,
            borderColor=CYAN,
            borderWidth=0,
            borderPadding=(0, 0, 3, 7),
            leftIndent=0,
            spaceBefore=10,
            spaceAfter=6,
            keepWithNext=True,
        ),
        "table": ParagraphStyle(
            "Table",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.2,
            leading=9.6,
            textColor=INK,
        ),
        "table_head": ParagraphStyle(
            "TableHead",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7,
            leading=8.8,
            textColor=CREAM,
        ),
        "bullet": ParagraphStyle(
            "BulletBody",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.1,
            leading=12.7,
            textColor=INK,
            leftIndent=0,
            spaceAfter=3,
        ),
        "toc": ParagraphStyle(
            "TOC",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=VIOLET,
            spaceAfter=4,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.3,
            leading=11.5,
            textColor=MUTED,
            spaceAfter=8,
        ),
    }


def table_from_lines(lines: list[str], styles: dict, available_width: float):
    rows = []
    for line in lines:
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells):
            continue
        style = styles["table_head"] if not rows else styles["table"]
        rows.append([Paragraph(inline_markup(cell), style) for cell in cells])

    column_count = max(len(row) for row in rows)
    for row in rows:
        row.extend([Paragraph("", styles["table"]) for _ in range(column_count - len(row))])

    raw_rows = [
        [cell.strip() for cell in line.strip().strip("|").split("|")]
        for line in lines
        if not all(
            re.fullmatch(r":?-{3,}:?", cell)
            for cell in line.strip().strip("|").split("|")
        )
    ]
    weights = []
    for column in range(column_count):
        longest = max((len(row[column]) if column < len(row) else 0) for row in raw_rows)
        weights.append(max(8, min(longest, 46)))
    total_weight = sum(weights)
    widths = [available_width * weight / total_weight for weight in weights]

    table = Table(rows, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), VIOLET),
                ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
                ("BACKGROUND", (0, 1), (-1, -1), PAPER),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [PAPER, colors.white]),
                ("GRID", (0, 0), (-1, -1), 0.35, RULE),
                ("BOX", (0, 0), (-1, -1), 0.8, INK),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def markdown_story(source: str, styles: dict, available_width: float):
    lines = source.splitlines()
    story = []
    paragraph_lines: list[str] = []
    list_lines: list[tuple[str, str]] = []
    index = 0

    def flush_paragraph():
        if paragraph_lines:
            joined = " ".join(line.strip() for line in paragraph_lines)
            story.append(Paragraph(inline_markup(joined), styles["body"]))
            paragraph_lines.clear()

    def flush_list():
        if not list_lines:
            return
        ordered = list_lines[0][0] == "ordered"
        items = [
            ListItem(Paragraph(inline_markup(text), styles["bullet"]), leftIndent=8)
            for _, text in list_lines
        ]
        list_options = {"start": "1"} if ordered else {"bulletChar": "bullet"}
        story.append(
            ListFlowable(
                items,
                bulletType="1" if ordered else "bullet",
                leftIndent=16,
                bulletFontName="Helvetica-Bold",
                bulletFontSize=8,
                bulletColor=PINK if ordered else VIOLET,
                spaceAfter=6,
                **list_options,
            )
        )
        list_lines.clear()

    while index < len(lines):
        line = lines[index].rstrip()

        if line.startswith("|"):
            flush_paragraph()
            flush_list()
            table_lines = []
            while index < len(lines) and lines[index].lstrip().startswith("|"):
                table_lines.append(lines[index])
                index += 1
            story.append(table_from_lines(table_lines, styles, available_width))
            story.append(Spacer(1, 8))
            continue

        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        if heading:
            flush_paragraph()
            flush_list()
            level = len(heading.group(1))
            title = inline_markup(heading.group(2))
            story.append(Paragraph(title, styles[f"h{level}"]))
            index += 1
            continue

        ordered = re.match(r"^(\d+)\.\s+(.+)$", line)
        bullet = re.match(r"^-\s+(.+)$", line)
        if ordered or bullet:
            flush_paragraph()
            kind = "ordered" if ordered else "bullet"
            text = ordered.group(2) if ordered else bullet.group(1)
            list_lines.append((kind, text))
            index += 1
            continue

        if not line.strip():
            flush_paragraph()
            flush_list()
        else:
            if list_lines:
                kind, prior = list_lines[-1]
                list_lines[-1] = (kind, f"{prior} {line.strip()}")
            else:
                paragraph_lines.append(line)
        index += 1

    flush_paragraph()
    flush_list()
    return story


def draw_page(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    width, height = A4
    if page > 1:
        canvas.setStrokeColor(RULE)
        canvas.setLineWidth(0.5)
        canvas.line(doc.leftMargin, height - 15 * mm, width - doc.rightMargin, height - 15 * mm)
        canvas.setFillColor(MUTED)
        canvas.setFont("Courier-Bold", 6.8)
        canvas.drawString(doc.leftMargin, height - 11 * mm, "YOKOI / TRANSLATION ARCHIVE / WWTM")
        canvas.setFillColor(INK)
        canvas.drawRightString(width - doc.rightMargin, 10 * mm, f"{page - 1:02d}")
        canvas.setFillColor(PINK)
        canvas.circle(width - doc.rightMargin - 9 * mm, 9.4 * mm, 1.2 * mm, fill=1, stroke=0)
    canvas.restoreState()


def build_pdf(source_path: Path, output_path: Path):
    source = source_path.read_text(encoding="utf-8")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    page_width, page_height = A4
    margin_x = 24 * mm
    margin_top = 22 * mm
    margin_bottom = 20 * mm
    content_width = page_width - 2 * margin_x
    content_height = page_height - margin_top - margin_bottom
    styles = build_styles()

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=margin_x,
        leftMargin=margin_x,
        topMargin=margin_top,
        bottomMargin=margin_bottom,
        title="Wonder Witch Technical Manual - Technical English Translation",
        author="Atsushi Watanabe / English technical translation prepared for Yokoi",
        subject="WonderWitch BIOS, FreyaOS, and development reference",
        creator="Yokoi Translation Archive",
    )

    headings = [
        line[3:].strip()
        for line in source.splitlines()
        if line.startswith("## ")
    ]

    story = [CoverPage(content_width, content_height), PageBreak()]
    story.extend(
        [
            Paragraph("Contents", styles["h1"]),
            Paragraph(
                "The printed-page references follow the original Japanese manual. "
                "This PDF is a compact English technical edition, so its pagination differs.",
                styles["small"],
            ),
        ]
    )
    story.extend(Paragraph(inline_markup(title), styles["toc"]) for title in headings)
    story.extend([PageBreak()])
    story.extend(markdown_story(source, styles, content_width))

    doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    build_pdf(args.source.resolve(), args.output.resolve())


if __name__ == "__main__":
    main()
