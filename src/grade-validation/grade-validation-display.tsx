import * as React from 'react';
import * as d3 from 'd3-collection'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'

import { letterGradeToNorm } from '../shared/utils'

import { ReportFiles } from '../shared/report-types'
import { 
    createGradeValidationReport,
    ClassroomValidation,
    ValidationErrors,
    ValidationDetails,
    OverallSummary} from './grade-validation-backend'

import {
    MultiSelect
    } from '../shared/components/multi-select'

import './grade-validation.css'

interface GradeValidationReportProps{
    reportFiles?: ReportFiles
}
interface GradeValidationReportState{
   gradeValidation: any,
   summary: OverallSummary,
}

export class GradeValidationReport extends React.PureComponent<GradeValidationReportProps, GradeValidationReportState>{
    
    componentWillMount(){
        const validation = this.props.reportFiles ? createGradeValidationReport(this.props.reportFiles): {}
        
        this.setState({
            gradeValidation: validation.classroomValidations,
            summary: validation.summary
        })

        console.log(validation)
    }

    render(){
       
        return (
            <Container>
                <Row>
                    <Col >
                        <div style={{pageBreakAfter: 'always'}}>
                            <h3>Summary of Gradebook Adjustments</h3>
                            {Object.keys(this.state.summary).filter(k => k !=='undefined').map(gl => {
                                return (
                                    <div key={gl}>
                                        <h4>Grade Level: {gl}</h4>
                                        <h5>Core Classes</h5>
                                        <Table className='validation-table' striped bordered size="sm">
                                            <thead>
                                                <tr>
                                                    <td>Class Name</td><td>Calculated GPA</td><td>Posted GPA</td><td>% Teacher Override</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(this.state.summary[gl].coreClasses).map(cn => {
                                                    return(
                                                        <tr key={gl + cn}>
                                                            <td>{cn}</td>
                                                            <td>{this.state.summary[gl].coreClasses[cn].calculatedGPA.toFixed(2)}</td>
                                                            <td>{this.state.summary[gl].coreClasses[cn].postedGPA.toFixed(2)}</td>
                                                            <td>{(this.state.summary[gl].coreClasses[cn].adjustments * 100).toFixed(2)}%</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </Table>
                                        <h5>Non-Core Classes</h5>
                                        <Table className='validation-table' striped bordered size="sm">
                                            <thead>
                                                <tr>
                                                    <td>Calculated GPA</td><td>Posted GPA</td><td>% Teacher Override</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>{this.state.summary[gl].nonCoreClasses.calculatedGPA.toFixed(2)}</td>
                                                    <td>{this.state.summary[gl].nonCoreClasses.postedGPA.toFixed(2)}</td>
                                                    <td>{(this.state.summary[gl].nonCoreClasses.adjustments * 100).toFixed(2)}%</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                )
                            })}
                        </div>
                        {Object.keys(this.state.gradeValidation).map(teacher => {return (<TeacherValidationSummary classes={this.state.gradeValidation[teacher]}/>)})}
                    </Col>
                </Row>
            </Container>
        )
    }
}


const TeacherValidationSummary: React.FunctionComponent<{classes: {[className:string]: ClassroomValidation}}> = (props) => {
    const classList = Object.keys(props.classes).filter(cn => hasErrors(props.classes[cn]))
    if(classList.length === 0){
        return (
            <>
            </>
        )
    }
    const teacherName = props.classes[classList[0]].details[0]["Teacher Name"]
    return (
        <div style={{pageBreakAfter: 'always', marginBottom: '40px'}}>
            <h3>{teacherName}</h3>
            <h4>
                Gradebook Validation Error Guide
            </h4>
            <h5>No Calculated Grades</h5>
            <p>
                This error can have several causes: a lack of grading scale, a lack of graded assignments, or assignments being set to private.
                If a whole classroom has this error the likely cause is a lack of a grading scale or assignments being set to private by default.  If inididual students have this error then it is likely that that student has no graded assignments. 
            </p>
            <h5>No Posted Grade</h5>
            <p>
                This indicates that the teacher has updated their post column, but not posted those grades to transcript.
            </p>
            <h5>Grade Posted before being Primed</h5>
            <p>
                This error results when the Post Column in a teacher's gradebook has been updated after the Transcript Column.  This means a grade was posted to the transcript, but then another grade was primed afterwords.
            </p>
            <h5>Posted Grade Different from Calculated</h5>
            <p>
                This usually indicates a teacher override for the indicated grade.  This typicall isn't a problem but it is difficult information to find elsewhere, so is presented here.
            </p>
            {classList.map(c => {
                const total = props.classes[c].details.length
                return (
                 <>
                    <h4>{props.classes[c].details[0]["Course Description"]} {props.classes[c].details[0]["Course Number"]}</h4>
                    <NoCalculatedGradeErrorSummary total={total} errors={props.classes[c].errors.noCalculatedGrade}/>
                    <NoPostedGradeErrorSummary total={total} errors={props.classes[c].errors.noStepTwo}/>
                    <SubmitBeforePrimeErrorSummary total={total} errors={props.classes[c].errors.twoBeforeOne}/>
                    <DifferentGradeErrorSummary total={total} errors={props.classes[c].errors.differentCalculatedFromOneorTwo}/>
                 </>   
                )
            })}
            <br/>
        </div>
    )
}


const SubmitBeforePrimeErrorSummary: React.FunctionComponent<{errors: ValidationDetails[], total: number}> = (props) => {
    
    if(props.errors.length === 0){
        return (
            <>
            </>
        )
    }

    if(props.errors.length === props.total){
        return (
            <>
                <h5>Step 2 Before Step 1</h5> - Whole Class
            </>
        )
    }

    return (
        <>
            <h5>Step 2 Before Step 1</h5>
            <Table className='validation-table' striped bordered size="sm">
                <thead>
                <th>
                    <td>Student Name</td>
                </th>
                </thead>
                <tbody>
                {props.errors.map(st => {
                    return (
                    <tr key={st["Student ID"]}><td>{st["Student Name"]}</td></tr>
                    )
                })}
                </tbody>
            </Table>
        </>
    )
}

const NoCalculatedGradeErrorSummary: React.FunctionComponent<{errors: ValidationDetails[], total: number}> = (props) => {
    if(props.errors.length === 0){
        return (
            <>
            </>
        )
    }

    if(props.errors.length === props.total){
        return (
            <>
                <h5>No Calculated Grade</h5> - Whole Class
            </>
        )
    }

    return (
        <>
            <h5>No Calculated Grade</h5>
            <Table className='validation-table' striped bordered size="sm">
                <thead>
                <th>
                    <td>Student Name</td>
                </th>
                </thead>
                <tbody>
                {props.errors.map(st => {
                    return (
                    <tr key={st["Student ID"]}><td>{st["Student Name"]}</td></tr>
                    )
                })}
                </tbody>
            </Table>
        </>
    )
}

const NoPostedGradeErrorSummary: React.FunctionComponent<{errors: ValidationDetails[], total: number}> = (props) => {
    if(props.errors.length === 0){
        return (
            <>
            </>
        )
    }

    if(props.errors.length === props.total){
        return (
            <>
                <h5>No Posted Grade</h5> - Whole Class
            </>
        )
    }

    return (
        <>
            <h5>No Calculated Grades</h5>
            <Table className='validation-table' striped bordered size="sm">
                <thead>
                <th>
                    <td>Student Name</td>
                </th>
                </thead>
                <tbody>
                {props.errors.map(st => {
                    return (
                    <tr key={st["Student ID"]}><td>{st["Student Name"]}</td></tr>
                    )
                })}
                </tbody>
            </Table>
        </>
    )
} 

const DifferentGradeErrorSummaryGraphic: React.FunctionComponent<{errors: ValidationDetails[]}> = (props) => {
    const changedGrades = d3.nest<ValidationDetails>()
                            .key(r => r['Calculated Letter Grade'])
                            .key(r => r['Transcript Mark'])
                            .rollup(rs => rs.length)
                            .object(props.errors)

    const gpaChange = props.errors.reduce((a,b) => a + letterGradeToNorm(b['Transcript Mark']), 0)-props.errors.reduce((a,b) => a + letterGradeToNorm(b['Calculated Letter Grade'] ? b['Calculated Letter Grade'] : ''), 0)
    console.log()
    return (
        <div>
            <Table className='validation-table'  striped bordered size="sm">
                <thead>
                    <tr>
                        <td>Post Column Mark</td><td>Transcript Mark</td><td>Count</td>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(changedGrades).sort().map(pc => {
                        return Object.keys(changedGrades[pc]).map(tm => {
                            return (
                            <tr key={pc + tm}>
                                <td>{pc}</td><td>{tm}</td><td>{changedGrades[pc][tm]}</td>
                            </tr>)
                        })
                    })}
                </tbody>
            </Table>
            Overall GPA Change : {gpaChange}
        </div>
    )
}

const DifferentGradeErrorSummary: React.FunctionComponent<{errors: ValidationDetails[], total: number}> = (props) => {
    if(props.errors.length === 0){
        return (
            <>
            </>
        )
    }

    return (
        <>
            <h5>Different Calculated Grade from Primed or Posted</h5>
            <Table className='validation-table' striped bordered size="sm">
                <thead>
                <tr>
                    <td>Student Name</td>
                    <td>Calculated Grade</td>
                    <td>Post Column Grade</td>
                    <td>Transcript Grade</td>
                </tr>
                </thead>
                <tbody>
                {props.errors.map(st => {
                    return (
                    <tr key={st["Student ID"]}>
                        <td>{st["Student Name"]}</td>
                        <td>{st["Calculated Letter Grade"]}</td>
                        <td>{st["Post Column Mark"]}</td>
                        <td>{st["Transcript Mark"]}</td>
                    </tr>
                    )
                })}
                </tbody>
            </Table>
            <DifferentGradeErrorSummaryGraphic errors={props.errors}/>
        </>
    )
}

const NoCalculatedLetterGradeErrorSummary: React.FunctionComponent<{errors: ValidationDetails[], total: number}> = (props) => {
    if(props.errors.length === 0){
        return (
            <>
            </>
        )
    }

    if(props.errors.length === props.total){
        return (
            <>
                <h5>No Calculated Letter Grade</h5> - Whole Class
            </>
        )
    }

    return (
        <>
            <h5>No Calculated Letter Grade</h5>
            <Table className='validation-table' striped bordered size="sm">
                <thead>
                <th>
                    <td>Student Name</td>
                </th>
                </thead>
                <tbody>
                {props.errors.map(st => {
                    return (
                    <tr key={st["Student ID"]}><td>{st["Student Name"]}</td></tr>
                    )
                })}
                </tbody>
            </Table>
        </>
    )
}

const OverallGPAChangeSummary: React.FunctionComponent<{errors: ValidationDetails[]}> = (props) => {
    return (
        <>
        </>
    )
}

const hasErrors = (c: ClassroomValidation) :boolean => {
    return c.errors.differentCalculatedFromOneorTwo.length > 0 ||
    c.errors.noCalculatedGrade.length > 0 ||
    c.errors.noCalculatedLetterGrade.length > 0 ||
    c.errors.noStepTwo.length > 0 ||
    c.errors.twoBeforeOne.length > 0
}