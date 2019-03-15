import * as React from 'react';
import * as R from 'ramda';

import {del} from 'idb-keyval'
import { 
    StaffDisplayContainer } from './absence-displays/staff-display'

import { 
    CalendarDisplay } from './absence-displays/calendar-display';

import { ReportFiles } from '../shared/report-types'
import { createStaffAbsenceReport } from './staff-absence-backend'

import './staff-absence-download.css'

interface StaffAbsenceReportProps {
    reportFiles?: ReportFiles
}

interface StaffAbsenceReportState {
    currentDisplay: string
    currentPosition: string
    currentStaff: string
}

export class StaffAbsenceReport extends React.PureComponent<StaffAbsenceReportProps, StaffAbsenceReportState> {
    constructor(props){
        super(props);
        this.state={
            currentDisplay: 'Staff',
            currentStaff: '',
            currentPosition: 'All',
        }
        window.addEventListener('beforeunload', () => {del('Staff Absence Report')});
    }


    public render() {
        const absenceData = this.props.reportFiles ? createStaffAbsenceReport(this.props.reportFiles): {absences: [], dates: []}
        const positionList: string[] = R.uniq(absenceData.absences.map( r => r.position ));
        const staffList: string[] = R.uniq((this.state.currentPosition === 'All') ? absenceData.absences.map( r => r.name):
            absenceData.absences.filter( r => r.position === this.state.currentPosition).map( r => r.name));
        return (
          <div className='staff-absence-report'>
            <div className='staff-absence-report-header'>
                <h3>Staff Absence Report</h3>
                <button onClick={() => {this.setState({currentDisplay: 'Staff'})}}>Staff</button>
                <button onClick={() => {this.setState({currentDisplay: 'Calendar'})}}>Calendar</button>
                <div>
                    <select value={this.state.currentPosition} onChange={(e) => this.handlePositionChange(e)}>
                        <option value={'All'}>All</option>
                        {positionList.map( s => {
                            return (<option value={s} key={s}>{s}</option>)
                        })}
                    </select>
                    <select value={this.state.currentStaff} onChange={(e) => this.handleStaffChange(e)}>
                        <option value={''}>All</option> 
                        {staffList.map( s => {
                            return (<option value={s} key={s}>{s}</option>)
                        } )}
                    </select>
                </div>
            </div>
            <div className={'tab-list'}>
                <div className={`tab-list-item ${(this.state.currentDisplay==='Calendar') ? "tab-list-active":""}`}>
                    <CalendarDisplay 
                        absenceData={absenceData} 
                        position={this.state.currentPosition}
                        staffName={this.state.currentStaff}/>
                </div>
                <div className={`tab-list-item ${(this.state.currentDisplay==='Staff') ? "tab-list-active":""}`}>
                    <StaffDisplayContainer 
                        absenceData={absenceData.absences}
                        position={this.state.currentPosition}
                        staffName={this.state.currentStaff}/>
                </div>
            </div>
          </div>
        );
    }

    private handlePositionChange = (ev: React.ChangeEvent<HTMLSelectElement>): void => {
        ev.preventDefault();
        if(ev.target.value != null){
            this.setState({currentPosition: ev.target.value})
        }
    }

    private handleStaffChange = (ev: React.ChangeEvent<HTMLSelectElement>): void => {
        ev.preventDefault();
        if(ev.target.value != null){
            this.setState({currentStaff: ev.target.value})
        }
    }
}