import pandas as pd
import io

def parse_excel(file_bytes) -> list[dict]:
    df = pd.read_excel(io.BytesIO(file_bytes))
    return normalize_df(df)

def parse_csv(file_bytes) -> list[dict]:
    df = pd.read_csv(io.StringIO(file_bytes.decode('utf-8')))
    return normalize_df(df)

def parse_pdf(file_bytes) -> list[dict]:
    from PyPDF2 import PdfReader
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    rows = []
    import re
    sku_pattern = re.compile(r'[A-Z]{2,5}-\d{3,5}')
    for line in text.split('\n'):
        skus = sku_pattern.findall(line)
        if not skus:
            continue
        nums = re.findall(r'\d+(?:\.\d+)?', line)
        for sku in skus:
            rows.append({
                "sku": sku,
                "name": "",
                "quantity": float(nums[0]) if nums else 0,
                "unitPrice": float(nums[1]) if len(nums) > 1 else None,
                "note": "PDF提取 (精度有限)",
                "errors": []
            })
    return rows

def normalize_df(df: pd.DataFrame) -> list[dict]:
    col_map = {}
    for col in df.columns:
        cl = str(col).lower().strip()
        if 'sku' in cl or cl == 'productcode':
            col_map[col] = 'sku'
        elif 'name' in cl or '品名' in cl or 'product' in cl:
            col_map[col] = 'name'
        elif 'quantity' in cl or 'qty' in cl or '数量' in cl:
            col_map[col] = 'quantity'
        elif 'price' in cl or '单价' in cl:
            col_map[col] = 'unitPrice'
        elif 'note' in cl or 'remark' in cl or '备注' in cl:
            col_map[col] = 'note'

    df = df.rename(columns=col_map)
    results = []
    for _, row in df.iterrows():
        item = {
            "sku": str(row.get("sku", "")).strip(),
            "name": str(row.get("name", "")).strip(),
            "quantity": float(row.get("quantity", 0)) if pd.notna(row.get("quantity")) else 0,
            "unitPrice": float(row.get("unitPrice")) if pd.notna(row.get("unitPrice")) else None,
            "note": str(row.get("note", "")).strip(),
            "errors": []
        }
        if not item["sku"] or item["sku"] == "nan":
            item["errors"].append("缺少 SKU")
        if item["quantity"] <= 0:
            item["errors"].append("数量无效 (必须 > 0)")
        results.append(item)
    return results
