import * as React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Dropzone from 'react-dropzone'

//import './home.css'

interface FolderDropModalProps {
    show: boolean
    handleHide: () => any
    dropFiles: (files: File[]) => Promise<string[]>
}

interface FolderDropModalState {
    uploadingFiles: string[]
    uploadedFiles: string[]
}



export class FolderDropModal extends React.Component<FolderDropModalProps, FolderDropModalState> {
    constructor(props: FolderDropModalProps){
        super(props);
        this.state={uploadedFiles:[], uploadingFiles:[]}
    }

    private resetFilesHide = () => {
        this.setState({uploadedFiles:[], uploadingFiles:[]})
        this.props.handleHide()
    }

    render(){
        return (
            <Modal show={this.props.show} onHide={this.resetFilesHide} dialogClassName={'modal-report-instrucitons'}>
                <Modal.Header closeButton>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Dropzone onDrop={acceptedFiles => {
                    //Tell you when thing is finished downloading
                    this.setState({uploadingFiles:this.state.uploadingFiles.concat(acceptedFiles.map((f):string => f.name))})
                    this.props.dropFiles(acceptedFiles).then(fns => {
                        this.setState({uploadedFiles:this.state.uploadedFiles.concat(fns), uploadingFiles:this.state.uploadingFiles.filter(fn => !fns.includes(fn))})
                    })
                    }}>
                            {({getRootProps, getInputProps}) => (
                                <section>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <div className='file-drop'> 
                                        <Button>Drag and drop files or a folder, or click to select files</Button>
                                    </div>
                                </div>
                                </section>
                            )}
                </Dropzone>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.resetFilesHide}>
                    Close
                    </Button>
            </Modal.Footer>
            <UploadTracker uploadedFiles={this.state.uploadedFiles} uploadingFiles={this.state.uploadingFiles}/>
            </Modal>
        )
    }
}

const UploadTracker: React.FunctionComponent<FolderDropModalState> = (props) => {
    const uploadStyle = {margin: '0px'}
    
    return (
        <Modal.Body>
            {props.uploadingFiles.map(fn => {
                return (
                    <p style={uploadStyle}>
                    {fn} ...uploading
                    </p>
                )
            })}
            {props.uploadedFiles.map(fn => {
                return (
                    <p style={uploadStyle}>
                    {fn} Uploaded!
                    </p>
                )
            })}
        </Modal.Body>
    )
}