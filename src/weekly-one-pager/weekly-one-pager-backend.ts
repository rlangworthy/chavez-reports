import * as d3 from 'd3'
import * as papa from 'papaparse'

import { 
    getOnTrackScore,
    getCPSOnTrack,
    convertAspGrades,
    getCurrentQuarter,
    getGPA,
    pcorr,
    linearRegression, 
    parseGrade} from '../shared/utils'

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
    RawNWEACDFRow,
    MClassStudentSummary,
    Tardies} from '../shared/file-interfaces'
import { StudentGradeSheets } from '../student-grade-sheets/student-grade-display'
import { HSStudent } from '../student-one-pager/student-one-pager-backend'


export interface HomeRoom{
    averages: GradesSummary
    room: string
    students: HRStudent[]
    grade: string
    OT?: number
    SQRP?: number
    NWEARead?: NWEAData
    NWEAMath?: NWEAData
}

export interface GradesSummary {
    studentCount: number
    ssGrade: number
    scienceGrade: number
    mathGrade: number
    readingGrade: number
    attendanceAvg: number
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
    otDelta?: number
    CPSonTrack: boolean
    nweaRead: number //-1 if none
    nweaMath: number  //-1 if none
    LRE: string
    mClass?: string
}

export interface ChartHRStudent extends HRStudent {
    residual: number
}

export interface NWEAData{
    chartData: ChartHRStudent []
    correl: number
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
    LRE: string
    mClass?: string
}

interface Students {
    [id: string]: Student
}

export interface HRSummary {
    OT: {[group: string]:{[OTScore: string]: number}}
    grades: {[group: string]: GradesSummary}
}

