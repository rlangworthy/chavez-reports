import * as d3 from 'd3'

import { 
    getOnTrackScore,
    getCPSOnTrack,
    convertAspGrades,
    getCurrentQuarter
} from '../shared/utils'

import {
    ReportFiles, } from '../shared/report-types'

import {
    SY_CURRENT
    } from '../shared/initial-school-dates'

import {
    ParseResult,
    } from '../shared/file-types'

import {
    RawESCumulativeGradeExtractRow,
    RawStudentProfessionalSupportDetailsRow,
    AspenESGradesRow,
    RawNWEACDFRow
    } from '../shared/file-interfaces'

export interface NWEAData{
    chartData: number[][]
    correl: number
}

export interface HomeRoom{
    room: string
    students: HRStudent[]
    grade: string
    OT?: number
    SQRP?: number
    NWEARead?: NWEAData
    NWEAMath?: NWEAData
}

export interface HRStudent {
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
    absences: number[]
    tardies: number[]
    enrollmentDays: number[]
    onTrack: number
    CPSonTrack: boolean
    nweaRead: number //-1 if none
    nweaMath: number  //-1 if none
}

interface Student {
    GradeLevel: string
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
    totalDays: number[]
    onTrack: number
    nweaRead: number //-1 if none
    nweaMath: number //-1 if none
}

interface Students {
    [id: string]: Student
}

interface Tardies {
    'Student ID': string
    Attended: string
    Absences: string
}

export const createOnePagers = (files: ReportFiles): HomeRoom[] => {
    const gr = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const aspGrades = gr === null? null: gr.data as AspenESGradesRow[]
    const currentQuarter = getCurrentQuarter(SY_CURRENT)
    const grades = aspGrades ? aspGrades.filter(g => g['Quarter']===currentQuarter).map(convertAspGrades): aspGrades
    let studentGradeObject = getStudentGrades(grades);

    const sp = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult;
    const tr = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult;
    const spps = sp === null ? null: sp.data as RawStudentProfessionalSupportDetailsRow[];
    const tardies = tr === null ? null: tr.data as Tardies[];
    let gradeHist = {}
    let tHist: ParseResult | null = null 
    let tardiesHist: null | Tardies[] =  null
    if(files.reportTitle.optionalFiles && files.reportFiles[files.reportTitle.optionalFiles[2].fileDesc]){
        const ogr = files.reportFiles[files.reportTitle.optionalFiles[1].fileDesc].parseResult
        const oaspGrades = ogr === null? null: ogr.data as AspenESGradesRow[]
        //FIXME: hardcoded quarter
        const ogrades = oaspGrades ? oaspGrades.filter(g => g['Quarter']===currentQuarter).map(convertAspGrades): oaspGrades
        gradeHist = getStudentGrades(ogrades);
        tHist = files.reportTitle.optionalFiles && files.reportFiles[files.reportTitle.optionalFiles[2].fileDesc] ? files.reportFiles[files.reportTitle.optionalFiles[2].fileDesc].parseResult : null;
        tardiesHist = tHist === null ? null: tHist.data as Tardies[];

    }

    let nweaData = {}
    if(files.reportTitle.optionalFiles && files.reportFiles[files.reportTitle.optionalFiles[0].fileDesc]){
        const nwea = files.reportFiles[files.reportTitle.optionalFiles[0].fileDesc].parseResult
        nweaData = parseNWEA(nwea === null ? []:nwea.data as RawNWEACDFRow[])
        
    
    }
    
    if (spps !== null){spps.forEach(row => {
        if(studentGradeObject[row['Student ID']]!== undefined){
            studentGradeObject[row['Student ID']].ELL = row['ELL Program Year Code'];
            studentGradeObject[row['Student ID']].GradeLevel = row.Grade
        }
    });}
    if(tardies != null){
        getAttendanceData(studentGradeObject, tardies);
    };

    if(gradeHist !== {} && tardiesHist !== null){
        getAttendanceData(gradeHist, tardiesHist);
    }

    if(nweaData !== {}){
        Object.keys(studentGradeObject).forEach(id => {
            if(nweaData[id]!== undefined){
                if(nweaData[id]['Mathematics']!==undefined){
                    studentGradeObject[id].nweaMath = parseInt(nweaData[id]['Mathematics'][0].TestPercentile)
                }
                if(nweaData[id]['Reading']!==undefined){
                    studentGradeObject[id].nweaRead = parseInt(nweaData[id]['Reading'][0].TestPercentile)
                }
            }
        })
    }

    mergeStudents(studentGradeObject, gradeHist);

    const homeRooms = flattenStudents(studentGradeObject);

    if(nweaData !== {}){
        Object.keys(homeRooms).forEach(hr => {
            homeRooms[hr] = {...homeRooms[hr], ...getNWEAData(homeRooms[hr])}
        })
    }
    console.log(homeRooms)
    return homeRooms.sort((a,b) => a.grade.localeCompare(b.grade));
}

const parseNWEA = (nwea: RawNWEACDFRow[]): {[id:string]:any} => {
    return d3.nest()
                .key(r => r.StudentID)
                .key(r => r.Discipline)
                .object(nwea)
}

const mergeStudents = (current: Students, past: Students) => {
    Object.keys(current).forEach( k => {
        if(past[k] !== undefined){
            current[k].quarterGPA.push(past[k].quarterGPA[0]);
            current[k].finalGPA.push(past[k].finalGPA[0]);
            current[k].absences.push(past[k].absences[0]);
            current[k].tardies.push(past[k].tardies[0]);
            current[k].totalDays.push(past[k].totalDays[0]);
        } else {
            current[k].finalGPA.push(current[k].finalGPA[0]);
            current[k].quarterGPA.push(current[k].quarterGPA[0]);
            current[k].absences.push(current[k].absences[0]);
            current[k].tardies.push(current[k].tardies[0]);
            current[k].totalDays.push(current[k].totalDays[0]);
        }
    })
}

