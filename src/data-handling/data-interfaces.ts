
//contains all personal information about a student and a list of their classes
export interface Student{
    info: StudentInfo
    classes: string[]
}
export interface StudentInfo{
    StudentID: number
}

export interface SchoolClass{
    teachers: string[]
    students: string[]
    info: ClassInfo
}

export interface ClassInfo{
    assignments: Assignment[]
    averageMode: string
}

export interface Assignment{
    scores: {id: Score}
}

export type Score = number

export interface School {
    students: {id: Student}
    classes: {cid: SchoolClass}
}