import * as React from 'react'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import { 
    ReportTitle,
    ReportFiles, } from '../../shared/report-types'
import { 
    FileList,} from '../../shared/file-types'

import {
    FileInputs
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
        this.props.report.files.forEach( f => {
            const list = this.props.fileList[f.fileType];
            selected[f.fileDesc] = list.length > 0 ? list[list.length-1].fileName :'Upload New File';
        })
        /* eslint-disable */
        this.props.report.optionalFiles ? this.props.report.optionalFiles.map( f => {
            const list = this.props.fileList[f.fileType];
            selected[f.fileDesc] = list.length > 0 ? list[list.length-1].fileName :'Upload New File';
        }) : null
        /* eslint-enable */
        if(this.props.report.optionalFiles){
            this.state={selectedValues:selected, isLoading: false}
        }else{
            this.state={selectedValues:selected, isLoading: false}
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

    private generateSubmit = () => {
        var selectedFiles = {}
        this.fileTypes.forEach( t => {
            const file = this.props.fileList[t.fileType].find( f => f.fileName === this.state.selectedValues[t.fileDesc])
            if(file !== undefined){
                //return object keyed on unique description
                selectedFiles[t.fileDesc] = file;
            }
        });
        const reportFiles: ReportFiles = {reportTitle: this.props.report, reportFiles: selectedFiles};
        console.log(reportFiles)
        const channel = new BroadcastChannel(reportFiles.reportTitle.title)
        channel.onmessage = (message: MessageEvent) => {
            channel.postMessage(reportFiles)
            channel.close()
        }
        window.open(this.props.report.link, '_blank')
    }

    private uploadSubmit = () => {
        this.fileTypes.forEach( t => {
            if (this.fileRefs[t.fileDesc] !== null){
                const ref:HTMLInputElement = this.fileRefs[t.fileDesc] as HTMLInputElement;
                if(ref.files !== null && ref.files[0] !== undefined){
                    this.setState({isLoading: true});
                    this.props.addFile(t.fileType, ref.files[0]).then(results => {                            
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

    private hideGenerate = ():boolean => {
        return this.props.report.files.some( (f) => this.state.selectedValues[f.fileDesc] === 'Upload New File');
    }

    private hideUpload = ():boolean => {
        return this.fileTypes.every( (f) => this.state.selectedValues[f.fileDesc] !== 'Upload New File');

    }

    render(){
        //file types not unique, file descriptions are unique within each report
        
        this.fileTypes.map( t => this.fileRefs[t.fileDesc]=null);

        //submits all the files currently selected.  Depending on disabling button for safety/completeness

        return (    
            <Modal show={this.props.show} onHide={this.handleHide} dialogClassName='modal-input-form'>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.report.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id={`${this.title}-file-form`}>
                        <Container>
                            <FileInputs report={this.props.report} 
                                        fileRefs={this.fileRefs}
                                        selectedValues={this.state.selectedValues}
                                        handleChange={this.handleChange}/>
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
