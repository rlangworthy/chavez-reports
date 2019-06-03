import * as d3 from 'd3'

import {
    AspenAssignmentRow,
    AspenCategoriesRow,
    AspenESGradesRow, } from './file-interfaces'

import {
    StudentAssignments,
    Student,
    StudentClass,
    StudentCategory,
    StudentAssignment, } from './student-assignment-interfaces'
import { parseGrade } from './utils';

const getStudentAssignments = (
    grades: AspenESGradesRow[],
    categories: AspenCategoriesRow[],
    assignments: AspenAssignmentRow[],
    ) => {
    const currentQuarter = '4'
    const hrs = d3.nest<AspenESGradesRow>()
        .key(r => r['Student ID'])
        .object(grades)
    
    const cats = d3.nest<AspenCategoriesRow>()
        .key(r => r['Class Name'])
        .object(categories)
    
    const asgns = d3.nest<AspenAssignmentRow>()
        .key(r => r['Student ID'])
        .object(assignments)
    
    const consolidatedStudents: StudentAssignments = {}
    Object.keys(asgns).forEach( id => {
        const stuName = asgns[id][0]['Student First Name'] + ' ' + asgns[id][0]['Student Last Name']
        const homeroom = hrs[id] ? hrs[id][0]['Homeroom'] : 'UNDEFINED STUDENT HOMEROOM'
        const gl = hrs[id] ? hrs[id][0]['Grade Level'] : 'UNDEFINED STUDENT GRADE LEVEL'
        const classObj = d3.nest<AspenAssignmentRow>()
            .key(r => r['Class Name'] + ' ' + gl + ' (' + homeroom + ')')
            .key(r => r['Category Name'])
            .object(asgns[id])
        const classes: {[className: string]: StudentClass} = {}
        Object.keys(classObj).forEach(cname => {
            const currentClassCats: AspenCategoriesRow[] = cats[cname] ? cats[cname].filter(c => c['CLS Cycle'] === currentQuarter || c['CLS Cycle'] === 'All Cycles') : []
            const gradeLogic = currentClassCats[0] ? currentClassCats[0]['Average Mode Setting'] : 'UNDEFINED CLASS'
            const teacherName = cats[cname] ? cats[cname][0]['Teacher First Name'] + ' ' + cats[cname][0]['Teacher Last Name'] : 'UNDEFINED CLASS'
            
            const categories: {[category: string]: StudentCategory} = {}
            Object.keys(classObj[cname]).forEach(catName => {
                const catAsgns = classObj[cname][catName]
                categories[catName] = {
                    weight: catAsgns[0]['Category Weight'],
                    category: catAsgns[0]['Category Name'],
                    assignments: catAsgns.map(convertAsgn)
                }
            })

            classes[cname] = {
                gradeLoic: gradeLogic,
                teacher: teacherName,
                categories: categories
            }
        })

        consolidatedStudents[id] = {
            studentName: stuName,
            homeroom : homeroom,
            gradeLevel : gl,
            classes: classes
        }
    })
}

const convertAsgn = (asgn: AspenAssignmentRow): StudentAssignment => {
    return {
        assignmentName: asgn['Assignment Name'],
        pointsPossible: parseInt(asgn['Score Possible']),
        points: asgn['Score'],
        assigned: asgn['Assigned Date'],
        due: asgn['Assignment Due'],
        entered: asgn['Grade entered on'],

    }
}

const calculateGrades = (studentClass: StudentClass) => {
    const gradeLogic = studentClass.gradeLoic
    const categories = studentClass.categories
    
    //get percentage weight of each category
    Object.keys(categories).forEach(a => categories[a].hasAssignments = categories[a].assignments.map(includeGrade).some(a=>a))
    const totalWeight = Object.keys(categories).reduce((a,b) => 
        a + (categories[b].hasAssignments ? parseInt(categories[b].weight) : 0), 0)
    Object.keys(categories).forEach(a => categories[a].percent = parseInt(categories[a].weight) * 100/totalWeight)
    
    //get total points if necessary
    if(gradeLogic === 'Total points' || gradeLogic === 'Category total points'){
        Object.keys(categories).forEach(a => {
            const assignments = categories[a].assignments.filter(includeGrade)
            categories[a].categoryTotalPoints = assignments.reduce((a,b) => a + b.pointsPossible, 0)
        })
        if(gradeLogic === 'Total points'){
            studentClass.classTotalPoints = Object.keys(categories)
                .reduce((a,b) => {
                    const ctp = categories[b].categoryTotalPoints
                    if(ctp !== undefined){
                        return a + ctp
                    }else{
                        return a
                    }
                }, 0)
        }
    }

    //calculate assignment weights and impact
    if(gradeLogic === 'Categories only' || gradeLogic === 'UNDEFINED CLASS' || gradeLogic === 'Categories and Assignments'){
        Object.keys(categories).forEach(a => {
            if(categories[a].hasAssignments) {
                const nValid = categories[a].assignments.filter(includeGrade).length
                const pct = categories[a].percent
                if(pct){
                    const assignmentWeight = pct/nValid
                    categories[a].assignments = categories[a].assignments.map(a => {
                        if(includeGrade(a)){
                            return {
                                ...a,
                                assignmentWeight: assignmentWeight,
                                impact: assignmentWeight * ((parseGrade(a.points)/a.pointsPossible)-1)
                            }
                        }else{
                            return a
                        }
                    })
                }
                categories[a].categoryGrade = categories[a].assignments
                    .filter(includeGrade)
                    .reduce((a,b):number => a + 100*(parseGrade(b.points)/b.pointsPossible),0)/nValid
            }
        })
    }else{ //if overall total points exists, use that, otherwise category total points
        const total = studentClass.classTotalPoints
        Object.keys(categories).forEach(a => {
            const catTotal = total ? total : categories[a].categoryTotalPoints
            const catPercent = gradeLogic === 'Total points' ? 1 : categories[a].percent
            if(categories[a].hasAssignments){
                categories[a].assignments = categories[a].assignments.map(a => {
                    if(includeGrade(a)){
                        return {
                            ...a,
                            assignmentWeight: a.pointsPossible
                            
                        }
                    }else{
                        return a
                    }
                })
            }
        })
    }

}

const includeGrade = (assignment: StudentAssignment): boolean => {
    if(assignment.points === 'Inc' || assignment.points === 'Exc'){
      return false
    }else{
      return true
    }
  }