import { 
    Score,
    LetterGrade,
    AspenAssignmentRow, } from '../shared/file-interfaces'

export type GradeLogic = 'Categories only' | 'Categories and assignments' | 'Category total points' | 'Total points'

/*
 *interfaces represeting the base form of a class as drawn from the aspen categories & logic file
 */
export interface ClassCategories{
    className: string
    classID: string
    teacherNames: string[]
    gradingLogic: GradeLogic
    categories: {[categoryName:string]: ClassCategory}
}

export interface ClassCategory {
    categoryWeight: number
}

/*
 * Collecion of classes by their unique ID
 */

export interface SchoolClasses {
    [classID: string]: ClassCategories
}