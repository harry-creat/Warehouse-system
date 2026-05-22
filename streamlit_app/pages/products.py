import streamlit as st
import pandas as pd
from utils.db import get_all_products, create_product, update_product, delete_product, get_categories
from utils.auth import require_auth

def show():
    require_auth()
    st.title("🏷️ 产品管理")

    # Only ADMIN can add/edit/delete
    is_admin = st.session_state.user.get("role") == "ADMIN"

    tab1, tab2 = st.tabs(["产品列表", "新增产品"] if is_admin else ["产品列表"])

    with tab1:
        search = st.text_input("搜索", placeholder="SKU 或名称...")
        data = get_all_products(search=search)
        if data:
            df = pd.DataFrame(data)
            col_map = {"sku": "SKU", "name": "名称", "category": "分类", "unit": "单位",
                       "unitPrice": "单价", "minStockLevel": "最低库存", "description": "描述"}
            display_cols = [c for c in col_map if c in df.columns]
            df_display = df[display_cols].rename(columns=col_map)
            st.dataframe(df_display, use_container_width=True)

            if is_admin:
                st.markdown("---")
                st.subheader("编辑或删除产品")
                product_skus = [p["sku"] for p in data]
                selected_sku = st.selectbox("选择要操作的产品", product_skus, key="edit_select")
                product = next((p for p in data if p["sku"] == selected_sku), None)

                if product:
                    col1, col2 = st.columns(2)
                    with col1:
                        new_name = st.text_input("名称", value=product["name"], key="edit_name")
                        new_cat = st.text_input("分类", value=product["category"], key="edit_cat")
                        new_unit = st.text_input("单位", value=product["unit"], key="edit_unit")
                    with col2:
                        new_price = st.number_input("单价", value=float(product["unitPrice"]), step=0.01, key="edit_price")
                        new_min = st.number_input("最低库存", value=int(product["minStockLevel"]), step=1, key="edit_min")

                    col_btn1, col_btn2 = st.columns(2)
                    with col_btn1:
                        if st.button("💾 保存修改", use_container_width=True):
                            update_product(product["id"], {
                                "name": new_name, "category": new_cat, "unit": new_unit,
                                "unitPrice": new_price, "minStockLevel": new_min
                            })
                            st.success("更新成功")
                            st.rerun()
                    with col_btn2:
                        if st.button("🗑️ 删除产品", use_container_width=True, type="secondary"):
                            try:
                                delete_product(product["id"])
                                st.success("删除成功")
                                st.rerun()
                            except Exception as e:
                                st.error(f"删除失败: {e}")
        else:
            st.info("暂无产品")

    if is_admin:
        with tab2:
            with st.form("new_product"):
                st.subheader("新增产品")
                sku = st.text_input("SKU *", placeholder="如 ELEC-004")
                name = st.text_input("名称 *", placeholder="产品名称")
                category = st.text_input("分类 *", placeholder="如 Electronics电子")
                unit = st.text_input("单位", value="pcs")
                price = st.number_input("单价", value=0.0, step=0.01)
                desc = st.text_input("描述")
                min_stock = st.number_input("最低库存", value=10, step=1)
                submitted = st.form_submit_button("创建产品", type="primary")

                if submitted and sku and name and category:
                    try:
                        create_product(sku, name, category, unit, price, desc, min_stock)
                        st.success(f"✅ 创建成功: {name} ({sku})")
                        st.rerun()
                    except Exception as e:
                        st.error(f"创建失败: {e}")
