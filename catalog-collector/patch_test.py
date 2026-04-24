
with open("src/tests/test_db.py", "r") as f:
    content = f.read()

content = content.replace('"2023-01-01", "2022-05-15"', 'datetime.date(2023, 1, 1), datetime.date(2022, 5, 15)')
content = "import datetime\n" + content

with open("src/tests/test_db.py", "w") as f:
    f.write(content)
