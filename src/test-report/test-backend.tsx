import { ReportFiles } from '../shared/report-types'
import { parseSchedule } from '../shared/schedule-parser'
import {stringToDate} from '../shared/utils'
import * as React from 'react'
import * as idb from 'idb-keyval'
import * as d3 from 'd3'
import * as datefns from 'date-fns'
import Table from 'react-bootstrap/Table'

const ObjectsToCsv = require('objects-to-csv');

interface JijiSheet {
    term: string,
    district_mind_id: string,
    district_organization_id: string,
    district_name: string,
    district_school_id: string,
    school_mind_id: string,
    school_organization_id: string,
    school_name: string,
    syllabus_state: string,
    syllabus_grade: string,
    student_grade: string,
    class_name: string,
    learner_status: string,
    teacher_mind_ids: string,
    teacher_district_ids: string,
    teacher_names: string,
    learner_gid: string,
    external_student_id: string,
    district_student_id: string,
    student_mind_id: string,
    student_first_name: string,
    student_middle_name: string,
    student_last_name: string,
    monday_date: string,
    monday_to_sunday_period: string,
    weekly_puzzles_collected: string,
    weekly_minutes: string,
    cumulative_minutes: string,
    cumulative_puzzles_collected: string,
}

const puzzlesByGrade:{[string:string]: number} = {
    'Pre-K':760,
    'K':2656,
    '1':2931,
    '2':3459,
    '3':3189,
    '4':3268,
    '5':3293,
    '6':3623,
    '7MSS':3253,
    '8MSS':2410,
}

const pctByGrade: {[string:string]: number} = {
    'Pre-K':8,
    'K':27,
    '1':30,
    '2':35,
    '3':32,
    '4':33,
    '5':33,
    '6':37,
    '7MSS':33,
    '8MSS':25,
}
    
    //test comment

const monthlyTargets: {[month: number]: number} = {
    8: 6,
    9:18,
    10:27,
    11:36,
    0:48,
    1:60,
    2:76,
    3:85,
    4:96,
    5:100
}

/*
-          End of September…….6%
-          End of October…….....18%
-          End of November….....27%
-          End of December….....36%
-          End of January………..48%
-          End of February…..…..60%
-          End of March……..…...76%
-          End of April………...….85%
-          End of May……….…...96%
-          End of June…………...100%

Reverse last week & Overall
Sort by progress last week

% puzzles key - how many puzzles needed for 1% progress
Organize teacher pages by last week progress

*/



interface PuzzleClasses {
    [className: string]: PuzzleClass
}

interface PuzzleClass {
    className: string
    gradeLevel: string
    sylGrade: {[grade:string]:number}
    averagePuzzles: number //as percent of total
    totalPuzzles: number
    totalMinutes: number
    lastWeekMinutes: number
    weekAgoPuzzles: number
    secondWeekAgoPuzzles: number
    students: PuzzleStudent[]
}

interface PuzzleStudent {
    name: string
    classGrade: string
    sylGrade: string
    class: string
    totalProgress: number //as percent of total
    cumulativePuzzles: number
    perPuzzleTime: string
    lastWeekCompleted: number //as percent of toal
    prevWeekCompleted: number
    lastWeekMinutes: number

}

const getPuzzleClasses = (studentWeeks: JijiSheet[]): PuzzleClasses => {
    
    const classes = d3.nest()
        .key((c:JijiSheet)=>c.class_name)
        .key((c:JijiSheet)=>c.district_student_id)
        .rollup((cs:JijiSheet[]):PuzzleStudent=>{
            const name = cs[0].student_first_name + ' ' + cs[0].student_last_name
            const lastWeek:JijiSheet = getLastWeek(cs)
            const prevWeek = get2WeeksAgo(cs)
            const totalProgress = parseInt(cs[0].cumulative_puzzles_collected)/puzzlesByGrade[cs[0].syllabus_grade] * 100   //puzzlesByGrade[cs[0].syllabus_grade]
            const perPuzzleTime = parseInt(cs[0].cumulative_minutes) > 0 ? (parseInt(cs[0].cumulative_puzzles_collected)/parseInt(cs[0].cumulative_minutes)).toFixed(1): '-'
            return {
                name: name,
                classGrade: cs[0].student_grade,
                sylGrade: cs[0].syllabus_grade,
                class: cs[0].class_name,
                totalProgress: totalProgress,
                perPuzzleTime: perPuzzleTime,
                lastWeekCompleted: 100 * parseInt(lastWeek.weekly_puzzles_collected)/puzzlesByGrade[cs[0].syllabus_grade],
                prevWeekCompleted: prevWeek !== 0 ? 100 * parseInt(prevWeek.weekly_puzzles_collected)/puzzlesByGrade[cs[0].syllabus_grade] : prevWeek,
                lastWeekMinutes: parseInt(lastWeek.weekly_minutes),
                cumulativePuzzles: parseInt(lastWeek.cumulative_puzzles_collected)
            }
        })
        .object(studentWeeks)
    
    const jijiClasses:PuzzleClasses = {}
    Object.keys(classes).forEach(className => {
        jijiClasses[className] = getJijiClass(classes[className])
    })
    console.log(classes)
    console.log(jijiClasses)
    return jijiClasses
}

