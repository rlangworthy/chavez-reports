import * as React from 'react';
import {
    differenceInCalendarWeeks,
    format,
    startOfWeek,
    endOfWeek,
    isDate} from 'date-fns'

import {
    StaffPunchTimes,
    PunchTimes,
    AbsencePaycodes,
    PunchTime,
    PayCodeDay,} from '../../shared/staff-absence-types';

import {
    isTardy } from '../../shared/utils'
import {
    defaultStartDay1819} from '../../shared/initial-school-dates'

import './staff-display.css'

interface StaffDisplayContainerProps {
    absenceData: StaffPunchTimes
    staffNames: string[]
    codes: string[]
    dates: Date[]
}

interface SingleAbsenceReportProps {
    absences: PunchTimes
    visibility: boolean
    codes: string[]
}


export class StaffDisplayContainer extends React.PureComponent<StaffDisplayContainerProps> {

    render(){
        const punchTimes=this.props.absenceData
        return (
            <>
                {Object.keys(punchTimes)
                    .map( name => {
                        const visibility = this.props.staffNames.length > 0 ? this.props.staffNames.includes(name): true
                        return (<SingleAbsenceReport 
                            visibility={visibility}
                            absences={punchTimes[name]} 
                            codes={this.props.codes} 
                            key={name}/>)
                    })}
            </>
        );
    }
}

const SingleAbsenceReport: React.SFC<SingleAbsenceReportProps> = props => {
    /* tslint:disable-next-line:prefer-const */
    let rows: JSX.Element[] = [];
    const codes = props.codes.length > 0 ? 
        props.codes.filter(k=> Object.keys(props.absences.absences).includes(k)) : 
        Object.keys(props.absences.absences).filter(k=> AbsencePaycodes.includes(k))
    const visibility = codes.length > 0 && props.visibility
    const headRow = (
        <tr key={'Absences Header'}>
          <th>Pay Code</th>
          <th>Monday</th>
          <th>Tuesday</th>
          <th>Wednesday</th>
          <th>Thursday</th>
          <th>Friday</th>
        </tr>
    );
    const getDays = (dates: Date[]): string => {
        const str = dates.map(d => d.toDateString().slice(3)).join(',')
        return str;
    }

    const getAbsenceDay = (pc : PayCodeDay) : string => {
        return pc.date.toDateString().slice(3) + (pc.halfDay ? '(1/2)':'')
    }

    var dates: PayCodeDay[] = []
    var stats = ''
    codes.forEach(code => {
        dates = dates.concat(props.absences.absences[code]);
        const row = (
            <tr key={code}>
                <td className='index-column'>{code}</td>
                <td>{props.absences.absences[code].filter( r => r.date.getDay()===1).map(getAbsenceDay).join(',')}</td>
                <td>{props.absences.absences[code].filter( r => r.date.getDay()===2).map(getAbsenceDay).join(',')}</td>
                <td>{props.absences.absences[code].filter( r => r.date.getDay()===3).map(getAbsenceDay).join(',')}</td>
                <td>{props.absences.absences[code].filter( r => r.date.getDay()===4).map(getAbsenceDay).join(',')}</td>
                <td>{props.absences.absences[code].filter( r => r.date.getDay()===5).map(getAbsenceDay).join(',')}</td>
            </tr>
        );
        rows.push(row);
    });
    
    if(props.absences.attDays && props.absences.tardies){
        var nUnx = 0
        var unxDates:Date[] = []
        const wasHere:{[date: string]: boolean} = {}
        props.absences.punchTimes.forEach( (val, key) => wasHere[key.toString()]=true)
        props.absences.attDays.forEach( d => {
            if(!wasHere[d.toString()]){
                nUnx = nUnx + 1;
                unxDates.push(d)
            }else{
            }
        })
        if(nUnx > 0){
            rows.push(
                (<tr key='unexcused'>
                    <td className='index-column'>Unexcused</td>
                    <td>{getDays(unxDates.filter( r => r.getDay()===1))}</td>
                    <td>{getDays(unxDates.filter( r => r.getDay()===2))}</td>
                    <td>{getDays(unxDates.filter( r => r.getDay()===3))}</td>
                    <td>{getDays(unxDates.filter( r => r.getDay()===4))}</td>
                    <td>{getDays(unxDates.filter( r => r.getDay()===5))}</td>
                </tr>))
        }
        
        const nDays = props.absences.attDays.length;
        const nTardies = props.absences.tardies.size;
        var nInLate = 0;
        var nOutEarly = 0;
        props.absences.tardies.forEach( p => {
            if(props.absences.startTime && props.absences.endTime){
                const [inLate, outEarly] = isTardy(props.absences.startTime, props.absences.endTime, p.in, p.out)
                nInLate += inLate? 1 : 0
                nOutEarly +=outEarly? 1 : 0
            }
        })
        const nCodes = dates.reduce((a,b) => a + (b.halfDay ? .5: 1),0);
        stats = ((nDays-nCodes)*100/nDays).toFixed(2) + '% Attendance, ' 
            + ((nDays-nInLate)*100/nDays).toFixed(2) + '% In On Time, '
            + ((nDays-nOutEarly)*100/nDays).toFixed(2) + '% Out On Time'
    }

    const totalRow = (
        <tr key='totals'>
            <td className='index-column'>Total</td>
            <td>{dates.filter( r => r.date.getDay()===1).reduce( (a,b) => {return a + (b.halfDay ? .5 : 1)},0 )}</td>
            <td>{dates.filter( r => r.date.getDay()===2).reduce( (a,b) => {return a + (b.halfDay ? .5 : 1)},0 )}</td>
            <td>{dates.filter( r => r.date.getDay()===3).reduce( (a,b) => {return a + (b.halfDay ? .5 : 1)},0 )}</td>
            <td>{dates.filter( r => r.date.getDay()===4).reduce( (a,b) => {return a + (b.halfDay ? .5 : 1)},0 )}</td>
            <td>{dates.filter( r => r.date.getDay()===5).reduce( (a,b) => {return a + (b.halfDay ? .5 : 1)},0 )}</td>
        </tr>
    );
    rows.push(totalRow);
    
    return (
        <div id={props.absences.name} className={`single-staff-absence-report ${visibility? '':'staff-display-hidden'}`}>
            <h4>{props.absences.name}</h4>
            <span className='single-staff-absence-stats'>{stats}</span>
            <table className={'data-table'}>
                <thead>
                    {headRow}
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            {props.absences.tardies && props.absences.startTime && props.absences.endTime? <TardiesTable 
                tardies={props.absences.tardies}
                in={props.absences.startTime}
                out={props.absences.endTime}/>:null}
        </div>
    )
}

