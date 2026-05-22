import streamlit as st
import pandas as pd
from utils.db import get_inventory, get_categories
from utils.auth import require_auth

def show():
    require_auth()
    st.title("📦 库存管理")

    col1, col2, col3 = st.columns([3, 2, 1])
    with col1:
        search = st.text_input("搜索 SKU 或产品名称", placeholder="输入关键词...")
    with col2:
        categories = get_categories()
        category = st.selectbox("分类筛选", ["全部"] + categories)
    with col3:
        low_only = st.checkbox("仅低库存")

    data = get_inventory(
        search=search,
        category="" if category == "全部" else category,
        low_stock_only=low_only
    )

    if data:
        df = pd.DataFrame(data)
        # Select and rename columns
        col_map = {
            "sku": "SKU", "productName": "产品名称", "category": "分类",
            "warehouseLocation": "库位", "currentQuantity": "当前库存",
            "availableQuantity": "可用数量", "unit": "单位", "unitPrice": "单价"
        }
        df_display = df[[c for c in col_map.keys() if c in df.columns]].rename(columns=col_map)
        if "单价" in df_display.columns and "当前库存" in df_display.columns:
            df_display["库存价值"] = df_display["当前库存"] * df["unitPrice"]

        # Color low-stock rows
        def highlight_low(row):
            if row.get("当前库存", 999) <= df.iloc[row.name]["minStockLevel"] if "minStockLevel" in df.columns else 0:
                return ['background-color: #fff3cd'] * len(row)
            return [''] * len(row)

        st.dataframe(df_display.style.apply(highlight_low, axis=1), use_container_width=True, height=500)

        # Export button
        csv = df_display.to_csv(index=False).encode('utf-8')
        st.download_button("📥 导出 CSV", csv, f"inventory_{pd.Timestamp.now().strftime('%Y%m%d')}.csv", "text/csv")
    else:
        st.info("暂无库存记录")
