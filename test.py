from app import db, User, app
import pymysql


# Your MySQL connection details
connection = pymysql.connect(
    host='mysql-2bd8f379-waleedgamal2821-a9bd.k.aivencloud.com',
    user='avnadmin',
    password='AVNS_uuM8yWa7VQRd92EhGev',
    database='defaultdb',
    port=14381,
    ssl={'check_hostname': False}
)

try:
    with connection.cursor() as cursor:
        cursor.execute("ALTER TABLE user ADD COLUMN grade VARCHAR(20);")
        cursor.execute("ALTER TABLE user ADD COLUMN section VARCHAR(20);")
    connection.commit()
    print("Columns 'grade' and 'section' added (if they did not exist).")
finally:
    connection.close()