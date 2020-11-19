import { 
    Score,
    LetterGrade,
    AspenAssignmentRow, } from '../shared/file-interfaces'

export type GradeLogic = 'Categories only' | 'Categories and assignments' | 'Category total points' | 'Total points'



/*
  Working on using this for ES grades, className for index is classID from aspen, 
  currently class name in categories
*/

export interface TeacherClasses {
    [teacherName: string]: {[className: string]: TeacherClass}
}

export interface TeacherClassImpacts {
    [className:string]: {
        tpl: GradeLogic
        assignments: AssignmentImpact[]
    }
}

export interface TeacherClass {
    categories: {[categoryName: string]: Category}
    distribution: GradeDistribution
    className: string
    tpl: GradeLogic
    defaultMode: boolean
    topAssignments: AssignmentImpact[]
}

//experimental schedule nonsense
export interface ScheduleClass extends TeacherClass {
    students: string[] //student id's
    teachers: string[] //list of people who issued assignments, entered grades, or set categories
}

export interface ScheduleClasses {
    [classID: string]: ScheduleClass
}

//Student object to organize assignments since assignments extract doesn't have class name or homeroom information,
//need to join based on student id from grades
export interface StudentAssignments{
    [studentID: string]: {
        [className: string]: AspenAssignmentRow[]
    }
}

/*
 ES Gradebook backend generates two objects, a TeacherGradeDistributions and a TeacherClassCategories
*/

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
    students?: string[] //array of student id's
}

//TeacherClassCategories and Assignment both use AssignmentStats to keep track of data on different scopes
//TeacherClassCategories has stats over whole chimichanga --note this is terrible documentation

export interface Category {
    name: string
    weight: number
    TPL: string
    assignments: Assignment[]
    assignmentStats: AssignmentStats
}

export interface ImpactCategory extends Category {
    assignments: AssignmentImpact[]
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
    grades?:number[] //not used in the category
}

export interface AssignmentImpact extends Assignment{
    categoryDivisor: number //either number of assignments, or number of points
    impact: number
    averageGrade: number
    medianGrade: number
    lowestGrade: number
}

export const blankDistribution: GradeDistribution = {
    A : 0,
    B : 0,
    C : 0,
    D : 0,
    F : 0,
    Blank : 0,
    failingStudents: [],
    students: []
}

export const blankAssignmentStats: AssignmentStats = {
    numBlank: 0,
    numExcused: 0,
    numIncomplete: 0,
    numMissing: 0,
    numZero: 0,
    averageGrade: 0,
    medianGrade: 0,
    lowestGrade: 0,
}