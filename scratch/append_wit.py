import csv

new_rows = [
    ['1CL', 'WIT431', 'War and its Theorists', 'CENIZA, B, Y', '27268', 'J', 'E', '26.0000', '4', '27.0000', '1', '0.0000', '-10.00', '5.6888'],
    ['1CL', 'WIT431', 'War and its Theorists', 'NANALE, D, F', '27172', 'F', 'C', '24.0000', '4', '32.0000', '1', '0.0000', '-7.00', '6.2222'],
    ['1CL', 'WIT431', 'War and its Theorists', 'LABADOR, R, P', '26204', 'I', 'B', '18.0000', '3', '33.0000', '4', '0.0000', '-5.00', '6.375'],
    ['1CL', 'WIT431', 'War and its Theorists', 'VISARIO, D, T', '26348', 'C', 'E', '32.0000', '4', '27.0000', '1', '0.0000', '-4.00', '6.5555'],
    ['1CL', 'WIT431', 'War and its Theorists', 'BOGAALBAL, I, C', '27035', 'J', 'E', '25.0000', '4', '35.0000', '1', '0.0000', '-3.00', '6.6666'],
    ['1CL', 'WIT431', 'War and its Theorists', 'CAJELES, E, P', '26076', 'E', 'C', '27.0000', '4', '33.0000', '1', '0.0000', '-3.00', '6.6666'],
    ['1CL', 'WIT431', 'War and its Theorists', 'MITRA, R, N', '26243', 'I', 'B', '26.0000', '4', '0.0000', '0', '0.0000', '-2.00', '6.5'],
    ['1CL', 'WIT431', 'War and its Theorists', 'SALVE, K, L', '26304', 'G', 'G', '25.0000', '4', '37.0000', '1', '0.0000', '-1.00', '6.8888']
]

with open('public/week4_deficiencies.csv', 'a', newline='') as f:
    writer = csv.writer(f)
    for row in new_rows:
        writer.writerow(row)

print("Appended rows.")
