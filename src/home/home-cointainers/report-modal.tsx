import * as React from 'react'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ToggleButton from 'react-bootstrap/ToggleButton'
import { 
    ReportTitle,
    ReportFiles, } from '../../shared/report-types'
import { 
    FileList,} from '../../shared/file-types'
import {
    getCurrentQuarter,
    } from '../../shared/utils'
import {SY_CURRENT} from '../../shared/initial-school-dates'


import {
    FileInputs
    } from '../home-displays/file-inputs'

import './report-modal.css'
import { reportTag } from '../../shared/gtag'
import { School } from '../../data-handling/data-interfaces'
import { SymbolDisplayPartKind } from 'typescript'

interface ReportModalProps {
    report: ReportTitle
    fileList: FileList
    show: boolean
    handleHide: () => any
    addFile: (fileType: string, file: File, selectedQuarter?: string) => Promise<void>
    tag: () => void
    school: School
}

interface ReportModalState {
    selectedValues: {[fileDesc: string]: string}
    selectedQuarter: string
    isLoading: boolean
    useSchool: boolean
}
export class ReportModal extends React.Component<ReportModalProps, ReportModalState> {
    //The file form is the workhorse of this app.  It displays existing files and allows new ones to be uploaded    
    constructor(props: ReportModalProps){
        super(props);
        var selected = {}
        //fileList keyed on type of file, selected files keyed on this reports descriptions
        this.props.report.files.forEach( f => {
            const list = this.props.fileList[f.fileType];
            selected[f.fileDesc] = list.length > 0 ? list[list.length-1].fileName :'Upload New File';
        })
        /* eslint-disable */
        this.props.report.optionalFiles ? this.props.report.optionalFiles.map( f => {
            const list = this.props.fileList[f.fileType];
            selected[f.fileDesc] = list.length > 0 ? list[list.length-1].fileName :'Upload New File';
        }) : null
        
        //NOTE right now only enables on Gradebook Audit, as new reports use the data suite can add them here
        const useSchool = Object.keys(this.props.school.students).length > 0 && this.props.report.title === 'Gradebook Audit Report'
        /* eslint-enable */
        if(this.props.report.optionalFiles){
            this.state={selectedValues:selected, isLoading: false, selectedQuarter: 'Quarter ' + getCurrentQuarter(SY_CURRENT), useSchool:useSchool}
        }else{
            this.state={selectedValues:selected, isLoading: false, selectedQuarter: 'Quarter ' + getCurrentQuarter(SY_CURRENT), useSchool:useSchool}
        }

    }
    private title = this.props.report.title;
    private fileTypes = this.props.report.optionalFiles ? 
        this.props.report.files.concat(this.props.report.optionalFiles) : 
        this.props.report.files
    private fileRefs: {[type: string]: HTMLInputElement | null} ={};

    private handleHide = () => {
        const selected = {}
        Object.keys(this.state.selectedValues).forEach( key => {
            selected[key] = 'Upload New File';
        });
        this.setState({selectedValues: selected});
        this.props.handleHide();
    }

    private handleChange = (ev: React.ChangeEvent<HTMLSelectElement>, d: string): void =>{
        ev.preventDefault();
        var selected = this.state.selectedValues;
        selected[d] = ev.target.value;
        //update upload button 
        const uploadElement = document.getElementById(`${this.title + d}-file-input`) as HTMLInputElement;
        if(ev.target.value === 'Upload New File'){
            uploadElement.style.visibility='visible'
        }else{
            uploadElement.style.visibility='hidden'}
        //update selected item
        this.setState({selectedValues: selected});
    }

    private handleSchoolToggleChange = (ev: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({useSchool: ev.target.checked})
    }

    private handleQuarterChange = (ev: React.ChangeEvent<HTMLSelectElement>): void => {
        ev.preventDefault();
        this.setState({selectedQuarter: ev.target.value}) //.split(' ')[1]})
    }

    private generateSubmit = () => {
        var selectedFiles = {}
        this.fileTypes.forEach( t => {
            const file = this.props.fileList[t.fileType].find( f => f.fileName === this.state.selectedValues[t.fileDesc])
            if(file !== undefined){
                //return object keyed on unique description
                selectedFiles[t.fileDesc] = file;
            }
        });
        //FIXME copies component correctly so broadcast works.  Seems unnecessary.
        const report = JSON.parse(JSON.stringify(this.props.report))
        const reportFiles: ReportFiles = {reportTitle: report, reportFiles: selectedFiles, schooData: this.props.school, term: this.state.selectedQuarter as any};
        const channel = new BroadcastChannel(reportFiles.reportTitle.title)
        channel.onmessage = (message: MessageEvent) => {
            channel.postMessage(reportFiles)
            channel.close()
        }
        this.props.tag()
        window.open(this.props.report.link, '_blank')
    }

