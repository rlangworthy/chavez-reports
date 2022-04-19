
//contains all personal information about a student and a list of their classes
export interface Student{
    info: StudentInfo
    classes: string[]
}
export interface StudentInfo{
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

export interface SchoolClass{
    teachers: string[]
    students: {[id:string]:{[term:string]:StudentClassInfo}}
    assignments: {[term:string]:{[id:string]:Assignment}}
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