import * as React from 'react';
import {partition} from 'ramda';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import {del} from 'idb-keyval'
import { ReportFiles } from '../../shared/report-types'
import { 
    createESGradebookReports,
    getAssignmentImpacts } from '../gradebook-audit-backend'
import { 
    createHSGradebookReports, } from '../hs-gradebook-audit-backend'
import {
    GradeLogic,
    AssignmentImpact,
    TeacherGradeDistributions,
    TeacherClassCategories,
    Teacher,
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
    distributions: TeacherGradeDistributions
    categories: TeacherClassCategories
    teachers: string[]
    
}

export class GradebookAuditReport extends React.PureComponent<GradebookAuditReportProps, GradebookAuditReportState>{
    
    componentWillMount(){
        const {distributions, categories, teachers} = this.props.reportFiles ? createGradebookReports(this.props.reportFiles): {distributions:{}, categories:{}, teachers:[]}
        const selectedTeachers = teachers.map(teacher => teacher.firstName + ' ' + teacher.lastName)
        this.setState({
            selectedTeachers:[],
            distributions: distributions,
            categories:categories,
            teachers: selectedTeachers
        })
    }

    render(){
        window.addEventListener('beforeunload', () => {del('Gradebook Audit Report')});
        //expects sorted teachers
        const distributions = this.state.distributions
        const categories = this.state.categories
        const teachers = this.state.selectedTeachers.length === 0 ? this.state.teachers : this.state.selectedTeachers

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
                            if(distributions[tKey] && categories[tKey]){
                                const [hasGrades, noGrades]: string[][] = partition( (cn: string) => {
                                    const gd = distributions[tKey][cn]
                                    return (gd.A > 0 || 
                                            gd.B > 0 || 
                                            gd.C > 0 || 
                                            gd.D > 0 ||
                                            gd.F > 0)}, Object.keys(distributions[tKey]))
                                
                                const hasAsgn: string[] = Object.keys(categories[tKey]).filter( cn => {
                                    return Object.keys(categories[tKey][cn]).some( cat => categories[tKey][cn][cat].assignments.length > 0)
                                })
                                const classes:{[className: string]: {
                                    tpl: GradeLogic
                                    assignments : {[category:string]:AssignmentImpact[]} //sorted list of assignments
                                    }
                                } = {}
                                const classAsgs:{[className: string]: {
                                    tpl: GradeLogic
                                    assignments : AssignmentImpact[] //sorted list of assignments
                                    }
                                } = {}

                                hasAsgn.forEach( cName => { 
                                    classes[cName] = {tpl: categories[tKey][cName][Object.keys(categories[tKey][cName])[0]].TPL as GradeLogic, assignments: getAssignmentImpacts(categories[tKey][cName])}
                                    classAsgs[cName] = {
                                        tpl: classes[cName].tpl, 
                                        assignments: Object.keys(classes[cName].assignments)
                                            .reduce( (a:AssignmentImpact[],b) => a.concat(classes[cName].assignments[b]),[])
                                            .sort((a,b) => b.impact - a.impact)}
                                })

                                return (
                                    <div key={tKey} className='gradebook-audit-report'>
                                        <h1>{tKey}</h1>
                                        <GradeDistributionDisplay 
                                            classes={distributions[tKey]}
                                            hasGrades={hasGrades}
                                            noGrades={noGrades}/>
                                        <CategoryTableRender 
                                            classes={categories[tKey]}
                                            hasGrades={hasAsgn}/>
                                        <FailingGradesRender 
                                            classes={distributions[tKey]}
                                            hasGrades={hasGrades}/>
                                        <HighImpactAssignmentsRender 
                                            classes={classAsgs}
                                            hasGrades={hasAsgn}/>
                                        <GradesByAssignmentRender
                                            classes={classes}
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

const createGradebookReports = (reportFiles: ReportFiles) => {
    if(reportFiles.reportTitle.title === 'HS Gradebook Audit Report'){
        return createHSGradebookReports(reportFiles)
    }else{
        return createESGradebookReports(reportFiles)
    }

}