    private uploadSubmit = () => {
        this.fileTypes.forEach( t => {
            if (this.fileRefs[t.fileDesc] !== null){
                const ref:HTMLInputElement = this.fileRefs[t.fileDesc] as HTMLInputElement;
                if(ref.files !== null && ref.files[0] !== undefined){
                    this.setState({isLoading: true});
                    this.props.addFile(t.fileType, ref.files[0], this.state.selectedQuarter).then(results => {                            
                        //set currently selected option
                        var selected = this.state.selectedValues;
                        const list = this.props.fileList[t.fileType];
                        selected[t.fileDesc] = list.length > 0 ? list[list.length-1].fileName :'Upload New File';
                        this.fileRefs[t.fileDesc] = null;
                        this.setState({selectedValues: selected})
                    });
                }
            }
        });
        this.setState({isLoading: false})
    }

    componentDidUpdate(prevProps) {
        if(Object.keys(prevProps.school.students).length !== Object.keys(this.props.school.students).length)
        {
            this.setState({useSchool: Object.keys(this.props.school.students).length > 0 && this.props.report.title === 'Gradebook Audit Report'})
        }
    }

    private hideGenerate = ():boolean => {
        
        if(this.state.useSchool){
            return false
        }
        return this.props.report.files.some( (f) => this.state.selectedValues[f.fileDesc] === 'Upload New File');
    }

    private hideUpload = ():boolean => {
        return this.fileTypes.every( (f) => this.state.selectedValues[f.fileDesc] !== 'Upload New File');

    }



    render(){
        //file types not unique, file descriptions are unique within each report
        
        this.fileTypes.map( t => this.fileRefs[t.fileDesc]=null);
        //NOTE Update this along with useSchool in the coinstructor
        const showSchoolOption = Object.keys(this.props.school.students).length > 0 && this.props.report.title === 'Gradebook Audit Report'
        
        //submits all the files currently selected.  Depending on disabling button for safety/completeness

        return (    
            <Modal show={this.props.show} onHide={this.handleHide} dialogClassName='modal-input-form'>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.report.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id={`${this.title}-file-form`}>
                        <Container>
                        {showSchoolOption? 
                            <>
                            <Row style={{paddingBottom: '20px', borderBottom:'solid'}}>
                             <Col>
                                <Form.Control 
                                as='select'
                                value={this.state.selectedQuarter.length === 1 ? 'Quarter ' + this.state.selectedQuarter : this.state.selectedQuarter}
                                onChange = {(e) => this.handleQuarterChange(e as React.ChangeEvent<HTMLSelectElement>)}>
                                <option>Quarter 1</option>
                                <option>Quarter 2</option>
                                <option>Quarter 3</option>
                                <option>Quarter 4</option>
                                <option>Semester 1</option>
                                <option>Semester 2</option> 
                            </Form.Control> 
                            </Col> 
                            <Col>
                                Use Student Reporting Data Export "{this.props.school.fileName}"
                            </Col>
                            <Col md="auto">
                                <Form.Check
                                    type='checkbox'
                                    checked={this.state.useSchool}
                                    onChange={this.handleSchoolToggleChange}
                                />
                            </Col>
                            
                        </Row>
                        <br></br>
                        </>
                    : <></>}  
                            <div
                            style={{
                                opacity: this.state.useSchool ? 0.25 : 1,
                                pointerEvents: this.state.useSchool ? "none" : "initial"
                              }}>
                            <FileInputs report={this.props.report} 
                                        fileRefs={this.fileRefs}
                                        selectedValues={this.state.selectedValues}
                                        handleChange={this.handleChange}
                                        handleQuarterChange={this.handleQuarterChange}
                                        selectedQuarter={this.state.selectedQuarter}
                                        />
                            </div>
                        </Container>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.uploadSubmit} 
                            disabled={this.hideUpload()}>
                        {this.state.isLoading? 'Loading...' : 'Load Files'}
                    </Button>
                    <Button onClick={this.generateSubmit} disabled={this.hideGenerate()}>
                        Generate Report
                    </Button>
                </Modal.Footer>
            </Modal>
        )}
}
