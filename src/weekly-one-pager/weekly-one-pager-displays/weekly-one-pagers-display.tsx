import * as React from 'react'
import * as dateFns from 'date-fns'
import * as idb from 'idb-keyval'

import Table from 'react-bootstrap/Table'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Chart from 'react-google-charts'

import {
    createOnePagers, 
    HomeRoom, 
    NWEAData,
    getOTSQRP,
    HRSummary} from '../weekly-one-pager-backend'
import { ReportFiles } from '../../shared/report-types'
import {
    MultiSelect
    } from '../../shared/components/multi-select'
import './weekly-one-pagers-display.css'

interface OnePageProps {
    reportFiles?: ReportFiles
}

interface OnePageState {
    grades: string[]
    selectedGrades: string[]
    homeRooms: HomeRoom[],
    summary: HRSummary,
    twoSided: boolean
    pctFailure:boolean
}

const printGrade = (quarter: number, final: number) => {
    if (quarter < 0 && final < 0 ){ return '--'}
    return '(' + ((quarter > 0 ) ? quarter.toFixed(0): '-') + ', ' + ((final > 0 ) ? final.toFixed(0): '-') + ')';
}

const dateString= dateFns.format(new Date(), 'Do MMM, YYYY');

export class HROnePagers extends React.Component<OnePageProps, OnePageState> {
    constructor(props){
        super(props)
        window.addEventListener('beforeunload', () => {idb.del('Weekly One Pager')});
        this.state = {
            grades: [],
            selectedGrades: [],
            homeRooms: [],
            summary: {OT:{},grades:{}},
            twoSided: false,
            pctFailure: false,
        }
    }

    componentWillMount(){
        const pctFailure = 
            this.props.reportFiles && 
            ((this.props.reportFiles.schooData!== undefined && Object.keys(this.props.reportFiles.schooData.students).length > 0) ||(
            this.props.reportFiles.reportTitle.optionalFiles && 
            (this.props.reportFiles.reportFiles[this.props.reportFiles.reportTitle.optionalFiles[0].fileDesc] ||
                this.props.reportFiles.reportFiles[this.props.reportFiles.reportTitle.optionalFiles[1].fileDesc]   ))) ? true:false
        const [homeRooms, summary]: [HomeRoom[], HRSummary] = this.props.reportFiles ? createOnePagers(this.props.reportFiles) : 
        [[] as HomeRoom[],{} as HRSummary]
        const grades = [... new Set(homeRooms.map(hr => hr.grade))].sort()
        const twoSided = false

        this.setState({
            homeRooms: homeRooms,
            summary: summary,
            twoSided: twoSided,
            grades: grades,
            pctFailure:pctFailure,
        })
    
    } 

    render() {
        const summary = this.state.summary
        const twoSided = this.state.twoSided
        const homeRooms = this.state.homeRooms
        return (
            <Container>
                <Row>
                    <Col className='grades-filter-container'>
                        <MultiSelect
                            items={this.state.grades}
                            selected={this.state.selectedGrades}
                            title='Teachers'
                            handleClick={this.handleGradeClick}
                        />
                    </Col>
                    <Col className='grades-display-container'>
                        <SummaryPage summary={summary}/>
                        {twoSided ? <div className={'summary-page'}/>:null}
                        {homeRooms.map( hr => {
                                if(this.state.selectedGrades.length===0 || this.state.selectedGrades.includes(hr.grade)){
                                    return (
                                        <WeeklyOnePager hr={hr} key={hr.room} backpage={twoSided} pctFailure={this.state.pctFailure}/>
                                    )
                                }else{
                                    return null
                                }   
                            }
                        )}
                    </Col>
                </Row>
            </Container>
        )}

        handleGradeClick = (grade: string[] | string): void => {
            const selected=this.state.selectedGrades;
            if(Array.isArray(grade)){
                if(grade.every(s => selected.includes(s))){
                    this.setState({selectedGrades: selected.filter(f=> !grade.includes(f))})
                }else{
                    const newSelected = selected.concat(grade.filter(s=> !selected.includes(s)))
                    this.setState({selectedGrades:newSelected})
                }
            }else{
                selected.includes(grade) ? 
                    this.setState({selectedGrades: selected.filter(f => f!==grade)}):
                    this.setState({selectedGrades: selected.concat([grade])})
            }
        }
}

