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
    all_guest = {}
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT 
            name,
            CASE 
                WHEN inside = TRUE THEN 'Yes'
                ELSE 'No'
            END AS is_inside
        FROM guests;
    """)
    guests = cur.fetchall()
    for name, is_inside in guests:
        all_guest[name] = is_inside
    cur.close()
    conn.close()
    return all_guest



def add_guest(name, hash_value):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO guests (name, hash) VALUES (%s, %s) RETURNING id;",
            (name, hash_value)
        )
        guest_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return guest_id  # You can return the ID of the inserted guest
    except psycopg2.Error as e:
        print("Error inserting guest:", name)
        return None


def every_one_out():

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE guests SET inside = FALSE;")
    conn.commit()
    cur.close()
    conn.close()




def every_one_inside():

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE guests SET inside = TRUE;")
    conn.commit()
    cur.close()
    conn.close()


def delete_DB_content():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM guests;")
    conn.commit()
    cur.close()
    conn.close()



def remove_person(hash_val):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM guests WHERE hash = %s;", (hash_val,))
    conn.commit()
    cur.close()
    conn.close()



