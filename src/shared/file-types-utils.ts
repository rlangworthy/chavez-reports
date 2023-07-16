import {
    FileTypes } from './file-types'

import {
    aspenAssignmentRowKeys,
    aspenESGradesRowKeys,
    aspenCategoriesRowKeys,
    rawStudentProfessionalSupportDetailsRowKeys,
    rawPunchcardRowKeys,
    tardiesKeys,
    studentSearchListRowKeys,
    rawNWEACDFRowKeys,
    StudentReportingDataExportRowKeys,
} from './file-interfaces'
const aspenESGradesRow : string[] = Object.keys(aspenESGradesRowKeys)//keys<AspenESGradesRow>()
const aspenAssignmentRow: string[] =  Object.keys(aspenAssignmentRowKeys)
const aspenCategoriesRow: string[] =  Object.keys(aspenCategoriesRowKeys)
const rawStudentProfessionalSupportDetailsRow: string[] =  Object.keys(rawStudentProfessionalSupportDetailsRowKeys)
const rawPunchcardRow: string[] =  Object.keys(rawPunchcardRowKeys)
const studentSearchListRow: string[] = Object.keys(studentSearchListRowKeys)
const rawNWEACDFRow: string[] =  Object.keys(rawNWEACDFRowKeys)
const tardiesRow: string[] = Object.keys(tardiesKeys)
const studentReportingDataRow: string[] = Object.keys(StudentReportingDataExportRowKeys)

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
        if(studentSearchListRow.every(field => fieldStrings.includes(field))){
            return FileTypes.STUDENT_INFO
        }
        if(rawNWEACDFRow.every(field => fieldStrings.includes(field))){
            return FileTypes.NWEA
        }
        if(tardiesRow.every(field => fieldStrings.includes(field))){
            return FileTypes.ATTENDENCE
        }
        if(studentReportingDataRow.every(field => fieldStrings.includes(field))){
            return FileTypes.STUDENT_REPORTING_DATA_EXPORT
        }
        if(fieldStrings[0] !== '' && fieldStrings[13] !== '' && fieldStrings[1] === ''){
            return FileTypes.STUDENT_SCHEDULE
        }
    }
    return 'NA'
}