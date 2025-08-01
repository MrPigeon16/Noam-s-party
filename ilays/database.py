import sqlite3

def create_database():
    conn = sqlite3.connect('party.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS guests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            hash TEXT NOT NULL,
            inside BOOLEAN DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

def add_guest(name, hash_value):
    conn = sqlite3.connect('party.db')
    c = conn.cursor()
    c.execute('INSERT INTO guests (name, hash, inside) VALUES (?, ?, ?)', (name, hash_value, False))
    conn.commit()
    conn.close()


def update_inside_status(hash_value, inside_status):
    conn = sqlite3.connect('party.db')
    c = conn.cursor()
    c.execute('UPDATE guests SET inside = ? WHERE hash = ?', (inside_status, hash_value))
    conn.commit()
    conn.close()


def get_guest_info(hash_value):
    conn = sqlite3.connect('party.db')
    c = conn.cursor()
    c.execute('SELECT id, name, hash, inside FROM guests WHERE hash = ?', (hash_value,))
    guest = c.fetchone()
    conn.close()
    return guest
