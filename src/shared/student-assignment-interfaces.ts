import {
    RawAssignmentsRow,
    RawTeacherCategoriesAndTotalPointsLogicRow,
    AspenAssignmentRow,
    AspenCategoriesRow,
    Score,
    StudentSearchListRow } from './file-interfaces'

export interface StudentAssignments {
    [id: string]: Student
}

export interface Student {
    studentName: string
    homeroom: string
    gradeLevel: string
    onTrack: number
    classes: {[className: string]: StudentClass}
}

export interface StudentClass {
    className: string
    gradeLoic: string
    teacher: string
    finalGrade?: number
    classTotalPoints?: number
    categories: {[category: string]: StudentCategory}
}

export interface StudentCategory {
    categoryTotalPoints?:number
    percent?:number //calculated percent of overall grade this category represents
    categoryGrade?:number //grade of just this category
    hasAssignments?:boolean
    weight: string
    category: string
    assignments: StudentAssignment[]
}

export interface StudentAssignment {
    assignmentName: string
    pointsPossible: number
    points: Score
    assigned: string
    due: string
    entered: string
    assignmentWeight?: number
    impact?: number
}