import * as React from 'react'

import {
    compareAsc,
    differenceInCalendarWeeks,
    format,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameDay,
    isAfter,
    isBefore} from 'date-fns'

import {
    StaffPunchTimes,
    AbsencePaycodes,
    PayCodeDay,
    Absences, } from '../../shared/staff-absence-types';
import {
    SY_CURRENT} from '../../shared/initial-school-dates'

import {Chart} from 'react-google-charts'
import { start } from 'repl';
import { sort } from 'ramda';


interface RollingAttendanceProps {
    absenceData: StaffPunchTimes
    staffNames: string[]
    dates: Date[]
    codes: string[]
}

export const RollingAttendanceGraph: React.FunctionComponent<RollingAttendanceProps> = (props) => {
    var totalAbsences: PayCodeDay[] = []
    const names = props.staffNames.length===0 ? Object.keys(props.absenceData) : props.staffNames;
    const codes = props.codes.length===0 ? AbsencePaycodes : props.codes;
    names.forEach( name => {
        if(props.absenceData[name]!== undefined){
            codes.forEach(code => {
                if(props.absenceData[name].absences[code]!== undefined){
                    totalAbsences = totalAbsences.concat(props.absenceData[name].absences[code])
                }
            })
        }
    })
   
    if(totalAbsences.length == 0){
        return <></>
    }
    const sortedAbsences = totalAbsences.sort((a,b) => compareAsc(a.date, b.date))
    const sortedDates = props.dates.sort((a,b) => compareAsc(a, b))
    let weekStart = startOfWeek(sortedDates[0])
    let week = 1
    let data:any = [['Week', 'Rolling Attendance Percent']]
    let cumAbs = 0
    let absOffset = 0
    //catch absences up to start date
    while(isBefore(sortedAbsences[absOffset].date, sortedDates[0])){
        absOffset++
    }

    for( let i = 0; i < sortedDates.length; i++){
        if(isAfter(sortedDates[i], endOfWeek(weekStart))){
            //Insert logic for running absence pct, increase week
            data.push([week, 100*((i * names.length)-cumAbs)/(i * names.length)])
            weekStart = addDays(endOfWeek(weekStart),1)
            week++;
        }
        
        while((sortedAbsences[cumAbs+absOffset] && isSameDay(sortedAbsences[cumAbs+absOffset].date, sortedDates[i]))
            || (sortedAbsences[cumAbs+absOffset] && isBefore(sortedAbsences[cumAbs+absOffset].date, sortedDates[i]))){
            cumAbs++;
        }
    }
    const minAttendance = Math.min(...data.slice(1).map(x => x[1]))
    const options = {
        vAxis: {title: 'Attendance Percent', minValue: minAttendance-2, maxValue: 100},
        hAxis: {title: 'Week', minValue: 0, maxValue: data.length-1},
        legend: 'none',
        trendlines: {
            0: {
            type: "polynomial",
            degree: 6,
            visibleInLegend: false,
            labelInLegend: "Trend",
            },
        }     
    }
    
    return (
    <>
        <h5 style={{marginTop:'25px'}}>Rolling Attendance Graph</h5>
        <Chart
            chartType='ScatterChart'
            width="100%"
            data={data}
            options={options}
        />
    </>
    )
}