import csv

real_companies = {}
for file in ['public/week1_deficiencies.csv', 'public/week2_deficiencies.csv']:
    try:
        with open(file) as f:
            for row in csv.DictReader(f):
                real_companies[row['cadet']] = row['company']
    except:
        pass

fixed_rows = []
with open('public/week3_deficiencies.csv') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        # Filter out the ARIPLRA hallucination
        if row['cadet'] == 'ARIPLRA':
            continue
            
        coy = row['company'].strip()
        if coy not in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']:
            # Need to fix
            clean_name = row['cadet'].replace('PENARUBIA', 'PEÑARUBIA') # sometimes N is NYE
            found_coy = coy
            for k, v in real_companies.items():
                if row['cadet'].split(',')[0] in k:
                    found_coy = v
                    break
            row['company'] = found_coy
            print(f"Fixed {row['cadet']} to company {found_coy}")
        
        fixed_rows.append(row)

with open('public/week3_deficiencies.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(fixed_rows)
