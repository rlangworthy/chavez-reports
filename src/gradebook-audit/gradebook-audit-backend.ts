import * as d3 from 'd3'
import {
    uniqBy,
    mean,
    median} from 'ramda'

import {
    isAfter, } from 'date-fns'

import {
    AspenAssignmentRow,
    AspenCategoriesRow,
    AspenESGradesRow,
    Score,  } from '../shared/file-interfaces'

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
    Assignment, 
    AssignmentStats,
    AssignmentImpact,
    Category,
    GradeLogic,
    TeacherClass,
    TeacherClasses,
    StudentAssignments, 
    ImpactCategory} from './gradebook-audit-interfaces'

const blankDistribution: GradeDistribution = {
    A : 0,
    B : 0,
    C : 0,
    D : 0,
    F : 0,
    Blank : 0,
    failingStudents: [],
    students: []
}

const blankAssignmentStats: AssignmentStats = {
    numBlank: 0,
    numExcused: 0,
    numIncomplete: 0,
    numMissing: 0,
    numZero: 0,
    averageGrade: 0,
    medianGrade: 0,
    lowestGrade: 0,
}

export const createESGradebookReports = (files: ReportFiles ):TeacherClasses => {
    const gr = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const asg = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult
    const cat = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult
    const aspESGrades = gr ? gr.data as AspenESGradesRow[] : []
    const aspAllAssignments = asg ? asg.data as AspenAssignmentRow[] : []
    const aspCategoriesAndTPL = cat ? cat.data as AspenCategoriesRow[] : []
    //FIXME: hardcoded, should be a choice of the user
    const currentTerm = getCurrentQuarter(SY_CURRENT)
    const qStart = getCurrentQuarterDate(SY_CURRENT)

    const rawESGrades = aspESGrades.filter(g => g['Quarter']===currentTerm)
    const rawAllAssignments = aspAllAssignments.filter(a => isAfter(stringToDate(a['Assigned Date']), qStart))
    const rawCategoriesAndTPL = aspCategoriesAndTPL.filter(c => c['CLS Cycle']===currentTerm ||
        c['CLS Cycle'] ==='All Cycles')
    //first get classes and categories for each teacher
    const teacherClasses: TeacherClasses = getClassesAndCategories(rawCategoriesAndTPL)
    //second add grade distributions (including student list) and class names through the grades extract
    const classesAndGrades: TeacherClasses = getGradeDistributions(rawESGrades, teacherClasses)
    //associate student id's and assignments
    const studentAssignments: StudentAssignments = getStudentAssignment(rawAllAssignments)
    //combine assignments and classes
    const completeTeacherClasses: TeacherClasses = addAssignmentsToClasses(classesAndGrades, studentAssignments)

    return completeTeacherClasses
}

const getClassesAndCategories = (categories: AspenCategoriesRow[]): TeacherClasses => {
    const classes:TeacherClasses = d3.nest<AspenCategoriesRow, TeacherClass>()
        .key(r => r['Teacher First Name'] + ' ' + r['Teacher Last Name'])
        .key(r => r['Class Name'])
        .rollup((rs):TeacherClass => {
            return {
                className: '',
                distribution: blankDistribution,
                categories: d3.nest<AspenCategoriesRow, Category>()
                                .key(r => r['Category Name'])
                                .rollup((js:AspenCategoriesRow[]):Category => {
                                    return{
                                        name: js[0]["Category Name"],
                                        weight: parseInt(js[0]["Category Weight"]),
                                        TPL: js[0]["Average Mode Setting"],
                                        assignments: [],
                                        assignmentStats: blankAssignmentStats,
                                    }
                                }).object(rs) as { [categoryName: string]: Category; },
                tpl:rs[0]["Average Mode Setting"],
                topAssignments: [],
                
                            }
        }).object(categories)
    return classes
}

