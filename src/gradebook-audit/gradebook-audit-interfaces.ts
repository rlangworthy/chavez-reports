import { 
    Score,
    LetterGrade, } from '../shared/file-interfaces'

export type GradeLogic = 'Categories only' | 'Categories and assignments' | 'Category total points' | 'Total points'

export interface Teacher {
    firstName: string
    lastName: string
}

export interface GradeDistribution {
    A : number
    B : number
    C : number
    D : number
    F : number
    Blank : number
    failingStudents: {
        studentName: string
        quarterGrade: number
    }[]
}

export interface TeacherGradeDistributions { 
    [teacher: string] : {
        [className: string]: GradeDistribution
    }
}
//TeacherClassCategories and Assignment both use AssignmentStats to keep track of data on different scopes
//TeacherClassCategories has stats over whole chimichanga --note this is terrible documentation
export interface TeacherClassCategories {
    [teacherName: string]: ClassCategories
}

export interface ClassCategories {
    [className: string]: {
        [categoryName: string]: Category
    }
}

export interface Category {
    name: string
    weight: number
    TPL: string
    assignments: Assignment[]
    assignmentStats: AssignmentStats
}

export interface Assignment {
    maxPoints: number
    assignmentName: string
    categoryName: string
    categoryWeight: string
    grades: Score[]
    stats: AssignmentStats
}

export interface AssignmentStats {
    numBlank: number
    numExcused: number
    numIncomplete: number
    numMissing: number
    numZero: number
    averageGrade: number
    medianGrade: number
    lowestGrade: number
    grades?:number[]
}

export interface AssignmentImpact extends Assignment{
    categoryDivisor: number //either number of assignments, or number of points
    impact: number
    averageGrade: number
    medianGrade: number
    lowestGrade: number
}
