import * as d3 from 'd3'

import {
    RawESCumulativeGradeExtractRow,
    RawAssignmentsRow,
    RawTeacherCategoriesAndTotalPointsLogicRow,
    Score, 
    LetterGradeList,
    LetterGrade } from '../shared/file-interfaces'

import { 
    letterGradeToNorm,
    normToLetterGrade,
    parseGrade } from '../shared/utils'
import { ReportFiles } from '../shared/report-types'
import TabPane from 'react-bootstrap/TabPane';

interface StudentRawAsg extends RawAssignmentsRow {
    AssignmentDue: string
    AssignedDate: string
    StuLName: string
    StuFName: string
}

export interface StudentAssignments {
    [id: string]: Student
}

export interface Student {
    studentName: string
    homeroom: string
    classes: {[className: string]:
                {[categoryName: string]: {assignments: Assignment[], stats: Category}}}
}

export interface Assignment {
    assignmentName: string
    tpl: boolean
    pointsPossible: number
    points: Score
    assigned: string
    due: string
    entered: string
    assignmentWeight: number
    impact: number
}

interface ClassCategory {
    [className: string]:
                {[categoryName: string]: Category}
}

export interface Category {
    weight: string
    tpl: boolean
    category: string
    classGrade: number
    categoryAverage: number
    teacherName: string
    totalPct: number
}

