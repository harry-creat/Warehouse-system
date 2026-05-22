import streamlit as st
import pandas as pd
from utils.db import get_all_products, create_transaction, get_product_by_sku, create_product
from utils.parsers import parse_excel, parse_csv, parse_pdf
from utils.auth import require_auth

def show():
    require_auth()
    st.title("📥 入库管理")

    tab1, tab2 = st.tabs(["手动入库", "文件导入"])

    # --- Manual Entry ---
    with tab1:
        with st.form("manual_stock_in"):
            products = get_all_products()
            product_options = {f"{p['name']} ({p['sku']})": p for p in products}
            selected = st.selectbox("选择产品", options=list(product_options.keys()))
            qty = st.number_input("入库数量", min_value=1, step=1, value=1)
            price = st.number_input("单价（留空使用默认价）", min_value=0.0, step=0.01, value=0.0)
            note = st.text_input("备注", placeholder="如：PO-2024-001")
            submitted = st.form_submit_button("确认入库", type="primary")

            if submitted and selected:
                product = product_options[selected]
                try:
                    create_transaction(
                        "STOCK_IN", product["id"], qty,
                        unit_price=price if price > 0 else None,
                        note=note if note else None,
                        user_id=st.session_state.user["id"],
                        operator_name=st.session_state.user["username"]
                    )
                    st.success(f"✅ 入库成功: {product['name']} x {qty}")
                except Exception as e:
                    st.error(f"入库失败: {e}")

    # --- File Upload ---
    with tab2:
        st.markdown("#### 下载模板")
        # Generate template
        template_df = pd.DataFrame({
            "SKU": ["PRD-001", "PRD-002"],
            "品名/Name": ["螺丝钉", "轴承"],
            "数量/Quantity": [500, 20],
            "单价/UnitPrice": [0.50, 35.00],
            "备注/Note": ["采购入库", "补货入库"]
        })
        from io import BytesIO
        buffer = BytesIO()
        template_df.to_excel(buffer, index=False, engine="openpyxl")
        st.download_button("📥 下载导入模板", buffer.getvalue(), "wms-template.xlsx",
                           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

        st.markdown("---")
        st.markdown("#### 上传文件")
        uploaded = st.file_uploader("选择文件", type=["xlsx", "xls", "csv", "pdf"], key="stock_in_upload")

        if uploaded:
            file_bytes = uploaded.read()
            ext = uploaded.name.rsplit(".", 1)[-1].lower()

            try:
                if ext in ("xlsx", "xls"):
                    rows = parse_excel(file_bytes)
                elif ext == "csv":
                    rows = parse_csv(file_bytes)
                elif ext == "pdf":
                    rows = parse_pdf(file_bytes)
                else:
                    st.error("不支持的文件格式")
                    rows = []

                if rows:
                    df_preview = pd.DataFrame(rows)
                    # Highlight errors
                    df_preview["状态"] = df_preview["errors"].apply(
                        lambda e: "❌ " + ", ".join(e) if e else "✅ 正常"
                    )
                    st.dataframe(df_preview, use_container_width=True)

                    valid = [r for r in rows if not r["errors"]]
                    invalid = len(rows) - len(valid)
                    st.caption(f"有效行: {len(valid)} | 无效行: {invalid}")

                    if st.button("🚀 确认导入所有有效行", type="primary"):
                        success, fail = 0, 0
                        for row in valid:
                            try:
                                product = get_product_by_sku(row["sku"])
                                if not product:
                                    create_product(row["sku"], row.get("name") or row["sku"], "Imported",
                                                   unit_price=row.get("unitPrice") or 0)
                                    product = get_product_by_sku(row["sku"])
                                create_transaction(
                                    "STOCK_IN", product["id"], int(row.get("quantity", 1)),
                                    unit_price=row.get("unitPrice"),
                                    note=row.get("note"),
                                    user_id=st.session_state.user["id"],
                                    operator_name=st.session_state.user["username"]
                                )
                                success += 1
                            except Exception as e:
                                fail += 1
                                st.warning(f"SKU {row['sku']}: {e}")
                        st.success(f"✅ 导入完成: 成功 {success} 行, 失败 {fail} 行")
            except Exception as e:
                st.error(f"解析文件失败: {e}")