export const createOnePagers = (files: ReportFiles): [HomeRoom[], HRSummary] => {
    const gr = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    const aspGrades = gr === null? null: gr.data as AspenESGradesRow[]
    const currentQuarter = getCurrentQuarter(SY_CURRENT)
    const grades = aspGrades ? spreadGrades(aspGrades, currentQuarter): aspGrades
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
    let mClassData = {}
    if(files.reportTitle.optionalFiles && files.reportFiles[files.reportTitle.optionalFiles[1].fileDesc]){
        const mClass = files.reportFiles[files.reportTitle.optionalFiles[1].fileDesc].parseResult
        mClassData = parseMClass(mClass === null ? []:mClass.data as MClassStudentSummary[])
    }

    
    if (spps !== null){spps.forEach(row => {
        if(studentGradeObject[row['Student ID']]!== undefined){
            studentGradeObject[row['Student ID']].ELL = row['ELL Program Year Code'];
            studentGradeObject[row['Student ID']].GradeLevel = row.Grade
            studentGradeObject[row['Student ID']].LRE = row.LRE;
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
    console.log(mClassData)
    if(mClassData !== {}){
        Object.keys(studentGradeObject).forEach(id => {
            if(mClassData[id]!== undefined){
                studentGradeObject[id].mClass = mClassData[id]['Assessment Measure-TRC Proficiency Level-Levels']
            }
        })
    }

    mergeStudents(studentGradeObject, gradeHist);

    const [homeRooms, summary] = flattenStudents(studentGradeObject);

    if(nweaData !== {}){
        Object.keys(homeRooms).forEach(hr => {
            homeRooms[hr] = {...homeRooms[hr], ...getNWEAData(homeRooms[hr])}
        })
    }

    const students= homeRooms.map(hr => {return hr.students.map(s => {
        
        return {
        ...s,
        quarterGPA: s.quarterGPA[0],
        finalGPA: s.finalGPA[0],
        absences: s.absences[0],
        tardies: s.tardies[0],
        enrollmentDays: s.enrollmentDays[0]
        
        }}).flat()
    }).flat()
    console.log(papa.unparse(JSON.stringify(students)))
    //console.log(students)
    return [homeRooms.sort((a,b) => a.grade.localeCompare(b.grade)), summary];
}

const parseNWEA = (nwea: RawNWEACDFRow[]): {[id:string]:any} => {
    return d3.nest()
                .key(r => r.StudentID)
                .key(r => r.Discipline1)
                .object(nwea)
}

const parseMClass = (mClass: MClassStudentSummary[]): {[id:string]:MClassStudentSummary} => {
    return d3.nest()
    .key((r:MClassStudentSummary) => r["Student Primary ID"])
    .rollup(rs=> rs[rs.length-1])
    .object(mClass)
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
        const row = rows.find( r => r.SubjectName === 'CHGO READING FRMWK' || r.SubjectName === 'KG CHGO READ FRMWRK' );
        if(row === undefined){return [-1, -1]}
        const finalAvg = row.FinalAvg !== '' ? parseGrade(row.FinalAvg): parseGrade(row.QuarterGrade)
        const quarterAvg = row.QuarterAvg !== '' ? parseGrade(row.QuarterAvg): -1
        return [quarterAvg, finalAvg];

    }
    const getMathGrade = (rows: RawESCumulativeGradeExtractRow[]): number[] => {
        const row = rows.find( r => r.SubjectName === 'MATHEMATICS STD' || r.SubjectName === 'KG MATH STANDARDS');
        const alg = rows.find( r => r.SubjectName === 'ALGEBRA');
        if(row === undefined){
            if(alg === undefined){return [-1, -1]}
            else{
                const finalAvg = alg.FinalAvg !== '' ? parseGrade(alg.FinalAvg): parseGrade(alg.QuarterGrade);
                const quarterAvg = alg.QuarterAvg !== '' ? parseGrade(alg.QuarterAvg): -1
                return [quarterAvg, finalAvg];
            }}
        const finalAvg = row.FinalAvg !== '' ? parseGrade(row.FinalAvg): parseGrade(row.QuarterGrade)
        const quarterAvg = row.QuarterAvg !== '' ? parseGrade(row.QuarterAvg): -1
        return [quarterAvg, finalAvg];
    }
    const getScienceGrade = (rows: RawESCumulativeGradeExtractRow[]): number[] => {
        const row = rows.find( r => r.SubjectName === 'SCIENCE  STANDARDS' || r.SubjectName === 'KG SCIENCE');
        if(row === undefined){return [-1, -1]}
        const finalAvg = row.FinalAvg !== '' ? parseGrade(row.FinalAvg): parseGrade(row.QuarterGrade)
        const quarterAvg = row.QuarterAvg !== '' ? parseGrade(row.QuarterAvg): -1
        return [quarterAvg, finalAvg];
    }
    const getSocialScienceGrade = (rows: RawESCumulativeGradeExtractRow[]): number[] => {
        const row = rows.find( r => r.SubjectName === 'SOCIAL SCIENCE STD' || r.SubjectName === 'KG SOCIAL SCIENCE');
        if(row === undefined){return [-1, -1]}
        const finalAvg = row.FinalAvg !== '' ? parseGrade(row.FinalAvg): parseGrade(row.QuarterGrade)
        const quarterAvg = row.QuarterAvg !== '' ? parseGrade(row.QuarterAvg): -1
        return [quarterAvg, finalAvg];
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
                LRE: '',
            }
        }).object(file)
    
    return students;
}

const flattenStudents = (students: Students): [HomeRoom[], HRSummary] => {
    const studentArray: Student[] = Object.keys(students).map( s => students[s]);
    //Fill out on track portion of summary
    const summary: HRSummary = {
        OT: {},
        grades: {}
    }
    summary.OT = d3.nest<Student, number>()
        .key((r:Student) => r.GradeLevel)
        .key((r:Student) => r.onTrack.toString())
        .rollup(rs => rs.length)
        .object(studentArray)
    summary.OT['3-8'] = {}
    
    Object.keys(summary.OT).forEach(gl => {
        ['1','2','3','4','5'].forEach(ot => {
            if(summary.OT[gl][ot]===undefined){
                summary.OT[gl][ot] = 0
            }
        })
        Object.keys(summary.OT[gl]).forEach(ot => {
            if(['3','4','5','6','7','8'].includes(gl)){
                if(summary.OT['3-8'][ot] === undefined){
                    summary.OT['3-8'][ot] = 0
                }
                summary.OT['3-8'][ot] = summary.OT['3-8'][ot] + summary.OT[gl][ot]
            }
        })
    })
    Object.keys(summary.OT).forEach(gl => {
        let total = 0
        summary.OT[gl]['Avg'] = 0
        Object.keys(summary.OT[gl]).forEach(ot => {
            if(ot !== 'Avg'){
                total += summary.OT[gl][ot]
                summary.OT[gl]['Avg'] += summary.OT[gl][ot] * parseInt(ot)
            }
        })
        summary.OT[gl]['Avg'] = parseFloat((summary.OT[gl]['Avg']/total).toFixed(2))
    })
    //end on track portion of summary

    const homeRoomsObject: {[hr: string]: HomeRoom}= d3.nest<Student, HomeRoom>()
        .key( r => r.HR)
        .rollup( (rs:Student[]):HomeRoom => {
            return {
                averages: {
                    studentCount:rs.length,
                    attendanceAvg: rs.map(r => r.absencePercent).reduce((a,b) => a+b,0)/rs.length,
                    ssGrade: rs.map(r => r.finalSocialScienceGrade)
                                .reduce((a,b) => a + (b >= 0 ? b:0),0)/rs.filter(r => r.finalSocialScienceGrade >=0).length,
                    scienceGrade: rs.map(r => r.finalScienceGrade)
                                .reduce((a,b) => a + (b >= 0 ? b:0),0)/rs.filter(r => r.finalScienceGrade >=0).length,
                    mathGrade: rs.map(r => r.finalMathGrade)
                                .reduce((a,b) => a + (b >= 0 ? b:0),0)/rs.filter(r => r.finalMathGrade >=0).length,
                    readingGrade: rs.map(r => r.finalReadingGrade)
                                .reduce((a,b) => a + (b >= 0 ? b:0),0)/rs.filter(r => r.finalReadingGrade >=0).length,
                                
                },
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
                        otDelta: getOTDelta(r.onTrack, r.finalGPA[0], r.absencePercent),
                        CPSonTrack: getCPSOnTrack(r.finalMathGrade, r.finalReadingGrade, r.absencePercent),
                        nweaMath: r.nweaMath,
                        nweaRead: r.nweaRead,
                        LRE: r.LRE,
                        mClass: r.mClass,
                    }
                })
            }
        }).object(studentArray);
    const homeRooms = Object.keys(homeRoomsObject)
                            .map( hr => homeRoomsObject[hr])
                            .map(hr => {
                                const OT = getGroupOT(hr.students)
                                const SQRP = getOTSQRP(OT)
                                return {...hr, OT:OT, SQRP:SQRP}
                            })
    
    
    //grade averages
    const gradeStudents = d3.nest<Student>()
                            .key(s => s.GradeLevel)
                            .rollup((rs:Student[]):GradesSummary => {
                                return {
                                    studentCount:rs.length,
                                    attendanceAvg: rs.map(r => r.absencePercent).reduce((a,b) => a+b,0)/rs.length,
                                    ssGrade: rs.map(r => r.finalSocialScienceGrade)
                                                .reduce((a,b) => a + (b >= 0 ? b:0),0)/rs.filter(r => r.finalSocialScienceGrade >=0).length,
                                    scienceGrade: rs.map(r => r.finalScienceGrade)
                                                .reduce((a,b) => a + (b >= 0 ? b:0),0)/rs.filter(r => r.finalScienceGrade >=0).length,
                                    mathGrade: rs.map(r => r.finalMathGrade)
                                                .reduce((a,b) => a + (b >= 0 ? b:0),0)/rs.filter(r => r.finalMathGrade >=0).length,
                                    readingGrade: rs.map(r => r.finalReadingGrade)
                                                .reduce((a,b) => a + (b >= 0 ? b:0),0)/rs.filter(r => r.finalReadingGrade >=0).length,
                                                
                                }})
                            .object(studentArray)
    summary.grades = gradeStudents
    console.log(summary)
    console.log(homeRooms)
    return [homeRooms, summary];
}

