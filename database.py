import sqlite3

def create_database():
    with sqlite3.connect('party.db') as conn:
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS guests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                hash TEXT NOT NULL UNIQUE,
                inside INTEGER DEFAULT 0
            )
        ''')
        conn.commit()

def add_guest(name, hash_value):
    try:
        with sqlite3.connect('party.db') as conn:
            c = conn.cursor()
            c.execute(
                'INSERT INTO guests (name, hash, inside) VALUES (?, ?, ?)',
                (name, hash_value, int(False))
            )
            conn.commit()
    except sqlite3.IntegrityError:
        print(f"Guest with hash '{hash_value}' already exists.")

def update_inside_status(hash_value, inside_status):
    with sqlite3.connect('party.db') as conn:
        c = conn.cursor()
        c.execute(
            'UPDATE guests SET inside = ? WHERE hash = ?',
            (int(inside_status), hash_value)
        )
        conn.commit()

def get_guest_info(hash_value):
    with sqlite3.connect('party.db') as conn:
        c = conn.cursor()
        c.execute(
            'SELECT id, name, hash, inside FROM guests WHERE hash = ?',
            (hash_value,)
        )
        guest = c.fetchone()
    return guest

def get_all_guest():
    """
    Function will get all the DB users and no, yes if they are inside yet or not
    Return: Dict
    """
    all_guest = {}
    with sqlite3.connect('party.db') as conn:
        c = conn.cursor()
        c.execute("""
        SELECT 
            name,
            CASE inside 
                WHEN 1 THEN 'Yes'
                ELSE 'No'
            END AS is_inside
        FROM guests;
        """)
        info = c.fetchall()
        for user in info:
            all_guest[user[0]] = user[1]
       
    return all_guest

