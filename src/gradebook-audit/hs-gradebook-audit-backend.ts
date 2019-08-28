import * as d3 from 'd3'

import {
    partition} from 'ramda'

import {
    isAfter, } from 'date-fns'

import {
    AspenAssignmentRow,
    AspenCategoriesRow,
    AspenHSThresholdRow,
    StudentSearchListRow,
    Score,  } from '../shared/file-interfaces'

import {
    parseGrade,
    stringToDate, } from '../shared/utils'

import { ReportFiles } from '../shared/report-types'
import { 
    TeacherClass,
    GradeDistribution,
    TeacherClasses,
    Assignment, 
    AssignmentStats,
    AssignmentImpact,
    Category,
    GradeLogic } from './gradebook-audit-interfaces'

//intermediate interface based on grades, builds unique classes and assigns students 
interface UniqueClasses {
    [className: string]: {
        teachers: string[]
        students: AspenHSThresholdRow[] //list of student id's
    }
}

//ClassLists list the classes and sections each student has a grade in
interface ClassLists {
    [id: string]: string[]
}


export const createHSGradebookReports = (files: ReportFiles ) => {

    const gr = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const asg = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult
    const cat = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult
    const grades = gr ? gr.data as AspenHSThresholdRow[] : []
    const allAssignments = asg ? asg.data as AspenAssignmentRow[] : []
    const categoriesAndTPL = cat ? cat.data as AspenCategoriesRow[] : []
    const classes: UniqueClasses = getUniqueClasses(grades)
    const {teacherClasses, studentClasses} = invertUniqueClasses(classes)
    console.log(teacherClasses)
    console.log(studentClasses)
    console.log(classes)
    return {distributions:{}, categories:{}, teachers:[]}
}

const getUniqueClasses = (grades: AspenHSThresholdRow[]): UniqueClasses => {
    const uniques: UniqueClasses = d3.nest<AspenHSThresholdRow, {teachers: string[],students: string[]}>()
        .key(r => getUniqueClassName(r))
        .rollup((rs: AspenHSThresholdRow[]) => {
            return {
                teachers: rs[0]['Teacher Name'].split('; '), //assumes that each class/period is going to have a consistent list of teachers
                students: rs
            }
        }).object(grades)

    return uniques
}

//gets a unique class name by appending the section number to the class name
const getUniqueClassName = (row: AspenHSThresholdRow): string => {
    return row['Course Name'] + ' ' + row['Section']
}

//takes the UniqueClasses struct and turns it into a mostly blank TeacherClasses
const invertUniqueClasses = (classes: UniqueClasses): {teacherClasses: TeacherClasses, studentClasses: ClassLists} => {
    const teacherClasses: TeacherClasses = {}
    const studentClasses: ClassLists = {}
    Object.keys(classes).forEach(unique => {
        classes[unique].teachers.forEach(teacher => {
            if(teacherClasses[teacher]===undefined){
                teacherClasses[teacher] = {}
            }
            teacherClasses[teacher][unique] = {
                categories: {},
                distribuiton: gradesToDistribution(classes[unique].students)}
        })
        classes[unique].students.forEach(student => {
            if(studentClasses[student['Student ID']]===undefined){
                studentClasses[student['Student ID']] = []
            }
            studentClasses[student['Student ID']][studentClasses[student['Student ID']].length] = unique
        })
    })

    return {teacherClasses: teacherClasses, studentClasses: studentClasses}
}

const gradesToDistribution = (grades: AspenHSThresholdRow[]):GradeDistribution => {
    
    const [Blank, quality] = partition((a:AspenHSThresholdRow)=>a['Cavg']==='', grades)
    const [As, Bl] = partition((a:AspenHSThresholdRow)=>parseFloat(a['Cavg']) > 89, quality)
    const [Bs, Cl] = partition((a:AspenHSThresholdRow)=>parseFloat(a['Cavg']) > 79, Bl)
    const [Cs, Dl] = partition((a:AspenHSThresholdRow)=>parseFloat(a['Cavg']) > 69, Cl)
    const [Ds, Fs] = partition((a:AspenHSThresholdRow)=>parseFloat(a['Cavg']) > 59, Dl)
    return {
        A: As.length,
        B: Bs.length,
        C: Cs.length,
        D: Ds.length,
        F: Fs.length,
        Blank: Blank.length,
        failingStudents: Fs.map((a) => {return {studentName: a['Student Name'], quarterGrade: parseFloat(a['Cavg'])}}),
        students: grades.map(g => g["Student ID"])
    }
}