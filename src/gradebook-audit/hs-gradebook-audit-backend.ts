import * as d3 from 'd3'

import {
    uniqBy,
    mean,
    median} from 'ramda'

import {
    isAfter, } from 'date-fns'

import {
    RawESCumulativeGradeExtractRow,
    RawAssignmentsRow,
    RawTeacherCategoriesAndTotalPointsLogicRow,
    AspenAssignmentRow,
    AspenCategoriesRow,
    AspenHSThresholdRow,
    StudentSearchListRow,
    Score,  } from '../shared/file-interfaces'

import {
    parseGrade,
    convertAspAsgns,
    convertAspCategories,
    convertAspGrades,
    stringToDate, } from '../shared/utils'

import { ReportFiles } from '../shared/report-types'
import { 
    TeacherGradeDistributions,
    GradeDistribution,
    TeacherClassCategories,
    Assignment, 
    AssignmentStats,
    Teacher,
    AssignmentImpact,
    Category,
    GradeLogic } from './gradebook-audit-interfaces'


const createHSGradebookReports = (files: ReportFiles ) => {

    const gr = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const asg = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult
    const cat = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult
    const Grades = gr ? gr.data as AspenHSThresholdRow[] : []
    const allAssignments = asg ? asg.data as AspenAssignmentRow[] : []
    const categoriesAndTPL = cat ? cat.data as AspenCategoriesRow[] : []

}