from main import load_csv, sort_students

def test_student_sort():

    #Student Name,Reading Ability Level,Writing Ability Level,Math Ability Level,ASL Ability Level 
    # Jackie Abbott,5,5,4,7
    # Diana Lemke,9,9,7,8
    # Odell Padberg,6,6,6,5
    # Jadon Gleason,5,5,2,7
    # Skye Braun,9,9,9,2

 #If not, schedule in this order:
    #- English
    #- Math
    #- ASL

    students = [{"name": "Jackie Abbott", "Reading": 5, "Writing": 5, "Math": 4, "ASL": 7},
                {"name": "Diana Lemke", "Reading": 9, "Writing": 9, "Math": 7, "ASL": 8},
                {"name": "Odell Padberg", "Reading": 6, "Writing": 6, "Math": 6, "ASL": 5},
                {"name": "Jadon Gleason", "Reading": 5, "Writing": 5, "Math": 2, "ASL": 7},
                {"name": "Skye Braun", "Reading": 9, "Writing": 9, "Math": 9, "ASL": 2}]
    actual = [
                {"name": "Jadon Gleason", "Reading": 5, "Writing": 5, "Math": 2, "ASL": 7},
                {"name": "Jackie Abbott", "Reading": 5, "Writing": 5, "Math": 4, "ASL": 7},
                {"name": "Odell Padberg", "Reading": 6, "Writing": 6, "Math": 6, "ASL": 5},
                {"name": "Diana Lemke", "Reading": 9, "Writing": 9, "Math": 7, "ASL": 8},
                {"name": "Skye Braun", "Reading": 9, "Writing": 9, "Math": 9, "ASL": 2}]
    
    assert student_sort(students) == actual
    
    
    # Test student sort 