class SummaryPage extends React.PureComponent<{summary: HRSummary}>{
    render(){
        const summaryKeys = ['1', '2', '3','4','5','6','7','8', '3-8']
        const summary = this.props.summary.OT
        const averages = this.props.summary.grades
        return (
            <div className={'summary-page'}>
                <span>
                    <h1>Homeroom One Pager Summaries</h1>
                    <h3 className='inline'>{dateString}</h3>
                </span>
                <h3>On Track Counts by Grade</h3>
                {summaryKeys.map(key => 
                        summary[key] &&
                        <Table striped bordered size="sm" className={'summary-page-table'} key={key}>
                            <tbody>
                                <tr>
                                    <td className={'summary-cell'}>Grade Level</td>
                                    {['1','2','3','4','5','Avg'].map(k => {
                                        if(k !== 'Avg'){
                                            return (
                                                <td className={'summary-cell'} key={k}>OT Level {k}</td>
                                        )}else{
                                            return (
                                                <td className={'summary-cell'} key={k}>Avg OT Score</td>
                                            )
                                        }
                                    })}
                                    <td className={'summary-cell'}>SQRP Points</td>
                                </tr>
                                <tr>
                                    <td className={'summary-cell'}>{key}</td>
                                    {['1','2','3','4','5','Avg'].map(k => {
                                        return (
                                            <td className={'summary-cell'} key={k}>{summary[key][k]}</td>
                                        )
                                    })}
                                    <td className={'summary-cell'}>{key === '1' || key === '2' ? '-' : getOTSQRP(summary[key]['Avg'] * 10)}</td>
                                </tr>
                            </tbody>
                        </Table>
                )}
                <h3>Grade and Attendance Averages by Grade</h3>
                {summaryKeys.map(key => 
                        averages[key] &&
                        <Table striped bordered size="sm" className={'summary-page-table'} key={key}>
                            <tbody>
                                <tr>
                                    <td className={'summary-cell'}>Grade Level</td>
                                    <td className={'summary-cell'}>Math</td>
                                    <td className={'summary-cell'}>Reading</td>
                                    <td className={'summary-cell'}>Science</td>
                                    <td className={'summary-cell'}>Social Science</td>
                                    <td className={'summary-cell'}>Attendance</td>
                                </tr>
                                <tr>
                                    <td className={'summary-cell'}>{key}</td>
                                    <td className={'summary-cell'}>{averages[key].mathGrade.toFixed(0)}</td>
                                    <td className={'summary-cell'}>{averages[key].readingGrade.toFixed(0)}</td>
                                    <td className={'summary-cell'}>{averages[key].scienceGrade.toFixed(0)}</td>
                                    <td className={'summary-cell'}>{averages[key].ssGrade.toFixed(0)}</td>
                                    <td className={'summary-cell'}>{averages[key].attendanceAvg.toFixed(0)}</td>
                                </tr>
                            </tbody>
                        </Table>
                )}
            </div>
        )
    }
}

