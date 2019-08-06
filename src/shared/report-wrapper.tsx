import * as React from 'react'

import {ReportFiles} from './report-types'

interface ReportWrapperProps {
    reportTitle: string
}

interface ReportWrapperState {
    reportFiles: ReportFiles | null
    channel: BroadcastChannel
}



/*
ReportWrapper assumes each child will have an optional prop called reportFiles.
This is enforced in the type definition for ReportTitle.  ReportWrapper opens a
broadcast channel with the title of the report, sends a message to let the
channel know the report is ready to recieve files, and then waits for those
files.

*/
export class ReportWrapper extends React.Component<ReportWrapperProps, ReportWrapperState> {
    constructor(props){
        super(props);
        const channel = new BroadcastChannel(this.props.reportTitle)
        channel.onmessage = (message: MessageEvent) => {
            this.setState({reportFiles: message.data as ReportFiles})
            channel.close()
        }
        this.state={reportFiles: null, channel: channel}
        channel.postMessage(this.props.reportTitle)
        /*
        idb.get(this.props.reportTitle).then( (res) => {
            this.setState({reportFiles: res as ReportFiles})
        })
        */
    }

    render(){
        const children = React.Children.map( this.props.children, child => {
            return React.cloneElement(child as React.ReactElement<any>, {reportFiles: this.state.reportFiles})
        })
        return(
            <React.Fragment>
                {this.state.reportFiles === null ? <h5>Loading...</h5>: children}
            </React.Fragment>
        )
    }
    

}