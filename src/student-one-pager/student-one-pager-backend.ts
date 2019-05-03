import * as d3 from 'd3'
import {isAfter} from 'date-fns'

import { 
    getOnTrackScore,
    convertAspAsgns,
    convertAspGrades,
    stringToDate,
    parseGrade
} from '../shared/utils'

import {
    ReportFiles, } from '../shared/report-types'

import {
    RawFileParse,
    } from '../shared/file-types'

import {
    RawESCumulativeGradeExtractRow,
    AspenESGradesRow,
    AspenAssignmentRow
    } from '../shared/file-interfaces'

export interface HSStudent {
    homeRoom: string
    ID: string
    name: string
    IEP: string
    ELL: string
    address: string
    attendance: number
    NWEAMath: number
    NWEAReading: number
    quarterReadingGrade: number
    quarterMathGrade: number
    quarterScienceGrade: number
    quarterSocialScienceGrade: number
    finalReadingGrade: number
    finalMathGrade: number
    finalScienceGrade: number
    finalSocialScienceGrade: number
    GPA: number
    onTrack: number
    assignments: {[className: string]: Assignment[]}
}

export interface Assignment {
    StuStudentId: string
    ClassName: string
    ASGName: string
    Score: string
}

interface Student {
    HR: string
    ID: string
    fullName: string
    ELL: string
    quarterReadingGrade: number,
    quarterMathGrade: number,
    quarterScienceGrade: number,
    quarterSocialScienceGrade: number,
    quarterGPA: number[],
    finalReadingGrade: number,
    finalMathGrade: number,
    finalScienceGrade: number,
    finalSocialScienceGrade: number,
    finalGPA: number[],
    absencePercent: number
    absences: number[]
    tardies: number[]
    onTrack: number
    assignments: {[className: string]: Assignment[]}
}

interface Students {
    [id: string]: Student
}

interface NWEAScores {
    StudentID: string
    Discipline: string
    TestPercentile: string
}

interface AddData {
    textbox5: string
    STUDENT_NAME: string
    STUDENT_ID: string
    STUDENT_SPECIAL_ED_INDICATOR1: string
    StudentAddress: string
}

interface Tardies {
    'Student ID': string
    Attended: string
    Absences: string
}

