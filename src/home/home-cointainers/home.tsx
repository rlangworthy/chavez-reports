import * as React from 'react'
import * as Papa from 'papaparse'
import * as idb from 'idb-keyval'
import * as d3 from 'd3'
import CardDeck from 'react-bootstrap/CardDeck'
import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import { ReportCards } from '../../shared/report-types'
import { ReportCard } from '../home-displays/report-card'
import { ReportModal } from './report-modal'
import {FolderDropModal} from '../home-displays/folder-drop-modal'
import { InstructionModal } from '../home-displays/instructions-modal'
import { FileManagerContainer } from './file-manager-container'
import { getFileType } from '../../shared/file-types-utils'
import { reportTag } from '../../shared/gtag'
import AspenRequest from '../../shared/icons/Aspen Support Request.png'

import { 
    FileList,
    FileTypes,
    ParseResult,
    RawFileParse, } from '../../shared/file-types'
import { 
    fileListHas, 
    getUniqueFileName, 
    getCurrentQuarter, 
    stringToDate} from '../../shared/utils'

import './home.css'
import { AspenAssignmentRow } from '../../shared/file-interfaces'
import { SY_CURRENT } from '../../shared/initial-school-dates'
import { GoogleLoginResponse } from 'react-google-login'

export type Action = 'Delete' | 'Save' | 'Rename'
 
export interface FileContextInterface{
    
    fileList: FileList
    savedFiles: RawFileParse[]
    addFile: (fileType: string, file: File) => Promise<void>
    modifyFile: (file: RawFileParse, action: Action) => Promise<void>
}

export const FileContext = React.createContext<FileContextInterface>({
    fileList: {},
    savedFiles: [],
    addFile: () => {return new Promise<void>( (resolve, reject) => null)},
    modifyFile: () => {return new Promise<void>( (resolve, reject) => null)},
});

export const FileContextConsumer = FileContext.Consumer;
export const FileContextProvider = FileContext.Provider;

interface ReportHomeState {
    fileList: FileList
    activeModal: string | null
    savedFiles: RawFileParse[]
    loadingFiles: boolean
}

interface ReportHomeProps {
    account: GoogleLoginResponse
}    

//ReportHome renders the cards and report modals, also holds onto the file list and state.
//The state modifying things are all pased on to modal, it might make sense to do this as a context.

export class ReportHome extends React.PureComponent<ReportHomeProps, ReportHomeState> {
    constructor(props: ReportHomeProps){
        super(props);
        var emptyFileList: FileList = {};
        Object.values(FileTypes).forEach(v => emptyFileList[v]=[]);
        this.state = {
            fileList: emptyFileList,
            activeModal: null,
            savedFiles: [],
            loadingFiles: true,
        }
        this.loadFiles();
    }

    private loadFiles = () => {
        idb.keys().then( keys => {
            Promise.all(keys.map(key => idb.get(key))).then( (files) => {
                const newSavedFiles = (files as RawFileParse[]).map( (file):RawFileParse => {
                    return {fileName: file.fileName, fileType: file.fileType, parseResult: null}
                });
                const savedFileObj: FileList = d3.nest<RawFileParse>()
                                    .key( r => r.fileType)
                                    .object(files as RawFileParse[]);
                const newFileList = {};
                Object.assign(newFileList, this.state.fileList, savedFileObj);
                this.setState({savedFiles: newSavedFiles, fileList: newFileList, loadingFiles: false});
            });
        })
    }
    /*
     * This works, but I need to get a handle on making the css load before the page does.
     * Otherwise it takes these as the values of the raw html elements, which is bad.
     * It behaves correclty in a production build, but not as a dev build
     */
    componentDidMount(){
        var cards = document.getElementsByClassName('card') as HTMLCollectionOf<HTMLDivElement>
        var max = 0;
        for(var card in cards){
            if(cards[card].clientHeight > max){max=cards[card].clientHeight}
        }
        for(var card2 in cards){
            if(cards[card2].style){
               cards[card2].style.height = max + 'px'
            }
        }
    }

    /*

    
                        */
    

