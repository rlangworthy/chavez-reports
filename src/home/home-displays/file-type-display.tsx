import * as React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import ListGroup from 'react-bootstrap/ListGroup'
import Collapse from 'react-bootstrap/Collapse'
import saveIcon from '../../shared/icons/save-icon.svg'

import { 
    RawFileParse,
    FileTypes } from '../../shared/file-types'
import {
    CustomToggle
    } from '../../shared/components/custom-toggle'
import { 
    Action,
    FileContextConsumer } from '../home-cointainers/home'
import { FileManagerFooter } from './file-manager-footer'
import './file-type-display.css'

interface FileTypeDisplayProps {
    onClick : (type: FileTypes) => void
    fileType: FileTypes
    showFiles: (fileType: FileTypes) => boolean
}

interface FileDropdownWidgetProps {
    onClick: (file: RawFileParse, action :Action) => any
    file: RawFileParse
}

export const FileTypeDisplay: React.SFC<FileTypeDisplayProps> = (props) => {
    return (
        <FileContextConsumer>
            {({fileList, addFile, modifyFile, savedFiles}) => {
                return (
                    <ListGroup.Item>
                        <div onClick={() => props.onClick(props.fileType)}>
                            {props.fileType + ' (' + fileList[props.fileType].length + ' Uploaded)'}
                        </div>
                        <Collapse in={props.showFiles(props.fileType)}>
                            <ListGroup variant='flush'>
                                {fileList[props.fileType].map( (file: RawFileParse) => {
                                    const saved = savedFiles.some((f) => 
                                        f.fileName === file.fileName && 
                                        f.fileType === file.fileType)
                                    return (
                                        <ListGroup.Item key={file.fileName}>
                                            {saved? <img alt={'Saved'}src={saveIcon} style={{width:'24px', height:'24px', marginRight:'24px'}}/>:null}    
                                            {file.fileName}
                                            <FileDropdownWidget
                                                onClick={modifyFile}
                                                file={file}/>
                                        </ListGroup.Item>
                                    );
                                })}
                                <ListGroup.Item>
                                    <FileManagerFooter fileType={props.fileType}/>
                                </ListGroup.Item>
                            </ListGroup>
                        </Collapse>
                    </ListGroup.Item>
                    )
                }
            }
        </FileContextConsumer>
    )
}

export const FileDropdownWidget: React.SFC<FileDropdownWidgetProps> = (props) => {
    return (
        <Dropdown className='file-dropdown-widget' >
            <Dropdown.Toggle id='file-dropdown-widget-toggle' as={CustomToggle}/>
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => props.onClick(props.file, 'Rename')} disabled>
                    Rename
                </Dropdown.Item>
                <Dropdown.Item onClick={() => props.onClick(props.file, 'Save')}>
                    Save
                </Dropdown.Item>
                <Dropdown.Divider/>
                <Dropdown.Item onClick={() =>props.onClick(props.file, 'Delete')}>
                    Delete
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
}
  
//interactive view for each file type.