export const createAssignmentReports = (files: ReportFiles ): StudentAssignments =>{
    const asg = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const cats = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult
    const rawAllAssignments = asg ? asg.data as StudentRawAsg[] : []
    const rawCats = cats ? cats.data as RawTeacherCategoriesAndTotalPointsLogicRow[] : []

    const classCats: ClassCategory = d3.nest<RawTeacherCategoriesAndTotalPointsLogicRow, Category>()
        .key( r=> r.ClassName)
        .key( r=> r.CategoryName)
        .rollup( rs=> {return {
            weight: parseInt(rs[0].CategoryWeight), 
            tpl: rs[0].TotalPointsLogicSetting === 'TPL Yes',
            category: rs[0].CategoryName,
            classGrade: -1,
            categoryAverage: -1,
            teacherName: rs[0].TeacherFirstName + ' ' + rs[0].TeacherLastName,
            totalPct: -1}})
        .object(rawCats.filter(r=>r.CLSCycle === '3'))

    const studentAssignments: StudentAssignments = d3.nest<StudentRawAsg, Student>()
        .key( r => r.StuStudentId)
        .rollup( (rs:StudentRawAsg[]): Student => {
            const name = rs[0].StuFName + ' ' + rs[0].StuLName
            const hr = rs[0].ClassName.slice(rs[0].ClassName.indexOf('(') + 1,-1)
            const classes = d3.nest<StudentRawAsg, {assignments: Assignment[], stats: Category}>()
                .key( r => r.ClassName)
                .key( r => r.CategoryName)
                .rollup( (asgs: StudentRawAsg[]): {assignments: Assignment[], stats: Category}=> {
                    return {assignments: asgs.map(asg => {
                        return {
                            assignmentName: asg.ASGName,
                            tpl: false,
                            pointsPossible: parseInt(asg.ScorePossible),
                            points: asg.Score,
                            assigned: asg.AssignedDate,
                            due: asg.AssignedDate,
                            entered: asg.GradeEnteredOn,
                            assignmentWeight: 0,
                            impact: -1,
                        }}), stats:  {
                            weight: asgs[0].CategoryWeight,
                            tpl: false,
                            category: asgs[0].CategoryName,
                            classGrade: -1,
                            categoryAverage: -1,
                            teacherName: asgs[0].TeacherFirst +' '+ asgs[0].TeacherLast,
                            totalPct: -1,
                        }}
                }).object(rs)
            return {
                studentName: name,
                homeroom: hr,
                classes: classes,
            }
        }).object(rawAllAssignments)

    const computedAssignments:StudentAssignments = {}
    Object.keys(studentAssignments).map( s => {
        computedAssignments[s] = {
            studentName:studentAssignments[s].studentName,
            homeroom:studentAssignments[s].homeroom,
            classes: {}}
        Object.keys(studentAssignments[s].classes).map(cn=> {
            if(classCats[cn]){ 
                computedAssignments[s].classes[cn] = {}
                const total = Object.keys(studentAssignments[s].classes[cn]).reduce( (a,b) => {
                    return a + parseInt(studentAssignments[s].classes[cn][b].stats.weight)},0)
                //get assignment weights and category averages
                Object.keys(classCats[cn]).map(cat => {
                    if(studentAssignments[s].classes[cn][cat]){
                        const assignments = studentAssignments[s].classes[cn][cat].assignments.filter( a => a.points !== '' && a.points !== 'Inc' && a.points !== 'Exc')
                        const catWeight = parseInt(classCats[cn][cat].weight)/total
                        const tpl = classCats[cn][cat].tpl
                        computedAssignments[s].classes[cn][cat] = {assignments: [], stats: {...classCats[cn][cat]}}
                        if(tpl){
                            const pp = assignments.reduce((a,b) => a + b.pointsPossible, 0)
                            computedAssignments[s].classes[cn][cat].assignments = assignments.map( a => {
                                return {...a, assignmentWeight: (a.pointsPossible/pp)*catWeight}
                            })
                            computedAssignments[s].classes[cn][cat].stats = {
                                ...classCats[cn][cat],
                                categoryAverage: computedAssignments[s].classes[cn][cat].assignments.reduce((a,b) => {
                                    return a + parseGrade(b.points)
                                }, 0)/pp * 100,
                                totalPct: total,
                            }
                        }else{
                            computedAssignments[s].classes[cn][cat].assignments = assignments.map( a => {
                                return {...a, assignmentWeight: (1/assignments.length)*catWeight}
                            })
                            computedAssignments[s].classes[cn][cat].stats = {
                                ...classCats[cn][cat],
                                categoryAverage: computedAssignments[s].classes[cn][cat].assignments.reduce((a,b) =>
                                  a + parseGrade(b.points)  ,0)/assignments.length,
                                totalPct: total,
                            }
                        }
                    }else{
                        computedAssignments[s].classes[cn][cat]={assignments: [], stats: {...classCats[cn][cat]}}
                    }
                })
                //get class grade
                const cg = Object.keys(computedAssignments[s].classes[cn]).reduce( (a,b) => {
                    const stats = computedAssignments[s].classes[cn][b].stats
                    const avg = computedAssignments[s].classes[cn][b].assignments.length > 0 ? stats.categoryAverage:0
                    return a + avg * parseInt(stats.weight) / stats.totalPct
                },0)
                //add impacts, class grade, and blanks/incompletes
                Object.keys(computedAssignments[s].classes[cn]).map( c => {
                    const cat = computedAssignments[s].classes[cn][c]
                    computedAssignments[s].classes[cn][c].stats = {...cat.stats, classGrade: cg}
                    if(cat.stats.tpl){
                        computedAssignments[s].classes[cn][c].assignments = cat.assignments.map(a => {
                            return {...a, impact: a.assignmentWeight * ((parseGrade(a.points)/a.pointsPossible*100)-100)}
                        })
                    }else{
                        computedAssignments[s].classes[cn][c].assignments = cat.assignments.map(a => {
                            return {...a, impact: a.assignmentWeight * (parseGrade(a.points)-100)}
                        })
                    }
                    if(studentAssignments[s].classes[cn][c]){
                        computedAssignments[s].classes[cn][c].assignments = computedAssignments[s].classes[cn][c].assignments.concat(
                            studentAssignments[s].classes[cn][c].assignments.filter( a => a.points === '' || a.points === 'Inc' || a.points === 'Exc')
                        )
                    }
                })
            }
        })
    })

    return computedAssignments
}