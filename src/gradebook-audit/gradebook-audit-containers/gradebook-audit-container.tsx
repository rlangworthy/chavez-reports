import * as React from 'react';
import {partition} from 'ramda';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {del} from 'idb-keyval'
import { ReportFiles } from '../../shared/report-types'
import { 
    createESGradebookReports} from '../gradebook-audit-backend'
import { 
    createHSGradebookReports, } from '../hs-gradebook-audit-backend'
import {
    GradeLogic,
    AssignmentImpact,
    TeacherClasses,
    } from '../gradebook-audit-interfaces'
import {
    GradeDistributionDisplay,
    CategoryTableRender,
    FailingGradesRender,
    HighImpactAssignmentsRender,
    GradesByAssignmentRender,} from '../gradebook-audit-displays'
import {
    MultiSelect
    } from '../../shared/components/multi-select'

import './gradebook-audit-report.css'

interface GradebookAuditReportProps{
    reportFiles?: ReportFiles
}
interface GradebookAuditReportState{
    selectedTeachers: string[]
    teacherClasses: TeacherClasses
    teachers: string[]
    
}

export class GradebookAuditReport extends React.PureComponent<GradebookAuditReportProps, GradebookAuditReportState>{
    
    componentWillMount(){
        const teacherClasses = this.props.reportFiles ? createGradebookReports(this.props.reportFiles): {}
        const selectedTeachers = Object.keys(teacherClasses)
        this.setState({
            selectedTeachers:[],
            teacherClasses: teacherClasses,
            teachers: selectedTeachers
        })
    }

    render(){
        window.addEventListener('beforeunload', () => {del('Gradebook Audit Report')});
        //expects sorted teachers
        const teachers = this.state.selectedTeachers.length === 0 ? this.state.teachers : this.state.selectedTeachers
        const teacherClasses = this.state.teacherClasses
        return (
            <Container>
                <Row>
                    <Col className='gpa-filter-container'>
                        <MultiSelect
                            items={this.state.teachers}
                            selected={this.state.selectedTeachers}
                            title='Teachers'
                            handleClick={this.handleTeacherClick}
                        />
                    </Col>
                    <Col className='gpa-display-container'>
                        <React.Fragment>
                        {teachers.map( teacher => {
                            const tKey: string = teacher
                            if(teacherClasses[tKey]){
                                //hasGrades and noGrades are names of classes
                                const [hasGrades, noGrades]: string[][] = partition( (cn: string) => {
                                    if(teacherClasses[tKey][cn].distribution === undefined){
                                        console.log(teacherClasses[tKey])
                                        console.log(cn)
                                    }
                                    const gd = teacherClasses[tKey][cn].distribution
                                    return (gd.A > 0 || 
                                            gd.B > 0 || 
                                            gd.C > 0 || 
                                            gd.D > 0 ||
                                            gd.F > 0)}, Object.keys(teacherClasses[tKey]))
                                //hasAsgn list of classes with assignments
                                const hasAsgn: string[] = Object.keys(teacherClasses[tKey]).filter( cn => {
                                    return Object.keys(teacherClasses[tKey][cn].categories).some( cat => teacherClasses[tKey][cn].categories[cat].assignments.length > 0)
                                })

                                return (
                                    <div key={tKey} className='gradebook-audit-report'>
                                        <h1>{tKey}</h1>
                                        <GradeDistributionDisplay 
                                            classes={teacherClasses[tKey]}
                                            hasGrades={hasGrades}
                                            noGrades={noGrades}/>
                                        <CategoryTableRender 
                                            classes={teacherClasses[tKey]}
                                            hasGrades={hasAsgn}/>
                                        <FailingGradesRender 
                                            classes={teacherClasses[tKey]}
                                            hasGrades={hasGrades}/>
                                        <HighImpactAssignmentsRender 
                                            classes={teacherClasses[tKey]}
                                            hasGrades={hasGrades}/>
                                        <GradesByAssignmentRender
                                            classes={teacherClasses[tKey]}
                                            hasAsign={hasAsgn}/>
                                    </div>
                                )
                            }else{return null}
                        })}
                        </React.Fragment>
                    </Col>
                </Row>
            </Container>
        )
    }

    handleTeacherClick = (staff: string[] | string): void => {
        const selected=this.state.selectedTeachers;
        if(Array.isArray(staff)){
            if(staff.every(s => selected.includes(s))){
                this.setState({selectedTeachers: selected.filter(f=> !staff.includes(f))})
            }else{
                const newSelected = selected.concat(staff.filter(s=> !selected.includes(s)))
                this.setState({selectedTeachers:newSelected})
            }
        }else{
            selected.includes(staff) ? 
                this.setState({selectedTeachers: selected.filter(f => f!==staff)}):
                this.setState({selectedTeachers: selected.concat([staff])})
        }
    }
}

const createGradebookReports = (reportFiles: ReportFiles):TeacherClasses => {
    if(reportFiles.reportTitle.title === 'HS Gradebook Audit Report'){
        return createHSGradebookReports(reportFiles)
    }else{
        return createESGradebookReports(reportFiles)
    }

}