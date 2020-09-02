/*
 * Adding a file involves:
 *  update the FileTypes enum to include your new file + human readable name
 *  update the FileDescription object to have a description for your new file
 *
 * From there you'll want to add an interface for your new file (file-interfaces.ts) and then add it
 * to whatever reports will require it (report-types.ts).
 * 
 */



export const DBNAME = 'reportFileStore'


//remember to add file descripiton for every new file type
export enum FileTypes {
    ES_GRADES_EXTRACT = 'Cumulative Grades Export',
    ASSIGNMENTS_SLOW_LOAD = 'All Assignments and Grades Extract',
    TEACHER_CATEGORIES_TPL = 'CPS Teacher Categories and Average Mode',
    TOTAL_STUDENTS_SPED_INSTRUCTION = 'Total Students Special Education Instruction Details',
    NWEA= 'NWEA Report Details',
    ATTENDENCE = '% Students Present, Not Present, Excused, or Tardy',
    KRONOS_DATA = 'Kronos Data',
    STUDENT_INFO = 'Student Search List Report',
    HS_THRESHOLD = 'HS Threshold Report',
    STUDENT_SCHEDULE = 'Student Schedules (Sheet)',
    MCLASS_STUDENT_SUMMARY = 'Student Summary',
    SCHEDULE_INFO = 'Schedule Info'
}

/*
Interface for accessing the different kinds of files used by the report.

Stores one list of file parses for each fileType in the FileTypes enum.
*/
export interface FileList {
    [fileType: string]: RawFileParse[]
}

/*
    fileType: one from the FileTypes enum
    fileName: unique file name of this file type guaranteed by getUniqueFileName
    parseResult: output from the papaParse parse of input file
*/
export interface RawFileParse {
    fileType: string
    fileName: string
    parseResult: ParseResult | null
}

/*
    continer for output from a papaParse parse
*/
export interface ParseResult {
    data: any
    errors: any[]
    meta: any
}

//link is to google doc instructions for downloading that type of file
export interface FileDescripiton {
    description: string
    link?: string
}

export const FileDescriptions: {[fileType: string]: FileDescripiton} = {}
FileDescriptions[FileTypes.ES_GRADES_EXTRACT] = {
    description: 'Located in Grade Input section of the Aspen School view Grades tab',
    link: 'https://drive.google.com/open?id=17aDRWZrMfcyqlMUGHGD38Zz5E-yAFTks7L70nb0ynJY'
    }
FileDescriptions[FileTypes.ASSIGNMENTS_SLOW_LOAD] = {
    description: 'Located in Grade Input section of the Aspen School view Grades tab',
    link: 'https://drive.google.com/open?id=17aDRWZrMfcyqlMUGHGD38Zz5E-yAFTks7L70nb0ynJY'
    }
FileDescriptions[FileTypes.TEACHER_CATEGORIES_TPL] = {
    description: 'Located in the Reports dropdown of the Aspen School view Grades tab',
    link: 'https://drive.google.com/open?id=16sqAhCAEMqHf4Ep7QLl28KpT8c7HFitLLvL0U6oKLSU'
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
FileDescriptions[FileTypes.HS_THRESHOLD] = {
    description: 'Located in Grade Input section of the Aspen School view Grades tab',
    //link: 'https://drive.google.com/open?id=17aDRWZrMfcyqlMUGHGD38Zz5E-yAFTks7L70nb0ynJY'
}
FileDescriptions[FileTypes.STUDENT_SCHEDULE] = {
    description: 'Located in Reports section of the Aspen School view Schedule tab',
    link: 'https://docs.google.com/document/d/1mxzo9TQKwc76SaKb4MeVEOV3yERe5H2FBuXa7LTE4xk/edit?usp=sharing'
}
FileDescriptions[FileTypes.MCLASS_STUDENT_SUMMARY] = {
    description: '',
}
FileDescriptions[FileTypes.SCHEDULE_INFO] = {
    description: ''
}