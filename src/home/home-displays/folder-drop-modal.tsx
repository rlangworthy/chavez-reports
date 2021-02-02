import * as React from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Dropzone from 'react-dropzone'

//import './home.css'

interface FolderDropModalProps {
    show: boolean
    handleHide: () => any
    dropFiles: (files: File[]) => Promise<void[]>
}

export const FolderDropModal: React.FunctionComponent<FolderDropModalProps> = (props) => {

    return (
        <Modal show={props.show} onHide={props.handleHide} dialogClassName={'modal-report-instrucitons'}>
            <Modal.Header closeButton>
                <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Dropzone onDrop={acceptedFiles => props.dropFiles(acceptedFiles)}>
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
                <Button variant="secondary" onClick={props.handleHide}>
                Close
                </Button>
          </Modal.Footer>
            
        </Modal>
    )
}