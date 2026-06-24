import re
import csv
import sys

def parse_line(line):
    line = re.sub(r'[—_\-=~]', ' ', line)
    pattern = r'^(\d{1,3})\s+([A-Z\.,\s\|]+?)\s+(\d{5})\s+(.*?)$'
    match = re.match(pattern, line.strip())
    if not match:
        return None
        
    no = match.group(1)
    name = match.group(2).strip().replace('|', 'I')
    cn = match.group(3)
    rest_str = match.group(4)
    rest_str = re.sub(r'(\d),(\d)', r'\1.\2', rest_str)
    
    tokens = rest_str.split()
    if len(tokens) < 4:
        return None
        
    sec = tokens[0][0]
    coy = tokens[1][0] if len(tokens) > 1 else ""
    
    numbers = []
    for t in tokens[2:]:
        m = re.search(r'-?\d+\.?\d*', t)
        if m:
            numbers.append(m.group(0))
            
    if len(numbers) >= 2:
        avg_grade = numbers[-1]
        pts_def = numbers[-2]
        lesson_sum = numbers[0] if len(numbers) > 2 else "0"
        lesson_cnt = numbers[1] if len(numbers) > 3 else "0"
        unit_sum = numbers[2] if len(numbers) > 4 else "0"
        unit_cnt = numbers[3] if len(numbers) > 5 else "0"
        final_exam = numbers[4] if len(numbers) > 6 else "0"
        
        return {
            'class': '1CL',
            'course': 'WIT431',
            'course_name': 'War and its Theorists',
            'cadet': name,
            'cn': cn,
            'sec': sec,
            'company': coy,
            'lesson_sum': lesson_sum,
            'lesson_cnt': lesson_cnt,
            'unit_sum': unit_sum,
            'unit_cnt': unit_cnt,
            'final_exam': final_exam,
            'pts': pts_def,
            'grade': avg_grade,
        }
    return None

def main():
    records = []
    with open('scratch/wit431/ocr.txt', 'r') as f:
        for line in f:
            if not line.strip() or line.startswith('Page') or 'Course Name' in line:
                continue
            res = parse_line(line)
            if res:
                records.append(res)
                
    # Add the missing 22 records manually
    manual = [
        ('SALON, F, E', '27215', 'G', 'G', '15.0000', '3', '-6.00', '5.0'),
        ('CASTRO, B, A', '27050', 'A', 'A', '17.0000', '3', '-4.00', '5.6666'),
        ('SIMON, J, R', '27222', 'G', 'F', '18.0000', '3', '-3.00', '6.0'),
        ('ARIP, R, A', '25030', 'E', 'C', '18.0000', '3', '-3.00', '6.0'),
        ('CASTRO, D, F', '27048', 'E', 'C', '18.0000', '3', '-3.00', '6.0'),
        ('CENIZA, B, V', '27268', 'J', 'E', '18.0000', '3', '-3.00', '6.0'),
        ('LABADOR, R, P', '26204', 'I', 'B', '18.0000', '3', '-3.00', '6.0'),
        ('LEVISTE, L, V', '27138', 'A', 'B', '18.0000', '3', '-3.00', '6.0'),
        ('LUCERO, D, E', '27143', 'I', 'A', '18.0000', '3', '-3.00', '6.0'),
        ('MAMA, I, S', '27149', 'H', 'H', '18.0000', '3', '-3.00', '6.0'),
        ('MARDICAS, R, A', '27155', 'D', 'H', '18.0000', '3', '-3.00', '6.0'),
        ('SABADO, W, G', '26299', 'D', 'H', '18.0000', '3', '-3.00', '6.0'),
        ('WANIA, T, T', '27261', 'F', 'D', '18.0000', '3', '-3.00', '6.0'),
        ('ABBAS, N, N', '26001', 'G', 'F', '18.0000', '3', '-3.00', '6.0'),
        ('ACOSTA, C, B', '28007', 'G', 'F', '19.0000', '3', '-2.00', '6.3333'),
        ('AGUSTIN, R, R', '26351', 'J', 'D', '19.0000', '3', '-2.00', '6.3333'),
        ('ANTOLIN, R, E', '26019', 'C', 'E', '19.0000', '3', '-2.00', '6.3333'), 
        ('BANAN, J, D', '27024', 'I', 'B', '19.0000', '3', '-2.00', '6.3333'),
        ('BERNARDO, J, H', '27031', 'I', 'B', '19.0000', '3', '-2.00', '6.3333'),
        ('BUENO, J, J', '26066', 'C', 'F', '19.0000', '3', '-2.00', '6.3333'),
        ('CORPUZ, A, D', '26104', 'L', 'G', '19.0000', '3', '-2.00', '6.3333'),
        ('GUMARU, D, R', '27120', 'C', 'G', '19.0000', '3', '-2.00', '6.3333'),
        ('MONTEMAYOR, N, S', '27295', 'I', 'B', '19.0000', '3', '-2.00', '6.3333'),
        ('LELINA, I, B', '27136', 'D', 'G', '20.0000', '3', '-1.00', '6.6666'),
    ]
    
    for m in manual:
        records.append({
            'class': '1CL',
            'course': 'WIT431',
            'course_name': 'War and its Theorists',
            'cadet': m[0],
            'cn': m[1],
            'sec': m[2],
            'company': m[3],
            'lesson_sum': m[4],
            'lesson_cnt': m[5],
            'unit_sum': '0',
            'unit_cnt': '0',
            'final_exam': '0',
            'pts': m[6],
            'grade': m[7],
        })
                
    print(f"Extracted {len(records)} records")
    
    fieldnames = ['class', 'course', 'course_name', 'cadet', 'cn', 'sec', 'company', 
                  'lesson_sum', 'lesson_cnt', 'unit_sum', 'unit_cnt', 
                  'final_exam', 'pts', 'grade']
                  
    with open('public/week3_deficiencies.csv', 'a', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        for rec in records:
            writer.writerow(rec)

if __name__ == "__main__":
    main()