const getJijiClass = (room: {[student: string]:PuzzleStudent}):PuzzleClass => {
    const students: PuzzleStudent[] = Object.keys(room).map(id => room[id])
    
    const sylObj = d3.nest()
        .key(s=>s.sylGrade)
        .rollup(rs => rs.length)
        .object(students)

    //const sylGrade = Object.keys(sylObj).map(gl => gl + ': ' + sylObj[gl].toString()).join()
    

    return {
        className: students[0].class,
        gradeLevel: students[0].classGrade,
        sylGrade: sylObj,
        averagePuzzles: students.reduce((a,b) => a + b.totalProgress, 0)/students.length,
        weekAgoPuzzles: students.reduce((a,b) => a + b.lastWeekCompleted, 0)/students.length,
        secondWeekAgoPuzzles: students.reduce((a,b) => a + b.prevWeekCompleted, 0)/students.length,
        totalMinutes: students.reduce((a,b) => a + b.totalProgress, 0),
        totalPuzzles: students.reduce((a,b) => a + b.totalProgress, 0),
        lastWeekMinutes: students.reduce((a,b) => a + b.lastWeekMinutes, 0),
        students: students}
}

const getLastWeek = (cs: JijiSheet[]):JijiSheet => {
    const sorted = cs.sort((a,b) => datefns.compareAsc(stringToDate(b.monday_date), stringToDate(a.monday_date)))
    return sorted[0]
}
const get2WeeksAgo = (cs: JijiSheet[]):JijiSheet | 0 => {
    const sorted = cs.sort((a,b) => datefns.compareAsc(stringToDate(b.monday_date), stringToDate(a.monday_date)))
    return sorted.length > 1 ? sorted[1] : 0
}


interface TestReportProps { 
    reportFiles?: ReportFiles
}

interface TestReportState {
    puzzleClasses: PuzzleClasses
}

export class TestReport extends React.Component<TestReportProps, TestReportState> {
    constructor(props){
        super(props)
        this.state = {
            puzzleClasses: {}
        }
    }

    componentWillMount(){
        const puzzles: JijiSheet[] = this.props.reportFiles ? this.props.reportFiles.reportFiles[this.props.reportFiles.reportTitle.files[0].fileDesc].parseResult?.data : [];
        const classes = getPuzzleClasses(puzzles)

        this.setState({
            puzzleClasses: classes
        })

    } 

