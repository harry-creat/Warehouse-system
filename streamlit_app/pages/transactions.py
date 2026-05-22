import streamlit as st
import pandas as pd
from utils.db import get_transactions
from utils.auth import require_auth

def show():
    require_auth()
    st.title("📋 交易记录")

    col1, col2, col3 = st.columns(3)
    with col1:
        type_filter = st.selectbox("类型", ["全部", "STOCK_IN", "STOCK_OUT"])
    with col2:
        start_date = st.date_input("开始日期", value=None)
    with col3:
        end_date = st.date_input("结束日期", value=None)

    page = st.number_input("页码", min_value=1, value=1)
    data, total = get_transactions(
        page=page, limit=20,
        type_=None if type_filter == "全部" else type_filter,
        start_date=start_date.isoformat() if start_date else None,
        end_date=end_date.isoformat() if end_date else None,
    )

    st.caption(f"共 {total} 条记录，当前第 {page} 页 (显示 {len(data)} 条)")

    if data:
        df = pd.DataFrame(data)
        type_labels = {"STOCK_IN": "入库", "STOCK_OUT": "出库"}
        df["类型"] = df["type"].map(type_labels)
        df["时间"] = df["createdAt"].str[:16] if "createdAt" in df.columns else ""

        col_map = {"类型": "类型", "productName": "产品", "sku": "SKU", "quantity": "数量",
                   "unitPrice": "单价", "totalAmount": "总金额", "operator": "操作人", "note": "备注", "时间": "时间"}
        display_cols = [c for c in col_map if c in df.columns]
        df_display = df[display_cols].rename(columns=col_map)

        # Color code
        def color_type(val):
            if val == "入库":
                return 'color: green; font-weight: bold'
            elif val == "出库":
                return 'color: red; font-weight: bold'
            return ''

        st.dataframe(df_display.style.applymap(color_type, subset=["类型"] if "类型" in df_display.columns else []),
                     use_container_width=True, height=500)

        csv = df_display.to_csv(index=False).encode('utf-8')
        st.download_button("📥 导出 CSV", csv, "transactions.csv", "text/csv")
    else:
        st.info("暂无交易记录")
