import { FileTypes } from './file-types'

export interface ReportTitle {
    title: string
    description: string
    link: string
    files: FileTypes[]
}

export const ReportCards: ReportTitle[] = [
    {
        title: 'Gradebook Audit Report',
        description: 'Check teacher\'s grading habits and make sure no assignments are unfairly weighted.',
        link: '/reports/gradebook-audit/upload/',
        files: [FileTypes.ES_GRADES_EXTRACT, FileTypes.ASSIGNMENTS_SLOW_LOAD, FileTypes.TEACHER_CATEGORIES_TPL],
    },
    {
        title: 'Summerschool Report',
        description: 'Monitor which students are likely to need summer school and are at risk of being retained.',
        link: '/reports/summerschool/upload/',
        files: [FileTypes.ES_GRADES_EXTRACT, FileTypes.NWEA, FileTypes.NWEA, FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION],
    },
    {
        title: 'Staff Absence Report',
        description: 'Look for patterns/problems in staff attendance records.',
        link: '/reports/staff-absence/upload/',
        files: [FileTypes.KRONOS_DATA],
    },
    {
        title: 'NWEA Summarizer',
        description: '',
        link: '/NWEA-summarizer/',
        files: [],
    },
    {
        title: 'Weekly One Pager',
        description: 'Generates a report of all students by homeroom.',
        link: '/reports/weekly-one-pager/upload/',
        files: [FileTypes.ES_GRADES_EXTRACT, FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION, FileTypes.ATTENDENCE,
        FileTypes.ES_GRADES_EXTRACT, FileTypes.ATTENDENCE],
    },
    {
        title: 'Student One Pager',
        description: '',
        link: '/reports/student-one-pager/upload/',
        files: [FileTypes.ES_GRADES_EXTRACT, FileTypes.ATTENDENCE, FileTypes.STUDENT_INFO, FileTypes.NWEA],
    }
]