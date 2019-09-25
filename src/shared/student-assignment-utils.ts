import * as d3 from 'd3'

import {
    AspenAssignmentRow,
    AspenCategoriesRow,
    AspenESGradesRow,
    StudentSearchListRow, } from './file-interfaces'

import {
    StudentAssignments,
    StudentClass,
    StudentCategory,
    StudentAssignment, } from './student-assignment-interfaces'
import { parseGrade } from './utils';

export const getStudentAssignments = (
    grades: AspenESGradesRow[],
    categories: AspenCategoriesRow[],
    assignments: AspenAssignmentRow[],
    ):StudentAssignments => {
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
        const gl = hrs[id] ? hrs[id][0]['Grade Level'].slice(-1) : 'UNDEFINED STUDENT GRADE LEVEL'
        const classObj = d3.nest<AspenAssignmentRow>()
            .key(r => r['Class Name'] + ' ' + gl + ' (' + homeroom + ')')
            .key(r => r['Category Name'])
            .object(asgns[id])
        const classes: {[className: string]: StudentClass} = {}
        Object.keys(classObj).forEach(cname => {
            const currentClassCats: AspenCategoriesRow[] = cats[cname] ? cats[cname] : []
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
    Object.keys(consolidatedStudents).forEach(id => {
        Object.keys(consolidatedStudents[id].classes).forEach( cName => 
            calculateGrades(consolidatedStudents[id].classes[cName]))
    })
    return consolidatedStudents
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
    const pts = gradeLogic === 'Total points' || gradeLogic === 'Category total points'
    
    //get percentage weight of each category
    Object.keys(categories).forEach(a => categories[a].hasAssignments = categories[a].assignments.map(includeGrade).some(a=>a))
    const totalWeight = Object.keys(categories).reduce((a,b) => 
        a + (categories[b].hasAssignments ? parseInt(categories[b].weight) : 0), 0)
    Object.keys(categories).forEach(a => categories[a].percent = parseInt(categories[a].weight) * 100/totalWeight)
    
    //get total points if necessary
    if(pts){
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
    const total = studentClass.classTotalPoints
    //calculate assignment weights and impact
    if(!pts){
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
        Object.keys(categories).forEach(a => {
            const catTotal = total ? total : categories[a].categoryTotalPoints
            const catPercent = gradeLogic === 'Total points' ? 100 : categories[a].percent
            if(categories[a].hasAssignments && catTotal !== undefined && catPercent !== undefined){
                categories[a].assignments = categories[a].assignments.map(a => {
                    if(includeGrade(a)){
                        return {
                            ...a,
                            assignmentWeight: a.pointsPossible,
                            impact: (parseGrade(a.points) -a.pointsPossible) * (catPercent/catTotal)
                        }
                    }else{
                        return a
                    }
                })
            }
        })
    }
    studentClass.finalGrade = pts ? Object.keys(studentClass.categories).reduce( (a,b) => {
        const catTotal = total ? total : studentClass.categories[b].categoryTotalPoints
        if(catTotal !== undefined){
            return a + catTotal
        }else{
            return a;
        }},0): Object.keys(studentClass.categories).reduce((a,b)=> {
            const catGrade = studentClass.categories[b].categoryGrade
            const catPct = studentClass.categories[b].percent
            if(catGrade !== undefined && catPct !== undefined){
                return a + (catGrade * (catPct/100))
            }else {
                return a
            }},0)
}

export const studentSearchToGrade = (student : StudentSearchListRow): AspenESGradesRow => {
    return {
        'Student Last Name': '',
        'Student First Name': '',
        'Student ID' : student.STUDENT_ID,
        'Grade Level' : student.textbox8,
        'Homeroom' : student.STUDENT_CURRENT_HOMEROOM,
        'Quarter' : '',
        'Course Name' : '',
        'Teacher Last Name' : '',
        'Teacher First Name' : '',
        'Term Average' : '',
        'Term Grade' : '',
        'Final Average' : '',
        'Course Number' : '',
    }
}

const includeGrade = (assignment: StudentAssignment): boolean => {
    if(assignment.points === 'Inc' || assignment.points === 'Exc'){
      return false
    }else{
      return true
    }
}

//returns a sorted list of assignments by impact
export const getHighImpactStudentAssignments = (studentClass: StudentClass): StudentAssignment[] => {
    const assignments = Object.keys(studentClass.categories).reduce((a:StudentAssignment[],b) => {
        return a.concat(studentClass.categories[b].assignments)
    }, []).filter(a => a.impact !== undefined)
    return assignments.sort((a,b) => {
        const aImpact = a.impact
        const bImpact = b.impact
        if(aImpact !== undefined && bImpact !== undefined){
            return aImpact-bImpact
        }else{
            return 0
        }
    })
}

//returns an object with homeroom keys and a list of student names
export const getStudentHrObject = (students: StudentAssignments): {[hr: string]: string[]}=> {
    const hrObj: {[hr: string]: string[]}= {}
    Object.values(students).forEach( student => {
        if(hrObj[student.homeroom] === undefined){
            hrObj[student.homeroom] = [student.studentName]
        } else {
            hrObj[student.homeroom] = hrObj[student.homeroom].concat([student.studentName])
         }
    })
    return hrObj
}