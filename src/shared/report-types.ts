import { 
    FileTypes,
    RawFileParse, } from './file-types'

export interface ReportTitle {
    title: string
    description: string
    link: string
    files: ReportTitleFile[]
    optionalFiles?: {fileType: FileTypes, fileDesc: string}[]
    externalLink?: string
}
//alternate link gets checked first, in case you have two files of the same type but are expecting different things
export interface ReportTitleFile {
    fileType: FileTypes
    fileDesc: string
     altLink?: string
}

//reportFiles indexed on unique descriptions: this is the object passed to report generators
export interface ReportFiles {
    reportTitle: ReportTitle
    reportFiles: {[fileDesc: string]: RawFileParse}
}

//It is important here that each report have unique descriptions for each file

export const ReportCards: ReportTitle[] = [
    {
        title: 'Gradebook Audit Report',
        description: 'Analyze gradebook by classroom (for Admin).',
        link: '/reports/gradebook-audit/upload/',
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT, fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: FileTypes.ASSIGNMENTS_SLOW_LOAD}, 
                {fileType: FileTypes.TEACHER_CATEGORIES_TPL,fileDesc: FileTypes.TEACHER_CATEGORIES_TPL}],
    },
    {
        title: 'Summerschool Report',
        description: 'Monitor which students are likely to need summer school and are at risk of being retained (for Admin).',
        link: '/reports/summerschool/upload/',
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.NWEA,fileDesc: FileTypes.NWEA + ' Current Year'}, 
                {fileType: FileTypes.NWEA,fileDesc: FileTypes.NWEA + ' Previous Year'}, 
                {fileType: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION,fileDesc: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION}],
    },
    {
        title: 'Staff Absence Report',
        description: 'Review employee attendance (for Admin).',
        link: '/reports/staff-absence/upload/',
        files: [{fileType: FileTypes.KRONOS_DATA,fileDesc: FileTypes.KRONOS_DATA}],
    },
    {
        title: 'NWEA Summarizer',
        description: 'Spring-Spring growth and attainment by classroom (for Admin).',
        link: '/NWEA-summarizer/',
        files: [],
        externalLink: 'https://chavez.shinyapps.io/NWEA-Summary/'
    },
    {
        title: 'Weekly One Pager',
        description: 'Review student on-track informaiton by classroom (for teachers).',
        link: '/reports/weekly-one-pager/upload/',
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION,fileDesc: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION}, 
                {fileType: FileTypes.ATTENDENCE,fileDesc: FileTypes.ATTENDENCE}],
        optionalFiles: [{fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT + ' (Optional)'}, 
                        {fileType: FileTypes.ATTENDENCE,fileDesc: FileTypes.ATTENDENCE + ' (Optional)'}],
    },
    {
        title: 'Student One Pager',
        description: 'Progress report for students to use with Chavez HS Planner (for students).',
        link: '/reports/student-one-pager/upload/',
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.ATTENDENCE,fileDesc: FileTypes.ATTENDENCE}, 
                {fileType: FileTypes.STUDENT_INFO,fileDesc: FileTypes.STUDENT_INFO}, 
                {fileType: FileTypes.NWEA,fileDesc: FileTypes.NWEA},
                {fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: 'CPS Missing and Zero Point Assignments',
                altLink: 'https://docs.google.com/document/d/1g9zLcYaq7nIGTCm1wA8C8-ps0-eGIaRiSF33DnJSP-Y/edit?usp=sharing'}],
    }
]