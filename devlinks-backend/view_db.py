import sqlite3

conn = sqlite3.connect('data/devlinks.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print('=== 数据库表列表 ===')
for t in tables:
    print(f'  - {t[0]}')

for t in tables:
    table_name = t[0]
    print(f'\n=== {table_name} ===')
    cursor.execute(f'SELECT * FROM {table_name}')
    columns = [d[0] for d in cursor.description]
    rows = cursor.fetchall()
    print(f'  字段: {columns}')
    print(f'  记录数: {len(rows)}')
    for row in rows:
        print(f'  {dict(zip(columns, row))}')

conn.close()
