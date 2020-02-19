import * as React from 'react'
import * as dateFns from 'date-fns'
import * as idb from 'idb-keyval'

import Table from 'react-bootstrap/Table'
import Chart from 'react-google-charts'

import {
    createOnePagers, 
    HomeRoom, 
    NWEAData,
    OTSummary, 
    getOTSQRP} from '../weekly-one-pager-backend'
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
        const [homeRooms, summary] = this.props.reportFiles ? createOnePagers(this.props.reportFiles) : [[],{}]
        const twoSided = this.props.reportFiles && 
            this.props.reportFiles.reportTitle.optionalFiles && 
            this.props.reportFiles.reportFiles[this.props.reportFiles.reportTitle.optionalFiles[0].fileDesc] ? true:false
        return (
            <React.Fragment>
                <SummaryPage summary={summary}/>
                {twoSided ? <div className={'summary-page'}/>:null}
                {homeRooms.map( hr => {return (
                    <WeeklyOnePager hr={hr} key={hr.room} backpage={twoSided}/>
                    )})}
            </React.Fragment>
        )}
}

class SummaryPage extends React.PureComponent<{summary: OTSummary}>{
    render(){
        const summaryKeys = ['3','4','5','6','7','8', '3-8']
        const summary = this.props.summary
        console.log(summary)
        return (
            <div className={'summary-page'}>
                <h1>Homeroom One Pager Summaries</h1>
                <h3>On Track Counts by Grade</h3>
                {summaryKeys.map(key => 
                        summary[key] &&
                        <Table striped bordered size="sm" className={'summary-page-table'}>
                            <tr>
                                <td className={'summary-cell'}>Grade Level</td>
                                {Object.keys(summary[key]).map(k => {
                                    if(k !== 'Avg'){
                                        return (
                                            <td className={'summary-cell'}>OT Level {k}</td>
                                    )}else{
                                        return (
                                            <td className={'summary-cell'}>Avg OT Score</td>
                                        )
                                    }
                                })}
                                <td className={'summary-cell'}>SQRP Points</td>
                            </tr>
                            <tr>
                                <td className={'summary-cell'}>{key}</td>
                                {Object.keys(summary[key]).map(k => {
                                    return (
                                        <td className={'summary-cell'}>{summary[key][k]}</td>
                                    )
                                })}
                                <td className={'summary-cell'}>{getOTSQRP(summary[key]['Avg'] * 10)}</td>
                            </tr>
                        </Table>
                    
                )}
            </div>
        )
    }
}

class WeeklyOnePager extends React.PureComponent<{hr: HomeRoom, backpage: boolean}> {
    render(){
        const hr = this.props.hr
        return (
            <div>
                <div className='weekly-wrapper'>
                            <span>
                                <h1 className='inline'>{'Homeroom One Pager - ' + hr.room}</h1>
                                <h3 className='inline'>{dateString}</h3>
                            </span>
                            <h4>Average OT Score: {hr.OT ? hr.OT.toFixed(1):''}, worth {hr.SQRP} of 5 SQRP points</h4>
                            <Table striped bordered size="sm">
                                <tbody>
                                    <tr>
                                        <td>ELL</td>
                                        <td>LRE</td>
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
                                                <td>{student.LRE}</td>
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
                    <DisciplineDisplay data={props.hr.NWEAMath} discipline={'Math'}/>
                </div> : null}
            {props.hr.NWEARead && props.hr.NWEARead.chartData.length > 1? 
                <div className='math-rep'>
                    <h4>Correlation between most recent Reading NWEA percentile and cummulative grade for Reading Framework class</h4>
                    <DisciplineDisplay data={props.hr.NWEARead} discipline={'Read'}/>
                </div> : null}

        </div>
    )
}

const DisciplineDisplay :React.SFC<{data: NWEAData, discipline: 'Math' | 'Read'}> = props => {
    let data: number[][] = []
    if(props.discipline === 'Math'){
        data = props.data.chartData.map(s => [s.nweaMath, s.finalMathGrade])
    }else{
        data = props.data.chartData.map(s => [s.nweaRead, s.finalReadingGrade])
    }

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
                    ...data
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
            <div>
                <span className='inline'>
                    <h5>Lower than Predicted Grade</h5>
                    <Table striped bordered size="sm">
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>NWEA</td>
                                <td>Grade</td>
                            </tr>
                            {props.data.chartData.slice(0, Math.min(props.data.chartData.length, 5)).map(s => {
                                return (
                                    <tr key={s.fullName}>
                                        <td>{s.fullName}</td>
                                        {props.discipline === 'Math' ?
                                            <>
                                            <td>{s.nweaMath}</td>
                                            <td>{s.finalMathGrade}</td>
                                            </> :
                                            <>
                                            <td>{s.nweaRead}</td>
                                            <td>{s.finalReadingGrade}</td>
                                            </>}
                                    </tr>
                                )
                                })
                            }
                        </tbody>
                    </Table>

                </span>
            </div>
        </div>
    )
}