import * as React from 'react'

import {
    differenceInCalendarWeeks,
    format,
    startOfWeek,
    endOfWeek,
    getDay} from 'date-fns'

import {
    StaffPunchTimes,
    PunchTimes,
    AbsencePaycodes,
    PunchTime,} from '../../shared/staff-absence-types';
import {
    defaultStartDay1819} from '../../shared/initial-school-dates'

interface AbsenceTotalsProps{
    absenceData: StaffPunchTimes
    staffNames: string[]
    codes: string[]
    dates: Date[]
}

interface TotalDisplayProps {
    totalAbsences: {[code:string]:Date[]}
}

export const AbsenceTotals: React.SFC<AbsenceTotalsProps> = (props) => {
    const totalAbsences: {[code:string]:Date[]} = {}
    const names = props.staffNames.length===0 ? Object.keys(props.absenceData) : props.staffNames;
    const codes = props.codes.length===0 ? AbsencePaycodes : props.codes;
    names.forEach( name => {
        if(props.absenceData[name]!== undefined){
            codes.forEach(code => {
                if(props.absenceData[name].absences[code]!== undefined){
                    totalAbsences[code] ? 
                    totalAbsences[code]= totalAbsences[code].concat(props.absenceData[name].absences[code]):
                    totalAbsences[code] = props.absenceData[name].absences[code]
                }
            })
        }
    })

    return (
        <>
            <TotalsByDay totalAbsences={totalAbsences}/>
            <TotalsByMonth totalAbsences={totalAbsences}/>
            <TotalsByWeek totalAbsences={totalAbsences}/>
        </>
    )
}


