import * as React from 'react'
import {uniq} from 'ramda'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import {
    List, 
    AutoSizer, 
    CellMeasurerCache, 
    CellMeasurer, 
    Grid }from 'react-virtualized'

import {
    StudentAssignments,
    StudentCategory,
    StudentAssignment,
    Student} from '../shared/student-assignment-interfaces'
import { ReportFiles } from '../shared/report-types'
import { MultiSelect } from '../shared/components/multi-select'
import { createAssignmentReports } from './student-grade-sheet-backend'
import {parseGrade} from '../shared/utils'


import './student-grade-display.css'

interface StudentGradeState {
    asgs: StudentAssignments
    selectedHRs: string[]
    HRs: string[]
    sortedKeys: string[]
    cache: CellMeasurerCache
    sortedStudents: JSX.Element[]
}

export class StudentGradeSheets extends React.PureComponent<{reportFiles?: ReportFiles}, StudentGradeState> {
    constructor(props){
        super(props)
        const cache = new CellMeasurerCache({
            fixedWidth: true,
            defaultHeight: 100
        })
        this.state = {asgs: {}, selectedHRs:[], sortedKeys:[], HRs: [], cache: cache, sortedStudents: []}
    }

    componentWillMount(){
        if(this.props.reportFiles){
            const asgs = createAssignmentReports(this.props.reportFiles)
            const sk = Object.keys(asgs).sort((a,b) => asgs[a].homeroom.localeCompare(asgs[b].homeroom))
            const hrs = uniq(sk.map(k => asgs[k].homeroom))
            const ss = sk.map( id => <StudentClassDisplay student={asgs[id]}/>)
            this.setState({
                asgs: asgs,
                HRs: hrs,
                sortedKeys: sk,
                sortedStudents: ss
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
                        <AutoSizer>
                        {({ height, width }) => (
                            <List
                                deferredMeasurementCache={this.state.cache}
                                height={height}
                                rowCount={this.state.sortedKeys.length}
                                rowHeight={20}
                                rowRenderer={this.Student}
                                width={width}
                                overscanRowCount={10}
                            />
                        )}
                        </AutoSizer>
                    </Col>
                </Row>
            </Container>
            )
    }

    StudentDisplay = React.memo((props:{id:string}) => {
        const student = this.state.asgs[Object.keys(this.state.asgs)[props.id]]
        const visibility = this.state.selectedHRs.length===0 ||  this.state.selectedHRs.includes(student.homeroom)
        return (
            <div key={props.id} className={`student-assignments ${visibility ? '': 'student-assignments-hidden'}`}>
                <StudentClassDisplay student={student}/>
            </div>
        )
    })

    Student:React.FunctionComponent<{index:number, parent: Grid, key: string, style: any}> = (props) => {
        //const id = Object.keys(this.state.asgs)[props.index]
        //const student = this.state.asgs[id]
        return (
            <CellMeasurer
                cache={this.state.cache}
                columnIndex={0}
                parent={props.parent}
                rowIndex={props.index}>
                <div key={props.index} className={`student-assignments`}>
                    {this.state.sortedStudents[props.index]}
                </div>
            </CellMeasurer>
        )
    }
        
}

class StudentClassDisplay extends React.PureComponent<{student: Student}> {

    render(){
        const student = this.props.student
            return(
            <>
                <h3>{student.studentName + ', ' + student.homeroom}</h3>
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
            </>
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
        const nc = asg.points === '' || asg.points === 'Inc'
        const weight = asg.assignmentWeight
        const impact = asg.impact
        rows.push((
        <tr key={i}>
            <td>{asg.assignmentName}</td>
            <td>{asg.assigned}</td>
            <td>{asg.due}</td>
            <td>{pts ? asg.points: (parseGrade(asg.points)/asg.pointsPossible * 100).toFixed(2) + '%'}</td>
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