import * as React from 'react'
import * as d3 from 'd3'

import {uniq} from 'ramda'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {
    StudentAssignments,
    StudentCategory,
    StudentAssignment,
    Student} from '../shared/student-assignment-interfaces'
import { ReportFiles } from '../shared/report-types'
import { MultiSelect } from '../shared/components/multi-select'
import { createAssignmentReports } from './student-grade-sheet-backend'
import {parseGrade} from '../shared/utils'
import {includeGrade} from '../shared/student-assignment-utils'


import './student-grade-display.css'

interface StudentGradeState {
    asgs: StudentAssignments
    selectedHRs: string[]
    HRs: {[hr:string]:JSX.Element[]}
    sortedKeys: string[]
}

export class StudentGradeSheets extends React.PureComponent<{reportFiles?: ReportFiles}, StudentGradeState> {
    constructor(props){
        super(props)
        this.state = {asgs: {}, selectedHRs:[], sortedKeys:[], HRs: {}}
    }

    componentWillMount(){
        if(this.props.reportFiles){
            const asgs = createAssignmentReports(this.props.reportFiles)
            const sk = Object.keys(asgs).sort((a,b) => asgs[a].homeroom.localeCompare(asgs[b].homeroom))
            const hrs = d3.nest()
                .key(s => asgs[s].homeroom)
                .rollup(rs => rs.map( (r, i) => <StudentClassDisplay student={asgs[r]} key={asgs[r].homeroom + i}/>))
                .object(sk)
            this.setState({
                asgs: asgs,
                HRs: hrs,
                sortedKeys: sk,
            });
        }
    }

    handleClick = (ev: string | string[]) => {
        if(Array.isArray(ev)){
            if(this.state.selectedHRs.length !== Object.keys(this.state.HRs).length){
                this.setState({selectedHRs: Object.keys(this.state.HRs)})
            }else{
                this.setState({selectedHRs: []})
            }
        }else {
            if(this.state.selectedHRs.includes(ev)){
                this.setState({selectedHRs: this.state.selectedHRs.filter(a => a!==ev)})
            } else{
                this.setState({selectedHRs: this.state.selectedHRs.concat([ev])})
            }
        }
    }

    render(){


        return (
            <Container>
                <Row>
                    <Col className='assignments-filter-container'>
                        <MultiSelect
                            items={Object.keys(this.state.HRs)}  
                            selected={this.state.selectedHRs}
                            handleClick={this.handleClick}
                            title={'Homerooms'}/>
                    </Col>
                    <Col className={'assignments-display-container'}>
                        {this.state.selectedHRs.length === 0 ? 
                        Object.keys(this.state.HRs).map(hr => this.state.HRs[hr]) :
                        this.state.selectedHRs.map(hr => this.state.HRs[hr]).flat()}
                    </Col>
                </Row>
            </Container>
            )
    }

    StudentDisplay = (student:Student) => {
        return (
            <div key={student.studentName + student.homeroom} className={`student-assignments`}>
                <StudentClassDisplay student={student}/>
            </div>
        )
    }
        
}

const getOTWord = (ot: number): string => {
    if(ot === 5){
        return ' On Track Score: 5 (On-Track)'
    }
    if(ot === 4){
        return ' On Track Score: 4 (Almost On-Track)'
    }
    if(ot === 3){
        return ' On Track Score: 3 (Near On-Track)'
    }
    if(ot === 2){
        return ' On Track Score: 2 (Far from On-Track)'
    }
    if(ot === 1){
        return ' On Track Score: 1 (Off-Track)'
    }
    return ''
    
}

class StudentClassDisplay extends React.PureComponent<{student: Student}> {

    render(){
        const student = this.props.student
            return(
            <div key={student.studentName + student.homeroom} className={`student-assignments`}>
                <h3>{student.studentName + ', ' + student.homeroom + getOTWord(student.onTrack)}</h3>
                    {Object.keys(student.classes).map(cname => {
                        const fg = student.classes[cname].finalGrade
                        return (
                            <div key={cname} className='category-table'>
                                <h4>{student.classes[cname].teacher + ', ' +cname + ', ' + 
                                    (fg !== undefined ? fg.toFixed(2):'')+ '%'}</h4>
                                {Object.keys(student.classes[cname].categories).map(cat => 
                                    student.classes[cname].categories[cat].assignments.length > 0 ? 
                                    <AssignmentStats 
                                        key={cat} 
                                        assignments={student.classes[cname].categories[cat].assignments}
                                        category={student.classes[cname].categories[cat]}
                                        gradeLogic={student.classes[cname].gradeLoic}/> :
                                    null)}
                            </div>
                        )
                    })}
            </div>
        )   
    }
}

const AssignmentStats: React.SFC<{assignments: StudentAssignment[], category: StudentCategory, gradeLogic: string}> = (props) => {
    const pts = props.gradeLogic === 'Total points' ||  props.gradeLogic === 'Category total points' 

    const header = (
        <tr key='head'>
            <th>Assignment</th>
            <th>Assigned</th>
            <th>Due</th>
            <th>Grade</th>
            {pts ? <th>Max Grade</th>:null}
            <th>% of Overall</th>
            <th>Impact</th>
        </tr>
    )

    const rows: JSX.Element[] = []
    props.assignments.forEach( (asg, i) => {
        const nc = !includeGrade(asg)
        const weight = asg.assignmentWeight
        const impact = asg.impact
        rows.push((
        <tr key={i}>
            <td>{asg.assignmentName}</td>
            <td>{asg.assigned}</td>
            <td>{asg.due}</td>
            <td>{pts ? asg.points: !nc && (parseGrade(asg.points)/asg.pointsPossible * 100).toFixed(2) + '%'}</td>
            {pts  
            ? <td>{asg.pointsPossible}</td> : null}
            <td>{nc || weight === undefined? '' :(weight).toFixed(2) + '%'}</td>
            <td>{nc || impact === undefined? '' :(impact).toFixed(2)+ '%'}</td>
        </tr>))
    })
    rows.push(
        <tr key='total'>
            <td colSpan={3}> Category Average</td>
            <td>{props.category.categoryGrade ? props.category.categoryGrade.toFixed(2) + '%': ''}</td>
            <td colSpan={3}></td>
        </tr>
    )
    
    return (
        <>
            <h5>{props.category.category + ', '+ props.category.weight + '%'}</h5>
            <table className='data-table'>
                <thead>{header}</thead>
                <tbody>{rows}</tbody>
            </table>
        </>
    )
}