import * as React from 'react'
import * as idb from 'idb-keyval'

import {ReportFiles} from './report-types'

interface ReportWrapperProps {
    reportTitle: string
}

interface ReportWrapperState {
    reportFiles: ReportFiles | null
}

//ReportWrapper assumes each child will have a prop for report files

export class ReportWrapper extends React.Component<ReportWrapperProps, ReportWrapperState> {
    constructor(props){
        super(props);
        this.state={reportFiles: null}
        idb.get(this.props.reportTitle).then( (res) => {
            this.setState({reportFiles: res as ReportFiles})
        })
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