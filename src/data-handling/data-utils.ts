import * as Data from './data-interfaces'
import * as Constants from './data-constants'
import {
    StudentReportingDataExportRow
} from '../shared/file-interfaces'
import{
    getGPA,
    getOnTrackScore
} from '../shared/utils'


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
        //It's a small enough calculation it makes sense to do here rather than wait
        'Attendance Percent' : getAttendancePct(row),
        'DL Status': row['DL Status'],
        'EL Program Year': row['EL Program Year'],
        
    }
}

export const getHomeroomFromStudents = (students: Data.CalculatedStudentInfo[]) : Data.Homeroom => {
    
    return {
            'Homeroom': students[0].Homeroom,
            "Grade Level": students[0]['Grade Level'],
            "Student Count": students.length,
            "Attendance Average": 0,
            "Term Averages": {},
            Students: students
        }
}

export const getCalculatedStudentInfo = (student: Data.StudentInfo, school : Data.School): Data.CalculatedStudentInfo => {
    const calculatedStudent =  {
        ...student,
        "Term Averages" : getTermAverages(student, school),
        "Assignment Failure Rates": getFailureRates(student, school),
        "GPA" : 0,
        'On Track' : 0,
    }
    const gpa = getGPAFromCalculatedStudent(calculatedStudent)

    calculatedStudent.GPA = gpa['Cumulative/Overall Average'] ? gpa['Cumulative/Overall Average'] : 0

    calculatedStudent['On Track'] = getOnTrackScore(calculatedStudent.GPA, student['Attendance Percent'])
    return calculatedStudent
}

export const getGPAFromCalculatedStudent = (student: Data.CalculatedStudentInfo): Data.QuarterGrades => {
    const grades = Object.keys(student['Term Averages']).filter(cn => Constants.CoreClassList.includes(student['Term Averages'][cn]['Class Description']))
        .map(cn => student['Term Averages'][cn])
    console.log(grades)
    const GPA: Data.QuarterGrades = Constants.BlankQuarterGrades
    Object.keys(GPA).forEach(key => GPA[key] = getGPA(grades.map(grade => grade[key])))
    return GPA
}

export const getFailureRates = (student: Data.StudentInfo, school : Data.School): Data.FailureRates => {
    
    const SID = student['Student ID']
    const assignments = school.students[SID].classes
            .reduce((asgn, cid) => {
                return {
                    'Term 1' : asgn['Term 1']
                        .concat(Object.keys(school.classes[cid].assignments['Term 1'])
                        .filter(aid =>school.classes[cid].assignments['Term 1'][aid].scores[SID] != undefined)
                        .map(aid => school.classes[cid].assignments['Term 1'][aid].scores[SID]['Number Score'])),
                    'Term 2' : asgn['Term 2']
                        .concat(Object.keys(school.classes[cid].assignments['Term 2'])
                        .filter(aid =>school.classes[cid].assignments['Term 2'][aid].scores[SID] != undefined)
                        .map(aid => school.classes[cid].assignments['Term 2'][aid].scores[SID]['Number Score'])),
                    'Term 3' : asgn['Term 3']
                        .concat(Object.keys(school.classes[cid].assignments['Term 3'])
                        .filter(aid =>school.classes[cid].assignments['Term 3'][aid].scores[SID] != undefined)
                        .map(aid => school.classes[cid].assignments['Term 3'][aid].scores[SID]['Number Score'])),
                    'Term 4' : asgn['Term 4']
                        .concat(Object.keys(school.classes[cid].assignments['Term 4'])
                        .filter(aid =>school.classes[cid].assignments['Term 4'][aid].scores[SID] != undefined)
                        .map(aid => school.classes[cid].assignments['Term 4'][aid].scores[SID]['Number Score'])),
                    }
                }, 
            { 
            'Term 1' : [] as number[],
            'Term 2' : [] as number[],
            'Term 3' : [] as number[],
            'Term 4' : [] as number[]})
            //.map(term => Object.keys(school.classes.cid.assignments.term)
            //.map(aid => school.classes.cid.assignments.term.aid.scores.SID['Number Score']

            //))).flat()
    assignments['Total'] = assignments['Term 1'].concat(assignments['Term 2']).concat(assignments['Term 3']).concat(assignments['Term 4'])

    const failureRate: Data.FailureRates = {
        'Term 1' : assignments['Term 1'].length > 0 ? assignments['Term 1'].filter(b => b < 59.5).length/assignments['Term 1'].length : null,
        'Term 2' : assignments['Term 2'].length > 0 ? assignments['Term 2'].filter(b => b < 59.5).length/assignments['Term 2'].length : null,
        'Term 3' : assignments['Term 3'].length > 0 ? assignments['Term 3'].filter(b => b < 59.5).length/assignments['Term 3'].length : null,
        'Term 4' : assignments['Term 4'].length > 0 ? assignments['Term 4'].filter(b => b < 59.5).length/assignments['Term 4'].length : null,
        'Cumulative/Overall Average' : assignments['Total'].length > 0 ? assignments['Total'].filter(b => b < 59.5).length/assignments['Total'].length : null,
    }

    return failureRate
}

export const getTermAverages = (student: Data.StudentInfo, school : Data.School): {[classID: string]: Data.QuarterGrades} => {
    const termAverages: {[classID: string]: Data.QuarterGrades} = {}
    school.students[student['Student ID']].classes.forEach(cid => {
        if(school.classes[cid].students[student['Student ID']]['Term 1'] == undefined){
            console.log(school.students[student['Student ID']])
            console.log(school.classes[cid].students[student['Student ID']])
            console.log(cid)
        }
        termAverages[cid] = {
            'Class Description' : school.classes[cid].Description,
            "Term 1": parseInt(school.classes[cid].students[student['Student ID']]['Term 1']['Running Term Average']),
            "Term 2": parseInt(school.classes[cid].students[student['Student ID']]['Term 2']['Running Term Average']),
            "Term 3": parseInt(school.classes[cid].students[student['Student ID']]['Term 3']['Running Term Average']),
            "Term 4": parseInt(school.classes[cid].students[student['Student ID']]['Term 4']['Running Term Average']),
            "Cumulative/Overall Average": parseInt(school.classes[cid].students[student['Student ID']]['Term 1']['Cumulative/Overall Average'])
        }
    })
    
    return termAverages
}

export const getAttendancePct = (student: StudentReportingDataExportRow) : number => {
    //Relies on the export to correclty count present and enrollment days
    return (parseFloat(student.Present))/parseInt(student['Enrollment Days']) * 100
}

export const parseGrade = (g: string): number => {
    const numberGrade = parseFloat(g);
    if(numberGrade || numberGrade === 0){
      return numberGrade
    }
    if(g==='A'||g==='a'){
      return 95;
    }
    if(g==='B'||g==='b'){
      return 85;
    }
    if(g==='C'||g==='c'){
      return 75;
    }
    if(g==='D'||g==='d'){
      return 65;
    }
    if(g==='F'||g==='f'){
      return 59;
    }
    if(g==='Msg' || g === 'M' || g==='m'){
      return 0;
    }
    console.log('Invalid Grade ' + g)
    return -1;
  }