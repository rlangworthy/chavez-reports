export interface Student {
  studentID: string
  studentFirstName: string
  studentLastName: string
  studentHomeroom: string
  studentGradeLevel: string

  mathGrade: number | null
  readingGrade: number | null
  lyNWEAMath: number | null
  lyNWEARead: number | null
  cyNWEAMath: number | null
  cyNWEARead: number | null
  ellStatus: boolean
  spEdExempt: boolean
}
