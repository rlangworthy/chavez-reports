import * as React from 'react'
import * as Papa from 'papaparse'
import CardDeck from 'react-bootstrap/CardDeck'
import { ReportCard } from '../home-displays/report-card'
import { ReportCards } from '../report-types'
import { ReportModal } from './report-modal'
import { 
    FileList,
    FileTypes,
    ParseResult, } from '../file-types'


interface ReportHomeState {
    fileList: FileList
    activeModal: string | null
}

interface ReportHomeProps {

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
        }
    }
    render () {
        return (
            <React.Fragment>
                <CardDeck>
                    {ReportCards.map( card => {return (<ReportCard key={card.title} cardInfo={card} onClick={this.activateModal} />)})}
                </CardDeck>
                {ReportCards.map( report => {
                    return(
                    <ReportModal key={report.title}
                        fileList={this.state.fileList} 
                        report={report} 
                        show={this.state.activeModal === report.title}
                        handleHide={this.handleHide}
                        addFile={this.addFile} />)
                })}
            </React.Fragment>
        )
    }

    private activateModal = (title: string) => {
        this.setState({activeModal: title});
    }
    private handleHide = () => {
        this.setState({activeModal: null});
    }
    private addFile = (fileType: string, file: File) => {
        Papa.parse(file, {complete: (result: ParseResult) => {
            const newFileList = this.state.fileList;
            newFileList[fileType].push({fileType: fileType, fileName: file.name, parseResult: result});
            this.setState({fileList: newFileList});},
            skipEmptyLines: true,
            header: true})
    }
}