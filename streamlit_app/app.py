import streamlit as st
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

st.set_page_config(page_title="WMS 仓库管理系统", page_icon="📦", layout="wide")

# --- Login Screen ---
if "user" not in st.session_state:
    st.session_state.user = None

if st.session_state.user is None:
    st.title("📦 仓库管理系统 WMS")
    st.markdown("---")

    col1, col2 = st.columns([1, 2])
    with col1:
        st.image("https://img.icons8.com/fluency/96/warehouse.png", width=80)
    with col2:
        st.markdown("### 欢迎使用仓库管理系统")
        st.markdown("管理入库、出库、库存盘点与报表分析")

    st.markdown("---")
    email = st.text_input("邮箱", placeholder="admin@wms.com")
    password = st.text_input("密码", type="password", placeholder="请输入密码")

    if st.button("登录", type="primary", use_container_width=True):
        from utils.auth import authenticate
        user = authenticate(email, password)
        if user:
            st.session_state.user = user
            st.rerun()
        else:
            st.error("邮箱或密码错误")

    st.caption("默认账户: admin@wms.com / Admin@123456")

else:
    # Already logged in — show sidebar nav and page content
    from utils.auth import require_auth

    st.sidebar.title("📦 WMS 仓库系统")
    st.sidebar.markdown(f"👤 {st.session_state.user['username']} ({st.session_state.user['role']})")
    st.sidebar.markdown("---")

    page = st.sidebar.radio(
        "导航",
        ["📊 仪表盘", "📦 库存管理", "📥 入库管理", "📤 出库管理", "📋 交易记录", "🏷️ 产品管理", "📈 报表分析"],
        label_visibility="collapsed"
    )

    st.sidebar.markdown("---")
    if st.sidebar.button("🚪 退出登录"):
        st.session_state.user = None
        st.rerun()

    # Route to pages
    if page == "📊 仪表盘":
        from pages import dashboard
        dashboard.show()
    elif page == "📦 库存管理":
        from pages import inventory
        inventory.show()
    elif page == "📥 入库管理":
        from pages import stock_in
        stock_in.show()
    elif page == "📤 出库管理":
        from pages import stock_out
        stock_out.show()
    elif page == "📋 交易记录":
        from pages import transactions
        transactions.show()
    elif page == "🏷️ 产品管理":
        from pages import products
        products.show()
    elif page == "📈 报表分析":
        from pages import reports
        reports.show()
