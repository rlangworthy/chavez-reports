import {
    FileTypes } from './file-types'
import { keys } from 'ts-transformer-keys';

import {
    AspenESGradesRow,
    AspenAssignmentRow,
    AspenCategoriesRow,
    RawStudentProfessionalSupportDetailsRow,
    RawStaffAbsenceRow,
    RawPunchcardRow,
    StudentSearchListRow,
    RawNWEACDFRow,

} from './file-interfaces'

const aspenESGradesRow : string[] = keys<AspenESGradesRow>()
const aspenAssignmentRow: string[] = keys<AspenAssignmentRow>()
const aspenCategoriesRow: string[] = keys<AspenCategoriesRow>()
const rawStudentProfessionalSupportDetailsRow: string[] = keys<RawStudentProfessionalSupportDetailsRow>()
const rawStaffAbsenceRow: string[] = keys<RawStaffAbsenceRow>()
const rawPunchcardRow: string[] = keys<RawPunchcardRow>()
const studentSearchListRow: string[] = keys<StudentSearchListRow>()
const rawNWEACDFRow: string[] = keys<RawNWEACDFRow>()

export const getFileType = (fields: string[] | undefined): string => {
    if(fields !== undefined){
        const fieldStrings = fields as string[]
        if(aspenESGradesRow.every(field => fieldStrings.includes(field))){
            return FileTypes.ES_GRADES_EXTRACT
        }
        if(aspenAssignmentRow.every(field => fieldStrings.includes(field))){
            return FileTypes.ASSIGNMENTS_SLOW_LOAD
        }
        if(aspenCategoriesRow.every(field => fieldStrings.includes(field))){
            return FileTypes.TEACHER_CATEGORIES_TPL
        }
        if(rawStudentProfessionalSupportDetailsRow.every(field => fieldStrings.includes(field))){
            return FileTypes.TOTAL_STUDENTS_SPED_INSTRUCTION
        }
        if(rawStaffAbsenceRow.every(field => fieldStrings.includes(field))){
            return FileTypes.KRONOS_DATA
        }
        if(rawPunchcardRow.every(field => fieldStrings.includes(field))){
            return FileTypes.KRONOS_DATA
        }
        if(studentSearchListRow.every(field => fieldStrings.includes(field))){
            return FileTypes.STUDENT_INFO
        }
        if(rawNWEACDFRow.every(field => fieldStrings.includes(field))){
            return FileTypes.NWEA
        }
    }
    return 'NA'
}