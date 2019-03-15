import * as React from 'react'
import * as idb from 'idb-keyval'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import { 
    ReportTitle,
    ReportFiles, } from '../../shared/report-types'
import { 
    FileList,
    FileTypes, } from '../../shared/file-types'

import {
    fileInputs
    } from '../home-displays/file-inputs'

import './report-modal.css'

interface ReportModalProps {
    report: ReportTitle
    fileList: FileList
    show: boolean
    handleHide: () => any
    addFile: (fileType: string, file: File) => Promise<void>
}

interface ReportModalState {
    selectedValues: {[fileDesc: string]: string}
    isLoading: boolean
}
export class ReportModal extends React.Component<ReportModalProps, ReportModalState> {
    //The file form is the workhorse of this app.  It displays existing files and allows new ones to be uploaded    
    
    constructor(props: ReportModalProps){
        super(props);
        var selected = {}
        //fileList keyed on type of file, selected files keyed on this reports descriptions
        this.props.report.files.map( f => {
            const list = this.props.fileList[f.fileType];
            selected[f.fileDesc] = list.length > 0 ? list[list.length-1].fileName :'Upload New File';
        })
        this.props.report.optionalFiles ? this.props.report.optionalFiles.map( f => {
            const list = this.props.fileList[f.fileType];
            selected[f.fileDesc] = list.length > 0 ? list[list.length-1].fileName :'Upload New File';
        }) : null
        if(this.props.report.optionalFiles){
            this.state={selectedValues:selected, isLoading: false}
        }else{
            this.state={selectedValues:selected, isLoading: false}
        }
    }

    render(){
        //file types not unique, file descriptions are unique within each report
        
        const title = this.props.report.title;
        const fileTypes = this.props.report.optionalFiles ? 
                        this.props.report.files.concat(this.props.report.optionalFiles) : 
                        this.props.report.files
        var fileRefs: {[type: string]: HTMLInputElement | null} ={};
        //fileRefs keyed on descriptions
        fileTypes.map( t => fileRefs[t.fileDesc]=null);

        const uploadSubmit = () => {
            fileTypes.map( t => {
                if (fileRefs[t.fileDesc] !== null){
                    const ref:HTMLInputElement = fileRefs[t.fileDesc] as HTMLInputElement;
                    if(ref.files !== null && ref.files[0] !== undefined){
                        this.setState({isLoading: true});
                        this.props.addFile(t.fileType, ref.files[0]).then(results => {                            
                            //set currently selected option
                            var selected = this.state.selectedValues;
                            const list = this.props.fileList[t.fileType];
                            selected[t.fileDesc] = list.length > 0 ? list[list.length-1].fileName :'Upload New File';
                            fileRefs[t.fileDesc] = null;
                            this.setState({selectedValues: selected})
                        });
                    }
                }
            });
            this.setState({isLoading: false})
        }

        const hideGenerate = ():boolean => {
            return this.props.report.files.some( (f) => this.state.selectedValues[f.fileDesc] === 'Upload New File');
        }

        const hideUpload = ():boolean => {
            return fileTypes.every( (f) => this.state.selectedValues[f.fileDesc] !== 'Upload New File');

        }

        //submits all the files currently selected.  Depending on disabling button for safety/completeness
        const generateSubmit = () => {
                var selectedFiles = {}
                fileTypes.map( t => {
                    const file = this.props.fileList[t.fileType].find( f => f.fileName === this.state.selectedValues[t.fileDesc])
                    if(file !== undefined){
                        //return object keyed on unique description
                        selectedFiles[t.fileDesc] = file;
                    }
                });
                const reportFiles: ReportFiles = {reportTitle: this.props.report, reportFiles: selectedFiles};
                idb.set(reportFiles.reportTitle.title, reportFiles)
                    .then(() => window.open(this.props.report.link, '_blank'));
        }

        const handleChange = (ev: React.ChangeEvent<HTMLSelectElement>, d: string): void =>{
            ev.preventDefault();
            var selected = this.state.selectedValues;
            selected[d] = ev.target.value;
            //update upload button 
            const uploadElement = document.getElementById(`${title + d}-file-input`) as HTMLInputElement;
            if(ev.target.value === 'Upload New File'){
                uploadElement.style.visibility='visible'
            }else{
                uploadElement.style.visibility='hidden'}
            //update selected item
            this.setState({selectedValues: selected});
        }

        const handleHide = () => {
            const selected = {}
            Object.keys(this.state.selectedValues).map( key => {
                selected[key] = 'Upload New File';
            });
            this.setState({selectedValues: selected});
            this.props.handleHide();
        }

        return (    
            <Modal show={this.props.show} onHide={handleHide} dialogClassName='modal-input-form'>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.report.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id={`${title}-file-form`}>
                        <Container>
                            {fileInputs(this.props.report, 
                                        fileRefs,
                                        this.state.selectedValues,
                                        handleChange)}
                        </Container>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={uploadSubmit} 
                            disabled={hideUpload()}>
                        {this.state.isLoading? 'Loading...' : 'Upload Files'}
                    </Button>
                    <Button onClick={generateSubmit} disabled={hideGenerate()}>
                        Generate Report
                    </Button>
                </Modal.Footer>
            </Modal>
        )}
}
