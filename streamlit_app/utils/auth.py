import sqlite3
import bcrypt
import streamlit as st
from utils.db import get_conn

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def authenticate(email: str, password: str):
    conn = get_conn()
    user = conn.execute("SELECT * FROM User WHERE email = ?", [email]).fetchone()
    conn.close()
    if not user:
        return None
    if check_password(password, user["passwordHash"]):
        return {"id": user["id"], "username": user["username"], "email": user["email"], "role": user["role"]}
    return None

def require_auth():
    if "user" not in st.session_state or st.session_state.user is None:
        st.warning("请先登录")
        st.stop()

def require_admin():
    require_auth()
    if st.session_state.user["role"] != "ADMIN":
        st.error("需要管理员权限")
        st.stop()
