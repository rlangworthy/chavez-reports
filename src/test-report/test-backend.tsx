import { ReportFiles } from '../shared/report-types'
import { parseSchedule } from '../shared/schedule-parser'
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

interface PuzzleClasses {
    [className: string]: PuzzleClass
}

interface PuzzleClass {
    className: string
    gradeLevel: string
    averagePuzzles: number
    totalMinutes: number
    lastWeekMinutes: number
    students: PuzzleStudent[]
}

interface PuzzleStudent {
    name: string
    totalProgress: number
    perPuzzleTime: string
    lastWeekCompleted: number
    lastWeekMinutes: number

}

const getPuzzleClasses = (studentWeeks: JijiSheet[]): PuzzleClasses => {
    
    const classes = d3.nest()
        .key((c:JijiSheet)=>c.class_name)
        .key((c:JijiSheet)=>c.district_student_id)
        .rollup((cs:JijiSheet[]):PuzzleStudent=>{
            const name = cs[0].student_first_name + ' ' + cs[0].student_last_name
            const totalProgress = parseInt(cs[0].cumulative_puzzles_collected)
            const perPuzzleTime = parseInt(cs[0].cumulative_minutes) > 0 ? (totalProgress/parseInt(cs[0].cumulative_minutes)).toFixed(1): '-'
            const lastWeek:JijiSheet = cs[0]//getLastWeek(cs)
            return {
                name: name,
                totalProgress: totalProgress,
                perPuzzleTime: perPuzzleTime,
                lastWeekCompleted: parseInt(lastWeek.weekly_puzzles_collected),
                lastWeekMinutes: parseInt(lastWeek.weekly_minutes),
            }
        })
        .object(studentWeeks)
    
    const jijiClasses:PuzzleClasses = {}
    Object.keys(classes).forEach(className => {
        jijiClasses[className] = getJijiClass(classes[className])
    })
    
    return jijiClasses
}

const getJijiClass = (room: {[student: string]:PuzzleStudent}):PuzzleClass => {
    return {className: '',
        gradeLevel: '',
        averagePuzzles: 0,
        totalMinutes: 0,
        lastWeekMinutes: 0,
        students: []}
}
/*
const getLastWeek = (cs: JijiSheet[]):JijiSheet => {

}
*/

const getPuzzleStudent = (student: JijiSheet[]): PuzzleStudent => {
    return {name: '',
    totalProgress: 0,
    perPuzzleTime: '',
    lastWeekCompleted: 0,
    lastWeekMinutes: 0,}
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