const TardiesTable: React.SFC<{tardies: Map<Date, PunchTime>, in:number, out:number}> = (props)=> {
    const startDate = defaultStartDay1819
    const headRow = (
        <tr key={'Absences Header'}>
          <th>Week Number</th>
          <th colSpan={2} >Monday</th>
          <th colSpan={2}>Tuesday</th>
          <th colSpan={2}>Wednesday</th>
          <th colSpan={2}>Thursday</th>
          <th colSpan={2}>Friday</th>
        </tr>
    );
    let rows:JSX.Element[] = [];
    let tardiesByWeek: {[week:number]: {date: Date, punchTime: PunchTime}[]} = {}
    props.tardies.forEach((val, key)=>{
        const week = differenceInCalendarWeeks(key,startDate)
        if(tardiesByWeek[week]!== undefined){
            tardiesByWeek[week]=tardiesByWeek[week].concat([{date:new Date(key), punchTime:val}])
        } else{
            tardiesByWeek[week]=[{date: new Date(key), punchTime:val}]
        }
    })
    const getTardyCells = (week: {date: Date, punchTime: PunchTime}[]) =>{
        return [...Array(5).keys()].map(i => {
            const day = week.filter(r=>r.date.getDay()===i+1)
            if(day.length > 0){
                const [inLate, leftEarly] = isTardy(props.in, props.out, day[0].punchTime.in, day[0].punchTime.out)
                return (
                    <React.Fragment key={i}>
                        <td className={`${inLate ? 'tardy-cell-bad':''}`}>{format(day[0].punchTime.in, 'hh:mm')}</td>
                        <td className={`${leftEarly ? 'tardy-cell-bad':''}`}>
                            {day[0].punchTime.out ? format(day[0].punchTime.out, 'hh:mm'): 'N/A'}
                        </td>
                    </React.Fragment>
                )
            }else{
                return (
                    <React.Fragment key={i}>
                        <td className='tardy-cell-good'>-</td>
                        <td className='tardy-cell-good'>-</td>
                    </React.Fragment>
                )
            }
        })
    }
    Object.keys(tardiesByWeek).map( k => {
        const d:Date = tardiesByWeek[k][0].date;
        if(tardiesByWeek[k].length !== 1 || d.getDay()!==6){
            const index:string = k + format(startOfWeek(d), ' (M/D-') + format(endOfWeek(d), 'M/D)')
            const row = (
            <tr key={k}>
                <td className='index-column'>{index}</td>
                {getTardyCells(tardiesByWeek[k])}
            </tr>
        )
        rows.push(row);
        }
    })
    
    return(
        <>
            <h5>Tardies</h5>
            <table className={'data-table'}>
                <thead>
                    {headRow}
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </>
    )
}