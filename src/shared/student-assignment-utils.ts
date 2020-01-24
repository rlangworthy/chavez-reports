import * as d3 from 'd3'

import {
    AspenAssignmentRow,
    AspenCategoriesRow,
    AspenESGradesRow,
    StudentSearchListRow, } from './file-interfaces'

import {
    ScheduleClass,
    ScheduleStudent,
    StudentSchedules,
    StudentAssignments,
    StudentClass,
    StudentCategory,
    StudentAssignment,
    StudentCategorySchedules,
    ScheduleClassCategories } from './student-assignment-interfaces'
    
import { 
    parseGrade,
    getOnTrackScore, 
    getGPA, 
    isCoreClass,} from './utils';

import {
    SchoolClasses, 
    ClassCategories,} from './teacher-class-interfaces'

import { StudentClassList } from '../shared/schedule-parser'

export interface Tardies {
    'Student ID': string
    Attended: string
    Absences: string
}

/*
 * Simply collect schedules from the student schedule extract
 */

export const getStudentSchedules = (schedule: StudentClassList[]): StudentSchedules => {
    const studentSchedules: StudentSchedules = d3.nest<StudentClassList>()
        .key(r => r.studentID)
        .rollup((rs:StudentClassList[]):ScheduleStudent => {
            return {
                studentID: rs[0].studentID,
                studentName: rs[0].studentName,
                homeroom: rs[0].homeroom,
                classes: d3.nest<StudentClassList>()
                    .key((r:StudentClassList) => r.courseID)
                    .rollup((rs:StudentClassList[]):ScheduleClass => {
                        return {
                            classID: rs[0].courseID,
                            className: rs[0].courseDesc,
                            teacherNames: rs[0].teacher.split('; ')
                        }
                    })
            }
        })
        .object(schedule)
    return studentSchedules
}

/*
 * Add class categories to student classes, filters classes that don't have categories
 * Add teacher names from categories if they're not in schedule
 */

export const joinClassesandCategories = (schedule : StudentSchedules, classCats: SchoolClasses):StudentCategorySchedules  => {
    const studentCategorySchedules : StudentCategorySchedules = {}
    Object.keys(schedule).forEach(sID => {
        const classes:{[classID: string]:ScheduleClassCategories} = {}
        Object.keys(schedule[sID].classes).forEach(cID => {
            if(classCats[cID]!== undefined){
                classes[cID] = {
                    ...schedule[sID].classes[cID],
                    teacherNames: [...new Set(schedule[sID].classes[cID].teacherNames
                        .concat(classCats[cID].teacherNames))],
                    gradingLogic: classCats[cID].gradingLogic,
                    categories: classCats[cID].categories,
                }
            }
        })

        studentCategorySchedules[sID] = {
            ...schedule[sID],
            classes: classes
        }
    })
    return studentCategorySchedules
}