class WeeklyOnePager extends React.PureComponent<{hr: HomeRoom, backpage: boolean, pctFailure: boolean}> {
    render(){
        const hr = this.props.hr
        return (
            <>
                <div className='weekly-wrapper'>
                            <span>
                                <h1 className='inline'>{'Homeroom One Pager - ' + hr.room}</h1>
                                <h3 className='inline'>{dateString}</h3>
                            </span>
                            <span className='inline'>
                                <h4>Average OT Score: {hr.OT ? hr.OT.toFixed(1):''}, worth {hr.SQRP} of 5 SQRP points</h4>
                                <span color={'darkgreen'}>Green</span> names improve OT with one higher letter grade, <span color={'darkorange'}>Orange</span> with two
                            </span>
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
                                        <td>{this.props.pctFailure? "Percent F's": 'Tardies'}</td>
                                        <td>Attendance</td>
                                    </tr>
                                    {hr.students.map( (student, i) => {
                                        const className = student.otDelta && student.otDelta > 0 ? (student.otDelta ===1 ? 'one-grade':'two-grade') : ''
                                        return (
                                            <tr key={student.fullName + hr.room + i}>
                                                <td>{student.ELL === 'N/A' ? '' : student.ELL}</td>
                                                <td>{student.LRE}</td>
                                                <td className={className}>{student.fullName + ' ('+ student.onTrack + ')'}</td>
                                                <td>{printGrade(student.quarterReadingGrade, student.finalReadingGrade)}</td>
                                                <td>{printGrade(student.quarterMathGrade, student.finalMathGrade)}</td>
                                                <td>{printGrade(student.quarterScienceGrade, student.finalScienceGrade)}</td>
                                                <td>{printGrade(student.quarterSocialScienceGrade, student.finalSocialScienceGrade)}</td>
                                                <td>{student.finalGPA[0] === student.finalGPA[1] ? student.finalGPA[0].toFixed(1):
                                                    student.finalGPA[0].toFixed(1) + '(' + (student.finalGPA[0]-student.finalGPA[1]).toFixed(1)+')'}</td>
                                                <td>{this.props.pctFailure ? student.failureRate >= 0 ? (student.failureRate*100).toFixed(0)+ '%': 'N/A' : student.tardies[0] === student.tardies[1] ? student.tardies[0]:
                                                    student.tardies[0] + '(' + (student.tardies[0]-student.tardies[1])+')'}</td>
                                                <td>{student.enrollmentDays[0]===student.enrollmentDays[1] ? 
                                                ((student.enrollmentDays[0]-student.absences[0])/student.enrollmentDays[0]*100).toFixed(0) + '%(' +
                                                (student.enrollmentDays[0]-student.absences[0]) + '/' + student.enrollmentDays[0] + ')': 
                                                ((student.enrollmentDays[0]-student.absences[0])/student.enrollmentDays[0]*100).toFixed(0) + '%'}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>

                            </Table>
                        </div>

                    {this.props.backpage ? <BackPage hr={hr}/>:null}
                    </>
        )
    }
}

const BackPage : React.SFC<{hr: HomeRoom}> = (props) =>{    
    if(['3','4','5','6','7','8'].includes(props.hr.grade))
    {
        return (
            <div className='backpage'>
                {props.hr.NWEAMath && props.hr.NWEAMath.chartData.length > 1 ? 
                    <div className='math-rep'>
                        <h4>Mathematics NWEA percentile and cummulative grade for Math class Analysis</h4>
                        <DisciplineDisplay data={props.hr.NWEAMath} discipline={'Math'}/>
                    </div> : null}
                {props.hr.NWEARead && props.hr.NWEARead.chartData.length > 1? 
                    <div className='math-rep'>
                        <h4>Reading NWEA percentile and cummulative grade for Reading Framework class Analysis</h4>
                        <DisciplineDisplay data={props.hr.NWEARead} discipline={'Read'}/>
                    </div> : null}

            </div>
        )
    }else if(['1', '2'].includes(props.hr.grade)){
        return (
            <div className='backpage'>
                <h4>Students with High Reading Grades and Low TRC Proficiency</h4>
                <span className='inline'>
                    <Table striped bordered size="sm">
                        <tbody>
                            <tr>
                                <td colSpan={2}>Below Proficient and A's</td>
                            </tr>
                            {props.hr.students.map((s,id)=> {
                                if(s.mClass && s.mClass === 'Below Proficient'
                                    && s.finalReadingGrade > 89.5){
                                        return (
                                            <tr key={id}>
                                                <td>{s.fullName}</td>
                                                <td>{s.finalReadingGrade}</td>
                                            </tr>
                                        )
                                    }
                            })}
                        </tbody>
                    </Table>
                    <Table striped bordered size="sm">
                        <tbody>
                            <tr>
                                <td colSpan={2}>Far Below Proficient and A's or B's</td>
                            </tr>
                            {props.hr.students.map((s,id)=> {
                                if(s.mClass && s.mClass === 'Far Below Proficient'
                                    && s.finalReadingGrade > 79.5){
                                        return (
                                            <tr key={id}>
                                                <td>{s.fullName}</td>
                                                <td>{s.finalReadingGrade}</td>
                                            </tr>
                                        )
                                    }
                            })}
                        </tbody>
                    </Table>
                </span>
            </div>
        )
    }
    else{
        return (
            <div className='backpage'>
                
            </div>
        )
    }
}

const DisciplineDisplay :React.SFC<{data: NWEAData, discipline: 'Math' | 'Read'}> = props => {
    let data: number[][] = []
    if(props.discipline === 'Math'){
        data = props.data.chartData.map(s => [s.nweaMath, s.finalMathGrade])
    }else{
        data = props.data.chartData.map(s => [s.nweaRead, s.finalReadingGrade])
    }
    let correl = 'Low';
    if(props.data.correl > .4){
        correl = 'Medium'
    }
    if(props.data.correl > .65){
        correl = 'High'
    }

    /*
    old chart of nwea vs grade
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
    */
    return(
        <div className='NWEA-rep'>
            <h5>{correl} Correlation Between NWEA Percentile and Grade</h5>
            <div>
                <span className='inline'>
                    <h5>D and F Grades With High NWEA Scores</h5>
                    <Table striped bordered size="sm">
                        <tbody>
                            <tr>
                                <td>Name</td>
                                <td>NWEA</td>
                                <td>Grade</td>
                            </tr>
                            {props.data.chartData
                                .filter(student => 
                                    (props.discipline === 'Math' && student.finalMathGrade < 70 && student.nweaMath >= 50) ||
                                    (props.discipline === 'Read' && student.finalReadingGrade < 70 && student.nweaRead >= 50))
                                .sort((a,b) => {
                                    if(props.discipline === 'Math'){
                                        return a.finalMathGrade - b.finalMathGrade
                                    }else{
                                        return a.finalReadingGrade - b.finalReadingGrade
                                    }
                                })
                                .slice(0, Math.min(props.data.chartData.length, 5))
                                .map(s => {
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