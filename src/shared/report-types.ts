import React from 'react'
import { SummerschoolReportDownload } from '../summerschool-report/summerschool-report-download'
import { StudentOnePagers } from '../student-one-pager/student-one-pager-displays/student-one-pager-display'
import { StaffAbsenceReport } from '../staff-absence-report/absence-containers/staff-absence-download'
import { GradebookAuditReport } from '../gradebook-audit/gradebook-audit-containers/gradebook-audit-container'
import { StudentGradeSheets } from '../student-grade-sheets/student-grade-display'
import {HROnePagers} from '../weekly-one-pager/weekly-one-pager-displays/weekly-one-pagers-display'


import { 
    FileTypes,
    RawFileParse, } from './file-types'

export interface ReportTitle {
    title: string
    description: string
    link: string
    files: ReportTitleFile[]
    component:  React.ComponentClass<{reportFiles?: ReportFiles}> | React.FunctionComponent<{reportFiles?: ReportFiles}>
    optionalFiles?: {fileType: FileTypes, fileDesc: string}[]
    externalLink?: string
    moreInfoLink?: string
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
        link: process.env.PUBLIC_URL + '/gradebook-audit/upload/',
        component: GradebookAuditReport,
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT, fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: FileTypes.ASSIGNMENTS_SLOW_LOAD}, 
                {fileType: FileTypes.TEACHER_CATEGORIES_TPL,fileDesc: FileTypes.TEACHER_CATEGORIES_TPL}],
        moreInfoLink: 'https://docs.google.com/document/d/16ssdtsMqY5khDZCOtbw0Xpm-oZmS_agQSFI-iCEg1yA/edit?usp=sharing',
    },
    {
        title: 'HS Gradebook Audit Report',
        description: 'Analyze gradebook by classroom (for Admin).',
        link: process.env.PUBLIC_URL + '/hs-gradebook-audit/upload/',
        component: GradebookAuditReport,
        files: [{fileType: FileTypes.HS_THRESHOLD, fileDesc: FileTypes.HS_THRESHOLD}, 
                {fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: FileTypes.ASSIGNMENTS_SLOW_LOAD}, 
                {fileType: FileTypes.TEACHER_CATEGORIES_TPL,fileDesc: FileTypes.TEACHER_CATEGORIES_TPL}],
        moreInfoLink: 'https://docs.google.com/document/d/16ssdtsMqY5khDZCOtbw0Xpm-oZmS_agQSFI-iCEg1yA/edit?usp=sharing',
    },
    {
        title: 'Summerschool Report',
        description: 'Monitor which students are likely to need summer school and are at risk of being retained (for Admin).',
        link: process.env.PUBLIC_URL + '/summerschool/upload/',
        component: SummerschoolReportDownload,
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.NWEA,fileDesc: FileTypes.NWEA + ' Current Year'}, 
                {fileType: FileTypes.NWEA,fileDesc: FileTypes.NWEA + ' Previous Year'}, 
                {fileType: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION,fileDesc: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION}],
    },
    {
        title: 'Staff Absence Report',
        description: 'Review employee attendance (for Admin).',
        link: process.env.PUBLIC_URL + '/staff-absence/upload/',
        component: StaffAbsenceReport,
        files: [{fileType: FileTypes.KRONOS_DATA,fileDesc: FileTypes.KRONOS_DATA}],
    },
    {
        title: 'NWEA Summarizer',
        description: 'Spring-Spring growth and attainment by classroom (for Admin).',
        link: process.env.PUBLIC_URL + '/NWEA-summarizer/',
        component: React.Fragment,
        files: [],
        externalLink: 'https://chavez.shinyapps.io/NWEA-Summary/'
    },
    {
        title: 'Weekly One Pager',
        description: 'Review student on-track informaiton by classroom (for teachers).',
        link: process.env.PUBLIC_URL + '/weekly-one-pager/upload/',
        component: HROnePagers,
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION,fileDesc: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION}, 
                {fileType: FileTypes.ATTENDENCE,fileDesc: FileTypes.ATTENDENCE}],
        optionalFiles: [{fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT + ' (Optional)'}, 
                        {fileType: FileTypes.ATTENDENCE,fileDesc: FileTypes.ATTENDENCE + ' (Optional)'}],
    },
    {
        title: 'Student One Pager',
        description: 'Progress report for students to use with Chavez HS Planner (for students).',
        link: process.env.PUBLIC_URL + '/student-one-pager/upload/',
        component: StudentOnePagers,
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.ATTENDENCE,fileDesc: FileTypes.ATTENDENCE}, 
                {fileType: FileTypes.STUDENT_INFO,fileDesc: FileTypes.STUDENT_INFO}, 
                {fileType: FileTypes.NWEA,fileDesc: FileTypes.NWEA},
                {fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: FileTypes.ASSIGNMENTS_SLOW_LOAD},
                {fileType: FileTypes.TEACHER_CATEGORIES_TPL, fileDesc: FileTypes.TEACHER_CATEGORIES_TPL}],
    },
    {
        title: 'Student Assignment Sheet',
        description: 'All student assignments by class and category',
        link: process.env.PUBLIC_URL + '/student-assignment-sheet/upload/',
        component: StudentGradeSheets,
        files: [{fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: FileTypes.ASSIGNMENTS_SLOW_LOAD},
                {fileType: FileTypes.TEACHER_CATEGORIES_TPL, fileDesc: FileTypes.TEACHER_CATEGORIES_TPL},
                {fileType: FileTypes.STUDENT_INFO, fileDesc: FileTypes.STUDENT_INFO}],
    }
]