export const getStudentAssignments = (
    attendance: Tardies[],
    categories: AspenCategoriesRow[],
    assignments: AspenAssignmentRow[],
    schedule: StudentClassList[],
    ):StudentAssignments => {
    
    const classes = d3.nest<StudentClassList>()
        .key(r=>r.studentID)
        .key(r=>r.courseID)
        .object(schedule)
    
    const cats = d3.nest<AspenCategoriesRow>()
        .key(r => r['Class Number'])
        .object(categories)
    
    const asgns = d3.nest<AspenAssignmentRow>()
        .key(r => r['Student ID'])
        .object(assignments)

    const consolidatedStudents: StudentAssignments = {}
    Object.keys(asgns).forEach( id => {
        const stuName = asgns[id][0]['Student First Name'] + ' ' + asgns[id][0]['Student Last Name']
        var homeroom = 'UNDEFINED STUDENT HOMEROOM'
        var gl = 'UNDEFINED STUDENT GRADE LEVEL'
        const classAsignsObj = d3.nest<AspenAssignmentRow>()
            .key(r => r['Class Name'])
            .key(r => r['Category Name'])
            .object(asgns[id])
        const studentClasses: {[className: string]: StudentClass} = {}
        classes[id] && Object.keys(classes[id]).forEach(cid => {
            homeroom = classes[id][cid][0].homeroom
            gl = cid.split('-')[2]
            const currentClassCats: AspenCategoriesRow[] = cats[cid] ? cats[cid] : []
            const gradeLogic = currentClassCats[0] ? currentClassCats[0]['Average Mode Setting'] : 'UNDEFINED CLASS'
            const teacherName = classes[id][cid][0].teacher
            const className = classes[id][cid][0].courseDesc
            
            const categories: {[category: string]: StudentCategory} = {}
            classAsignsObj[className] && Object.keys(classAsignsObj[className]).forEach(catName => {
                const catAsgns = classAsignsObj[className][catName]
                categories[catName] = {
                    weight: catAsgns[0]['Category Weight'],
                    category: catAsgns[0]['Category Name'],
                    assignments: catAsgns.map(convertAsgn)
                }
            })

            if(classAsignsObj[className] !== undefined){
                studentClasses[className] = {
                    className: className,
                    gradeLoic: gradeLogic,
                    teacher: teacherName,
                    categories: categories
                }
            }
        })

        consolidatedStudents[id] = {
            studentName: stuName,
            homeroom : homeroom,
            gradeLevel : gl,
            onTrack : -1,
            classes: studentClasses,
        }
    })
    Object.keys(consolidatedStudents).forEach(id => {
        Object.keys(consolidatedStudents[id].classes).forEach( cName => 
            calculateGrades(consolidatedStudents[id].classes[cName]))
    })
    getOnTrackfromClasses(consolidatedStudents, attendance);
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
                const nValid = categories[a].assignments.filter((a) => includeGrade(a)&&a.pointsPossible>0).length
                const pct = categories[a].percent
                if(pct){
                    const assignmentWeight = pct/nValid
                    categories[a].assignments = categories[a].assignments.map(a => {
                        if(includeGrade(a)&&a.pointsPossible>0){
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
                    .filter((a) => includeGrade(a)&&a.pointsPossible>0)
                    .reduce((a,b):number => a + 100*(parseGrade(b.points)/b.pointsPossible),0)/nValid
            }
        })
    }else{ //if overall total points exists, use that, otherwise category total points
        Object.keys(categories).forEach(a => {
            const catTotal = total ? total : categories[a].categoryTotalPoints
            const catPercent = gradeLogic === 'Total points' ? 100 : categories[a].percent
            if(categories[a].hasAssignments && catTotal !== undefined && catPercent !== undefined){
                const cattp = categories[a].categoryTotalPoints
                categories[a].assignments = categories[a].assignments.map(a => {
                    if(includeGrade(a) && cattp){
                        return {
                            ...a,
                            assignmentWeight: (a.pointsPossible/cattp) * (catPercent),
                            impact: (parseGrade(a.points) -a.pointsPossible) * (catPercent/catTotal)
                        }
                    }else{
                        return a
                    }
                })
                
                if(cattp !== undefined){
                    categories[a].categoryGrade = 100 * categories[a].assignments.reduce((a:number,b:StudentAssignment): number=> {
                        return (a + parseGrade(b.points))
                    }, 0)/cattp
                }
            }
        })
    }
    studentClass.finalGrade = pts ? Object.keys(studentClass.categories).reduce( (a,b) => {
        const catTotal = total ? total : studentClass.categories[b].categoryTotalPoints
        const percent = studentClass.categories[b].percent
        const catGrade = studentClass.categories[b].categoryGrade
                if(catTotal !== undefined && percent !== undefined && catGrade !== undefined){
                    return a + (catGrade * percent)/100
                }else{
                    return a;
                }
            },0): 
        Object.keys(studentClass.categories).reduce((a,b)=> {
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

export const includeGrade = (assignment: StudentAssignment): boolean => {
    if(assignment.points === 'Inc' || assignment.points === 'Exc' 
        || assignment.points === '/' || assignment.points === ''
        || assignment.points === '_3XCLUD3D_' || assignment.points === 'exc'){
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

const getGPAfromClasses = (classes: {[className: string]: StudentClass}): number =>{
    let cores: number[] = []
    Object.keys(classes).forEach(cname => {
        const fg = classes[cname].finalGrade;
        if(isCoreClass(cname) && fg !== undefined){
            cores.push(fg)
        }
    })

    return getGPA(cores)
} 

const getOnTrackfromClasses = (students: StudentAssignments, attData: Tardies[]) => {

    const getTardies = (rs: Tardies[]):number =>{
        const t = rs.find(r=>r.Attended ==='Tardy');
        if(t !== undefined){return parseInt(t.Absences)}
        return 0;
    }

    const getAbsences = (rs: Tardies[]):number =>{
        return rs.filter(r=> r.Attended !== 'Tardy' && r.Attended !== 'Present')
                    .reduce((a,b) => {return a + ((b.Attended === '1/2 Day Excused' || b.Attended === '1/2 Day Unexcused') ?
                                                    parseInt(b.Absences)/2.0 : parseInt(b.Absences))}, 0)
    }

    d3.nest<Tardies, Tardies[]>()
        .key( r => r['Student ID'])
        .rollup( rs => {
            if(students[rs[0]['Student ID']]!==undefined){
                const total = rs.reduce((a,b) => a + parseInt(b.Absences),0);
                const tardy = getTardies(rs);
                const absent = getAbsences(rs);
                const pct = (total-absent)/total * 100;
                students[rs[0]['Student ID']].onTrack = 
                    getOnTrackScore(getGPAfromClasses(students[rs[0]['Student ID']].classes), pct);
            }
            return rs;
        })
        .object(attData)
}