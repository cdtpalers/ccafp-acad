import csv

records = [
    ["1CL", "WIT431", "War and its Theorists", "FELIPE,L,M", "27292", "D", "C", "63.0000", "11", "62.0000", "2", "0.0000", "-22.00", "5.9523"],
    ["1CL", "WIT431", "War and its Theorists", "SABILLA, G, B", "26301", "D", "H", "72.0000", "12", "64.0000", "2", "0.0000", "-18.00", "6.1818"],
    ["1CL", "WIT431", "War and its Theorists", "CENIZA,B, Y", "27268", "J", "E", "47.0000", "8", "27.0000", "1", "0.0000", "-17.00", "5.6923"],
    ["1CL", "WIT431", "War and its Theorists", "LABADOR, R, P", "26204", "I", "B", "72.0000", "13", "73.0000", "2", "0.0000", "-16.00", "6.3043"],
    ["1CL", "WIT431", "War and its Theorists", "LOBETE, J,M", "26221", "F", "D", "64.0000", "11", "67.0000", "2", "0.0000", "-16.00", "6.2380"],
    ["1CL", "WIT431", "War and its Theorists", "TY,R,R", "25330", "D", "H", "73.0000", "12", "75.0000", "2", "0.0000", "-6.00", "6.7272"],
    ["1CL", "WIT431", "War and its Theorists", "PLAZA, B, D", "27193", "L", "G", "85.0000", "13", "71.0000", "2", "0.0000", "-5.00", "6.7826"],
    ["1CL", "WIT431", "War and its Theorists", "SILAO,C,O", "27221", "B", "C", "83.0000", "11", "60.0000", "2", "0.0000", "-4.00", "6.8095"],
    ["1CL", "WIT431", "War and its Theorists", "VASQUEZ, J,M", "26341", "J", "D", "98.0000", "14", "33.0000", "1", "0.0000", "-2.00", "6.8947"],
    ["1CL", "WIT431", "War and its Theorists", "BOGAALBAL, I, C", "27035", "J", "E", "90.0000", "14", "77.0000", "2", "0.0000", "-1.00", "6.9583"]
]

with open('public/week10_deficiencies.csv', 'a', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for row in records:
        writer.writerow(row)

print("Appended 10 records for WIT431")
