import * as d3 from 'd3'
import {
    mean,
    median,
    uniq} from 'ramda'

import {
    isAfter,
    isBefore, } from 'date-fns'

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
    parseSchedule,
    StudentClassList } from '../shared/schedule-parser'

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
    ImpactCategory,
    blankAssignmentStats,
    blankDistribution,
    ScheduleClass,
    ScheduleClasses,} from './gradebook-audit-interfaces'

export const createESGradebookReports = (files: ReportFiles ):TeacherClasses => {
    const gr = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const asg = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult
    const cat = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult
    const sched = files.reportFiles[files.reportTitle.files[3].fileDesc].parseResult
    const SS = sched ? sched.data as string[][] : []
    const aspESGrades = gr ? gr.data as AspenESGradesRow[] : []
    const aspAllAssignments = asg ? asg.data as AspenAssignmentRow[] : []
    const aspCategoriesAndTPL = cat ? cat.data as AspenCategoriesRow[] : []
    const studentSched = parseSchedule(SS)
    //FIXME: hardcoded, should be a choice of the user
    const currentTerm = getCurrentQuarter(SY_CURRENT)
    const qStart = getCurrentQuarterDate(SY_CURRENT)
    const rawESGrades = aspESGrades.filter(g => g['Quarter']===currentTerm)

    const rawAllAssignments = aspAllAssignments.filter(a => 
        isAfter(stringToDate(a['Assigned Date']), qStart) &&
        isBefore(stringToDate(a['Assignment Due']), new Date()))
    console.log(aspAllAssignments)
    const rawCategoriesAndTPL = aspCategoriesAndTPL.filter(c => c['CLS Cycle']===currentTerm ||
        c['CLS Cycle'] ==='All Cycles')
    const scheduleClasses: ScheduleClasses = getScheduleClasses(studentSched)
    console.log(scheduleClasses)
    //first get classes and categories
    const classCats: ScheduleClasses = getClassesAndCategories(rawCategoriesAndTPL, scheduleClasses)
    //second add grade distributions (including student list) and class names through the grades extract
    const classGrades: ScheduleClasses = getGradeDistributions(rawESGrades, classCats)
    //associate student id's and assignments
    const studentAssignments = getStudentAssignment(rawAllAssignments)
    //combine assignments and classes
    const classesFinal = addAssignmentsToClasses(classGrades, studentAssignments)
    const teacherclasses = invertScheduleClasses(classesFinal)
    return teacherclasses
    
}

const getScheduleClasses = (schedule: StudentClassList []): ScheduleClasses => {
    const classes: ScheduleClasses = d3.nest<StudentClassList, ScheduleClass>()
        .key((r: StudentClassList) => r.courseID)
        .rollup((rs: StudentClassList[]): ScheduleClass => {
            return {
                students: rs.map((r: StudentClassList) => r.studentID),
                teachers: rs[0].teacher.split('; '),
                categories: {},
                distribution: blankDistribution,
                className: rs[0].courseDesc,
                tpl: "Categories and assignments", //random value to be filled in later
                topAssignments:[],
            }
        }).object(schedule)
    return classes
}

const getClassesAndCategories = (categories: AspenCategoriesRow[], schedule: ScheduleClasses): ScheduleClasses => {
    const classCats: ScheduleClasses = {}
    const classes: ScheduleClasses = d3.nest<AspenCategoriesRow, TeacherClass>()
        .key(r => r['Class Number'])
        .rollup((rs: AspenCategoriesRow[]):ScheduleClass => {
            return {
                teachers: [rs[0]["Teacher Last Name"] + ', ' + rs[0]["Teacher First Name"]],
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
                tpl:rs[0]["Average Mode Setting"] as GradeLogic,
                topAssignments: [],
                students:[],
                
                            }
        }).object(categories)

    Object.keys(classes).forEach(cID => {
        if(schedule[cID] !== undefined){
            classCats[cID]= {
                teachers: classes[cID].teachers.concat(schedule[cID].teachers),
                className: schedule[cID].className,
                distribution: blankDistribution,
                categories: classes[cID].categories,
                tpl: classes[cID].tpl,
                topAssignments: [],
                students: schedule[cID].students,
            }
        }
    })
    
    return classCats
}

