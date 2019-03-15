import * as React from 'react'
import Modal from 'react-bootstrap/Modal'
import ListGroup from 'react-bootstrap/ListGroup'
import Button from 'react-bootstrap/Button'

import { FileTypes } from '../../shared/file-types'
import { FileTypeDisplay } from '../home-displays/file-type-display'
import { FileManagerFooter} from '../home-displays/file-manager-footer'

import './file-manager-container.css'


//modal wrapper for file system type thing

interface FileManagerContainerProps {
    show: boolean
    handleHide: () => any

}

interface FileManagerContainerState {
    selectedTypes: FileTypes[]
}

export class FileManagerContainer extends React.PureComponent<FileManagerContainerProps, FileManagerContainerState> {
    constructor(props){
        super(props);
        this.state=({selectedTypes: []})
    }

    private showFiles = (type: FileTypes): boolean => {
        return (this.state.selectedTypes.includes(type));
    }

    private toggleFiles = (type: FileTypes) => {
        const index = this.state.selectedTypes.indexOf(type);
        if(index === -1){
            this.setState({selectedTypes: this.state.selectedTypes.concat([type])});
        } else {
            const newSelectedTypes = this.state.selectedTypes.concat([]);
            newSelectedTypes.splice(index, 1);
            this.setState({selectedTypes: newSelectedTypes})
        }
    }

    render(){
        return(
            <Modal show={this.props.show} onHide={this.props.handleHide} dialogClassName='modal-file-manager'>
                <Modal.Header closeButton>
                    Uploaded Files
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {Object.values(FileTypes).map( type => {
                            return (
                                    <FileTypeDisplay
                                        onClick={this.toggleFiles}
                                        fileType={type}
                                        showFiles={this.showFiles}
                                        key={type}
                                    />
                            )
                        })}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <FileManagerFooter fileType={null}/>
                    <Button variant="secondary" onClick={this.props.handleHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}