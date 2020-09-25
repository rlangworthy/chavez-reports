import * as d3 from 'd3'
import {isAfter} from 'date-fns'
import * as papa from 'papaparse'

import { 
    getOnTrackScore,
    convertAspAsgns,
    convertAspGrades,
    stringToDate,
    parseGrade,
    getCurrentQuarter,
    getCurrentQuarterDate,
} from '../shared/utils'

import {
    ReportFiles, } from '../shared/report-types'

import {SY_CURRENT} from '../shared/initial-school-dates'

import {
    getStudentAssignments,
    } from '../shared/student-assignment-utils'

import {
    parseSchedule,} from '../shared/schedule-parser'

import {StudentClass} from '../shared/student-assignment-interfaces'

import {
    RawESCumulativeGradeExtractRow,
    AspenESGradesRow,
    AspenAssignmentRow,
    AspenCategoriesRow,
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
    assignments: {[className: string]: StudentClass}
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
    assignments: {[className: string]: StudentClass}
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
    const cats = files.reportFiles[files.reportTitle.files[5].fileDesc].parseResult
    const sched = files.reportFiles[files.reportTitle.files[6].fileDesc].parseResult
    //FIXME: hardcoded, should be a choice of the user
    const currentTerm = getCurrentQuarter(SY_CURRENT)
    const startDate = getCurrentQuarterDate(SY_CURRENT)
    const schedule = sched !== null ? parseSchedule(sched.data) : []
    const aspESGrades = gr ? gr.data as AspenESGradesRow[] : []
    const aspAllAssignments = mz ? mz.data as AspenAssignmentRow[] : []
    const aspCats = cats ? cats.data as AspenCategoriesRow[] : []
    const rawESGrades = aspESGrades.filter(g => g['Quarter']===currentTerm)
    const rawAllAssignments = aspAllAssignments.filter(a => parseGrade(a['Score'])===0 
        && isAfter(stringToDate(a['Assigned Date']), startDate))
        .map(convertAspAsgns)
    const tardies = at === null ? []: at.data as Tardies[];
    const studentAssignments = getStudentAssignments(tardies, aspCats, 
        aspAllAssignments.filter( a => isAfter(stringToDate(a['Assigned Date']), startDate) && a['Score'] !== 'Exc' && a['Score'] !== '/'),
        schedule)

    let studentGradeObject = getStudentGrades(rawESGrades);
    //const tardies = at === null ? null: at.data as Tardies[];
    const assignments = rawAllAssignments as Assignment[];
    if(tardies !== null){
        getAttendanceData(studentGradeObject, tardies);
    };
    if(assignments !== null){
        Object.keys(studentAssignments).forEach( id => {
            if(studentGradeObject[id] !== undefined){
                studentGradeObject[id].assignments = studentAssignments[id].classes;
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
        return(students.sort((a,b) => a.homeRoom.concat(a.name).localeCompare(b.homeRoom.concat(b.name))));
    } else{
        return []
    }
}

/* Can be used to check all student grade calculations*/
const printCalculatedGrades = (students: HSStudent[]) => {
    const calcGrades: Object[]=[]
        students.forEach(student =>{
            Object.keys(student.assignments).forEach(cname => {
                calcGrades.push({
                    StudentID: student.ID,
                    Class: cname,
                    Grade: student.assignments[cname].finalGrade
                })
            })
        })
    console.log(papa.unparse(calcGrades))
}

const getStudentGrades = (file: AspenESGradesRow[]): Students => {
    
    
    const getReadingGrade = (rows: AspenESGradesRow[]): number[] => {
        const row = rows.find( r => r["Course Name"] === 'CHGO READING FRMWK');
        if(row === undefined){return [-1, -1]}
        const finalAvg = row["Cumulative Semester Average"] !== '' ? parseInt(row["Cumulative Semester Average"], 10): -1;
        const quarterAvg = row["Running Term Average"] !== '' ? parseInt(row["Running Term Average"], 10): -1
        return [quarterAvg, finalAvg];

    }
    const getMathGrade = (rows: AspenESGradesRow[]): number[] => {
        const row = rows.find( r => r["Course Name"] === 'MATHEMATICS STD');
        const alg = rows.find( r => r["Course Name"] === 'ALGEBRA');
        if(row === undefined){
            if(alg === undefined){return [-1, -1]}
            else{
                const finalAvg = alg["Cumulative Semester Average"] !== '' ? parseInt(alg["Cumulative Semester Average"], 10): -1;
                const quarterAvg = alg["Running Term Average"] !== '' ? parseInt(alg["Running Term Average"], 10): -1
                return [quarterAvg, finalAvg];
            }}
        const finalAvg = row["Cumulative Semester Average"] !== '' ? parseInt(row["Cumulative Semester Average"], 10): -1;
        const quarterAvg = row["Running Term Average"] !== '' ? parseInt(row["Running Term Average"], 10): -1
        return [quarterAvg, finalAvg];
    }
    const getScienceGrade = (rows: AspenESGradesRow[]): number[] => {
        const row = rows.find( r => r["Course Name"] === 'SCIENCE  STANDARDS');
        if(row === undefined){return [-1, -1]}
        const finalAvg = row["Cumulative Semester Average"] !== '' ? parseInt(row["Cumulative Semester Average"], 10): -1;
        const quarterAvg = row["Running Term Average"] !== '' ? parseInt(row["Running Term Average"], 10): -1
        return [quarterAvg, finalAvg];
    }
    const getSocialScienceGrade = (rows: AspenESGradesRow[]): number[] => {
        const row = rows.find( r => r["Course Name"] === 'SOCIAL SCIENCE STD');
        if(row === undefined){return [-1, -1]}
        const finalAvg = row["Cumulative Semester Average"] !== '' ? parseInt(row["Cumulative Semester Average"], 10): -1;
        const quarterAvg = row["Running Term Average"] !== '' ? parseInt(row["Running Term Average"], 10): -1
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

    const students = d3.nest<AspenESGradesRow, Student>()
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

    d3.nest<Tardies, Tardies[]>()
        .key( r => r['Student ID'])
        .rollup( rs => {
            if(students[rs[0]['Student ID']]!==undefined){
                const total = rs.reduce((a,b) => a + parseInt(b.Absences),0);
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