export const createStudentOnePagers = (files: ReportFiles):HSStudent[] => {
    const gr = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult;
    const at = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult;
    const info = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult;
    const nwea = files.reportFiles[files.reportTitle.files[3].fileDesc].parseResult;
    const mz = files.reportFiles[files.reportTitle.files[4].fileDesc].parseResult;
    //FIXME: hardcoded, should be a choice of the user
    const currentTerm = '4';
    const q4Start = new Date(2019, 3, 4)

    const aspESGrades = gr ? gr.data as AspenESGradesRow[] : []
    const aspAllAssignments = mz ? mz.data as AspenAssignmentRow[] : []
    const rawESGrades = aspESGrades.filter(g => g['Quarter']===currentTerm).map(convertAspGrades)
    const rawAllAssignments = aspAllAssignments.filter(a => parseGrade(a['Score'])===0 
        && isAfter(stringToDate(a['Assigned Date']), q4Start))
        .map(convertAspAsgns)



    let studentGradeObject = getStudentGrades(rawESGrades);
    const tardies = at === null ? null: at.data as Tardies[];
    const assignments = rawAllAssignments as Assignment[];
    if(tardies !== null){
        getAttendanceData(studentGradeObject, tardies);
    };
    if(assignments !== null){
        const assignmentObject = d3.nest<Assignment, Assignment[]>()
            .key( r => r.StuStudentId)
            .key( r => r.ClassName)
            .object(assignments);
        Object.keys(assignmentObject).map( id => {
            if(studentGradeObject[id] !== undefined){
                studentGradeObject[id].assignments = assignmentObject[id];
            }
        })
    }
    const addresses = info === null? null: info.data as AddData[];
    const scores = nwea===null? null: nwea.data as NWEAScores[];


    if(addresses !== null && scores !== null){
        const students:HSStudent[] = Object.keys(studentGradeObject).map( (id:string):HSStudent => {
            const student = studentGradeObject[id];
            const address = addresses.find(a => a.STUDENT_ID===id);
            const NWEAm = scores.filter(a => a.StudentID === id).find(a=>a.Discipline==='Mathematics');
            const NWEAr = scores.filter(a => a.StudentID === id).find(a=>a.Discipline==='Reading');
            return {
                homeRoom: student.HR,
                ID: id,
                name: address === undefined? '':address.STUDENT_NAME,
                IEP: address === undefined? '':address.STUDENT_SPECIAL_ED_INDICATOR1,
                ELL: address === undefined? '':address.textbox5,
                address: address === undefined? '':address.StudentAddress,
                attendance: student.absencePercent,
                NWEAMath: NWEAm === undefined? -1: parseInt(NWEAm.TestPercentile),
                NWEAReading: NWEAr === undefined? -1 : parseInt(NWEAr.TestPercentile),
                quarterReadingGrade: student.quarterReadingGrade,
                quarterMathGrade: student.quarterMathGrade,
                quarterScienceGrade: student.quarterScienceGrade,
                quarterSocialScienceGrade: student.quarterSocialScienceGrade,
                finalReadingGrade: student.finalReadingGrade,
                finalMathGrade: student.finalMathGrade,
                finalScienceGrade: student.finalScienceGrade,
                finalSocialScienceGrade: student.finalSocialScienceGrade,
                GPA: student.finalGPA[0],
                onTrack: student.onTrack,
                assignments: student.assignments,
            }
        }).filter( a => a !== undefined);
        console.log(students)
        return(students.sort((a,b) => a.homeRoom.concat(a.name).localeCompare(b.homeRoom.concat(b.name))));
    } else{
        return []
    }
}

