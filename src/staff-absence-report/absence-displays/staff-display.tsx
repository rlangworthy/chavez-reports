import * as React from 'react';
import {
    differenceInCalendarWeeks,
    format,
    startOfWeek,
    endOfWeek,
    isSameDay,
    min,
    max,
    isValid,
    } from 'date-fns'

import {
    StaffPunchTimes,
    PunchTimes,
    AbsencePaycodes,
    PunchTime,
    PayCodeDay,
    isPunchTime} from '../../shared/staff-absence-types';

import {
    isTardy } from '../../shared/utils'
import {
    SY_CURRENT} from '../../shared/initial-school-dates'

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
    startDate: Date
}


export class StaffDisplayContainer extends React.PureComponent<StaffDisplayContainerProps> {

    render(){
        const punchTimes=this.props.absenceData
        const startDate=min(...this.props.dates)
        return (
            <>
                {Object.keys(punchTimes)
                    .map( name => {
                        const visibility = this.props.staffNames.length > 0 ? this.props.staffNames.includes(name): true
                        return (<SingleAbsenceReport 
                            visibility={visibility}
                            absences={punchTimes[name]} 
                            codes={this.props.codes} 
                            key={name}
                            startDate={startDate}/>)
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
    const visibility = (codes.length > 0 && props.visibility) || (props.visibility && props.absences.attDays && props.absences.tardies)
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
        var nInLate = 0;
        var nOutEarly = 0;
        props.absences.tardies.forEach( p => {
            if(props.absences.startTime && props.absences.endTime && isPunchTime(p)){
                const [inLate, outEarly] = isTardy(props.absences.startTime, props.absences.endTime, p.in, p.out)
                nInLate += inLate? 1 : 0
                nOutEarly +=outEarly? 1 : 0
            }
        })
        const codeDays = dates.filter(date => props.absences.attDays ? props.absences.attDays.some(attDay => isSameDay(date.date, attDay) ): false)
        const nCodes = codeDays.reduce((a,b) => a + (b.halfDay ? .5: 1),0);
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
                out={props.absences.endTime}
                startDate={props.startDate}/>:null}
        </div>
    )
}

const TardiesTable: React.SFC<{tardies: Map<Date, PayCodeDay | PunchTime>, in:number, out:number, startDate:Date}> = (props)=> {
    const startDate = props.startDate
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
    let tardiesByWeek: {[week:number]: {date: Date, punchTime: PayCodeDay | PunchTime}[]} = {}
    props.tardies.forEach((val, key)=>{
        const week = differenceInCalendarWeeks(key,startDate) +1
        if(tardiesByWeek[week]!== undefined){
            tardiesByWeek[week]=tardiesByWeek[week].concat([{date:new Date(key), punchTime:val}])
        } else{
            tardiesByWeek[week]=[{date: new Date(key), punchTime:val}]
        }
    })
    const getTardyCells = (week: {date: Date, punchTime: PayCodeDay | PunchTime}[]) =>{
        return [...Array(5).keys()].map(i => {
            const day = week.filter(r=>r.date.getDay()===i+1)
            if(day.length > 0){
                const hold = day[0].punchTime
                if(isPunchTime(hold)){
                    const [inLate, leftEarly] = isTardy(props.in, props.out, hold.in, hold.out)
                    return (
                        <React.Fragment key={i}>
                            <td className={`${inLate ? 'tardy-cell-bad':''}`}>{format(hold.in, 'hh:mm')}</td>
                            <td className={`${leftEarly ? 'tardy-cell-bad':''}`}>
                                {hold.out ? format(hold.out, 'hh:mm'): 'N/A'}
                            </td>
                        </React.Fragment>
                    )
                }
                //logic for pay codes and missing swipes
                else{
                    const inTime = isValid(min(...hold.ins)) ? min(...hold.ins) : null
                    const outTime = isValid(max(...hold.outs)) ? max(...hold.outs): null
                    console.log(outTime)
                    const[inLate, leftEarly]= isTardy(props.in, props.out, inTime, outTime)
                    const paycode = hold.payCode
                    if(!inLate && !leftEarly){
                        return (
                        <React.Fragment key={i}>
                            <td colSpan={2} className='tardy-cell-reg'>REG Paycode</td>
                        </React.Fragment>
                        )
                    }
                    else {
                        return (
                            <React.Fragment key={i}>
                                <td className={`${inLate ? 'tardy-cell-bad':'tardy-cell-reg'}`}> {inTime ? format(inTime, 'hh:mm'): "REG"}</td>
                                <td className={`${leftEarly ? 'tardy-cell-bad':'tardy-cell-reg'}`}>
                                    {outTime ? format(outTime, 'hh:mm'): 'REG'}
                                </td>
                            </React.Fragment>)
                    }
                }
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
    Object.keys(tardiesByWeek).forEach( k => {
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