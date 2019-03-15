export const DBNAME = 'reportFileStore'

export enum FileTypes {
    ES_GRADES_EXTRACT = 'ES Grades Extract',
    ASSIGNMENTS_SLOW_LOAD = 'CPS All Assignments and Grades Extract (Slow Load)',
    TEACHER_CATEGORIES_TPL = 'CPS Teacher Categories and Total Points Logic',
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
//link is to instructions
export interface FileDescripiton {
    description: string
    link?: string
}

export const FileDescriptions: {[fileType: string]: FileDescripiton} = {}
FileDescriptions[FileTypes.ES_GRADES_EXTRACT] = {
    description: 'Located in the custom reports seciton of Gradebook',
    link: 'https://docs.google.com/document/d/1DLJj9Mc_cURxHfljOBlxvj2Tlni1I2sszBnOGsQfhdc/edit?usp=sharing'
    }
FileDescriptions[FileTypes.ASSIGNMENTS_SLOW_LOAD] = {
    description: 'Located in the custom reports seciton of Gradebook',
    link: 'https://docs.google.com/document/d/10ogRhaEbHqsQiXpT5184oiycpo9CGOikSuKQzwhQqVA/edit?usp=sharing'
    }
FileDescriptions[FileTypes.TEACHER_CATEGORIES_TPL] = {
    description: 'Located in the custom reports seciton of Gradebook',
    link: 'https://docs.google.com/document/d/107Tyile6kCiNf7b7sTvmykpEJZMGjr-BAKoIobLB7SY/edit?usp=sharing'
    }
FileDescriptions[FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION] = {
    description: 'Dashboard, school IEP.',
    link: 'https://docs.google.com/document/d/1LUNnzD6O8xxcMvu8nMPUqQL4MB-tHPwXiqB0fl4H8ak/edit?usp=sharing'
    }
FileDescriptions[FileTypes.NWEA] = {
    description: 'Dashboard reports, NWEA CDF and Participation',
    link: 'https://docs.google.com/document/d/1hlvBzkmbedZrZcKUsJ2vBJxbkWGiWX4ktx8ki4l22aI/edit?usp=sharing'
    }
FileDescriptions[FileTypes.ATTENDENCE] = {
    description: 'Dashboard attendance, Att Detail, bottom heatmap',
    link: 'https://docs.google.com/document/d/1khY0Uoo_72lIaRR7WirRDnCu4uiVMiSYax4kb6iIcD4/edit?usp=sharing'
    }
FileDescriptions[FileTypes.KRONOS_DATA] = {
    description: 'Comes from Kronos',

    }
FileDescriptions[FileTypes.STUDENT_INFO] = {
    description: 'Dashboard Student search list report',
    link: 'https://docs.google.com/document/d/1slRclThy3aCkQrKUp7rnFIw6Gdh3NSW33AiXZLTirfQ/edit?usp=sharing'
    }