    render() {
        
        return(
            <>
                <Table bordered style={{pageBreakAfter: 'always'}}>
                    <thead>
                        <tr>
                            <th>Class</th>
                            <th>Syllabus Grade</th>
                            <th>Average % Completed</th>
                            <th>2 Weeks Ago % Completed</th>
                            <th>Last Week % Completed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(this.state.puzzleClasses).map(pc => {

                            return(
                            <tr>
                                <td>{pc.slice(pc.indexOf('-')+2, pc.length)}</td>
                                <td>{Object.keys(this.state.puzzleClasses[pc].sylGrade).map(gl => gl + ': ' + this.state.puzzleClasses[pc].sylGrade[gl].toString()).join()}</td>
                                <td>{this.state.puzzleClasses[pc].averagePuzzles.toFixed(2)}%</td>
                                <td>{this.state.puzzleClasses[pc].secondWeekAgoPuzzles.toFixed(2)}%</td>
                                <td>{this.state.puzzleClasses[pc].weekAgoPuzzles.toFixed(2)}%</td>
                            </tr>)
                        })}
                    </tbody>
                </Table>
                {Object.keys(this.state.puzzleClasses).map(cName => {
                    return (
                        <>
                        <div style={{display:"flex", justifyContent:"space-between"}}>
                            <span>
                                <p>Class: {cName.slice(cName.indexOf('-')+2, cName.length)}</p>
                                <p>Total Puzzles: {this.state.puzzleClasses[cName].averagePuzzles.toFixed(2)}</p>
                                <p>Syllabus Grade: {Object.keys(this.state.puzzleClasses[cName].sylGrade).map(gl => gl + ': ' + this.state.puzzleClasses[cName].sylGrade[gl].toString()).join()}</p>
                            </span>
                            <span>
                                <Table bordered>
                                    <tr><td>End of Month Target</td><td>{monthlyTargets[(new Date).getMonth()]}%</td></tr>
                                    {Object.keys(this.state.puzzleClasses[cName].sylGrade).map(gl => {
                                        return (
                                        <tr><td>Grade {gl} puzzles/1%</td><td>{pctByGrade[gl]}</td></tr>
                                        )
                                    })}
                                </Table>
                            </span>
                        </div>
                            <Table bordered style={{pageBreakAfter: 'always'}}>
                                <thead>
                                    <tr>
                                        <td></td>
                                        <td colSpan={2}>Last Week</td>
                                        <td colSpan={2}>Overall</td>
                                    </tr>
                                    <tr>
                                        <td>Student Name</td>
                                        <td>% Progress</td>
                                        <td>Time spent</td>
                                        <td>Total Progress (%)</td>
                                        <td>Minutes/Puzzle</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.puzzleClasses[cName].students.sort((a,b) => a.totalProgress - b.totalProgress).map(student => {
                                        return (
                                            <tr>
                                                <td>{student.name}({student.sylGrade})</td>
                                                <td>{student.lastWeekCompleted.toFixed(0)}%</td>
                                                <td>{student.lastWeekMinutes}</td>
                                                <td>{student.totalProgress.toFixed(0)}%</td>
                                                <td>{student.perPuzzleTime}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </Table>
                        </>
                    )
                })}
            </>
        )
    }
}








interface ScheduleInfo {
    Clssrm: string,
    Contact: string,
    Description: string,
    EmailLock01: string,
    GrdLvl: string,
    Num: string,
    Platoon: string,
    Teacher: string,
    courseDesc: string,
    courseID: string,
    homeroom: string,
    room: string,
    studentID: string,
    studentName: string,
    teacher: string,
    Email1: string,
    'Parent Email': string,
    'Parent Phone': string,
}

interface RemoteLearningStudentInfoSheetProps {
    reportFiles?: ReportFiles
}

interface RemoteLearningStudentInfoSheetState {
    schedule: {[id: string] : ScheduleInfo[]}
}


export class RemoteLearningStudentInfoSheet extends React.Component<RemoteLearningStudentInfoSheetProps, RemoteLearningStudentInfoSheetState> {
    constructor(props){
        super(props)
        window.addEventListener('beforeunload', () => {idb.del('Weekly One Pager')});
        this.state = {
            schedule: {}
        }
    }

    componentWillMount(){
        const schedule: ScheduleInfo[] = this.props.reportFiles ? this.props.reportFiles.reportFiles[this.props.reportFiles.reportTitle.files[0].fileDesc].parseResult?.data : [];
        const students = d3.nest()
            .key((s:ScheduleInfo) => s.studentID)
            .object(schedule)
        this.setState({
            schedule: students
        })

    } 

    render() {
        
        const studentList = Object.keys(this.state.schedule).sort((a,b) => this.state.schedule[a][0].homeroom.localeCompare(this.state.schedule[b][0].homeroom))

        return(
            <>
                {studentList.map(id => {
                    return(
                        <div style={{pageBreakAfter: 'always'}}>
                            <h3 style={{margin: '1em'}}>Name/Nombre: {this.state.schedule[id][0].studentName}</h3>
                            <h3 style={{margin: '1em'}}>Room/Salon: {this.state.schedule[id][0].homeroom}</h3>
                            <h4 style={{margin: '1em'}}>CPS Username/Usuario: {this.state.schedule[id][0].Email1.split('@')[0]}</h4>
                            <h4 style={{margin: '1em'}}>CPS Password/Codigo: {id.slice(-4)}Chicago</h4>
                            <h4 style={{margin: '1em'}}>Parent's Site/Sitio para Padres: https://sites.google.com/cps.edu/padres-de-chavez/home</h4>
                            <Table striped bordered size="sm">
                                <tbody>
                                    <tr>
                                        <td>
                                            Class
                                        </td>
                                        <td>
                                            Teacher
                                        </td>
                                        <td>
                                            Email
                                        </td>
                                    </tr>
                                {this.state.schedule[id].map(row => {
                                    return(
                                        <tr>
                                            <td>
                                                {row.courseDesc}
                                            </td>
                                            <td>
                                                {row.Teacher}
                                            </td>
                                            <td>
                                                {row.EmailLock01}
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </Table>
                            <h4>Correo de Padre: {this.state.schedule[id][0]["Parent Email"]}</h4>
                            <h4>Teléfono de Padre: {this.state.schedule[id][0]["Parent Phone"]}</h4>
                        </div>
                    )
                })} 
            </>
        )
    }
}
