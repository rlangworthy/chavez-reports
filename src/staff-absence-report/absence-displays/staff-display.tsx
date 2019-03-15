import * as React from 'react';
import * as R from 'ramda';

import {
    StaffAbsence,
    PayCodes,
    PayCodeKeys} from '../../shared/staff-absence-types';

interface StaffDisplayContainerProps {
    absenceData: StaffAbsence[]
    position: string
    staffName: string
}

interface StaffDisplayContainerState {

}

interface StaffDisplayProps {
    absenceData: StaffAbsence[]
}

interface SingleAbsenceReportProps {
    absences: StaffAbsence
}


export class StaffDisplayContainer extends React.PureComponent<StaffDisplayContainerProps, StaffDisplayContainerState> {

    constructor(props) {
        super(props);
    }

    componentDidUpdate(){
        if(this.props.staffName !== ''){
            const report = document.getElementById(this.props.staffName);
            if(report !== null){
                report.scrollIntoView({block: 'center'});
            }
        }
    };
    
    render () {
        return (
            <div>
                <StaffDisplay absenceData={(this.props.position === 'All') ? this.props.absenceData : 
                this.props.absenceData.filter( r => r.position === this.props.position)}/>
            </div>
        );
    }
}

const StaffDisplay: React.SFC<StaffDisplayProps> = props => {
    return (
        <div className={'staff-display'}>
            {props.absenceData.map( absences => {
              return <SingleAbsenceReport key={absences.name} absences={absences}/>
            })}
        </div>
    )
}

const SingleAbsenceReport: React.SFC<SingleAbsenceReportProps> = props => {
    /* tslint:disable-next-line:prefer-const */
    let rows: JSX.Element[] = [];
    
    const headRow = (
        <tr key={'Absences Header'}>
          <th>Pay Code</th>
          <th>Monday</th>
          <th>Tuesday</th>
          <th>Wednesday</th>
          <th>Thurday</th>
          <th>Friday</th>
        </tr>
    );
    const getDays= (dates: Date[]): string => {
        const str = dates.map(d => d.toDateString().slice(3)).join('\n')

        return str;
    }   
    var dates: Date [] = []
    Object.keys(props.absences.absences).forEach(code => {
        dates = dates.concat(props.absences.absences[code]);
        const row = (
            <tr key={code}>
                <td className='index-column'>{code}</td>
                <td>{getDays(props.absences.absences[code].filter( r => r.getDay()===1))}</td>
                <td>{getDays(props.absences.absences[code].filter( r => r.getDay()===2))}</td>
                <td>{getDays(props.absences.absences[code].filter( r => r.getDay()===3))}</td>
                <td>{getDays(props.absences.absences[code].filter( r => r.getDay()===4))}</td>
                <td>{getDays(props.absences.absences[code].filter( r => r.getDay()===5))}</td>
            </tr>
        );
        rows.push(row);
    });
    const totalRow = (
        <tr key='totals'>
            <td className='index-column'>Total</td>
            <td>{dates.filter( r => r.getDay()===1).length}</td>
            <td>{dates.filter( r => r.getDay()===2).length}</td>
            <td>{dates.filter( r => r.getDay()===3).length}</td>
            <td>{dates.filter( r => r.getDay()===4).length}</td>
            <td>{dates.filter( r => r.getDay()===5).length}</td>
        </tr>
    );
    rows.push(totalRow);

    return (
        <div id={props.absences.name}>
            <h4>{props.absences.name}</h4>
            <table className={'data-table'}>
                <thead>
                    {headRow}
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    )
}