import * as d3 from 'd3'
import {
    uniqBy,
    mean,
    median} from 'ramda'

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
import { 
    TeacherGradeDistributions,
    GradeDistribution,
    TeacherClassCategories,
    Assignment, 
    AssignmentStats,
    Teacher, } from './gradebook-audit-interfaces'



export const createGradebookReports = (files: ReportFiles ) =>{
    const gr = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const asg = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult
    const cat = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult
    const rawESGrades = gr ? gr.data as RawESCumulativeGradeExtractRow[] : []
    const rawAllAssignments = asg ? asg.data as RawAssignmentsRow[] : []
    const rawCategoriesAndTPL = cat ? cat.data as RawTeacherCategoriesAndTotalPointsLogicRow[] : []
    const currentTerm = rawESGrades[0].Quarter;
    const distributions: TeacherGradeDistributions = getGradeDistributions(rawESGrades);
    const {categories, teachers} = getTeachersCategoriesAndAssignments(currentTerm, rawAllAssignments, rawCategoriesAndTPL);

    return {distributions: distributions, 
            categories: categories,
            teachers: uniqBy( a => a.firstName + a.lastName, teachers)
                        .sort((a,b) => (a.lastName+a.firstName).localeCompare(b.lastName+b.firstName))};
}

const getGradeDistributions = (grades: RawESCumulativeGradeExtractRow[]):TeacherGradeDistributions => {
    const distributions:TeacherGradeDistributions = d3.nest<RawESCumulativeGradeExtractRow, GradeDistribution>()
        .key( r => r.TeacherFirstName + r.TeacherLastName)
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
    categories: RawTeacherCategoriesAndTotalPointsLogicRow[]): {categories: TeacherClassCategories, teachers: Teacher[]} => {
    let classCategories: TeacherClassCategories = d3.nest<RawTeacherCategoriesAndTotalPointsLogicRow, any>()
        .key( r => r.TeacherFirstName + r.TeacherLastName)
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
        }).object(categories.filter(c => c.CLSCycle === term))
    
    const classAssignments = d3.nest<RawAssignmentsRow>()
        .key( r => r.TeacherFirst + r.TeacherLast)
        .key( r => r.ClassName)
        .key( r => r.CategoryName)
        .key( r => r.ASGName)
        .object(assignments)
    const teachers: Teacher[] = []
    
    Object.keys(classCategories).map( teacher => {
        if(classAssignments[teacher]){
            Object.keys(classCategories[teacher]).map( className => {
                if(classAssignments[teacher][className]){
                    Object.keys(classCategories[teacher][className]).map( category => {
                        if(classAssignments[teacher][className][category]){
                            const asgs: Assignment[] = Object.keys(classAssignments[teacher][className][category]).map( asg => {
                                const raws: RawAssignmentsRow[] = classAssignments[teacher][className][category][asg]
                                teachers.push({firstName:raws[0].TeacherFirst, lastName: raws[0].TeacherLast})
                                const grades: Score[] = raws.map( r => r.Score as Score);
                                return {
                                    maxPoints: parseInt(raws[0].ScorePossible),
                                    assignmentName: asg,
                                    categoryName: category,
                                    categoryWeight: raws[0].CategoryWeight,
                                    grades: grades,
                                    stats: getAssignmentStats(grades, className + '-' + asg)
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

export const getAssignmentStats = (grades: Score[], name?: string):AssignmentStats => {
    const blanks = grades.filter( g => g === '').length;
    const excused = grades.filter( g => g === 'Exc').length;
    const inc = grades.filter( g => g === 'Inc').length;
    const missing = grades.filter( g => g === 'Msg').length;
    const zeroes = grades.filter( g => g === '0').length;
    const numberGrades: number[] = grades.filter( g => g!=='Exc'&&g!=='Inc'&&g!=='').map( g => parseGrade(g)).filter(g => g >= 0);
    /*
    const letterGrades = grades.filter( g =>  LetterGradeList.includes(g));
    if( numberGrades.length >0 && letterGrades.length >0){
        console.log('Error: number and letter grades for same assignment');
        name ? console.log(name): null;
        console.log(numberGrades, letterGrades);
        return {
            numBlank: blanks,
            numExcused: excused,
            numIncomplete: inc,
            numMissing: missing,
            numZero: zeroes,
            averageGrade:-1,
            medianGrade:-1,
            lowestGrade:-1,
        }
    }*/
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

const letterGradeStats = (grades: string[]):
{averageGrade: number | LetterGrade,
medianGrade: number | LetterGrade,
lowestGrade: number | LetterGrade} => {
    const norms = grades.map(letterGradeToNorm);
    return {
        averageGrade: normToLetterGrade(mean(norms)),
        medianGrade: normToLetterGrade(median(norms)),
        lowestGrade: normToLetterGrade(Math.min(...norms)),
    }
}