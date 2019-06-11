import {isAfter} from 'date-fns'

import {
    AspenAssignmentRow,
    AspenCategoriesRow,
    StudentSearchListRow } from '../shared/file-interfaces'

import {
    stringToDate } from '../shared/utils'
import { ReportFiles } from '../shared/report-types'

import {
    getStudentAssignments,
    studentSearchToGrade,} from '../shared/student-assignment-utils'

import {
    StudentAssignments, } from '../shared/student-assignment-interfaces'


export const createAssignmentReports = (files: ReportFiles ): StudentAssignments =>{
    const asg = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const cats = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult
    const st = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult
    const aspAllAssignments = asg ? asg.data as AspenAssignmentRow[] : []
    const aspCats = cats ? cats.data as AspenCategoriesRow[] : []
    const studData = st? st.data as StudentSearchListRow[] : []
    const currentTerm = '4'
    const q4Start = new Date(2019, 3, 5)

    const rawAllAssignments=aspAllAssignments.filter(a => isAfter(stringToDate(a['Assigned Date']), q4Start))
    const rawCats = aspCats.filter(c => c['CLS Cycle']===currentTerm || c['CLS Cycle'] === 'All Cycles')
    
    const studentAssignments = getStudentAssignments(studData.map(studentSearchToGrade), rawCats, rawAllAssignments)

    return studentAssignments
}