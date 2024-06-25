import React from 'react'
import { SummerschoolReportDownload } from '../summerschool-report/summerschool-report-download'
import { StudentOnePagers } from '../student-one-pager/student-one-pager-displays/student-one-pager-display'
import { StaffAbsenceReport } from '../staff-absence-report/absence-containers/staff-absence-download'
import { GradebookAuditReport } from '../gradebook-audit/gradebook-audit-containers/gradebook-audit-container'
import { StudentGradeSheets } from '../student-grade-sheets/student-grade-display'
import {HROnePagers} from '../weekly-one-pager/weekly-one-pager-displays/weekly-one-pagers-display'
import {GradeValidationReport} from '../grade-validation/grade-validation-display'
import { DLSchedulingReport } from '../dl-scheduling/dl-scheduling-backend'
import { TestReport } from '../test-report/stmath-report'

import { School } from '../data-handling/data-interfaces'

/*
 *To add a new report: 
 *  First add any addtional files to file-types.ts and corresponding interfaces in file-interfaces.ts
 *  Second come here and make a new ReportTitle for it
 *  Third create a folder and add a front and back end for it
 */

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
    quarter?: '1'|'2'|'3'|'4'
    altLink?: string
}

//reportFiles indexed on unique descriptions: this is the object passed to report generators
export interface ReportFiles {
    reportTitle: ReportTitle
    reportFiles: {[fileDesc: string]: RawFileParse}
    schooData?: School
    term?: 'Quarter 1' | 'Quarter 2'| 'Quarter 3'| 'Quarter 4'| 'Semester 1'| 'Semester 2'
}


const activeReports: string [] = [
    'Gradebook Audit Report',
    'Homeroom One Pager',
    'Student One Pager',
    'Student Assignment Sheet',
    'Staff Absence Report',
    'DL Scheduling Aid',
    //'Summerschool Report',
    //'NWEA Summarizer',
    //'Gradebook Validation',
    //'Test',
    
]

//It is important here that each report have unique descriptions for each file
const allReportCards: ReportTitle[] = [
    {
        title: 'Gradebook Audit Report',
        description: 'Analyze gradebook by classroom (for Admin).',
        link: process.env.PUBLIC_URL + '/gradebook-audit/upload/',
        component: GradebookAuditReport,
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT, fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: FileTypes.ASSIGNMENTS_SLOW_LOAD}, 
                {fileType: FileTypes.TEACHER_CATEGORIES_TPL,fileDesc: FileTypes.TEACHER_CATEGORIES_TPL},
                {fileType: FileTypes.STUDENT_SCHEDULE, fileDesc: FileTypes.STUDENT_SCHEDULE}],
        optionalFiles:[{fileType: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION,fileDesc: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION}],
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
        title: 'Homeroom One Pager',
        description: 'Review student on-track informaiton by classroom (for teachers).',
        link: process.env.PUBLIC_URL + '/homeroom-one-pager/upload/',
        component: HROnePagers,
        files: [{fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT}, 
                {fileType: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION,fileDesc: FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION}, 
                {fileType: FileTypes.ATTENDENCE,fileDesc: FileTypes.ATTENDENCE}],
        optionalFiles: [{fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: FileTypes.ASSIGNMENTS_SLOW_LOAD},
                        {fileType: FileTypes.MCLASS_STUDENT_SUMMARY, fileDesc: FileTypes.MCLASS_STUDENT_SUMMARY + ' (Optional)'},
                        {fileType: FileTypes.ES_GRADES_EXTRACT,fileDesc: FileTypes.ES_GRADES_EXTRACT + ' (Optional)'}, 
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
                {fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: FileTypes.ASSIGNMENTS_SLOW_LOAD},
                {fileType: FileTypes.TEACHER_CATEGORIES_TPL, fileDesc: FileTypes.TEACHER_CATEGORIES_TPL},
                {fileType: FileTypes.STUDENT_SCHEDULE, fileDesc: FileTypes.STUDENT_SCHEDULE}],
    },
    {
        title: 'Student Assignment Sheet',
        description: 'All student assignments by class and category',
        link: process.env.PUBLIC_URL + '/student-assignment-sheet/upload/',
        component: StudentGradeSheets,
        files: [{fileType: FileTypes.ASSIGNMENTS_SLOW_LOAD, fileDesc: FileTypes.ASSIGNMENTS_SLOW_LOAD},
                {fileType: FileTypes.TEACHER_CATEGORIES_TPL, fileDesc: FileTypes.TEACHER_CATEGORIES_TPL},
                {fileType: FileTypes.ATTENDENCE, fileDesc: FileTypes.ATTENDENCE},
                {fileType: FileTypes.STUDENT_SCHEDULE, fileDesc: FileTypes.STUDENT_SCHEDULE}],
    },
    {
        title: 'Gradebook Validation',
        description: '',
        link: process.env.PUBLIC_URL + '/gradebook-validation/upload/',
        component: GradeValidationReport,
        files: [
                {fileType: FileTypes.GRADE_VALIDATION, fileDesc: FileTypes.GRADE_VALIDATION}],
    },
    {
        title: 'Test',
        description: '',
        link: process.env.PUBLIC_URL + '/gradebook-validation/upload/', 
        component: TestReport,
        files: [
                {fileType: FileTypes.JIJI, fileDesc: FileTypes.JIJI}],
    },
    {
        title: 'DL Scheduling Aid',
        description: 'Organized and summarized teacher and aide minutes',
        link: process.env.PUBLIC_URL + '/dl-aid/upload/',
        component: DLSchedulingReport,
        files: [
            {fileType: FileTypes.TEACHER_MINUTES, fileDesc: FileTypes.TEACHER_MINUTES},
            {fileType: FileTypes.AIDE_MINUTES, fileDesc: FileTypes.AIDE_MINUTES}
        ],
    },  
]

export const ReportCards: ReportTitle[] = allReportCards.filter(report => activeReports.includes(report.title))