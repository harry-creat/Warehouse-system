import sqlite3
import os
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backend", "dev.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def get_all_products(search="", category=""):
    conn = get_conn()
    q = "SELECT * FROM Product WHERE 1=1"
    params = []
    if search:
        q += " AND (name LIKE ? OR sku LIKE ?)"
        params += [f"%{search}%", f"%{search}%"]
    if category:
        q += " AND category = ?"
        params.append(category)
    q += " ORDER BY createdAt DESC"
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_product_by_sku(sku):
    conn = get_conn()
    row = conn.execute("SELECT * FROM Product WHERE sku = ?", [sku]).fetchone()
    conn.close()
    return dict(row) if row else None

def create_product(sku, name, category, unit="pcs", unit_price=0, description="", min_stock=10):
    conn = get_conn()
    conn.execute(
        "INSERT INTO Product (id, sku, name, category, unit, unitPrice, description, minStockLevel, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [f"prod_{int(datetime.now().timestamp()*1000)}", sku, name, category, unit, unit_price, description, min_stock, datetime.now().isoformat(), datetime.now().isoformat()]
    )
    conn.commit()
    conn.close()

def update_product(product_id, data):
    conn = get_conn()
    sets = ", ".join(f"{k} = ?" for k in data.keys())
    vals = list(data.values()) + [product_id]
    conn.execute(f"UPDATE Product SET {sets}, updatedAt = ? WHERE id = ?", vals + [datetime.now().isoformat()])
    conn.commit()
    conn.close()

def delete_product(product_id):
    conn = get_conn()
    conn.execute("DELETE FROM Product WHERE id = ?", [product_id])
    conn.commit()
    conn.close()

def get_categories():
    conn = get_conn()
    rows = conn.execute("SELECT DISTINCT category FROM Product ORDER BY category").fetchall()
    conn.close()
    return [r["category"] for r in rows]

def get_inventory(search="", category="", low_stock_only=False):
    conn = get_conn()
    q = """SELECT i.*, p.sku, p.name as productName, p.category, p.unit, p.unitPrice, p.minStockLevel
           FROM Inventory i JOIN Product p ON i.productId = p.id WHERE 1=1"""
    params = []
    if search:
        q += " AND (p.name LIKE ? OR p.sku LIKE ?)"
        params += [f"%{search}%", f"%{search}%"]
    if category:
        q += " AND p.category = ?"
        params.append(category)
    q += " ORDER BY i.lastUpdatedAt DESC"
    rows = conn.execute(q, params).fetchall()
    conn.close()

    result = []
    for r in rows:
        d = dict(r)
        d["availableQuantity"] = d["currentQuantity"] - d["reservedQuantity"]
        if low_stock_only and d["currentQuantity"] > d["minStockLevel"]:
            continue
        result.append(d)
    return result

def get_inventory_summary():
    conn = get_conn()
    total_products = conn.execute("SELECT COUNT(*) as c FROM Product").fetchone()["c"]
    inv_rows = conn.execute("SELECT i.currentQuantity, p.unitPrice FROM Inventory i JOIN Product p ON i.productId = p.id").fetchall()
    total_qty = sum(r["currentQuantity"] for r in inv_rows)
    total_value = sum(r["currentQuantity"] * r["unitPrice"] for r in inv_rows)

    today = datetime.now().strftime("%Y-%m-%d")
    today_in = conn.execute("SELECT COALESCE(SUM(quantity),0) as c FROM Transaction WHERE type='STOCK_IN' AND date(createdAt)=?", [today]).fetchone()["c"]
    today_out = conn.execute("SELECT COALESCE(SUM(quantity),0) as c FROM Transaction WHERE type='STOCK_OUT' AND date(createdAt)=?", [today]).fetchone()["c"]

    # Low stock
    low_items = []
    for r in inv_rows:
        pass
    rows = conn.execute("SELECT i.*, p.sku, p.name as productName, p.minStockLevel, p.unit FROM Inventory i JOIN Product p ON i.productId = p.id").fetchall()
    for r in rows:
        d = dict(r)
        if d["currentQuantity"] <= d["minStockLevel"]:
            low_items.append(d)

    conn.close()
    return {
        "totalProducts": total_products,
        "totalQuantity": total_qty,
        "totalValue": total_value,
        "lowStockCount": len(low_items),
        "todayIn": today_in,
        "todayOut": today_out,
        "lowStockItems": low_items,
    }

