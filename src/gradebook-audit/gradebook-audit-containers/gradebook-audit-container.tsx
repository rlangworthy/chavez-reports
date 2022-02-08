import * as React from 'react';
import * as JSZip from 'jszip';
import {partition} from 'ramda';
import {jsPDF} from 'jspdf';
import {saveAs} from 'file-saver';
import html2canvas from 'html2canvas';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from 'react-bootstrap/Modal'

import {del} from 'idb-keyval'
import { ReportFiles } from '../../shared/report-types'
import { 
    createESGradebookReports} from '../gradebook-audit-backend'
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
    GradesByAssignmentRender,
    AdminOverviewSheet} from '../gradebook-audit-displays'
import {
    MultiSelect
    } from '../../shared/components/multi-select'

import './gradebook-audit-report.css'
import { Button, ModalBody } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';

interface GradebookAuditReportProps{
    reportFiles?: ReportFiles
}
interface GradebookAuditReportState{
    selectedTeachers: string[]
    teacherClasses: TeacherClasses
    teachers: string[]
    sped: boolean
    downloading: boolean
    dlProgress: number
}

export class GradebookAuditReport extends React.PureComponent<GradebookAuditReportProps, GradebookAuditReportState>{
    
    componentWillMount(){
        const teacherClasses = this.props.reportFiles ? createGradebookReports(this.props.reportFiles): {}
        const selectedTeachers = Object.keys(teacherClasses)
        this.setState({
            dlProgress:0,
            downloading:false,
            selectedTeachers:[],
            teacherClasses: teacherClasses,
            teachers: selectedTeachers,
            sped: (this.props.reportFiles && 
            this.props.reportFiles.reportTitle.optionalFiles && 
            this.props.reportFiles.reportFiles[this.props.reportFiles.reportTitle.optionalFiles[0].fileDesc] ? true:false)
        })
    }

    generatePDFReports() {
        console.log(this.state)
        var zip = new JSZip.default();
        const teachers = this.state.selectedTeachers.length === 0 ? this.state.teachers : this.state.selectedTeachers
        //Array of promises 
        const tasks = teachers.map((t) => {
            return async () => {
                const htmlReport = document.getElementById(t) as HTMLElement
                return html2canvas(htmlReport, {windowWidth: 1600}).then(canvas => {
                    var imgData = canvas.toDataURL('image/png');
                    var imgWidth = 210; 
                    var pageHeight = 295;  
                    var imgHeight = canvas.height * imgWidth / canvas.width;
                    var heightLeft = imgHeight;
                    var doc = new jsPDF('p', 'mm', 'a4', true);
                    var position = 0;

                    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight,'','FAST');
                    heightLeft -= pageHeight;
                    
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        doc.addPage();
                        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight,'','FAST');
                        heightLeft -= pageHeight;
                    }
                    
                    zip.file(t+'.pdf', doc.output('blob'));
                    this.setState({dlProgress: this.state.dlProgress+1})
                })
            }
        })
        
        const callTasks = () => {
            return tasks.reduce((prev, task) => {
                return prev
                    .then(task)
                    .catch(err => {
                    console.warn('err', err.message);
                    });
            }, Promise.resolve());
          };
        
        callTasks()
            .then(()=>{
                //Wait for renders, download zip of PDF's
                console.log('Done Rendering')
                zip.generateAsync({type:"blob"}).then(blob => {
                    saveAs(blob, "GradebookAudits.zip");
                })
                //Close Modal
                this.setState({downloading:false})}
            )
    }


    
    render(){
        window.addEventListener('beforeunload', () => {del('Gradebook Audit Report')});
        //expects sorted teachers
        const teachers = this.state.selectedTeachers.length === 0 ? this.state.teachers : this.state.selectedTeachers
        const teacherClasses = this.state.teacherClasses
        return (
            <React.Fragment>
                <Modal
                show={this.state.downloading}
                onEntered={() => {this.generatePDFReports()}}
                onExited={() => {this.setState({dlProgress: 0})}}
                >
                    <ModalHeader>Working...</ModalHeader>
                    <ModalBody>
                        Formatting {this.state.dlProgress}/{this.state.selectedTeachers.length === 0 ? this.state.teachers.length : this.state.selectedTeachers.length}
                    </ModalBody>
                </Modal>
                <Container>
                    <Row>
                        <Col className='gpa-filter-container'>
                            <Button  
                            className='individual-report-button'
                            onClick={()=>{this.setState({downloading: true})}}>Generate Individual Report PDF's</Button>
                            <MultiSelect
                                items={this.state.teachers}
                                selected={this.state.selectedTeachers}
                                title='Teachers'
                                handleClick={this.handleTeacherClick}
                            />
                        </Col>
                        <Col className='gpa-display-container'>
                            <AdminOverviewSheet teacherClasses={this.state.teacherClasses}/>
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
                                        return teacherClasses[tKey][cn].hasGrades}, Object.keys(teacherClasses[tKey]))
                                    //hasAsgn list of classes with assignments
                                    const hasAsgn: string[] = Object.keys(teacherClasses[tKey]).filter( cn => {
                                        return teacherClasses[tKey][cn].hasAsgn
                                    })

                                    return (
                                        <div key={tKey} className='gradebook-audit-report' id={tKey}>
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
                                                hasGrades={hasGrades}
                                                hasSped={this.state.sped}/>
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
            </React.Fragment>
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
    return createESGradebookReports(reportFiles)

}