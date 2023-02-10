import * as d3 from 'd3'

import {
    School, 
    SchoolClass,
    StudentClassInfo,
    StudentInfo,
    Assignment,
    } from '../data-handling/data-interfaces'

import {
    getSemesters
    }   from '../data-handling/data-utils'

import {
    getAssignmentStats,
    getAssignmentImpacts,
    getSortedAssignments,
    getCategoryAssignmentStats,
    } from './gradebook-audit-backend'

import {
    parseGrade,
    stringToDate, 
    getCurrentQuarter,
    getCurrentQuarterDate,} from '../shared/utils'

import {
    SY_CURRENT
    } from '../shared/initial-school-dates'

import { ReportFiles } from '../shared/report-types'

import { 
    GradeDistribution,
    AssignmentStats,
    AssignmentImpact,
    Category,
    GradeLogic,
    TeacherClass,
    TeacherClasses,
    StudentAssignments, 
    ImpactCategory,
    blankAssignmentStats,
    blankDistribution,
    ScheduleClass,
    ScheduleClasses,
    ClassSummary} from './gradebook-audit-interfaces'


    export const convertSchooltoScheduleClasses = (files: ReportFiles ):ScheduleClasses => {
        
        const getGradeLevel = (grades: StudentInfo[]): string => {
            const gl = d3.nest<StudentInfo, number>()
                .key((r:StudentInfo) => r['Grade Level'])
                .rollup(rs => rs.length)
                .object(grades)
            const max = Object.keys(gl).reduce((a,b) => gl[a] > gl[b] ? a:b, '')
            return max
        }

        const getTerm = (t: string|undefined):string => {
            if(t === undefined){
                return getCurrentQuarter(SY_CURRENT)
            }
            if(t.includes('Quarter')){
                return 'Term ' + t.split(' ')[1]
            }
            return t
        }

        const convertAssignment = (assignment: Assignment, averageMode: string):AssignmentImpact => {
            const scores = Object.keys(assignment.scores).map(id => assignment.scores[id].Score)
            const max = parseGrade(assignment['Score Possible'])
            const stats = getAssignmentStats(scores, max, averageMode)
            return {
                maxPoints: max,
                assignmentName: assignment['Assignment Name'],
                categoryName: assignment['Category Name'],
                categoryWeight: assignment['Category Weight'],
                dueDate: stringToDate(assignment['Assignment Due']),
                grades: scores,
                stats: stats,
                categoryDivisor: -1, //either number of assignments, or number of points
                impact: -1,
                averageGrade: stats.averageGrade,
                medianGrade: stats.medianGrade,
                lowestGrade: stats.lowestGrade,
            }
        }


        
        var school:School = files.schooData !== undefined ? files.schooData : {fileName: '',classes:{}, students:{}}
        const term = getTerm(files.term) //files.term !== undefined ? 'Term ' + files.term.split(" ")[1] : 'Term ' + getCurrentQuarter(SY_CURRENT)
        const tc:ScheduleClasses = {}
        if(term === 'Semester 1' || term === 'Semester 2'){
            school = getSemesters(school)
        }

        Object.keys(school.classes).forEach(cid => {
            if(cid === "" || Object.keys(school.classes[cid].assignments[term]).length==0){
                return
            }
            const studentClassInfo: StudentClassInfo[] = Object.keys(school.classes[cid].students)
                .filter(k => school.classes[cid].students[k][term] !== undefined)
                .map(k => school.classes[cid].students[k][term])
            const groups:{[grade: string]:StudentClassInfo[]} = d3.nest<StudentClassInfo>()
                .key(r => r['Running Term Letter Grade'])
                .object(studentClassInfo)
            
            const distribution:GradeDistribution = {
                A: groups['A'] !== undefined? groups['A'].length : 0,
                B: groups['B'] !== undefined? groups['B'].length : 0,
                C: groups['C'] !== undefined? groups['C'].length : 0,
                D: groups['D'] !== undefined? groups['D'].length : 0,
                F: groups['F'] !== undefined? groups['F'].length : 0,
                Blank: groups[''] !== undefined? groups[''].length : 0,
                total: Object.keys(school.classes[cid].students).length,
                failingStudents: groups['F'] !== undefined? groups['F'].map(k => 
                    {
                    return {
                        studentName: school.students[k['Student ID']].info["Student First Name"] + ' ' + school.students[k['Student ID']].info["Student Last Name"],
                        quarterGrade: parseGrade(k['Running Term Average']),
                        studentID: k['Student ID'],
                        dl: school.students[k['Student ID']].info['DL Status'],
                        el: school.students[k['Student ID']].info['EL Status'],
                        }
                    }) : []
            }
            const categories: {[categoryName: string]: ImpactCategory} = d3.nest<Assignment>()
                .key(k => k['Category Name'])
                .rollup((ks:Assignment[]):ImpactCategory => {
                    const averageMode = school.classes[cid]['Average Mode']
                    const assignments = ks.map(k=> convertAssignment(k, averageMode))
                    return {
                        name: ks[0]['Category Name'],
                        weight: parseFloat(ks[0]['Category Weight']),
                        assignmentStats:getCategoryAssignmentStats(assignments),
                        assignments: assignments,
                        TPL:averageMode,
                    }
                })
                .object(Object.keys(school.classes[cid].assignments[term]).map(id => school.classes[cid].assignments[term][id]))
            
            const impactCategories = getAssignmentImpacts(categories)
            const totalAsgn = Object.keys(impactCategories).reduce((a,b) => a + impactCategories[b].assignments.length, 0)
            const topAssignments = getSortedAssignments(impactCategories)
            const students = Object.keys(school.classes[cid].students)
            
            tc[cid] = 
            {
                students: students,
                teachers: school.classes[cid].teachers,
                gradeLevel: getGradeLevel(Object.keys(school.classes[cid].students).map(id => school.students[id].info)),
                categories: impactCategories,
                distribution: distribution,
                className: school.classes[cid].Description + ' ' +school.classes[cid]['Class ID'].split('-')[1] + '-' + school.classes[cid]['Class ID'].split('-')[2],
                tpl: school.classes[cid]['Average Mode'] as GradeLogic,
                defaultMode: school.classes[cid]['Gradebook Default Indicator'] === 'Y' ? true:false,
                topAssignments: topAssignments,
                hasGrades: (
                    distribution.A > 0 || 
                    distribution.B > 0 || 
                    distribution.C > 0 || 
                    distribution.D > 0 ||
                    distribution.F > 0),
                hasAsgn: totalAsgn > 0,
                totalAsgn: totalAsgn,
                pctDF: (distribution.F+distribution.D)/distribution.total * 100,
                pctStudentsFailing: distribution.F/students.length * 100, 
                numberOver15: topAssignments.filter(a => a.impact >= 15).length,
            }
        })
        return tc
    }