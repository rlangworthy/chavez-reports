import * as d3 from 'd3'

import {isAfter} from 'date-fns'

import {
    RawAssignmentsRow,
    RawTeacherCategoriesAndTotalPointsLogicRow,
    AspenAssignmentRow,
    AspenCategoriesRow,
    Score,
    StudentSearchListRow } from '../shared/file-interfaces'

import { 
    convertAspAsgns,
    convertAspCategories,
    parseGrade,
    stringToDate } from '../shared/utils'
import { ReportFiles } from '../shared/report-types'

interface StudentRawAsg extends RawAssignmentsRow {
    AssignmentDue: string
    AssignedDate: string
    StuLName: string
    StuFName: string
    GradeLevel: string
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
    const st = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult
    const aspAllAssignments = asg ? asg.data as AspenAssignmentRow[] : []
    const aspCats = cats ? cats.data as AspenCategoriesRow[] : []
    const studData = st? st.data as StudentSearchListRow[] : []
    const currentTerm = '4'
    const q4Start = new Date(2019, 3, 5)

    const rawAllAssignments=aspAllAssignments.filter(a => isAfter(stringToDate(a['Assigned Date']), q4Start))
        .map((a:AspenAssignmentRow):StudentRawAsg => {return {
            ...convertAspAsgns(a),
            AssignedDate: a['Assigned Date'],
            AssignmentDue: a['Assignment Due'],StuLName: a['Student Last Name'], StuFName: a['Student First Name'],
            GradeLevel: a['Grade Level']  
        }})
    const rawCats = aspCats.filter(c => c['CLS Cycle']===currentTerm || c['CLS Cycle'] === 'All Cycles').map(convertAspCategories)
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
        .object(rawCats)
    
    const hrs = d3.nest<StudentSearchListRow>()
        .key( r => r.STUDENT_ID)
        .rollup( rs => rs[0].STUDENT_CURRENT_HOMEROOM)
        .object(studData)

    const studentAssignments: StudentAssignments = d3.nest<StudentRawAsg, Student>()
        .key( r => r.StuStudentId)
        .rollup( (rs:StudentRawAsg[]): Student => {
            const name = rs[0].StuFName + ' ' + rs[0].StuLName
            const hr = hrs[rs[0].StuStudentId] ? hrs[rs[0].StuStudentId] : 'no hr'
            const classes = d3.nest<StudentRawAsg, {assignments: Assignment[], stats: Category}>()
                .key( r => r.ClassName + ' ' + r.GradeLevel.slice(-1) + ' (' + hr + ')')
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
    
    console.log(studentAssignments)
    console.log(classCats)
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
                                  a + (parseGrade(b.points)/b.pointsPossible*100)  ,0)/assignments.length,
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