const getGradeDistributions = (grades: AspenESGradesRow[], teacherClasses: TeacherClasses): TeacherClasses => {
    const distributions = d3.nest<AspenESGradesRow, GradeDistribution>()
        .key((r:AspenESGradesRow) => r["Teacher First Name"] + ' ' + r["Teacher Last Name"])
        .key((r:AspenESGradesRow) => r["Course Number"] + '-' + r.Homeroom)
        .rollup( (rs: AspenESGradesRow[]):{distribution: GradeDistribution, name: string} => {
            const failingStudents = rs.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) < 60)
                .map(r => {
                    return {
                        studentName: r["Student First Name"] + ' ' + r["Student Last Name"],
                        quarterGrade: parseFloat(r["Term Average"])
                    }
                })
            return {distribution: {
                    A: rs.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) > 89).length,
                    B: rs.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) > 79 && parseFloat(r["Term Average"]) < 90).length,
                    C: rs.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) > 69 && parseFloat(r["Term Average"]) < 80).length,
                    D: rs.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) > 59 && parseFloat(r["Term Average"]) < 70).length,
                    F: failingStudents.length,
                    Blank: rs.filter(r => r["Term Average"] === '').length,
                    failingStudents: failingStudents,
                    students: rs.map(r=>r["Student ID"]),
                }, name: rs[0]["Course Name"]}
        }).object(grades);
    //adding the distributions to the teacherclasses, has the list of students there as well.
    Object.keys(teacherClasses).forEach(teacher => {
        if(distributions[teacher]){
            Object.keys(teacherClasses[teacher]).forEach(className => {
                if(distributions[teacher][className]){
                    teacherClasses[teacher][className].distribution = distributions[teacher][className].distribution
                    teacherClasses[teacher][className].className = distributions[teacher][className].name
                }
            })
        }
    })
    return teacherClasses;
}

const getStudentAssignment = (assignments: AspenAssignmentRow[]):StudentAssignments => {
    
    let studentAssignments: StudentAssignments = d3.nest<AspenAssignmentRow, AspenAssignmentRow[]>()
        .key( (r:AspenAssignmentRow) => r["Student ID"])
        .key( (r:AspenAssignmentRow) => r["Class Name"])
        .object(assignments)

    return studentAssignments
}
//Add assignments and do math on them
const addAssignmentsToClasses = (classes:TeacherClasses, assignments: StudentAssignments): TeacherClasses => {
    const teacherClassesFinal: TeacherClasses = {}
    Object.keys(classes).forEach(teacher => {
        teacherClassesFinal[teacher] = {}
        Object.keys(classes[teacher]).forEach(classId => {
            teacherClassesFinal[teacher][classId] = classes[teacher][classId]
            const className = teacherClassesFinal[teacher][classId].className
            if(teacherClassesFinal[teacher][classId].distribution){
                const students = teacherClassesFinal[teacher][classId].distribution.students
                if(students !== undefined){
                    
                    const studentAssignments = students
                        .map(id => assignments[id] && assignments[id][className] ? assignments[id][className]:[])
                        .flat()
                    const categories = teacherClassesFinal[teacher][classId].categories
                    teacherClassesFinal[teacher][classId].categories = addCategoryAssignments(categories, studentAssignments)
                    teacherClassesFinal[teacher][classId].topAssignments = getSortedAssignments(teacherClassesFinal[teacher][classId].categories)
                    teacherClassesFinal[teacher][classId].className = teacherClassesFinal[teacher][classId].className + ' ' + classId.split('-').pop()
                }
            }
        })
    })
    return teacherClassesFinal
}

const getSortedAssignments = (categories : {[category: string]: Category}): AssignmentImpact[] => {
    return Object.keys(categories)
            .map(key => categories[key].assignments as AssignmentImpact[])
            .flat()
            .sort((a:AssignmentImpact, b:AssignmentImpact) => a.impact > b.impact ? 0:1)
}

const addCategoryAssignments = (categories: {[category: string]: Category}, assignments: AspenAssignmentRow[]): {[category: string]: Category} => {
    const asgnCats = d3.nest<AspenAssignmentRow, Assignment>()
        .key((r:AspenAssignmentRow) => r["Category Name"])
        .key((r:AspenAssignmentRow) => r["Assignment Name"])
        .rollup((rs:AspenAssignmentRow[]): Assignment => {
            const scores: Score[] = rs.map(r => r.Score)
            const scorePossible = parseInt(rs[0]["Score Possible"])
            return {
                maxPoints: scorePossible,
                assignmentName: rs[0]["Assignment Name"],
                categoryName: rs[0]["Category Name"],
                categoryWeight: rs[0]["Category Weight"],
                grades: rs.map(r => r.Score),
                stats: getAssignmentStats(scores, scorePossible, ''),
            }
        }).object(assignments)
    
    const catsAndAsgns: {[category: string]: Category} = {}
    Object.keys(categories).forEach(category => {
        const asgs = asgnCats[category] === undefined ? [] : Object.keys(asgnCats[category]).map(name => asgnCats[category][name])
        const stats = asgs.length > 0 ? getTotalAssignmentStats(asgs) : blankAssignmentStats
        catsAndAsgns[category] = {
            ...categories[category],
            assignments: asgs,
            assignmentStats: stats,
        }
    })

    //Last step add assignment impacts
    const asgnImpacts = getAssignmentImpacts(catsAndAsgns)

    return asgnImpacts
}


