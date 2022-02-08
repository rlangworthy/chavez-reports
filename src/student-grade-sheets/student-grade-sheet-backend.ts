import {isAfter} from 'date-fns'
import * as papa from 'papaparse'

import {
    AspenAssignmentRow,
    AspenCategoriesRow,
    StudentSearchListRow,
    Tardies } from '../shared/file-interfaces'

import { 
    parseSchedule,
    StudentClassList } from '../shared/schedule-parser'

import {
    stringToDate } from '../shared/utils'

import { ReportFiles } from '../shared/report-types'

import {
    getStudentAssignments,
    studentSearchToGrade,
    } from '../shared/student-assignment-utils'

import {
    StudentAssignments, } from '../shared/student-assignment-interfaces'

export const createAssignmentReports = (files: ReportFiles ): StudentAssignments =>{
    const asg = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const cats = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult
    const att = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult
    const schedule = files.reportFiles[files.reportTitle.files[3].fileDesc].parseResult
    const aspAllAssignments = asg ? asg.data as AspenAssignmentRow[] : []
    const aspCats = cats ? cats.data as AspenCategoriesRow[] : []
    const attendance = att? att.data as Tardies[] : []
    const studentSchedules = schedule? parseSchedule(schedule.data) : []
    const currentTerm = '1'
    const q4Start = new Date(2019, 7, 5)

    const rawAllAssignments=aspAllAssignments.filter(a => isAfter(stringToDate(a['Assigned Date']), q4Start))
    const rawCats = aspCats.filter(c => c['CLS Cycle']===currentTerm || c['CLS Cycle'] === 'All Cycles')
    const studentAssignments = getStudentAssignments(attendance, 
                                                    rawCats, rawAllAssignments, studentSchedules)

    
    return studentAssignments
}