import streamlit as st
import pandas as pd
from utils.db import get_all_products, create_transaction, get_product_by_sku, create_product, get_inventory
from utils.parsers import parse_excel, parse_csv, parse_pdf
from utils.auth import require_auth

def show():
    require_auth()
    st.title("📤 出库管理")

    tab1, tab2 = st.tabs(["手动出库", "文件导入"])

    with tab1:
        with st.form("manual_stock_out"):
            products = get_all_products()
            product_options = {f"{p['name']} ({p['sku']})": p for p in products}
            selected = st.selectbox("选择产品", options=list(product_options.keys()))

            # Show available qty
            if selected:
                product = product_options[selected]
                inv_items = [i for i in get_inventory() if i.get("productId") == product["id"]]
                available = inv_items[0]["availableQuantity"] if inv_items else 0
                st.caption(f"可用库存: {available}")

            qty = st.number_input("出库数量", min_value=1, step=1, value=1)
            price = st.number_input("单价（留空使用默认价）", min_value=0.0, step=0.01, value=0.0)
            note = st.text_input("备注")
            submitted = st.form_submit_button("确认出库", type="primary")

            if submitted and selected:
                product = product_options[selected]
                inv_items = [i for i in get_inventory() if i.get("productId") == product["id"]]
                available = inv_items[0]["availableQuantity"] if inv_items else 0
                if qty > available:
                    st.error(f"库存不足: 需要 {qty}, 可用 {available}")
                else:
                    try:
                        create_transaction(
                            "STOCK_OUT", product["id"], qty,
                            unit_price=price if price > 0 else None,
                            note=note if note else None,
                            user_id=st.session_state.user["id"],
                            operator_name=st.session_state.user["username"]
                        )
                        st.success(f"✅ 出库成功: {product['name']} x {qty}")
                    except Exception as e:
                        st.error(f"出库失败: {e}")

    with tab2:
        st.markdown("#### 上传文件")
        uploaded = st.file_uploader("选择文件", type=["xlsx", "xls", "csv", "pdf"], key="stock_out_upload")

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
                    df_preview["状态"] = df_preview["errors"].apply(
                        lambda e: "❌ " + ", ".join(e) if e else "✅ 正常"
                    )
                    st.dataframe(df_preview, use_container_width=True)

                    valid = [r for r in rows if not r["errors"]]
                    st.caption(f"有效行: {len(valid)} | 无效行: {len(rows) - len(valid)}")

                    if st.button("🚀 确认导入所有有效行", type="primary"):
                        success, fail = 0, 0
                        for row in valid:
                            try:
                                product = get_product_by_sku(row["sku"])
                                if not product:
                                    st.warning(f"SKU {row['sku']} 不存在，跳过")
                                    fail += 1
                                    continue
                                create_transaction(
                                    "STOCK_OUT", product["id"], int(row.get("quantity", 1)),
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