const getStudentGrades = (file: RawESCumulativeGradeExtractRow[] | null): Students => {
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

    if (file === null){return {}}
    const students = d3.nest<RawESCumulativeGradeExtractRow, Student>()
        .key( r => r.StudentID)
        .rollup( rs => {
            const grades = [getReadingGrade(rs),getMathGrade(rs),getScienceGrade(rs),getSocialScienceGrade(rs)];
            const quarterGrades = grades.map(a => a[0]);
            const finalGrades = grades.map(a=>a[1]);
            const GPA = getGPA(finalGrades);
            return {
                HR: rs[0].StudentHomeroom,
                GradeLevel: '',
                ID: rs[0].StudentID,
                fullName: rs[0].StudentLastName + ', ' + rs[0].StudentFirstName,
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
                totalDays: [],
                onTrack: -1,
                nweaMath: -1,
                nweaRead: -1,
            }
        }).object(file)
    
    return students;
}

const flattenStudents = (students: Students): HomeRoom[] => {
    const studentArray: Student[] = Object.keys(students).map( s => students[s]);
    const homeRoomsObject: {[hr: string]: HomeRoom}= d3.nest<Student, HomeRoom>()
        .key( r => r.HR)
        .rollup( rs => {
            return {
                room: rs[0].HR,
                grade: rs[0].GradeLevel,
                students: rs.sort((a,b)=> a.onTrack-b.onTrack).map( (r: Student):HRStudent => {
                    return {
                        fullName: r.fullName,
                        ELL: r.ELL,
                        quarterReadingGrade: r.quarterReadingGrade,
                        quarterMathGrade: r.quarterMathGrade,
                        quarterScienceGrade: r.quarterScienceGrade,
                        quarterSocialScienceGrade: r.quarterSocialScienceGrade,
                        quarterGPA: r.quarterGPA,
                        finalReadingGrade: r.finalReadingGrade,
                        finalMathGrade: r.finalMathGrade,
                        finalScienceGrade: r.finalScienceGrade,
                        finalSocialScienceGrade: r.finalSocialScienceGrade,
                        finalGPA: r.finalGPA,
                        absences: r.absences,
                        tardies: r.tardies,
                        enrollmentDays: r.totalDays,
                        onTrack: r.onTrack,
                        CPSonTrack: getCPSOnTrack(r.finalMathGrade, r.finalReadingGrade, r.absencePercent),
                        nweaMath: r.nweaMath,
                        nweaRead: r.nweaRead,
                    }
                })
            }
        }).object(studentArray);
    const homeRooms = Object.keys(homeRoomsObject)
                            .map( hr => homeRoomsObject[hr])
                            .map(hr => {
                                const OT = getHROT(hr.students)
                                const SQRP = getOTSQRP(OT)
                                return {...hr, OT:OT, SQRP:SQRP}
                            })
    

    return homeRooms;

}

const getHROT = (students: HRStudent[]): number => {
    const ot = students.map(student => student.onTrack)
    const avg = ot.reduce((a,b) => a+b)/ot.length
    return avg * 10
}

const getOTSQRP = (OT: number): number => {
    if(OT >= 44.5){
        return 5
    }else if(OT >= 42){
        return 4
    }else if(OT >= 39){
        return 3
    }else if(OT >= 37){
        return 2
    }
    return 1
}

//: Mutates data
const getAttendanceData = (students: Students, attData: Tardies[]) => {

    const getTardies = (rs: Tardies[]):number =>{
        const t = rs.find(r=>r.Attended ==='Tardy');
        if(t !== undefined){return parseInt(t.Absences)}
        return 0;
    }

    const getAbsences = (rs: Tardies[]):number =>{
        return rs.filter(r=> r.Attended !== 'Tardy' && r.Attended !== 'Present')
                    .reduce((a,b) => {return a + ((b.Attended === '1/2 Day Excused' || b.Attended === '1/2 Day Unexcused') ?
                                                    parseInt(b.Absences)/2.0 : parseInt(b.Absences))}, 0)
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
                students[rs[0]['Student ID']].totalDays = [total];
            }
            return rs;
        })
        .object(attData)
}

const getNWEAData = (hr: HomeRoom): {NWEARead: NWEAData, NWEAMath: NWEAData} => {
    const mathChartData = hr.students.map(student => [student.nweaMath, student.finalMathGrade]).filter(a => a[0] >=0 && a[1] >=0)
    const mathCorr = pcorr(mathChartData.map(a => a[0]), mathChartData.map(a => a[1]))
    const readChartData: number[][] = hr.students.map(student => [student.nweaRead, student.finalReadingGrade]).filter(a => a[0] >=0 && a[1] >=0)
    const readCorr = pcorr(readChartData.map(a => a[0]), readChartData.map(a => a[1]))
    const readData:NWEAData = {correl: readCorr, chartData: readChartData}
    const mathData:NWEAData = {correl: mathCorr, chartData: mathChartData}
    return {NWEARead: readData, NWEAMath: mathData}
}

const pcorr = (x, y) => {
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0,
      sumY2 = 0;
    const minLength = x.length = y.length = Math.min(x.length, y.length),
      reduce = (xi, idx) => {
        const yi = y[idx];
        sumX += xi;
        sumY += yi;
        sumXY += xi * yi;
        sumX2 += xi * xi;
        sumY2 += yi * yi;
      }
    x.forEach(reduce);
    return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
  }