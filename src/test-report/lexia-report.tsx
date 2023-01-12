import { ReportFiles } from '../shared/report-types'
import { parseSchedule } from '../shared/schedule-parser'
import {stringToDate} from '../shared/utils'
import { LexiaReport } from '../shared/file-interfaces'
import { SY_CURRENT } from '../shared/initial-school-dates'
import * as React from 'react'
import * as idb from 'idb-keyval'
import * as d3 from 'd3'
import * as datefns from 'date-fns'
import Table from 'react-bootstrap/Table'
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants'
import './lexia-report.css'

const ObjectsToCsv = require('objects-to-csv');


interface LexiaClasses {
    [className: string] : LexiaClass
}

interface LexiaClass {
    [students:string] : LexiaStudent
}

interface LexiaStudent {
    className: string
    name: string
    eomLevel: string
    monthlyUnits: string
    monthlyMinutes: string
    pctProgress: number
    minutesPerUnit: number
}

const LexiaUnitsPerLevel: {[unit:string]:number} = {
    "n/a": 1,
    "1": 52,
    "2": 54,
    "3": 54,
    "4": 65,
    "5": 68,
    "6": 72,
    "7": 74,
    "8": 61,
    "9": 82,
    "10": 88,
    "11": 78,
    "12": 73,
    "13": 77,
    "14": 80,
    "15": 78,
    "16": 83,
    "17": 76,
    "18": 78,
    "19": 82,
    "20": 86,
    "21": 76,
}

interface TestReportProps { 
    reportFiles?: ReportFiles
}

interface TestReportState {
    lexiaClasses: LexiaClasses
}

const getLexiaClasses = (studentWeeks: LexiaReport[]): LexiaClasses => {
    const classes = d3.nest()
        .key((c:LexiaReport)=> c.Classes)
        .key((c:LexiaReport)=> c['SIS ID'])
        .rollup((cs:LexiaReport[]):LexiaStudent => {
            const dates =  cs.map(c=> new Date(parseInt(c.Year), parseInt(c.Month)))
            const units = parseInt(cs[0]['Monthly Units'])
            const minutes = parseInt(cs[0]['Monthly Minutes'])
            const mostMostRecent = cs.sort((a,b) => new Date(parseInt(a.Year), parseInt(a.Month)) < new Date(parseInt(b.Year), parseInt(b.Month))? 1:-1)[0]
            return {
                className: mostMostRecent.Classes,
                name: mostMostRecent['First Name']+ ' ' + mostMostRecent['Last Name'],
                eomLevel: mostMostRecent['End of Month Level'],
                monthlyUnits: mostMostRecent['Monthly Units'],
                monthlyMinutes: mostMostRecent['Monthly Minutes'],
                pctProgress: parseInt(mostMostRecent['Monthly Units'])/LexiaUnitsPerLevel[mostMostRecent['End of Month Level']],
                minutesPerUnit: parseInt(mostMostRecent['Monthly Units'])> 0? parseInt(mostMostRecent['Monthly Minutes'])/parseInt(mostMostRecent['Monthly Units']) : -1,
            }
        }).object(studentWeeks)
    return classes
}

export class TestReport extends React.Component<TestReportProps, TestReportState> {
    constructor(props){
        super(props)
        this.state = {
            lexiaClasses: {}
        }
    }

    componentWillMount() {
        var puzzles: LexiaReport[] = []
        if (this.props.reportFiles) {
            const result = this.props.reportFiles.reportFiles[this.props.reportFiles.reportTitle.files[0].fileDesc].parseResult
            if(result !== null){
                puzzles = result.data
            }
        }
        const classes = getLexiaClasses(puzzles)
        console.log(classes)
        this.setState({
            lexiaClasses: classes
        })

    } 

    render() {
        
        return(
            <>
                {Object.keys(this.state.lexiaClasses).map(cName => {
                    return (
                        <div className='lexia-report-classroom' key={cName}>
                            <div style={{display:"flex", justifyContent:"space-between"}}>
                                <span>
                                    <p>Class: {cName.slice(cName.indexOf('-')+2, cName.length)}</p>
                                </span>
                            </div>
                                <Table bordered style={{pageBreakAfter: 'always'}}>
                                    <thead>
                                        <tr>
                                            <td>Student Name</td>
                                            <td>Level</td>
                                            <td>Monthly Units</td>
                                            <td>Monthly Minutes</td>
                                            <td>Pct Progress</td>
                                            <td>Mins/Unit</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(this.state.lexiaClasses[cName]).sort((a,b) => {
                                            if(isNaN(parseInt(this.state.lexiaClasses[cName][a].eomLevel))){
                                                return -1
                                            }
                                            if(isNaN(parseInt(this.state.lexiaClasses[cName][b].eomLevel))){
                                                return 1
                                            }
                                            const level = parseInt(this.state.lexiaClasses[cName][a].eomLevel)-parseInt(this.state.lexiaClasses[cName][b].eomLevel)
                                            if(level !== 0){
                                                return level
                                            }
                                            return parseInt(this.state.lexiaClasses[cName][a].monthlyUnits)-parseInt(this.state.lexiaClasses[cName][b].monthlyUnits)
                                        }
                                        ).map(student => {
                                            const lexiaStudent = this.state.lexiaClasses[cName][student]
                                            const studentFlag = lexiaStudent.minutesPerUnit > 20 || lexiaStudent.minutesPerUnit <0

                                            return (
                                                <tr className={'lexia-report-student'+ (studentFlag? '-flag':'')}>
                                                    <td>{lexiaStudent.name}</td>
                                                    <td>{lexiaStudent.eomLevel}</td>
                                                    <td>{lexiaStudent.monthlyUnits}</td>
                                                    <td>{lexiaStudent.monthlyMinutes}</td>
                                                    <td>{(lexiaStudent.pctProgress * 100).toFixed(1) + '%'}</td>
                                                    <td>{lexiaStudent.minutesPerUnit > 0 ? lexiaStudent.minutesPerUnit.toFixed(1) : 'n/a'}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                        </div>
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
/*
    componentWillMount(){
        const schedule: ScheduleInfo[] = this.props.reportFiles ? this.props.reportFiles.reportFiles[this.props.reportFiles.reportTitle.files[0].fileDesc].parseResult?.data : [];
        
        const students = d3.nest()
            .key((s:ScheduleInfo) => s.studentID)
            .object(schedule)
        this.setState({
            schedule: students
        })

    } 
*/
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