    render () {
        return (
            <FileContextProvider value={{
                fileList: this.state.fileList, 
                addFile: this.addFile, 
                savedFiles: this.state.savedFiles,
                modifyFile: this.modifyFile,}}>
                <Navbar>
                    <Navbar.Brand>Chavez Report Suite</Navbar.Brand>
                </Navbar>
                <div className='home-btn-toolbar-container'>
                    <ButtonToolbar className='home-btn-toolbar'>
                        <Button onClick={() => this.activateModal('Instructions')}>
                            Instructions
                        </Button>
                        <Button onClick={() => this.activateModal('Manage Files')}>
                            {this.state.loadingFiles ? 'Loading...':'Manage Local Files'}
                        </Button>
                        <Button onClick={() => this.activateModal('Folder Drop')}>
                            Bulk Upload
                        </Button>
                    </ButtonToolbar>
                
                </div>
                <CardDeck>
                    {ReportCards.map( card => {return (<ReportCard 
                        key={card.title} 
                        cardInfo={card} 
                        onClick={this.activateModal} />)})}
                </CardDeck>
                <Navbar sticky='bottom'>
                    <Navbar.Brand>{new Date().getFullYear()}, Barton Dassinger</Navbar.Brand>
                    <Navbar.Text>
                        <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
                        <img alt="Creative Commons License" style={{borderWidth:'0'}} 
                        src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a>
                        <br />This work is licensed under a <a rel="license" 
                        href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
                        Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
                    </Navbar.Text>
                </Navbar>
                <InstructionModal 
                    show={this.state.activeModal === 'Instructions'}
                    handleHide={this.handleHide}/>
                
                <FolderDropModal
                    show={this.state.activeModal === 'Folder Drop'}
                    handleHide={this.handleHide}
                    dropFiles={this.dropFiles}
                />

                <FileManagerContainer
                    show={this.state.activeModal === 'Manage Files'}
                    handleHide={this.handleHide}/>
                
                {ReportCards.map( report => {
                    return(
                    <ReportModal key={report.title}
                        fileList={this.state.fileList} 
                        report={report} 
                        show={this.state.activeModal === report.title}
                        handleHide={this.handleHide}
                        addFile={this.addFile} 
                        tag={()=>reportTag(window, 'report_generate', this.props.account.getBasicProfile().getEmail(), report.title)}/>)
                })}
            </FileContextProvider>
        )
    }

    private activateModal = (title: string) => {
        this.setState({activeModal: title});
    }

    private handleHide = () => {
        this.setState({activeModal: null});
    }

    private dropFiles = (files: File[]): Promise<void[]> => {
        return Promise.all(files.map((file):Promise<void> => {
            return new Promise ((resolve, reject) => {
                Papa.parse(file, {complete: (result: ParseResult, f: File) => {
                    const fileType = getFileType(result.meta.fields)
                    if(fileType !== 'NA'){
                        this.addFile(fileType, f)
                    }
                    resolve();
                },
                skipEmptyLines: true,
                header: true,
                preview: 1})
            })
        }))
    }


