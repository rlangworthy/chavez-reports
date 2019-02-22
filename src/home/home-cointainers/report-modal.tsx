import * as React from 'react'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { ReportTitle } from '../report-types'
import { FileList } from '../file-types'

interface ReportModalProps {
    report: ReportTitle
    fileList: FileList
    show: boolean
    handleHide: () => any
    addFile: (fileType: string, file: File) => void
}

interface ReportModalState {

}

export class ReportModal extends React.PureComponent<ReportModalProps, ReportModalState> {
    //The file form is the workhorse of this app.  It displays existing files and allows new ones to be uploaded
    //TODO: submit conditional based on need to upload new files
    //TODO: responsive upload file button/control elements
    
    constructor(props: ReportModalProps){
        super(props);

    }
    //Need this out here so I can move the onsubmit
    private fileForm = () => {
        const fileTypes = this.props.report.files;
        var fileRefs: {[type: string]: HTMLInputElement | null} ={};
        fileTypes.map( t => fileRefs[t]=null);

        const onSubmit: React.FormEventHandler = (ev) => {
            console.log(ev.type);
            ev.preventDefault();
            fileTypes.map( t => {
                if (fileRefs[t] !== null){
                    const ref:HTMLInputElement = fileRefs[t] as HTMLInputElement;
                    if(ref.files !== null && ref.files[0] !== undefined){
                        this.props.addFile(t, ref.files[0]);
                    }
                }
            });
        }
        return (
            <Form id='file-form' onSubmit={onSubmit}>
                {fileTypes.map( (f, i) => {
                    return (
                        <React.Fragment key={i}>
                            <Form.Label>{f}</Form.Label>
                            <Form.Control as='select' onChange={(e)=>this.handleChange(e)}>
                                {this.props.fileList[f].map( (file, i) => {
                                    return (
                                        <option key={file.fileName + i}>{file.fileName}</option>
                                    )
                                })}
                                <option>Upload New File</option>
                            </Form.Control>
                            <Form.Control ref={(ref => fileRefs[f] = ref) as any } type='file' />
                        </React.Fragment>
                    )
                })}
                <button id='submit-button' style={{display: 'none'}} type='submit'/>
            </Form>
        )
    }

    private handleChange = (ev: React.ChangeEvent<HTMLSelectElement>): void =>{
        ev.preventDefault();
        if(ev.target.value === 'Upload New File'){

        }
    }

    //clicks the hidden submit button to generate a submit event and trigger the handler
    private clickSubmit = () => {
        const button = document.getElementById('submit-button')
        if(button){
            button.click()
        }
    }
    render(){
    return (    
        <Modal show={this.props.show} onHide={this.props.handleHide}>
            <Modal.Header closeButton>
                <Modal.Title>{this.props.report.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {this.fileForm()}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.clickSubmit}>
                    Upload Files
                </Button>
                <Button>
                    Generate Report
                </Button>
            </Modal.Footer>
        </Modal>
    )}
}