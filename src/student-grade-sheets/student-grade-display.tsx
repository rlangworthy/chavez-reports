import * as React from 'react'
import {uniq} from 'ramda'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {
    StudentAssignments,
    Category,
    Assignment,} from './student-grade-sheet-backend'
import { ReportFiles } from '../shared/report-types'
import { MultiSelect } from '../shared/components/multi-select'
import { createAssignmentReports } from './student-grade-sheet-backend'

import './student-grade-display.css'


interface StudentGradeState {
    asgs: StudentAssignments
    selectedHRs: string[]
    HRs: string[]
    sortedKeys: string[]
}

export class StudentGradeSheets extends React.PureComponent<{reportFiles?: ReportFiles}, StudentGradeState> {
    constructor(props){
        super(props)
        this.state = {asgs: {}, selectedHRs:[], sortedKeys:[], HRs: []}
    }
    componentWillMount(){
        if(this.props.reportFiles){
            const asgs = createAssignmentReports(this.props.reportFiles)
            const sk = Object.keys(asgs).sort((a,b) => asgs[a].homeroom.localeCompare(asgs[b].homeroom))
            const hrs = uniq(sk.map(k => asgs[k].homeroom))
            this.setState({
                asgs: asgs,
                HRs: hrs,
                sortedKeys: sk
            });
        }
    }

    handleClick = (ev: string | string[]) => {
        if(Array.isArray(ev)){
            if(this.state.selectedHRs.length !== this.state.HRs.length){
                this.setState({selectedHRs: this.state.HRs})
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
                            items={this.state.HRs}
                            selected={this.state.selectedHRs}
                            handleClick={this.handleClick}
                            title={'Homerooms'}/>
                    </Col>
                    <Col className={'assignments-display-container'}>
                        {this.state.asgs && Object.keys(this.state.asgs).sort((a,b) => this.state.asgs[a].homeroom.localeCompare(this.state.asgs[b].homeroom)).map(id => {
                            if(this.state.asgs){
                                const student = this.state.asgs[id]
                                const visibility = this.state.selectedHRs.length===0 ||  this.state.selectedHRs.includes(student.homeroom)
                                return (
                                    <div key={id} className={'student-assignments '.concat(visibility ? '': 'student-assignments-hidden')}>
                                        <h3>{student.studentName + ', ' + student.homeroom}</h3>
                                        {Object.keys(student.classes).map(cname => {
                                            const stats = student.classes[cname][Object.keys(student.classes[cname])[0]].stats
                                            return (
                                                <div key={cname} className='category-table'>
                                                    <h4>{stats.teacherName + ', ' +cname + ', ' + stats.classGrade.toFixed(2)+ '%'}</h4>
                                                    {Object.keys(student.classes[cname]).map(cat => 
                                                        student.classes[cname][cat].assignments.length > 0 ? 
                                                        <AssignmentStats 
                                                            key={cat} 
                                                            assignments={student.classes[cname][cat].assignments}
                                                            category={student.classes[cname][cat].stats}/> :
                                                        null)}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                        }})}
                    </Col>
                </Row>
            </Container>
            )
    }
        
}


const AssignmentStats: React.SFC<{assignments: Assignment[], category: Category}> = (props) => {
    const header = (
        <tr key='head'>
            <th>Assignment</th>
            <th>Assigned</th>
            <th>Due</th>
            <th>Grade</th>
            {props.category.tpl ? <th>Max Grade</th>:null}
            <th>% of Overall</th>
            <th>Impact</th>
        </tr>
    )

    const rows: JSX.Element[] = []
    props.assignments.map( (asg, i) => {
        const nc = asg.points === '' || asg.points === 'Inc'
        rows.push((
        <tr key={i}>
            <td>{asg.assignmentName}</td>
            <td>{asg.assigned}</td>
            <td>{asg.due}</td>
            <td>{asg.points}</td>
            {props.category.tpl ? <td>{asg.pointsPossible}</td> : null}
            <td>{nc ? '' :(asg.assignmentWeight * 100).toFixed(2) + '%'}</td>
            <td>{nc ? '' :(asg.impact).toFixed(2)+ '%'}</td>
        </tr>))
    })
    rows.push(
        <tr key='total'>
            <td colSpan={3}> Category Average</td>
            <td>{props.category.categoryAverage.toFixed(2)}</td>
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