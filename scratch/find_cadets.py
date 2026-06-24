import csv

cadets = {}
for file in ['public/week1_deficiencies.csv', 'public/week2_deficiencies.csv', 'public/week3_deficiencies.csv']:
    try:
        with open(file, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row['cadet']
                cadets[name] = {'cn': row['cn'], 'sec': row['sec'], 'coy': row['company']}
    except:
        pass

search_names = [
    "SIMON", "ARIP", "CASTRO, D", "CENIZA", "LABADOR", "LEVISTE", "LUCERO", "MAMA", "MARDICAS", "SABADO", "WANIA", "ABBAS"
]

for s in search_names:
    found = [n for n in cadets if s in n]
    for n in found:
        print(f"{n}: {cadets[n]}")
