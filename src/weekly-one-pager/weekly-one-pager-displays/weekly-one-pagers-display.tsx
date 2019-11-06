import * as React from 'react'
import * as dateFns from 'date-fns'
import * as idb from 'idb-keyval'

import Table from 'react-bootstrap/Table'
import Chart from 'react-google-charts'

import {createOnePagers, HomeRoom, NWEAData} from '../weekly-one-pager-backend'
import { ReportFiles } from '../../shared/report-types'
import './weekly-one-pagers-display.css'

interface OnePageProps {
    reportFiles?: ReportFiles
}

interface OnePageState {
}

const printGrade = (quarter: number, final: number) => {
    if (quarter < 0 && final < 0 ){ return '--'}
    return '(' + ((quarter > 0 ) ? quarter: '-') + ', ' + ((final > 0 ) ? final: '-') + ')';
}

const dateString= dateFns.format(new Date(), 'Do MMM, YYYY');

export class HROnePagers extends React.Component<OnePageProps, OnePageState> {
    constructor(props){
        super(props)
        window.addEventListener('beforeunload', () => {idb.del('Weekly One Pager')});
        this.state = {homeRooms: []}
    }

    private 

    render() {
        const homeRooms = this.props.reportFiles ? createOnePagers(this.props.reportFiles) : []
        const twoSided = this.props.reportFiles && 
            this.props.reportFiles.reportTitle.optionalFiles && 
            this.props.reportFiles.reportFiles[this.props.reportFiles.reportTitle.optionalFiles[0].fileDesc] ? true:false
        return (
            <React.Fragment>
                {homeRooms.map( hr => {return (
                    <WeeklyOnePager hr={hr} key={hr.room} backpage={twoSided}/>
                    )})}
            </React.Fragment>
        )}
}

class WeeklyOnePager extends React.PureComponent<{hr: HomeRoom, backpage: boolean}> {
    render(){
        const hr = this.props.hr
        return (
            <div>
                <div className='weekly-wrapper'>
                            <span>
                                <h1 className='inline'>{'Weekly HR One Pager - ' + hr.room}</h1>
                                <h3 className='inline'>{dateString}</h3>
                            </span>
                            <h4>Average OT Score: {hr.OT ? hr.OT.toFixed(1):''}, worth {hr.SQRP} of 5 SQRP points</h4>
                            <Table striped bordered size="sm">
                                <tbody>
                                    <tr>
                                        <td>ELL</td>
                                        <td>Full Name (On Track)</td>
                                        <td>Read(Q,F)</td>
                                        <td>Math(Q,F)</td>
                                        <td>Sci(Q,F)</td>
                                        <td>SS(Q,F)</td>
                                        <td>GPA</td>
                                        <td>Tardies</td>
                                        <td>Attendance</td>
                                    </tr>
                                    {hr.students.map( (student, i) => {
                                        return (
                                            <tr key={student.fullName + hr.room + i}>
                                                <td>{student.ELL === 'N/A' ? '' : student.ELL}</td>
                                                <td>{student.fullName + ' ('+ student.onTrack + ')'}</td>
                                                <td>{printGrade(student.quarterReadingGrade, student.finalReadingGrade)}</td>
                                                <td>{printGrade(student.quarterMathGrade, student.finalMathGrade)}</td>
                                                <td>{printGrade(student.quarterScienceGrade, student.finalScienceGrade)}</td>
                                                <td>{printGrade(student.quarterSocialScienceGrade, student.finalSocialScienceGrade)}</td>
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

                    {this.props.backpage ? <BackPage hr={hr}/>:null}
                    </div>
        )
    }
}

const BackPage : React.SFC<{hr: HomeRoom}> = (props) =>{    
    return (
        <div className='backpage'>
            {props.hr.NWEAMath && props.hr.NWEAMath.chartData.length > 1 ? 
                <div className='math-rep'>
                    <h4>Correlation between most recent Mathematics NWEA percentile and cummulative grade for Math class</h4>
                    <DisciplineDisplay data={props.hr.NWEAMath}/>
                </div> : null}
            {props.hr.NWEARead && props.hr.NWEARead.chartData.length > 1? 
                <div className='math-rep'>
                    <h4>Correlation between most recent Reading NWEA percentile and cummulative grade for Reading Framework class</h4>
                    <DisciplineDisplay data={props.hr.NWEARead}/>
                </div> : null}

        </div>
    )
}

const DisciplineDisplay :React.SFC<{data: NWEAData}> = props => {
    return(
        <div className='NWEA-rep'>
            <h5>Correlation: {props.data.correl}</h5>
            <Chart
                width={'500px'}
                height={'300px'}
                chartType="ScatterChart"
                loader={<div>Loading Chart</div>}
                data={[
                    ['NWEA', 'Grade'],
                    ...props.data.chartData
                ]}
                options={{
                    title: 'NWEA vs Grade',
                    hAxis: { title: 'NWEA' },
                    vAxis: { title: 'Grade' },
                    legend: 'none',
                    trendlines: { 0: {} },
                }}
                rootProps={{ 'data-testid': '1' }}
            />
        </div>
    )
}