const getStudentGrades = (file: RawESCumulativeGradeExtractRow[]): Students => {
    const getReadingGrade = (rows: RawESCumulativeGradeExtractRow[]): number[] => {
        const row = rows.find( r => r.SubjectName === 'CHGO READING FRMWK');
        if(row === undefined){return [-1, -1]}
        const finalAvg = row.FinalAvg !== '' ? parseInt(row.FinalAvg, 10): -1;
        const quarterAvg = row.QuarterAvg !== '' ? parseInt(row.QuarterAvg, 10): -1
        return [quarterAvg, finalAvg];

    }
    const getMathGrade = (rows: RawESCumulativeGradeExtractRow[]): number[] => {
        const row = rows.find( r => r.SubjectName === 'MATHEMATICS STD');
        const alg = rows.find( r => r.SubjectName === 'ALGEBRA');
        if(row === undefined){
            if(alg === undefined){return [-1, -1]}
            else{
                const finalAvg = alg.FinalAvg !== '' ? parseInt(alg.FinalAvg, 10): -1;
                const quarterAvg = alg.QuarterAvg !== '' ? parseInt(alg.QuarterAvg, 10): -1
                return [quarterAvg, finalAvg];
            }}
        const finalAvg = row.FinalAvg !== '' ? parseInt(row.FinalAvg, 10): -1;
        const quarterAvg = row.QuarterAvg !== '' ? parseInt(row.QuarterAvg, 10): -1
        return [quarterAvg, finalAvg];
    }
    const getScienceGrade = (rows: RawESCumulativeGradeExtractRow[]): number[] => {
        const row = rows.find( r => r.SubjectName === 'SCIENCE  STANDARDS');
        if(row === undefined){return [-1, -1]}
        const finalAvg = row.FinalAvg !== '' ? parseInt(row.FinalAvg, 10): -1;
        const quarterAvg = row.QuarterAvg !== '' ? parseInt(row.QuarterAvg, 10): -1
        return [quarterAvg, finalAvg];
    }
    const getSocialScienceGrade = (rows: RawESCumulativeGradeExtractRow[]): number[] => {
        const row = rows.find( r => r.SubjectName === 'SOCIAL SCIENCE STD');
        if(row === undefined){return [-1, -1]}
        const finalAvg = row.FinalAvg !== '' ? parseInt(row.FinalAvg, 10): -1;
        const quarterAvg = row.QuarterAvg !== '' ? parseInt(row.QuarterAvg, 10): -1
        return [quarterAvg, finalAvg];
    }

    const getGPA = (grades: number[]):number => {
        const pos = grades.filter( n => n >= 0);
        const normGrade = pos.map( (g):number => {
            if(g > 89){return 4;}
            if(g > 79){return 3;}
            if(g > 69){return 2;}
            if(g > 59){return 1;}
            return 0;
        })
        return normGrade.length > 0 ? normGrade.reduce(((a,b) => a+b), 0)/normGrade.length : 0
    }

    const students = d3.nest<RawESCumulativeGradeExtractRow, Student>()
        .key( r => r.StudentID)
        .rollup( rs => {
            const grades = [getReadingGrade(rs),getMathGrade(rs),getScienceGrade(rs),getSocialScienceGrade(rs)];
            const quarterGrades = grades.map(a => a[0]);
            const finalGrades = grades.map(a=>a[1]);
            const GPA = getGPA(finalGrades);
            return {
                HR: rs[0].StudentHomeroom,
                ID: rs[0].StudentID,
                fullName: '',
                ELL: '',
                quarterReadingGrade: quarterGrades[0],
                quarterMathGrade: quarterGrades[1],
                quarterScienceGrade: quarterGrades[2],
                quarterSocialScienceGrade: quarterGrades[3],
                quarterGPA: [GPA],
                finalReadingGrade: finalGrades[0],
                finalMathGrade: finalGrades[1],
                finalScienceGrade: finalGrades[2],
                finalSocialScienceGrade: finalGrades[3],
                finalGPA: [GPA],
                absencePercent: 0,
                absences: [],
                tardies: [],
                onTrack: -1,
                assignments: {}
            }
        }).object(file)
    
    return students;
}

const getAttendanceData = (students: Students, attData: Tardies[]) => {

    const getPresent = (rs: Tardies[]):number =>{
        const p = rs.find(r=>r.Attended ==='Present');
        if(p !== undefined){return parseInt(p.Absences)}
        return 0;
    }

    const getTardies = (rs: Tardies[]):number =>{
        const t = rs.find(r=>r.Attended ==='Tardy');
        if(t !== undefined){return parseInt(t.Absences)}
        return 0;
    }

    const getAbsences = (rs: Tardies[]):number =>{
        return rs.filter(r=> r.Attended !== 'Tardy' && r.Attended !== 'Present')
                    .reduce((a,b) => {return a + (b.Attended === ('1/2 Day Excused' || b.Attended === '1/2 Day Unexcused') ?
                                                    parseInt(b.Absences)/2 : parseInt(b.Absences))}, 0)
    }

    const attObject = d3.nest<Tardies, Tardies[]>()
        .key( r => r['Student ID'])
        .rollup( rs => {
            if(students[rs[0]['Student ID']]!==undefined){
                const total = rs.reduce((a,b) => a + parseInt(b.Absences),0);
                const present = getPresent(rs);
                const tardy = getTardies(rs);
                const absent = getAbsences(rs);
                const pct = (total-absent)/total * 100;
                students[rs[0]['Student ID']].absencePercent = pct;
                students[rs[0]['Student ID']].absences = [absent];
                students[rs[0]['Student ID']].tardies = [tardy];
                students[rs[0]['Student ID']].onTrack = getOnTrackScore(students[rs[0]['Student ID']].finalGPA[0], pct);
            }
            return rs;
        })
        .object(attData)
}