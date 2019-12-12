import {
    Score, } from './file-interfaces'

import {
    GradeLogic,
    ClassCategory} from './teacher-class-interfaces'


/*
 * Initial breakdown of students and their classes based on the student schedules sheet
 */
export interface StudentSchedules {
    [studentID: string]: ScheduleStudent
}
/*
 * names of the form lastname, firstname
 */
export interface ScheduleStudent {
    studentID: string
    studentName: string
    homeroom: string
    classes: {[classID: string]:ScheduleClass}
}

export interface ScheduleClass {
    classID: string
    className: string
    teacherNames: string[]
}

/*
 * for combining the schedule and class categories
 */
export interface ScheduleClassCategories extends ScheduleClass {
    gradingLogic: GradeLogic
    categories: {[categoryName:string]: ClassCategory}
}
export interface ScheduleStudentCategories extends ScheduleStudent {
    classes: {[classID: string]:ScheduleClassCategories}
}

export interface StudentCategorySchedules extends StudentSchedules {
    [studentID: string]: ScheduleStudentCategories
}



export interface StudentAssignments {
    [id: string]: Student
}

export interface Student {
    studentName: string
    homeroom: string
    gradeLevel: string
    onTrack: number
    classes: {[classID: string]: StudentClass}
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