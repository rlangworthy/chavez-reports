import * as d3 from 'd3'
import * as ramda from 'ramda'

import {
    isAfter
    } from 'date-fns'

import { GradeValidation } from '../shared/file-interfaces'

import { ReportFiles } from '../shared/report-types'

import {
    validationStringToDate,
    CoreClassList,
    letterGradeToNorm,
    } from '../shared/utils'

export interface ValidationDetails {
  'Grade Term' : string,
  'Teacher Name' : string,
  'Course Number' : string,
  'Course Description' : string,
  'Student Name' : string,
  'Student ID' : string,
  'Transcript Column Name' : string,
  'Gradebook Calculation' : number | null,
  'Calculated Letter Grade': string | null,
  'Post Column Mark' : string,
  'Transcript Mark' : string,
  'Gradebook Score Last Update' : Date | null,
  'Post Column Last Updated' : Date | null,
  'Transcript Column Last Updated' : Date | null,
  'Grade Level' : string
}

export interface ValidationErrors {
    twoBeforeOne : ValidationDetails[],
    noCalculatedGrade: ValidationDetails[],
    noStepTwo: ValidationDetails[],
    differentCalculatedFromOneorTwo: ValidationDetails[],
    noCalculatedLetterGrade: ValidationDetails[], //means no grade scale
}

export interface OverallSummary {
    [gradeLevel: string] : {
        coreClasses:{[className: string]: {
                calculatedGPA: number
                postedGPA: number
                adjustments: number //as a percentage of the total
            }
        }
        nonCoreClasses : {
            calculatedGPA: number
            postedGPA: number
            adjustments: number //as a percentage of the total
        }
    }
}

export interface ClassroomValidation {
    errors: ValidationErrors,
    details: ValidationDetails[]
}


export const createGradeValidationReport = (files: ReportFiles) : any => {
    const v = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const validation = v ? v.data as GradeValidation[] : []
    const details = validation.map(g => validationToDetails(g))
    const validationDetails = d3.nest<ValidationDetails, ClassroomValidation>()
        .key(g => g['Teacher Name'])
        .key(g => g['Course Number'])
        .rollup((gs: ValidationDetails[]):ClassroomValidation => {
            const errors = getValidationErrors(gs)

            return {
                errors: errors,
                details: gs
            }
        }).object(details)
    

    const overallSummary: OverallSummary = getOverallSummary(details)

    return {classroomValidations: validationDetails, summary: overallSummary}

}

const getOverallSummary = (vs: ValidationDetails[]): OverallSummary => {
    const summaryGroups = d3.nest<ValidationDetails>()
    .key(g => g['Grade Level'])
    .key(g => g['Course Description'])
    .rollup((gs: ValidationDetails[]) => {
        const errors = getValidationErrors(gs)
        const hasCalculatedLetterGrade = gs.filter(v => v["Calculated Letter Grade"] !== null)
        const hasPostedLetterGrade = gs.filter(v => v["Transcript Mark"] !== null)
        const calculatedGPA = hasCalculatedLetterGrade.map(g => g['Calculated Letter Grade'] !== null ? letterGradeToNorm(g['Calculated Letter Grade']): 0).reduce((a,b) => a+b, 0)/hasCalculatedLetterGrade.length
        const postedGPA = hasPostedLetterGrade.map(g=>letterGradeToNorm(g["Transcript Mark"])).reduce((a,b) => a+b, 0)/hasCalculatedLetterGrade.length
        const adjustments = (errors.differentCalculatedFromOneorTwo.length + errors.noCalculatedLetterGrade.length)/hasPostedLetterGrade.length

        return {
            calculatedGPA: calculatedGPA,
            postedGPA: postedGPA,
            adjustments: adjustments
        }
    }).object(vs)
    console.log(summaryGroups)

    const summary: OverallSummary = {}

    Object.keys(summaryGroups).forEach(gl => {
        
        const [core, nonCore] = ramda.partition((d) => 
        CoreClassList.includes(d), Object.keys(summaryGroups[gl]))
        const gradedNonCore = nonCore.filter(c => !isNaN(summaryGroups[gl][c].calculatedGPA) && summaryGroups[gl][c].postedGPA !== Infinity)
        const nonCoreSummary = {
            calculatedGPA: gradedNonCore.reduce((a,b) => a + summaryGroups[gl][b].calculatedGPA, 0)/gradedNonCore.length,
            postedGPA: gradedNonCore.reduce((a,b) => a + summaryGroups[gl][b].postedGPA, 0)/gradedNonCore.length,
            adjustments: gradedNonCore.reduce((a,b) => a + summaryGroups[gl][b].adjustments, 0)/gradedNonCore.length
        }
        summary[gl] = {
            coreClasses: {},
            nonCoreClasses: nonCoreSummary
        }
        core.forEach(cn => summary[gl].coreClasses[cn] = summaryGroups[gl][cn])
       
    })
    return summary
}


const getValidationErrors = (vs : ValidationDetails[]): ValidationErrors => {
    const missingStep = vs.filter(v => v["Post Column Last Updated"] === null || v["Transcript Column Last Updated"]=== null)
    const noMissing = vs.filter(v => v["Post Column Last Updated"] !== null && v["Transcript Column Last Updated"] !== null)
    const noCalculatedLetterGrade = vs.filter(v => v["Calculated Letter Grade"] === null)
    const hasCalculatedLetterGrade = vs.filter(v => v["Calculated Letter Grade"] !== null)
    return {
        twoBeforeOne : noMissing.filter(g => isAfter(g["Post Column Last Updated"] as Date, g["Transcript Column Last Updated"] as Date)),
        noCalculatedGrade: vs.filter(v => v["Gradebook Calculation"] === null),
        noStepTwo: missingStep,
        differentCalculatedFromOneorTwo: hasCalculatedLetterGrade.filter(v => v["Calculated Letter Grade"] !== v["Post Column Mark"] || v["Calculated Letter Grade"] !== v["Transcript Mark"]),
        noCalculatedLetterGrade: noCalculatedLetterGrade,
    }
}


const validationToDetails = (vs: GradeValidation):ValidationDetails => {
    const calc = vs["Gradebook Calculation"].split(' ')
    const numeric = calc[0] !== '' ? parseFloat(calc[0]) : null
    const letter = calc[1] !== undefined ? calc[1].slice(1,2) : null
    return {
        ...vs,
        'Gradebook Calculation': numeric,
        'Calculated Letter Grade': letter,
        'Gradebook Score Last Update' : vs['Gradebook Score Last Update'] !== '' ? validationStringToDate(vs['Gradebook Score Last Update']) : null,
        'Post Column Last Updated' : vs['Post Column Last Updated'] !== '' ? validationStringToDate(vs['Post Column Last Updated']) : null,
        'Transcript Column Last Updated' : vs['Transcript Column Last Updated'] !== '' ? validationStringToDate(vs['Transcript Column Last Updated']) : null,
        'Grade Level': vs['Course Number'].split('-')[1]
    }
}