export const hasCategoryWeightsNot100 = (categories: {
    [categoryName: string]: Category 
}): boolean => {
  //negatives because it kept concatenating the numbers when I used plus.  Weird.
    if(Object.keys(categories).reduce( (a,b) => {return a - categories[b].weight}, 0) === -100) {
      return false;
    } else {
      return true;
    }
};

export const getTotalAssignmentStats = (assignments: Assignment[]):AssignmentStats => {
    const stats = assignments.map( a => a.stats);
    const avg = Math.floor(stats.reduce( (a,b) => a - (Number.isNaN(b.averageGrade) ? 0:b.averageGrade), 0)/(-assignments.length))
    return stats.reduce( (a,b) => {
        return {
            numBlank: a.numBlank+b.numBlank,
            numExcused: a.numExcused+b.numExcused,
            numIncomplete: a.numIncomplete+b.numIncomplete,
            numMissing: a.numMissing+b.numMissing,
            numZero: a.numZero+b.numZero,
            averageGrade: Number.isNaN(avg) ? -1:avg,
            medianGrade: 0,
            lowestGrade: 0,
        }
    })
}

export const getAssignmentStats = (grades: Score[], scorePosible: number, gradeLogic: string, name?: string ):AssignmentStats => {
    const blanks = grades.filter( g => g === '').length;
    const excused = grades.filter( g => g === 'Exc').length;
    const inc = grades.filter( g => g === 'Inc').length;
    const missing = grades.filter( g => g === 'Msg').length;
    const zeroes = grades.filter( g => g === '0').length;
    const numberGrades: number[] = grades.filter( g => g!=='Exc'&&g!=='Inc'&&g!=='')
        .map( g => parseGrade(g)/scorePosible*100)
        .filter(g => g >= 0);
    const gradeStats: {averageGrade: number,
        medianGrade: number,
        lowestGrade: number} = numberGradeStats(numberGrades)
    return {
        numBlank: blanks,
        numExcused: excused,
        numIncomplete: inc,
        numMissing: missing,
        numZero: zeroes,
        grades: numberGrades,
        ...gradeStats
    }
}

const numberGradeStats = (grades: number[]):
    {averageGrade: number,
    medianGrade: number,
    lowestGrade: number} => {
    return {
        averageGrade: mean(grades),
        medianGrade: median(grades),
        lowestGrade: Math.min(...grades),
    }
}

export const getAssignmentImpacts = (c: {
    [categoryName: string]: Category
  }): {[categoryName:string]: ImpactCategory} => {
    const tpl = c[Object.keys(c)[0]].TPL
    const zeroCatsFactor = tpl === 'Total points' ? 1 : -100/(Object.keys(c).reduce( (a,b) => a - (c[b].assignments.length > 0 ? c[b].weight:0), 0))
    const totalPoints = tpl === 'Total points' ? 
        0 - Object.keys(c)
            .reduce( (a,b) => a - c[b].assignments.reduce( (a1,b1) => a1 + b1.maxPoints,0),0) : undefined

    const classAsgns:{[categoryName:string]: ImpactCategory} = {}
    Object.keys(c).forEach( cat => {
        //the divisor for assignment weight
        const total = totalPoints ? totalPoints :
            tpl === 'Categories only' ? c[cat].assignments.length : Math.abs(c[cat].assignments.reduce((a,b) => a - b.maxPoints, 0))
        classAsgns[cat] = {
            ...c[cat], 
            assignments: c[cat].assignments.map( (a):AssignmentImpact => {
            const rawImpact = getImpact(tpl as GradeLogic, a, total);
            return {
                ...a,
                categoryDivisor: total,
                impact: (rawImpact*zeroCatsFactor),
                averageGrade: a.stats.averageGrade,
                medianGrade: a.stats.medianGrade,
                lowestGrade: a.stats.lowestGrade,   
            }
        })}
    })  

    return classAsgns
  }
  
const getImpact = (tpl: GradeLogic, a: Assignment, total: number): number =>{
      if(tpl === 'Total points'){
        return a.maxPoints/total * 100
      }else if(tpl ==='Category total points'){
        return (a.maxPoints/total) * parseInt(a.categoryWeight)
      }else{
        return parseInt(a.categoryWeight)/total
      }
  }

export const getChartData = (assignments: AssignmentImpact[]):any => {
    const percentOther = 100 - Math.abs(assignments.reduce((a,b) => a - b.impact, 0))
    const data = [['Assignment Name', 'Assignment Weight'] as any]
    assignments.forEach( (a, i) => data.push([(a.impact).toFixed(1) + '%', a.impact]))
    data.push(['Others', percentOther])
    return data;
  }