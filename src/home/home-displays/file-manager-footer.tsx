import * as React from 'react'
import Button from 'react-bootstrap/Button'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';

import { FileContextConsumer } from '../home-cointainers/home'
import { 
    FileTypes, 
    RawFileParse } from '../../shared/file-types'
//has buttons to save all, delete all, or some other things maybe

interface FileManagerFooterProps {
    fileType: FileTypes | null
}

export const FileManagerFooter: React.SFC<FileManagerFooterProps> = (props) => {

    return (
        <FileContextConsumer>
            {({fileList, savedFiles, addFile, modifyFile}) => {
                const saveList = (files: RawFileParse[]) => {
                    files.map(file => {
                        if(savedFiles.every( f => f.fileType !== file.fileType || f.fileName !== file.fileName)){
                            modifyFile(file,'Save');
                        }
                    })
                }

                const deleteList = (files: RawFileParse[]) => {
                    files.forEach(file => {
                        modifyFile(file,'Delete');                        
                    })
                }

                const footSave = () => {
                    if(props.fileType){
                        saveList(fileList[props.fileType])
                    } else {
                        Object.values(FileTypes).map( type => {
                            saveList(fileList[type]);
                        })
                    }
                }

                const footDelete = () => {
                    if(props.fileType){
                        deleteList(fileList[props.fileType])
                    } else {
                        Object.values(FileTypes).map( type => {
                            deleteList(fileList[type]);
                        })
                    }
                }
                //false is the lazy way of commenting this bit out.  Can add functionality back in later
                return (
                    <ButtonToolbar style={{float:'right'}}>
                        {false && props.fileType?  
                        <Button>
                            Add File
                        </Button> : null }
                        <Button onClick={() => footSave()}>
                            Save All
                        </Button>
                        <Button onClick={() => footDelete()}>
                            Delete All
                        </Button>
                    </ButtonToolbar>
                )
            }}
        </FileContextConsumer>
    )
}