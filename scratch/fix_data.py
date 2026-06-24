import os

with open('public/week3_deficiencies.csv', 'r') as f:
    lines = f.readlines()

for i in range(len(lines)):
    if 'TIMAJO' in lines[i] and 'WIT431' in lines[i]:
        lines[i] = lines[i].replace(',A,1,', ',A,B,')
    elif 'PENARUBIA' in lines[i] and 'WIT431' in lines[i]:
        lines[i] = lines[i].replace(',H,1,', ',H,H,')

with open('public/week3_deficiencies.csv', 'w') as f:
    f.writelines(lines)