    //add file to the working instance of the app, should refactor into utils along with delete and save
    private addFile = (fileType: string, file: File, selectedQuarter?: string): Promise<void> => {
        if(fileType === FileTypes.ASSIGNMENTS_SLOW_LOAD){
            var download:AspenAssignmentRow[] = []
            const qStart = selectedQuarter !== undefined? selectedQuarter : 'Quarter ' + getCurrentQuarter(SY_CURRENT)
            return new Promise ((resolve,reject) => {
                Papa.parse(file, {complete: (result: ParseResult) => {
                    const newFileList = {};
                    Object.assign(newFileList, this.state.fileList);
                    const modName = file.name.slice(0,-4) + ' ' + qStart + file.name.slice(-4)
                    const fileName = newFileList[fileType].find( f => f.fileName === modName) ? 
                                        getUniqueFileName(modName, this.state.fileList[fileType]):
                                        modName;
                    newFileList[fileType].push({
                            fileType: fileType, 
                            fileName: fileName, 
                            parseResult: {...result, data: download}});
                    this.setState({fileList: newFileList})
                    resolve();
                },
                    skipEmptyLines: true,
                    header: true,
                    chunk: (result: ParseResult) => {
                        const d = new Date()
                        d.setDate(d.getDate()-1)
                        download = download.concat(result.data.filter((a:AspenAssignmentRow) => {
                            if(qStart.split(' ')[0] === 'Quarter'){
                                return a["Grade Term"].split(' ')[1]===qStart.split(' ')[1]}
                            else if(qStart === 'Semester 1'){
                                return a["Grade Term"].split(' ')[1]==='1' || a["Grade Term"].split(' ')[1]==="2" 
                            }
                            return a["Grade Term"].split(' ')[1]==='3' || a["Grade Term"].split(' ')[1]==="4" 
                        }))
                            
                    }})
            })
        }

        return new Promise ( (resolve, reject) => 
            Papa.parse(file, {complete: (result: ParseResult) => {
                const newFileList = {};
                Object.assign(newFileList, this.state.fileList);
                const fileName = newFileList[fileType].find( f => f.fileName === file.name) ? 
                                    getUniqueFileName(file.name, this.state.fileList[fileType]):
                                    file.name;
                newFileList[fileType].push({fileType: fileType, fileName: fileName, parseResult: result});
                this.setState({fileList: newFileList})
                resolve();
            },
                skipEmptyLines: true,
                header: fileType === FileTypes.STUDENT_SCHEDULE ? false:true})
        )
    }

    //remove file from working instance of app and delete it from indexeddb if necessary
    private deleteFile = (file: RawFileParse): Promise<void> => {
        return new Promise ( (resolve, reject) => {
            idb.del(file.fileType+file.fileName).finally(()=> {
                const newFileList: FileList = {}
                Object.assign(newFileList, this.state.fileList);
                const index = newFileList[file.fileType].findIndex(e => e.fileName === file.fileName);
                if(index !== -1){
                    newFileList[file.fileType].splice(index,1)
                    const newSavedList = this.state.savedFiles
                        .filter( f => f.fileType !== file.fileType || f.fileName !== file.fileName)
                    this.setState({fileList: newFileList, savedFiles: newSavedList})}
                resolve()})
        })
    }

    //save file to indexeddb using filetype+filename as key
    private saveFile = (file: RawFileParse): Promise<void> => {
        return idb.set(file.fileType + file.fileName, file).then( () => {
            const newSaved = this.state.savedFiles
            .concat([{fileName: file.fileName, fileType: file.fileType, parseResult: null}])
            this.setState({savedFiles: newSaved})})
    }

    //rename a file in the saved database and in the working copy
    private renameFile = (file: RawFileParse, name: string): Promise<void> => {
        return new Promise ( (resolve, reject) => {
            const newFileList: FileList = {}
            const newFile = {...file, fileName: name}
            Object.assign(newFileList, this.state.fileList);
            const index = newFileList[file.fileType].findIndex(e => e.fileName === file.fileName);
            if(index !== -1){
                newFileList[file.fileType].splice(index,1, newFile)
            }
            if(fileListHas(this.state.savedFiles, file)){
                idb.del(file.fileType+file.fileName).finally( () => {
                    idb.set(newFile.fileType+newFile.fileName, newFile).finally( ()=>{
                        const newSavedList = this.state.savedFiles
                            .filter( f => f.fileType !== file.fileType || f.fileName !== file.fileName)
                            .concat([{...newFile, parseResult: null}]);
                        this.setState({fileList: newFileList, savedFiles: newSavedList});
                
                    })
                })
            } else {
                this.setState({fileList: newFileList});
            }
        })
    }

    //default should be a better (any) error check
    private modifyFile = (file: RawFileParse, action: Action, name?: string): Promise<void> => {
        switch(action) {
            case 'Delete':
                return this.deleteFile(file);
            case 'Rename':
                if(name){
                    return this.renameFile(file, name);
                }
                return new Promise((resolve, reject) => {});
            case 'Save':
                return this.saveFile(file);
            default:
                return new Promise((resolve, reject) => {});
        }
    }

}