
//contains all personal information about a student and a list of their classes
export interface Student{
    info: StudentInfo
    classes: string[]
}
export interface StudentInfo{
  'Attendance Percent' : number
  'Student Last Name': string
  'Student First Name': string
  'Student ID': string
  'Grade Level': string
  'Homeroom': string
  'FRM Status': string
  'Gender': string
  'Student Address': string
  'Enrollment Days': string
  'Present': string
  'Full Day Unexcused': string
  'Tardy':string	
  '1/2 Day Unexcused': string
  '1/2 Day Excused': string
  'Full Day Excused': string
  'DL Status': string
  'EL Program Year': string
}

//Calculated Info about grades and attendance
export interface CalculatedStudentInfo extends StudentInfo{
    'Term Averages' : {[className: string]: QuarterGrades}
    'Assignment Failure Rates' : FailureRates
    'GPA' : number
    'On Track' : number
}

export interface QuarterGrades {
    'Class Description': string
    'Term 1' : number | null
    'Term 2' : number | null
    'Term 3' : number | null
    'Term 4' : number | null
    'Cumulative/Overall Average' : number | null
}

export interface FailureRates {
    'Term 1' : number | null
    'Term 2' : number | null
    'Term 3' : number | null
    'Term 4' : number | null
    'Cumulative/Overall Average' : number | null
}

//Student Data Export Homeroom
export interface Homeroom {
    'Homeroom' : string
    'Grade Level' : string
    'Student Count' : number
    'Attendance Average' : number
    'Term Averages' : {[className: string]: QuarterGrades}
    'Students' : CalculatedStudentInfo[]
}

export interface SchoolClass{
    teachers: string[]
    students: {[id:string]:{[term:string]:StudentClassInfo}}
    assignments: {[term:string]:{[asssignmentId:string]:Assignment}}
    'Class ID': string
    'Description': string
    'Average Mode': string
    'Gradebook Default Indicator': string
    'Max Grades to Drop': string
    'Drop Mode': string
    'Room': string
    'Period': string
}
//modify to accomodate more than one term
export interface StudentClassInfo{
    'Student ID': string
    'Grade Term': string
    'Running Term Average': string
    'Running Term Letter Grade': string
    'Posted Term Grade': string
    'Term Grade Override Indicator': string
    'Cumulative/Overall Average': string
    'Semester/Final Letter Grade': string
    'Posted Final Grade': string
}

export interface Assignment{
    scores: {[id:string]: {
        Score: string
        'Number Score': number
        'Grade Entered on': string
    }}
    'Grade Term':string
    'Assignment Name': string
    'Assignment ID':string
    'Assignment Due': string
    'Assignment Date': string
    'Score Possible': string
    'Category Code': string
    'Category Name': string
    'Category Weight': string
}

export interface School {
    fileName: string
    students: {[id:string]: Student}
    classes: {[cid:string]: SchoolClass}
}