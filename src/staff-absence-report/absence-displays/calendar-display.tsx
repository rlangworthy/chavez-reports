import * as React from 'react'
import * as R from 'ramda';
import dateFns from 'date-fns';


import { AbsenceDate, StaffAbsence } from '../../shared/staff-absence-types';
import {Calendar} from './calendar';

import './calendar-display.css';


interface CalendarDisplayProps{
    absenceData: {absences: StaffAbsence[], dates: AbsenceDate[]}
    position: string
    staffName: string
    positions?: string[]
    staffNames?: string[]
    codes?: string[]
}

interface CalendarDisplayState{

}

interface CalendarDisplayBodyProps{
    absenceDates: AbsenceDate[]
}
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


export class CalendarDisplay extends React.PureComponent<CalendarDisplayProps, CalendarDisplayState>{

    render () {
        return (
            <div>
                <CalendarDisplayBody absenceDates={this.getDisplayDates(this.props.absenceData.dates)}/>
                <Calendar months={R.uniqWith(dateFns.isSameMonth, 
                    this.props.absenceData.dates.map( d => d.date)).sort((a,b) => a.valueOf()-b.valueOf())}
                    absenceData={{absences: this.props.absenceData.absences, 
                    dates: this.getDisplayDates(this.props.absenceData.dates)}}/>
            </div>
        );
    }

    private getDisplayDates = (dates: AbsenceDate[]): AbsenceDate[] => {
        if(this.props.staffName !== ''){return dates.map(d => {return {date: d.date, 
            absences: d.absences.filter(a => a.name === this.props.staffName)}})}
        if(this.props.position !== 'All'){return dates.map(d => {return {date: d.date, 
            absences: d.absences.filter(a => a.position === this.props.position)}})}

        return dates;
    }
}

const CalendarDisplayBody: React.SFC<CalendarDisplayBodyProps> = props => {
    const maxDate=new Date(Math.max.apply(null,props.absenceDates.map( d => d.date.valueOf())));
    const minDate=new Date(Math.min.apply(null,props.absenceDates.map( d => d.date.valueOf())));
    return (
        <div className='calendar-display-body'>
            <div className='off-by-day'>
                {getDaysTable({dates: props.absenceDates})}
            </div>
            <div className='off-by-month'>
                {getMonthsTable({dates: props.absenceDates})}
            </div>
        </div>
    )
}

const getDaysTable: React.SFC<{dates: AbsenceDate[]}> = props => {
    let rows: JSX.Element[] = [];
    const headerRow = (
        <tr key={'day-header'}>
            <td colSpan={2}>Days Off By Day</td>
        </tr>
    )
    days.map((d, i) => {
        const row = (
            <tr key={d}>
                <td>{d}</td>
                <td>{props.dates.filter(d => d.date.getDay() === i).
                    reduce( (a,b) => a+b.absences.length, 0)}</td>
            </tr>)
        rows.push(row);
    })
    return (
        <table className={'calendar-table'}>
            <thead>
                {headerRow}
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    )
}

const getMonthsTable: React.SFC<{dates: AbsenceDate[]}> = props => {
    let rows: JSX.Element[] = [];
    const headerRow = (
        <tr key={'month-header'}>
            <td colSpan={12}>Days Off By Month</td>
        </tr>
    )
    
    const labelRow = (
        <tr key={'month-labels'}>
            {months.map((m) => {return(<td key={m}>{m}</td>)})}
        </tr>
    );
    const totalsRow =(
        <tr key={'month-totals'}>
            {months.map((m,i) => {return (<td key={m+'-total'}>{props.dates.filter(d => d.date.getMonth() === i)
            .reduce( (a,b) => a+b.absences.length, 0)}</td>);})}
        </tr>
    )
    rows.push(labelRow);
    rows.push(totalsRow);
    return (
        <table className={'calendar-table'}>
            <thead>
                {headerRow}
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    )
}

const getDaysByMonthTable: React.SFC<{dates: AbsenceDate[]}> = props => {
    let tables: JSX.Element [] = [];
    months.map( (m, mi) => {
        const monthDates = props.dates.filter(ad => ad.date.getMonth() === mi);
        let rows: JSX.Element [] = [];
        const header = (<tr key={m}><td colSpan={2}>{m}</td></tr>)
        days.map((d, di) => {
            const row = (
                <tr key={d}>
                    <td>{d}</td>
                    <td>{monthDates.filter(d => d.date.getDay() === di).
                        reduce( (a,b) => a+b.absences.length, 0)}</td>
                </tr>)
            rows.push(row);
        })
        const table = ( 
            <table key={m+'by-day'} className={'calendar-table'}>
                <thead>
                    {header}
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        )

        if (monthDates.length > 0){
            tables.push(table);}
    });
    return (<div>{tables}</div>);
}