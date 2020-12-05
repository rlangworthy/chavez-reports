import * as d3 from 'd3'

import {
    isAfter
    } from 'date-fns'
import { is } from 'ramda'

import { GradeValidation } from '../shared/file-interfaces'

import { ReportFiles } from '../shared/report-types'

import {
    validationStringToDate
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
}

export interface ValidationErrors {
    twoBeforeOne : ValidationDetails[],
    noCalculatedGrade: ValidationDetails[],
    noStepTwo: ValidationDetails[],
    differentCalculatedFromOneorTwo: ValidationDetails[],
    noCalculatedLetterGrade: ValidationDetails[], //means no grade scale
}

export interface ClassroomValidation {
    errors: ValidationErrors,
    details: ValidationDetails[]
}
export const createGradeValidationReport = (files: ReportFiles) : any => {
    const v = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const validation = v ? v.data as GradeValidation[] : []

    const validationDetails = d3.nest<GradeValidation, ClassroomValidation>()
        .key(g => g['Teacher Name'])
        .key(g => g['Course Number'])
        .rollup((gs: GradeValidation[]):ClassroomValidation => {
            const details = gs.map(g => validationToDetails(g))
            const errors = getValidationErrors(details)

            return {
                errors: errors,
                details: details
            }
        }).object(validation)
    console.log(validationDetails)
    return validationDetails

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
    }
}