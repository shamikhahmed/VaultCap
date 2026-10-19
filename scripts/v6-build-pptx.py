#!/usr/bin/env python3
"""Build VaultCap product + QA decks from real screenshots. Usage: build/qa/v6/.venv/bin/python scripts/v6-build-pptx.py"""
from __future__ import annotations

import os
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "build" / "qa" / "v6" / "presentations"
SHOT = ROOT / "assets" / "screenshots"
MIDNIGHT = RGBColor(0x06, 0x0A, 0x12)
IVORY = RGBColor(0xF4, 0xF6, 0xFA)
GOLD = RGBColor(0xD4, 0xA0, 0x17)
MUTED = RGBColor(0xB8, 0xC0, 0xCC)


def set_bg(slide, rgb):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = rgb


def add_text(slide, left, top, width, height, text, size=28, bold=False, color=IVORY, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.alignment = align
    return box


def add_bullets(slide, left, top, width, height, lines, size=16):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = box.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = line
        p.level = 0
        p.font.size = Pt(size)
        p.font.color.rgb = MUTED
        p.space_after = Pt(6)


def try_pic(slide, rel, left, top, width):
    path = SHOT / rel
    if not path.is_file():
        add_text(slide, left, top, width, 0.4, f"(missing {rel})", size=12, color=MUTED)
        return False
    slide.shapes.add_picture(str(path), Inches(left), Inches(top), width=Inches(width))
    return True


def product_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 2.2, 11, 1, "VaultCap", size=54, bold=True, color=GOLD)
    add_text(s, 0.8, 3.2, 11, 0.6, "Private encrypted life vault", size=24, color=IVORY)
    add_text(s, 0.8, 4.0, 11, 0.4, "v5.3.1 · Capricorn Systems · Offline-first · Not financial advice", size=14, color=MUTED)

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 0.5, 11, 0.6, "The problem", size=32, bold=True, color=GOLD)
    add_bullets(s, 0.8, 1.4, 11, 5, [
        "Banks, cards, documents, and family records live in too many places",
        "Cloud “vaults” mean someone else’s servers hold your life",
        "Expats juggle PK / UK / UAE currencies, zakat, and paperwork",
        "App Review and real users need a safe sample path — without printed PINs",
    ])

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 0.5, 11, 0.6, "What ships", size=32, bold=True, color=GOLD)
    add_bullets(s, 0.8, 1.4, 11, 5, [
        "AES-256-GCM vault on device · PIN/passphrase unlock · no Capricorn account",
        "Finance, identity, family, planning modules in one shell",
        "Optional FX/metals rates (off by default) · AI import web-only",
        "Native iOS: share-sheet backup, print, clipboard expiry, app-switcher cover",
        "Sample vault: Explore → Use sample PIN → Start exploring",
    ])

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 0.4, 12, 0.5, "Product screens (real gallery)", size=28, bold=True, color=GOLD)
    try_pic(s, "dark/mobile/hubs/dashboard.png", 0.5, 1.1, 3.8)
    try_pic(s, "dark/mobile/finance/banks.png", 4.6, 1.1, 3.8)
    try_pic(s, "dark/mobile/identity/documents.png", 8.7, 1.1, 3.8)

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 0.4, 12, 0.5, "Lock · Settings · Light", size=28, bold=True, color=GOLD)
    for rel, x in [
        ("dark/mobile/auth/lock.png", 0.5),
        ("dark/mobile/tools/settings.png", 4.6),
        ("light/mobile/hubs/dashboard.png", 8.7),
    ]:
        try_pic(s, rel, x, 1.1, 3.8)

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 0.5, 11, 0.6, "Devices tested", size=32, bold=True, color=GOLD)
    add_bullets(s, 0.8, 1.4, 11, 5, [
        "iPhone SE → Pro Max / Air / Duo fold+open (WebKit matrix + prior sim)",
        "iPad portrait/landscape + Split View (iPad Pro 12.9 retest open)",
        "MacBook/desktop viewports added to v6 matrix harness",
        "Dynamic Type up to 160% · light/dark · reduced motion",
    ])

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 0.5, 11, 0.6, "Status & limits", size=32, bold=True, color=GOLD)
    add_bullets(s, 0.8, 1.4, 11, 5, [
        "e2e verify ×2: 165 passed (2026-10-19)",
        "App Store pack ready in qa/v6/APP-STORE.md — Finance category",
        "Owner-only: Apple signing, ASC submit, TestFlight device",
        "Face ID + Keychain-wrapped key = design doc only",
        "Not financial advice · indicative rates when enabled",
    ])

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / "VaultCap-product-v6.pptx"
    prs.save(str(path))
    return path


def qa_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 2.4, 11, 1, "VaultCap — Technical QA", size=40, bold=True, color=GOLD)
    add_text(s, 0.8, 3.5, 11, 0.5, "Perfection Loop v6 + Experience Lab · 2026-10-19", size=18, color=MUTED)

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 0.5, 11, 0.5, "Coverage", size=32, bold=True, color=GOLD)
    add_bullets(s, 0.8, 1.3, 11, 5, [
        "Phases A–I complete · J/K in progress",
        "Playwright e2e ×2 green (165 / 3 skip)",
        "Feature matrix + 6 persona scenarios in qa/v6/",
        "FIXED-LIST #1–45 regression baseline",
        "Evidence: build/qa/v6/ (gitignored) · curated qa/v6/",
    ])

    s = prs.slides.add_slide(blank)
    set_bg(s, MIDNIGHT)
    add_text(s, 0.8, 0.5, 11, 0.5, "Open risks", size=32, bold=True, color=GOLD)
    add_bullets(s, 0.8, 1.3, 11, 5, [
        "iPad Pro 12.9 4th gen Network Process crash — retest",
        "iPad Pro 12.9 6th gen not run mid-sweep",
        "WebKit residual WARNs (sub-44 chips, contrast tertiary)",
        "Presentations/videos require gallery + simulator footage",
    ])

    path = OUT / "VaultCap-qa-v6.pptx"
    prs.save(str(path))
    return path


def main():
    p1 = product_deck()
    p2 = qa_deck()
    print(p1)
    print(p2)
    # PDF via pandoc from a short md companion if soffice missing
    md = OUT / "VaultCap-product-v6.md"
    md.write_text(
        "# VaultCap\n\nPrivate encrypted life vault · v5.3.1\n\n"
        "See companion PPTX for screenshot slides. Export PDF with Keynote/PowerPoint when available.\n",
        encoding="utf-8",
    )
    os.system(f'pandoc "{md}" -o "{OUT / "VaultCap-product-v6.pdf"}" 2>/dev/null || true')


if __name__ == "__main__":
    main()
