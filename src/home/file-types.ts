export enum FileTypes {
    ES_GRADES_EXTRACT = 'ES Grades Extract',
    ASSIGNMENTS_SLOW_LOAD = 'All Assignments and Grades Extract (Slow Load)',
    TEACHER_CATEGORIES_TPL = 'Teacher Categories and Total Points Logic',
    TOTAL_STUDENTS_SPED_INSTRUCTION = 'Total Students Special Education Instruction Details',
    NWEA= 'NWEA Report Details',
    ATTENDENCE = '% Students Present, Not Present, Excused, or Tardy',
    KRONOS_DATA = 'Kronos Data',
    STUDENT_INFO = 'Student Search List Report',
}

export interface FileList {
    [fileType: string]: RawFileParse[]
}

export interface RawFileParse {
    fileType: string
    fileName: string
    parseResult: ParseResult | null
}

export interface ParseResult {
    data: any
    errors: any[]
    meta: any
}