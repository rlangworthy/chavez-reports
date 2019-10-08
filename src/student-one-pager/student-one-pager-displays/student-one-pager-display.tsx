import * as React from 'react'
import Table from 'react-bootstrap/Table'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {del} from 'idb-keyval'
import { ReportFiles } from '../../shared/report-types'
import { createStudentOnePagers } from '../student-one-pager-backend'
import { isCoreClass } from '../../shared/utils'
import { getHighImpactStudentAssignments } from '../../shared/student-assignment-utils'
import './student-one-pager-display.css'

interface StudentOnePagerProps{
    reportFiles?: ReportFiles
}

export const StudentOnePagers: React.SFC<StudentOnePagerProps> = props => {
    window.addEventListener('beforeunload', () => {del('Student One Pager')});
    const students = props.reportFiles? createStudentOnePagers(props.reportFiles) : [];
    return (
       <React.Fragment>
           {students.map( student => {
                const assignments = student.assignments;
                return (
                    <div key={student.ID}>
                        <div className='page'>
                            <div style={{fontSize: '1.5em'}}>
                                <h1>{student.name}</h1>
                                <h3>{student.homeRoom}</h3>
                                <Table>
                                    <tbody>
                                        <tr>
                                            <td>Do you have an IEP?</td>
                                            <td>{student.IEP === ''?'unknown':student.IEP}</td>
                                        </tr>
                                        <tr>
                                            <td>Are you an English Learner Student?</td>
                                            <td>{student.ELL===''?'unknown':student.ELL}</td>
                                        </tr>
                                        <tr>
                                            <td>Your address</td>
                                            <td>{student.address}</td>
                                        </tr>
                                        <tr>
                                            <td>You attendance percentage</td>
                                            <td>{Math.floor(student.attendance)}</td>
                                        </tr>
                                        <tr>
                                            <td>NWEA Math</td>
                                            <td>{student.NWEAMath < 0 ? 'unknown':student.NWEAMath}</td>
                                        </tr>
                                        <tr>
                                            <td>NWEA Reading</td>
                                            <td>{student.NWEAReading < 0 ? 'unknown':student.NWEAReading}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                <div style={{height: '2em'}}></div>
                                <h2>Grades</h2>
                                <Container>
                                    <Row>
                                        <Col md={8}>
                                            <Table>
                                                <thead>
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Quarter Grade</th>
                                                        <th>Final Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Math</td>
                                                        <td>{getLetterGrade(student.quarterMathGrade)}</td>
                                                        <td>{getLetterGrade(student.finalMathGrade)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Reading</td>
                                                        <td>{getLetterGrade(student.quarterReadingGrade)}</td>
                                                        <td>{getLetterGrade(student.finalReadingGrade)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Science</td>
                                                        <td>{getLetterGrade(student.quarterScienceGrade)}</td>
                                                        <td>{getLetterGrade(student.finalScienceGrade)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Social Science</td>
                                                        <td>{getLetterGrade(student.quarterSocialScienceGrade)}</td>
                                                        <td>{getLetterGrade(student.finalSocialScienceGrade)}</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                        </Col>
                                        <Col md={4}></Col>
                                    </Row>
                                    <Row>
                                        <Col>Your Overall GPA is: {student.GPA.toFixed(1)}</Col>
                                    </Row>
                                    <Row></Row>
                                    <Row>
                                        <Col>Your Chavez On-Track Score is: {student.onTrack}</Col>
                                    </Row>
                                    <Row>
                                        <Col>Use this information at chavez-hs-planner.com to make a plan for getting into high school.</Col>
                                    </Row>
                                </Container>
                            </div>
                        </div>
                        
                        <div className='page'>
                            <h2>Highest Impact Assignments</h2>
                            <Table size="sm">
                            {Object.keys(assignments).map( (className,i) => {
                                if(isCoreClass(className)){
                                    return (
                                        <React.Fragment key={i}>
                                            <tbody>
                                                <tr>
                                                    <th colSpan={2}>{className + ', ' + assignments[className].teacher}</th>
                                                    <th>Score</th>
                                                    <th>Impact</th>
                                                </tr>
                                                {getHighImpactStudentAssignments(assignments[className])
                                                    .slice(0,5)
                                                    .map( (asg, j) => {
                                                    return (<tr key={j}>
                                                                <td colSpan={2}>{asg.assignmentName}</td>
                                                                <td>{asg.points}</td>
                                                                <td>{(asg.impact !== undefined ? asg.impact.toFixed(2):'n/a') + '%'}</td>
                                                            </tr>)})}
                                            </tbody>
                                        </React.Fragment>
                                )}else{return null}
                            })}
                            </Table>        
                        </div>
                    </div>
                )
           })}
       </React.Fragment>
    )
} 

const getLetterGrade = (g: number):string => {
    
    if(g > 89){return 'A';}
    if(g > 79){return 'B';}
    if(g > 69){return 'C';}
    if(g > 59){return 'D';}
    if(g >= 0){return 'F';}
    return 'unknown';
}