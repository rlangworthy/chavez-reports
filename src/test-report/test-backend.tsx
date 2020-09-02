import { ReportFiles } from '../shared/report-types'
import { parseSchedule } from '../shared/schedule-parser'
import * as React from 'react'
import * as idb from 'idb-keyval'
import * as d3 from 'd3'
import Table from 'react-bootstrap/Table'

const ObjectsToCsv = require('objects-to-csv');

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

interface TestProps {
    reportFiles?: ReportFiles
}

interface TestState {
    schedule: {[id: string] : ScheduleInfo[]}
}

async function printCsv(data) {
    console.log(
      await new ObjectsToCsv(data).toString()
    );
  }

export class TestReport extends React.Component<TestProps, TestState> {
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