def create_transaction(type_, product_id, quantity, unit_price=None, user_id=None, note="", operator_name="system"):
    conn = get_conn()
    # Get product default price if not provided
    if unit_price is None:
        p = conn.execute("SELECT unitPrice FROM Product WHERE id=?", [product_id]).fetchone()
        unit_price = float(p["unitPrice"]) if p else 0
    total_amount = quantity * unit_price

    tx_id = f"tx_{int(datetime.now().timestamp()*1000)}_{random.randint(1000,9999)}"
    conn.execute(
        "INSERT INTO Transaction (id, type, productId, quantity, unitPrice, totalAmount, operator, userId, note, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [tx_id, type_, product_id, quantity, unit_price, total_amount, operator_name, user_id, note, datetime.now().isoformat()]
    )

    # Update inventory
    inv = conn.execute("SELECT * FROM Inventory WHERE productId=?", [product_id]).fetchone()
    qty_change = quantity if type_ == "STOCK_IN" else -quantity
    if inv:
        conn.execute("UPDATE Inventory SET currentQuantity = currentQuantity + ?, lastUpdatedAt = ? WHERE id = ?",
                     [qty_change, datetime.now().isoformat(), inv["id"]])
    elif type_ == "STOCK_IN":
        inv_id = f"inv_{int(datetime.now().timestamp()*1000)}"
        conn.execute(
            "INSERT INTO Inventory (id, productId, warehouseLocation, currentQuantity, lastUpdatedAt) VALUES (?,?,?,?,?)",
            [inv_id, product_id, "A-01", quantity, datetime.now().isoformat()]
        )
    conn.commit()
    conn.close()
    return tx_id

def get_transactions(page=1, limit=20, type_=None, start_date=None, end_date=None):
    conn = get_conn()
    q = """SELECT t.*, p.sku, p.name as productName
           FROM Transaction t JOIN Product p ON t.productId = p.id WHERE 1=1"""
    params = []
    if type_:
        q += " AND t.type = ?"
        params.append(type_)
    if start_date:
        q += " AND date(t.createdAt) >= ?"
        params.append(start_date)
    if end_date:
        q += " AND date(t.createdAt) <= ?"
        params.append(end_date)

    count_q = q.replace("SELECT t.*, p.sku, p.name as productName", "SELECT COUNT(*) as c")
    total = conn.execute(count_q, params).fetchone()["c"]

    q += " ORDER BY t.createdAt DESC LIMIT ? OFFSET ?"
    params += [limit, (page - 1) * limit]
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return [dict(r) for r in rows], total

def get_transaction_stats(days=30):
    conn = get_conn()
    since = (datetime.now() - timedelta(days=days)).isoformat()
    rows = conn.execute(
        "SELECT date(createdAt) as date, type, SUM(quantity) as qty, SUM(totalAmount) as amt FROM Transaction WHERE createdAt >= ? GROUP BY date(createdAt), type ORDER BY date",
        [since]
    ).fetchall()
    conn.close()

    daily = {}
    for r in rows:
        d = dict(r)
        if d["date"] not in daily:
            daily[d["date"]] = {"date": d["date"], "stockIn": 0, "stockOut": 0, "stockInAmount": 0, "stockOutAmount": 0}
        if d["type"] == "STOCK_IN":
            daily[d["date"]]["stockIn"] = int(d["qty"])
            daily[d["date"]]["stockInAmount"] = float(d["amt"])
        else:
            daily[d["date"]]["stockOut"] = int(d["qty"])
            daily[d["date"]]["stockOutAmount"] = float(d["amt"])
    return sorted(daily.values(), key=lambda x: x["date"])