const TotalsByDay: React.SFC<TotalDisplayProps> = (props) => {
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
    let rows:JSX.Element[] = [];
    const OT = new Array(5).fill(0)
    //really simple, each code has an array of numbers for each day of the week
    Object.keys(props.totalAbsences).forEach((code)=>{
        const totals = getTotalDatesBy(props.totalAbsences[code], 'day');
        OT.map( (a,i) => OT[i] = a + totals[i])
        const row = (
            <tr key={code}>
                <td>{code}</td>
                <td>{totals[0]}</td>
                <td>{totals[1]}</td>
                <td>{totals[2]}</td>
                <td>{totals[3]}</td>
                <td>{totals[4]}</td>
            </tr>
        )
        rows.push(row);
    })
    const totalRow = (
        <tr key='total'>
                <td>Total</td>
                <td>{OT[0]}</td>
                <td>{OT[1]}</td>
                <td>{OT[2]}</td>
                <td>{OT[3]}</td>
                <td>{OT[4]}</td>
        </tr>
    )
    rows.push(totalRow)

    return (
        <>
            <h5>Absences By Day</h5>
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

const TotalsByMonth: React.SFC<TotalDisplayProps> = (props) => {
    
    const headRow = (
        <tr key={'Absences Header'}>
          <th>Pay Code</th>
          <th>Aug</th>
          <th>Sep</th>
          <th>Oct</th>
          <th>Nov</th>
          <th>Dec</th>
          <th>Jan</th>
          <th>Feb</th>
          <th>Mar</th>
          <th>Apr</th>
          <th>May</th>
          <th>Jun</th>
          <th>Jul</th>
        </tr>
    );
    let rows:JSX.Element[] = [];
    //really simple, each code has an array of numbers for each day of the week
    const OT:number[] = new Array(12).fill(0)
    Object.keys(props.totalAbsences).forEach((code)=>{
        const totals = getTotalDatesBy(props.totalAbsences[code], 'month');
        OT.map( (a,i) => OT[i] = a + totals[i])
        const row = (
            <tr key={code}>
                <td>{code}</td>
                <td>{totals[(0+7)%12]}</td>
                <td>{totals[(1+7)%12]}</td>
                <td>{totals[(2+7)%12]}</td>
                <td>{totals[(3+7)%12]}</td>
                <td>{totals[(4+7)%12]}</td>
                <td>{totals[(5+7)%12]}</td>
                <td>{totals[(6+7)%12]}</td>
                <td>{totals[(7+7)%12]}</td>
                <td>{totals[(8+7)%12]}</td>
                <td>{totals[(9+7)%12]}</td>
                <td>{totals[(10+7)%12]}</td>
                <td>{totals[(11+7)%12]}</td>
            </tr>
        )
        rows.push(row);
    })
    const totalRow = (
        <tr key='total'>
                <td>Total</td>
                <td>{OT[7]}</td>
                <td>{OT[8]}</td>
                <td>{OT[9]}</td>
                <td>{OT[10]}</td>
                <td>{OT[11]}</td>
                <td>{OT[0]}</td>
                <td>{OT[1]}</td>
                <td>{OT[2]}</td>
                <td>{OT[3]}</td>
                <td>{OT[4]}</td>
                <td>{OT[5]}</td>
                <td>{OT[6]}</td>
        </tr>
    )
    rows.push(totalRow)
    

    return (
        <>
            <h5>Absences By Month</h5>
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

const TotalsByWeek: React.SFC<TotalDisplayProps> = (props) => {
    
    const headRow = (
        <tr key='absences-header'>
            <th>Week #</th>
            <th>Pay Code</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
        </tr>
    )
    const byWeek:{[week: number]:{[code:string]:Date[]}} ={}
    Object.keys(props.totalAbsences).forEach(code => {
        const dates= props.totalAbsences[code]
        dates.forEach( date =>{
            const week = differenceInCalendarWeeks(date, defaultStartDay1819)
            if(byWeek[week] === undefined ){
                byWeek[week] = {[code]: [date]}
            } else if(byWeek[week][code] === undefined){
                byWeek[week][code] = [date]
            }else {
                byWeek[week][code] = byWeek[week][code].concat([date])
            }
        })
    })
    const rows: JSX.Element[] = []
    Object.keys(byWeek).map(a=>parseInt(a)).sort((a,b) => a-b).forEach( k => {
        const OT = new Array(5).fill(0);
        var c = 0;
        Object.keys(props.totalAbsences).forEach( (code) => {
            if(byWeek[k][code]!==undefined){
                const totals = getTotalDatesBy(byWeek[k][code], 'day');
                OT.map( (a,j) => OT[j] = a + totals[j])
                const row=(
                    <tr key={code+k}>
                        {c===0 ? <td rowSpan={Object.keys(byWeek[k]).length + 1}
                                     className='index-column'>
                                    {k + format(startOfWeek(byWeek[k][code][0]), ' (D/M-') + 
                                    format(endOfWeek(byWeek[k][code][0]), 'D/M)')}
                                </td>:null}
                        <td>{code}</td>
                        <td>{totals[0]}</td>
                        <td>{totals[1]}</td>
                        <td>{totals[2]}</td>
                        <td>{totals[3]}</td>
                        <td>{totals[4]}</td>
                    </tr>
                )
                rows.push(row)
                c=c+1;
            }
        })
        rows.push(
            <tr key={'total'+k}>
                    <td className='index-column'>Total</td>
                    <td>{OT[0]}</td>
                    <td>{OT[1]}</td>
                    <td>{OT[2]}</td>
                    <td>{OT[3]}</td>
                    <td>{OT[4]}</td>
            </tr>
        );
    })
    return (
        <>
            <h5>Absences By Week</h5>
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

const getTotalDatesBy = (dates: Date[], by: 'day' | 'month'):number[] => {
    let ret:number[] = []
    switch(by) {
        case 'day':
            ret = [0,0,0,0,0]
            dates.forEach( d=> {
                const day = d.getDay()
                if(ret[day-1]!==undefined){
                    ret[day-1] = ret[day-1]+1
                }
            })
            return ret;
        case 'month':
            ret = [0,0,0,0,0,0,0,0,0,0,0,0];
            dates.forEach( d=> {
                const month = d.getMonth()
                if(ret[month]!==undefined){
                    ret[month] = ret[month]+1
                }
            })
            return ret; 
        default:
            throw new Error('invalid date grouping')
    }
}