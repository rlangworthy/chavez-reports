import * as React from 'react'
import * as dateFns from 'date-fns'
import * as idb from 'idb-keyval'

import Table from 'react-bootstrap/Table'

import {createOnePagers} from '../weekly-one-pager-backend'
import { ReportFiles } from '../../shared/report-types'
import './weekly-one-pagers-display.css'

interface OnePageProps {
    reportFiles?: ReportFiles
}

interface OnePageState {
}

export class HROnePagers extends React.Component<OnePageProps, OnePageState> {
    constructor(props){
        super(props)
        window.addEventListener('beforeunload', () => {idb.del('Weekly One Pager')});
        this.state = {homeRooms: []}
    }

    private dateString= dateFns.format(new Date(), 'Do MMM, YYYY');
    private printGrade = (quarter: number, final: number) => {
        if (quarter < 0 && final < 0 ){ return '--'}
        return '(' + ((quarter > 0 ) ? quarter: '-') + ', ' + ((final > 0 ) ? final: '-') + ')';
    }
    render() {
        const homeRooms = this.props.reportFiles ? createOnePagers(this.props.reportFiles) : []
        return (
            <React.Fragment>
                {homeRooms.map( hr => {return (
                    <div key={hr.room} className='weekly-wrapper'>
                        <h1>{'Weekly HR One Pager - ' + hr.room}</h1>
                        <h3>{this.dateString}</h3>
                        <Table striped bordered size="sm">
                            <tbody>
                                <tr>
                                    <td>ELL</td>
                                    <td>Full Name (Chavez OT, CPS OT)</td>
                                    <td>Read(Q,F)</td>
                                    <td>Math(Q,F)</td>
                                    <td>Sci(Q,F)</td>
                                    <td>SS(Q,F)</td>
                                    <td>GPA</td>
                                    <td>Tardies</td>
                                    <td>Attendance</td>
                                </tr>
                                {hr.students.map( student => {
                                    return (
                                        <tr key={student.fullName}>
                                            <td>{student.ELL === 'N/A' ? '' : student.ELL}</td>
                                            <td>{student.fullName + ' ('+ student.onTrack + ', ' + (student.CPSonTrack? 'Yes': 'No') + ')'}</td>
                                            <td>{this.printGrade(student.quarterReadingGrade, student.finalReadingGrade)}</td>
                                            <td>{this.printGrade(student.quarterMathGrade, student.finalMathGrade)}</td>
                                            <td>{this.printGrade(student.quarterScienceGrade, student.finalScienceGrade)}</td>
                                            <td>{this.printGrade(student.quarterSocialScienceGrade, student.finalSocialScienceGrade)}</td>
                                            <td>{student.finalGPA[0] === student.finalGPA[1] ? student.finalGPA[0].toFixed(2):
                                                student.finalGPA[0].toFixed(2) + '(' + (student.finalGPA[0]-student.finalGPA[1]).toFixed(2)+')'}</td>
                                            <td>{student.tardies[0] === student.tardies[1] ? student.tardies[0]:
                                                student.tardies[0] + '(' + (student.tardies[0]-student.tardies[1])+')'}</td>
                                            <td>{student.enrollmentDays[0]===student.enrollmentDays[1] ? 
                                            ((student.enrollmentDays[0]-student.absences[0])/student.enrollmentDays[0]*100).toFixed(1) + '%(' +
                                            (student.enrollmentDays[0]-student.absences[0]) + '/' + student.enrollmentDays[0] + ')': 
                                            ((student.enrollmentDays[0]-student.absences[0])/student.enrollmentDays[0]*100).toFixed(1) + '%'}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>

                        </Table>
                    </div>
                    )})}
            </React.Fragment>
        )}
}



