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
    AspenESGradesRow,
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



export const createGradebookReports = (files: ReportFiles ) => {
    const gr = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const asg = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult
    const cat = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult
    const info = files.reportFiles[files.reportTitle.files[3].fileDesc].parseResult
    const aspESGrades = gr ? gr.data as AspenESGradesRow[] : []
    const aspAllAssignments = asg ? asg.data as AspenAssignmentRow[] : []
    const aspCategoriesAndTPL = cat ? cat.data as AspenCategoriesRow[] : []
    const studentInfo = info ? info.data as StudentSearchListRow[] : []
    //FIXME: hardcoded, should be a choice of the user
    const currentTerm = '4';
    const q4Start = new Date(2019, 3, 4)

    const rawESGrades = aspESGrades.filter(g => g['Quarter']===currentTerm).map(convertAspGrades)
    const rawAllAssignments = aspAllAssignments.filter(a => isAfter(stringToDate(a['Assigned Date']), q4Start) 
        ).map(convertAspAsgns)
    const rawCategoriesAndTPL = aspCategoriesAndTPL.filter(c => c['CLS Cycle']===currentTerm ||
     c['CLS Cycle'] ==='All Cycles').map(convertAspCategories)

    const distributions: TeacherGradeDistributions = getGradeDistributions(rawESGrades);
    const {categories, teachers} = getTeachersCategoriesAndAssignments(currentTerm, 
            rawAllAssignments, 
            rawCategoriesAndTPL,
            studentInfo);

    return {distributions: distributions, 
            categories: categories,
            teachers: uniqBy( (a:Teacher) => a.firstName + ' ' + a.lastName, teachers)
                        .sort((a,b) => (a.lastName+ ' ' + a.firstName).localeCompare(b.lastName + ' ' + b.firstName))};
}

const getGradeDistributions = (grades: RawESCumulativeGradeExtractRow[]):TeacherGradeDistributions => {
    const distributions:TeacherGradeDistributions = d3.nest<RawESCumulativeGradeExtractRow, GradeDistribution>()
        .key( r => r.TeacherFirstName + ' ' + r.TeacherLastName)
        .key( (r:RawESCumulativeGradeExtractRow) => r.SubjectName + ' ' + r.StudentGradeLevel.slice(-1) + ' (' + r.StudentHomeroom + ')')
        .rollup( (rs):GradeDistribution => {
            const failingStudents = rs.filter(r => r.QuarterAvg !== '' && r.QuarterAvg < 60)
                .map(r => {
                    return {
                        studentName: r.StudentFirstName + ' ' + r.StudentLastName,
                        quarterGrade: r.QuarterAvg
                    }
                })
            return {
                A: rs.filter(r => r.QuarterAvg !== '' && r.QuarterAvg > 89).length,
                B: rs.filter(r => r.QuarterAvg !== '' && r.QuarterAvg > 79 && r.QuarterAvg < 90).length,
                C: rs.filter(r => r.QuarterAvg !== '' && r.QuarterAvg > 69 && r.QuarterAvg < 80).length,
                D: rs.filter(r => r.QuarterAvg !== '' && r.QuarterAvg > 59 && r.QuarterAvg < 70).length,
                F: failingStudents.length,
                Blank: rs.filter(r => r.QuarterAvg === '').length,
                failingStudents: failingStudents

            }
        }).object(grades);

    return distributions;
}