const getGroupOT = (students: HRStudent[]): number => {
    const ot = students.map(student => student.onTrack)
    const avg = ot.reduce((a,b) => a+b)/ot.length
    return avg * 10
}

export const getOTSQRP = (OT: number): number => {
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

const getOTDelta = (ot: number, gpa: number, absencePct: number): number => {
    if(ot === 5){
        return 0
    }
    if(ot < getOnTrackScore(gpa + .25, absencePct)){
        return 1
    }
    if(ot < getOnTrackScore(gpa + .5, absencePct)){
        return 2
    }
    return 0
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
    const mathChartData = hr.students.filter(a => a.nweaMath >=0 && a.finalMathGrade >=0)
    const mathCorr = pcorr(mathChartData.map(a => a.nweaMath), mathChartData.map(a => a.finalMathGrade))
    const readChartData = hr.students.filter(a => a.nweaRead >= 0 && a.finalReadingGrade >=0)
    const readCorr = pcorr(readChartData.map(a => a.nweaRead), readChartData.map(a => a.finalReadingGrade))

    const mReg = linearRegression(mathChartData.map(s => s.finalMathGrade), mathChartData.map(s => s.nweaMath))
    const mChartStudents = mathChartData.map(s => {return {...s, 
        residual: s.finalMathGrade - (mReg.slope * s.nweaMath + mReg.intercept)}})
        .sort((a,b) => a.residual - b.residual)
    
    const rReg = linearRegression(readChartData.map(s => s.finalReadingGrade), readChartData.map(s => s.nweaRead))
    const rChartStudents = readChartData.map(s => {return {...s, 
        residual: s.finalReadingGrade - (rReg.slope * s.nweaRead + rReg.intercept)}})
        .sort((a,b) => a.residual - b.residual)


    const readData:NWEAData = {correl: readCorr, chartData: rChartStudents}
    const mathData:NWEAData = {correl: mathCorr, chartData: mChartStudents}
    return {NWEARead: readData, NWEAMath: mathData}

}

const spreadGrades = (grades: AspenESGradesRow[], currentQuarter: string): RawESCumulativeGradeExtractRow[] => {
    const prevQuarter  = parseInt(currentQuarter) > 1 ? (parseInt(currentQuarter) - 1).toString() : currentQuarter
    const byStudent : {
        [id: string]: {
            [cid: string]: RawESCumulativeGradeExtractRow
        }
    } = d3.nest<RawESCumulativeGradeExtractRow, AspenESGradesRow>()
        .key((r:AspenESGradesRow) => r["Student ID"])
        .key((r:AspenESGradesRow) => r["Course Number"])
        .rollup((rs: AspenESGradesRow[]):RawESCumulativeGradeExtractRow => {
            const grade = rs.filter(g => g['Quarter']===currentQuarter);
            const prevGrade = rs.filter(g => g['Quarter']===prevQuarter);
            if(grade[0]===undefined){
                console.log(rs)
            }/*
            if(grade[0]["Cumulative Semester Average"] === ''){
                grade[0]["Final Average"] = prevGrade[0]['Term Grade']
            }*/
            return convertAspGrades(grade[0])
    }).object(grades)
    return Object.values(byStudent).map(a => Object.values(a)).flat(2)
}