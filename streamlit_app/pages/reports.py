import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from utils.db import get_inventory_summary, get_transaction_stats, get_inventory, get_transactions
from utils.auth import require_auth

def show():
    require_auth()
    st.title("📈 报表分析")

    days = st.selectbox("时间范围", [7, 14, 30, 60, 90], index=2)

    summary = get_inventory_summary()
    stats = get_transaction_stats(days)

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("库存总价值", f"¥{summary['totalValue']:,.2f}")
    col2.metric("库存总量", f"{summary['totalQuantity']:,}")
    col3.metric("低库存项", summary["lowStockCount"])
    col4.metric("总产品数", summary["totalProducts"])

    st.markdown("---")

    if stats:
        df_stats = pd.DataFrame(stats)
        col_left, col_right = st.columns(2)

        with col_left:
            st.subheader(f"{days}日出入库趋势")
            fig = go.Figure()
            fig.add_trace(go.Scatter(x=df_stats["date"], y=df_stats["stockIn"], name="入库", line=dict(color="green")))
            fig.add_trace(go.Scatter(x=df_stats["date"], y=df_stats["stockOut"], name="出库", line=dict(color="red")))
            fig.update_layout(height=350, margin=dict(l=0, r=0, t=0, b=0))
            st.plotly_chart(fig, use_container_width=True)

        with col_right:
            st.subheader("交易量柱状图")
            fig2 = go.Figure()
            fig2.add_trace(go.Bar(x=df_stats["date"], y=df_stats["stockIn"], name="入库", marker_color="green"))
            fig2.add_trace(go.Bar(x=df_stats["date"], y=df_stats["stockOut"], name="出库", marker_color="red"))
            fig2.update_layout(height=350, margin=dict(l=0, r=0, t=0, b=0), barmode="group")
            st.plotly_chart(fig2, use_container_width=True)

    # Category distribution
    st.markdown("---")
    st.subheader("库存分类占比")
    inv_data = get_inventory()
    if inv_data:
        cat_map = {}
        for item in inv_data:
            cat = item.get("category", "未分类")
            cat_map[cat] = cat_map.get(cat, 0) + item["currentQuantity"]
        if cat_map:
            df_cat = pd.DataFrame({"分类": list(cat_map.keys()), "数量": list(cat_map.values())})
            fig3 = px.pie(df_cat, names="分类", values="数量", height=400)
            st.plotly_chart(fig3, use_container_width=True)

    # Export report
    st.markdown("---")
    st.subheader("导出报表")
    if st.button("📥 生成完整报表 Excel"):
        from io import BytesIO

        buffer = BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            # Summary sheet
            pd.DataFrame([{
                "指标": "产品总数", "数值": summary["totalProducts"]},
                {"指标": "库存总量", "数值": summary["totalQuantity"]},
                {"指标": "库存总价值", "数值": f"¥{summary['totalValue']:,.2f}"},
                {"指标": "今日入库", "数值": summary["todayIn"]},
                {"指标": "今日出库", "数值": summary["todayOut"]},
                {"指标": "低库存预警", "数值": summary["lowStockCount"]},
            ]).to_excel(writer, sheet_name="Summary", index=False)

            # Inventory
            inv_df = pd.DataFrame(inv_data)
            inv_df.to_excel(writer, sheet_name="Inventory", index=False)

            # Transactions
            tx_data, _ = get_transactions(limit=500)
            pd.DataFrame(tx_data).to_excel(writer, sheet_name="Transactions", index=False)

        st.download_button("📥 下载报表", buffer.getvalue(), f"report_{pd.Timestamp.now().strftime('%Y%m%d')}.xlsx",
                           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
