import * as React from 'react';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'


import { ReportFiles } from '../shared/report-types'
import { 
    createGradeValidationReport,
    ClassroomValidation,
    ValidationErrors,
    ValidationDetails} from './grade-validation-backend'

import {
    MultiSelect
    } from '../shared/components/multi-select'

interface GradeValidationReportProps{
    reportFiles?: ReportFiles
}
interface GradeValidationReportState{
   gradeValidation: any 
}

export class GradeValidationReport extends React.PureComponent<GradeValidationReportProps, GradeValidationReportState>{
    
    componentWillMount(){
        const validation = this.props.reportFiles ? createGradeValidationReport(this.props.reportFiles): {}
        
        this.setState({
            gradeValidation: validation
        })

        console.log(validation)
    }

    render(){
       
        return (
            <Container>
                <Row>
                    <Col >



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
        <div style={{pageBreakAfter: 'always'}}>
            <h3>{teacherName}</h3>
            {classList.map(c => {
                const total = props.classes[c].details.length
                return (
                 <>
                    <h4>{props.classes[c].details[0]["Course Description"]} {props.classes[c].details[0]["Course Number"]}</h4>
                    <SubmitBeforePrimeErrorSummary total={total} errors={props.classes[c].errors.twoBeforeOne}/>
                    <NoCalculatedGradeErrorSummary total={total} errors={props.classes[c].errors.noCalculatedGrade}/>
                    <NoPostedGradeErrorSummary total={total} errors={props.classes[c].errors.noStepTwo}/>
                    <DifferentGradeErrorSummary total={total} errors={props.classes[c].errors.differentCalculatedFromOneorTwo}/>
                    <NoCalculatedLetterGradeErrorSummary total={total} errors={props.classes[c].errors.noCalculatedLetterGrade}/>
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
            <Table striped bordered size="sm">
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
            <Table striped bordered size="sm">
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
            <Table striped bordered size="sm">
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

const DifferentGradeErrorSummary: React.FunctionComponent<{errors: ValidationDetails[], total: number}> = (props) => {
    if(props.errors.length === 0){
        return (
            <>
            </>
        )
    }

    if(props.errors.length === props.total){
        return (
            <>
                <h5>Different Calculated Grade from Primed or Posted</h5> - Whole Class
            </>
        )
    }

    return (
        <>
            <h5>Different Calculated Grade from Primed or Posted</h5>
            <Table striped bordered size="sm">
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
            <Table striped bordered size="sm">
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

const hasErrors = (c: ClassroomValidation) :boolean => {
    return c.errors.differentCalculatedFromOneorTwo.length > 0 ||
    c.errors.noCalculatedGrade.length > 0 ||
    c.errors.noCalculatedLetterGrade.length > 0 ||
    c.errors.noStepTwo.length > 0 ||
    c.errors.twoBeforeOne.length > 0
}