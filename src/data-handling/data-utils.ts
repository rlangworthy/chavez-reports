import * as Data from './data-interfaces'
import {
    StudentReportingDataExportRow
} from '../shared/file-interfaces'

export const getAssignmentFailureRate = (student: Data.Student): number => {
    //const assignments = student.classes.reduce()
    return 0
}

export const getSemesters = (school: Data.School): Data.School => {
    Object.keys(school.classes).forEach(cid => {
        school.classes[cid].assignments['Semester 1'] = {}
        school.classes[cid].assignments['Semester 2'] = {}
        //add q1 & q2 assignments to s1, add q3 & q4 assignments to s2
        if(school.classes[cid].assignments['Term 1'] !== undefined){
            Object.keys(school.classes[cid].assignments['Term 1']).forEach(asgn => {
                school.classes[cid].assignments['Semester 1'][asgn] = {...school.classes[cid].assignments['Term 1'][asgn]}
            })
        }
        if(school.classes[cid].assignments['Term 2'] !== undefined){
            Object.keys(school.classes[cid].assignments['Term 2']).forEach(asgn => {
                school.classes[cid].assignments['Semester 1'][asgn] = {...school.classes[cid].assignments['Term 2'][asgn]}
            })
        }
        if(school.classes[cid].assignments['Term 3'] !== undefined){
            Object.keys(school.classes[cid].assignments['Term 3']).forEach(asgn => {
                school.classes[cid].assignments['Semester 2'][asgn] = {...school.classes[cid].assignments['Term 3'][asgn]}
            })
        }
        if(school.classes[cid].assignments['Term 4'] !== undefined){
            Object.keys(school.classes[cid].assignments['Term 4']).forEach(asgn => {
                school.classes[cid].assignments['Semester 2'][asgn] = {...school.classes[cid].assignments['Term 4'][asgn]}
            })
        }
        //add in semester grades, not sure how this is calculated, just using q1 and q3 for now

        Object.keys(school.classes[cid].students).forEach(id => {
            school.classes[cid].students[id]['Semester 1'] = {...school.classes[cid].students[id]['Term 1']}
            school.classes[cid].students[id]['Semester 2'] = {...school.classes[cid].students[id]['Term 3']}
        })
    })

    
    return school
}

//Add attendance calculation
export const getStudentInfo = (row:StudentReportingDataExportRow):Data.StudentInfo =>{
    return {
        'Student Last Name': row['Student Last Name'],
        'Student First Name': row['Student First Name'],
        'Student ID': row['Student ID'],
        'Grade Level': row['Grade Level'],
        'Homeroom': row['Homeroom'],
        'FRM Status': row['FRM Status'],
        'Gender': row['Gender'],
        'Student Address': row['Student Address'],
        'Enrollment Days': row['Enrollment Days'],
        'Present': row['Present'],
        'Full Day Unexcused': row['Full Day Unexcused'],
        'Tardy': row.Tardy,
        '1/2 Day Unexcused': row['1/2 Day Unexcused'],
        '1/2 Day Excused': row['1/2 Day Excused'],
        'Full Day Excused': row['Full Day Excused'],
        'DL Status': row['DL Status'],
        'EL Program Year': row['EL Program Year'],
    }
}