const getTeachersCategoriesAndAssignments = (
    term: string, 
    assignments: RawAssignmentsRow[], 
    categories: RawTeacherCategoriesAndTotalPointsLogicRow[],
    students: StudentSearchListRow[]): {categories: TeacherClassCategories, teachers: Teacher[]} => {
    
    let classCategories: TeacherClassCategories = d3.nest<RawTeacherCategoriesAndTotalPointsLogicRow, any>()
        .key( r => r.TeacherFirstName + ' ' + r.TeacherLastName)
        .key( r => r.ClassName)
        .key( r => r.CategoryName)
        .rollup( rs => {
            return {
                name: rs[0].CategoryName,
                weight: rs[0].CategoryWeight,
                TPL: rs[0].TotalPointsLogicSetting,
                assignments: [],
                assignmentStats: {
                    numBlank: 0,
                    numExcused: 0,
                    numIncomplete: 0,
                    numMissing: 0,
                    numZero: 0,
                    averageGrade: 0,
                    medianGrade: 0,
                    lowestGrade: 0,
                },
            }
        }).object(categories.filter(c => c.CLSCycle === term || c.CLSCycle === 'All Cycles'))

    const studentHrs = d3.nest<StudentSearchListRow>()
        .key(r => r.STUDENT_ID)
        .rollup(rs=>{
            return {hr: rs[0].STUDENT_CURRENT_HOMEROOM, gl: rs[0].textbox8}
        })
        .object(students)
    
    const classAssignments = d3.nest<RawAssignmentsRow>()
        .key( r => r.TeacherFirst + ' ' + r.TeacherLast)
        .key( r => studentHrs[r.StuStudentId] ? r.ClassName + ' ' + studentHrs[r.StuStudentId].gl + ' (' + studentHrs[r.StuStudentId].hr + ')':
            'UNDEFINED STUDENT HR')
        .key( r => r.CategoryName)
        .key( r => r.ASGName)
        .object(assignments)
    let teachers: Teacher[] = []

    Object.keys(classCategories).forEach( teacher => {
        if(classAssignments[teacher]){
            Object.keys(classCategories[teacher]).forEach( className => {
                if(classAssignments[teacher][className]){
                    Object.keys(classCategories[teacher][className]).forEach( category => {
                        if(classAssignments[teacher][className][category]){
                            const asgs: Assignment[] = Object.keys(classAssignments[teacher][className][category]).map( asg => {
                                const raws: RawAssignmentsRow[] = classAssignments[teacher][className][category][asg]
                                teachers = teachers.concat([{firstName:raws[0].TeacherFirst, lastName: raws[0].TeacherLast}])
                                const grades: Score[] = raws.map( r => r.Score as Score);
                                return {
                                    maxPoints: parseInt(raws[0].ScorePossible),
                                    assignmentName: asg,
                                    categoryName: category,
                                    categoryWeight: classCategories[teacher][className][category].weight.toString(),
                                    grades: grades,
                                    stats: getAssignmentStats(grades, parseInt(raws[0].ScorePossible) , classAssignments[teacher][className][category].TotalPointsLogicSetting,className + '-' + asg)
                                }
                            })
                            classCategories[teacher][className][category].assignments = asgs;
                            classCategories[teacher][className][category].assignmentStats = getTotalAssignmentStats(asgs);
                        }
                    })
                }
            })
        }
    })
    return {categories: classCategories, teachers: teachers};
}

export const hasCategoryWeightsNot100 = (categories: {
    [categoryName: string]: {
        name: string
        weight: number
        TPL: string
        assignments: Assignment[]
    }   
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
  }): {[categoryName:string]: AssignmentImpact[]} => {
    const tpl = c[Object.keys(c)[0]].TPL
    const zeroCatsFactor = tpl === 'Total points' ? 1 : -100/(Object.keys(c).reduce( (a,b) => a - (c[b].assignments.length > 0 ? c[b].weight:0), 0))
    const totalPoints = tpl === 'Total points' ? 
        0 - Object.keys(c)
            .reduce( (a,b) => a - c[b].assignments.reduce( (a1,b1) => a1 + b1.maxPoints,0),0) : undefined

    const classAsgns:{[categoryName:string]: AssignmentImpact[]} = {}
    Object.keys(c).forEach( cat => {
        //the divisor for assignment weight
        const total = totalPoints ? totalPoints :
            tpl === 'Categories only' ? c[cat].assignments.length : Math.abs(c[cat].assignments.reduce((a,b) => a - b.maxPoints, 0))
        classAsgns[cat] = c[cat].assignments.map( (a):AssignmentImpact => {
            const rawImpact = getImpact(tpl as GradeLogic, a, total);
            return {
                ...a,
                categoryDivisor: total,
                impact: (rawImpact*zeroCatsFactor),
                averageGrade: a.stats.averageGrade,
                medianGrade: a.stats.medianGrade,
                lowestGrade: a.stats.lowestGrade,   
            }
        });
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
    const percentOther = 100 + Math.abs(assignments.reduce((a,b) => a - b.impact, 0))
    const data = [['Assignment Name', 'Assignment Weight'] as any]
    assignments.forEach( (a, i) => data.push([(a.impact).toFixed(1) + '%', a.impact]))
    data.push(['Others', percentOther])
    return data;
  }