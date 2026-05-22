import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from utils.db import get_inventory_summary, get_transaction_stats, get_inventory
from utils.auth import require_auth

def show():
    require_auth()
    st.title("📊 仪表盘")
    summary = get_inventory_summary()

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("产品总数", summary["totalProducts"], delta=None)
    col2.metric("库存总量", f"{summary['totalQuantity']:,}", delta=None)
    col3.metric("今日入库", f"{summary['todayIn']:,}", delta=None)
    col4.metric("今日出库", f"{summary['todayOut']:,}", delta=None)

    col1b, col2b = st.columns(2)
    col1b.metric("库存总价值", f"¥{summary['totalValue']:,.2f}")
    col2b.metric("低库存预警", summary["lowStockCount"], delta_color="inverse")

    st.markdown("---")

    # Charts
    stats = get_transaction_stats(30)
    if stats:
        df_stats = pd.DataFrame(stats)
        col_left, col_right = st.columns(2)

        with col_left:
            st.subheader("30日出入库趋势")
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=df_stats["date"], y=df_stats["stockIn"], name="入库", line=dict(color="green")))
            fig.add_trace(go.Scatter(x=df_stats["date"], y=df_stats["stockOut"], name="出库", line=dict(color="red")))
            fig.update_layout(height=300, margin=dict(l=0, r=0, t=0, b=0))
            st.plotly_chart(fig, use_container_width=True)

        with col_right:
            st.subheader("库存分类占比")
            inv_data = get_inventory()
            if inv_data:
                cat_map = {}
                for item in inv_data:
                    cat = item.get("category", "未分类")
                    cat_map[cat] = cat_map.get(cat, 0) + item["currentQuantity"]
                if cat_map:
                    df_cat = pd.DataFrame({"分类": list(cat_map.keys()), "数量": list(cat_map.values())})
                    fig2 = px.pie(df_cat, names="分类", values="数量", height=300)
                    fig2.update_layout(margin=dict(l=0, r=0, t=0, b=0))
                    st.plotly_chart(fig2, use_container_width=True)

    # Low stock alerts
    if summary["lowStockItems"]:
        st.markdown("---")
        st.subheader(f"⚠️ 低库存预警 ({len(summary['lowStockItems'])} 项)")
        df_low = pd.DataFrame(summary["lowStockItems"])
        if not df_low.empty:
            df_low.columns = [c.replace("productName", "产品名称").replace("currentQuantity", "当前库存").replace("minStockLevel", "最低库存").replace("sku", "SKU").replace("unit", "单位") for c in df_low.columns]
            show_cols = [c for c in ["SKU", "产品名称", "当前库存", "最低库存", "单位"] if c in df_low.columns]
            st.dataframe(df_low[show_cols] if show_cols else df_low, use_container_width=True)
