# database.py

import psycopg2
import os

# Get the connection string from the environment variable or fallback for local testing
DB_URL = os.getenv("DATABASE_URL") or "postgresql://partydb_b179_user:NwPRDelte4OkRNBJosrDvh2WPVP2ASpy@dpg-d287e4uuk2gs73evjncg-a.frankfurt-postgres.render.com/partydb_b179"

def get_connection():
    return psycopg2.connect(DB_URL, sslmode="require")

def create_guests_table():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS guests (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            hash TEXT UNIQUE NOT NULL,
            inside BOOLEAN DEFAULT FALSE
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

def get_guest_info(hash_value):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, hash, inside FROM guests WHERE hash = %s", (hash_value,))
    guest = cur.fetchone()
    cur.close()
    conn.close()
    return guest

def update_inside_status(hash_value, inside_status=True):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE guests SET inside = %s WHERE hash = %s", (inside_status, hash_value))
    conn.commit()
    cur.close()
    conn.close()

def get_all_guest():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, hash, inside FROM guests")
    guests = cur.fetchall()
    cur.close()
    conn.close()
    return guests



print(get_guest_info("85592f83c488a110d7cee47bb0fb8b4765367a8378d64f03e35a757ff93bf90b"))

if __name__ == "__main__":
    create_guests_table()
    print("guests table created (if not already)")