const getGradeDistributions = (grades: AspenESGradesRow[], classes: ScheduleClasses): ScheduleClasses => {
    const distClasses: ScheduleClasses = {}
    const studentGrades = d3.nest<AspenESGradesRow, GradeDistribution>()
        .key((r:AspenESGradesRow) => r["Student ID"])
        //Use just course number here, of form code-gradelevel
        .key((r:AspenESGradesRow) => r["Course Name"])
        .object(grades);

    //adding the distributions to the teacherclasses, has the list of students there as well.
    Object.keys(classes).forEach(cID => {
        const students = classes[cID].students
        const className = classes[cID].className
        const grades: AspenESGradesRow[] = students
            .filter(sID => studentGrades[sID] !== undefined && studentGrades[sID][className]!==undefined)
            .map(sID => studentGrades[sID][className][0])
        distClasses[cID] = {
            ...classes[cID],
            distribution: getDistribution(grades),
        }
    })
    return distClasses;
}

const getDistribution = (grades: AspenESGradesRow[]): GradeDistribution => {
    const failingStudents = grades.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) < 60)
                .map(r => {
                    return {
                        studentName: r["Student First Name"] + ' ' + r["Student Last Name"],
                        quarterGrade: parseFloat(r["Term Average"])
                    }
                })
    return {
            A: grades.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) > 89).length,
            B: grades.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) > 79 && parseFloat(r["Term Average"]) < 90).length,
            C: grades.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) > 69 && parseFloat(r["Term Average"]) < 80).length,
            D: grades.filter(r => r["Term Average"] !== '' && parseFloat(r["Term Average"]) > 59 && parseFloat(r["Term Average"]) < 70).length,
            F: failingStudents.length,
            Blank: grades.filter(r => r["Term Average"] === '').length,
            failingStudents: failingStudents,
            students: grades.map(r=>r["Student ID"]),
        }
}

const getStudentAssignment = (assignments: AspenAssignmentRow[]):StudentAssignments => {
    
    let studentAssignments: StudentAssignments = d3.nest<AspenAssignmentRow, AspenAssignmentRow[]>()
        .key( (r:AspenAssignmentRow) => r["Student ID"])
        .key( (r:AspenAssignmentRow) => r["Class Name"])
        .object(assignments)

    return studentAssignments
}

//Add assignments and do math on them, update class name to reflect the section number
const addAssignmentsToClasses = (classes:ScheduleClasses, assignments: StudentAssignments): ScheduleClasses => {
    const classesFinal: ScheduleClasses = {}
    Object.keys(classes).forEach(cID => {
        classesFinal[cID] = classes[cID]
        const className = classesFinal[cID].className
        const students = classesFinal[cID].students
    
        
        const studentAssignments = students
            .map(id => assignments[id] && assignments[id][className] ? assignments[id][className]:[])
            .flat()
        const categories = classesFinal[cID].categories
        classesFinal[cID].categories = addCategoryAssignments(categories, studentAssignments)
        classesFinal[cID].topAssignments = getSortedAssignments(classesFinal[cID].categories)
        classesFinal[cID].className = classesFinal[cID].className + '-' + cID.split('-').slice(-2).join('-')
        }
    )
    return classesFinal
}

const getSortedAssignments = (categories : {[category: string]: Category}): AssignmentImpact[] => {
    
    
    const sorted =  Object.keys(categories)
            .map(key => categories[key].assignments as AssignmentImpact[])
            .flat()
            .sort((a:AssignmentImpact, b:AssignmentImpact) => a.impact > b.impact ? -1:1)

    return sorted
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
    const stats = assignments.map( a => a.stats).filter(a => isFinite(a.averageGrade));
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
    }, {...blankAssignmentStats})
}

export const getAssignmentStats = (grades: Score[], scorePosible: number, gradeLogic: string, name?: string ):AssignmentStats => {
    const blanks = grades.filter( g => g === '').length;
    const excused = grades.filter( g => g === 'Exc' || g === '/').length;
    const inc = grades.filter( g => g === 'Inc').length;
    const missing = grades.filter( g => g === 'Msg').length;
    const zeroes = grades.filter( g => g === '0').length;
    const numberGrades: number[] = grades.filter( g => g!=='Exc'&&g!=='Inc'&&g!==''&&g!=='/')
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

//
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
    data.push(['Others', percentOther > 0 ? percentOther:0])
    return data;
  }


const invertScheduleClasses = (schedule: ScheduleClasses): TeacherClasses => {
      const teacherclasses: TeacherClasses = {}

      Object.keys(schedule).forEach(cID => {
        const teachers = getUniqueTeachers(schedule[cID].teachers)
        if(teacherclasses[teachers] === undefined){
            teacherclasses[teachers] = {}
        }
        teacherclasses[teachers][cID] = schedule[cID]
      })
      return teacherclasses
  }

const getUniqueTeachers = (teachers: string[]):string => {
      return uniq(teachers).sort().join('; ')
  }