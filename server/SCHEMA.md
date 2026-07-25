# Google Sheets CRM Schema Documentation

## Overview
This document specifies the explicit schema, field specifications, data types, and date format rules for the Collections Agent Google Sheets CRM dataset (`https://docs.google.com/spreadsheets/d/19Fz-qRFjfmwldXyCupjLGOzoS5o0pOZ_NwUnAnIZEXU/gviz/tq?tqx=out:csv`).

## Field Specifications

| Column Name | Data Type | Required | Pattern / Format | Description |
|-------------|-----------|----------|------------------|-------------|
| `Invoice ID` | String | Yes | `INV-\d+` (e.g., `INV-1001`) | Unique invoice identifier |
| `Client Name` | String | Yes | Non-empty string | Name of client or company |
| `Client Email` | String | Yes | Valid email address | Client email address |
| `Amount` | Number | Yes | Numeric float >= 0 | Invoice total amount |
| `Due Date` | String | Yes | `DD-MM-YYYY` (e.g., `15-07-2026`) | Payment due date |
| `Status` | String | Yes | `unpaid`, `paid`, etc. | Invoice lifecycle status |
| `Payment Link` | String | No | Valid URL | Payment gateway / portal link |
| `Notes` | String | No | Free-form text | Additional service notes |

## Date Structure Rules (`DD-MM-YYYY`)
- **Format**: `DD-MM-YYYY`
- **Day (`DD`)**: Two digits (`01` to `31`)
- **Month (`MM`)**: Two digits (`01` to `12`)
- **Year (`YYYY`)**: Four digits (`2026`, etc.)
- **Separator**: Hyphen (`-`)
- **Example**: `20-07-2026` represents July 20, 2026.
- **Parsing Rule**: Split by hyphen into `[day, month, year]`, instantiate Date via `new Date(year, month - 1, day)`.
