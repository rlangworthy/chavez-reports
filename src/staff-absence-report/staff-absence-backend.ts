import * as d3 from 'd3'
import {uniq} from 'ramda'
import {
    compareAsc,
    min,
    max,
    isAfter} from 'date-fns'

import { 
    RawPunchcardRow } from '../shared/file-interfaces'
import { ReportFiles } from '../shared/report-types'
import { 
    punchcardStringToDate } from "../shared/utils";
import {
    StaffPunchTimes,
    StaffPositions,
    StaffDates,
    PunchTimes,
    PunchTime,
    PayCodeDay,
    isPunchTime,
    Absences
    } from '../shared/staff-absence-types'

interface SortedPunchcardRow extends RawPunchcardRow {
    parsedEventDate: Date
}

export const createStaffAbsenceReport = (files: ReportFiles): {punchTimes: StaffPunchTimes, positions: StaffPositions, endDate: Date} => {
        return punchcardParser(files)
}

const punchcardParser = (files: ReportFiles): {punchTimes: StaffPunchTimes, positions: StaffPositions, endDate: Date} => {
    const parse = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    if(parse === null)
    {return {punchTimes:{}, positions:{}, endDate: new Date()}}
    else{
        var endDate = new Date(2018, 8, 3)
        const data = parse.data as RawPunchcardRow[]
        const staffTimes = d3.nest<RawPunchcardRow, PunchTimes>()
                            .key( r => r.PERSONFULLNAME)
                            .rollup(rs => {
                                const absences:Absences = {};
                                //sort dates by earliest, use map to preserve ordering + use date as key
                                const sortedDates = rs.map( (s:RawPunchcardRow):SortedPunchcardRow => {
                                    return {...s, parsedEventDate: punchcardStringToDate(s.EVENTDATE)}}).sort(compareAsc)
                                if(isAfter(sortedDates[sortedDates.length-1].parsedEventDate, endDate)){
                                    console.log('here')
                                    endDate = sortedDates[sortedDates.length-1].parsedEventDate;
                                }
                                const dates = d3.nest<SortedPunchcardRow>()
                                    .key( r => r.parsedEventDate)
                                    .rollup( ks => {
                                        const parsedDate = punchcardDayParser(ks)
                                        if(isPunchTime(parsedDate)){
                                            return parsedDate
                                        }else{
                                            const code = parsedDate.payCode
                                            if(absences[code] !== undefined){
                                                absences[code] = absences[code].concat([parsedDate])
                                            } else {
                                                absences[code]= [parsedDate]
                                            }
                                            return parsedDate
                                        }
                                    }).map(sortedDates);
                                const dateMap: StaffDates = new Map();
                                dates.each((val,key) => {
                                    dateMap.set(new Date(key), val);
                                })
                                return {
                                    name: rs[0].PERSONFULLNAME,
                                    position: rs[0].POSITION,
                                    punchTimes: dateMap,
                                    absences: absences,
                                }
                            }).object(data)
        const positions = d3.nest()
                            .key(r => r.POSITION)
                            .rollup( rs => {
                                return uniq(rs.map(r => r.PERSONFULLNAME))
                            }).object(data)

        return {punchTimes:staffTimes, positions:positions, endDate:endDate}
    }
}

const punchcardDayParser = (events: SortedPunchcardRow[]): PayCodeDay|PunchTime => {
    //single punch-event, either punch in & out or a paycode code
    if(events.length === 1){
        if(events[0].PAYCODENAME !== ''){
            //non-event day, just send it off as a regular day? might need tweaking
            if(parseInt(events[0].HOURS) === 0){
                return {
                    date: punchcardStringToDate(events[0].EVENTDATE),
                    payCode:'REG',
                    halfDay: false,
                    ins:[],
                    outs:[]
                }
            }
            //single pay code event
            const code = events[0].PAYCODENAME.slice(0,3);
            return {
                date: punchcardStringToDate(events[0].EVENTDATE),
                payCode: code,
                halfDay: false,
                ins:[],
                outs:[]
            }
        } else {
            //single in & out for this date
            return {
                in: punchcardStringToDate(events[0].PUNCHDTM), 
                out: events[0].ENDPUNCHDTM === '' ? null: punchcardStringToDate(events[0].ENDPUNCHDTM)
            }
        }
    }else{
        //multiple punch-ins & outs, for use with people who punch out for lunch
        if(events.every( e => e.PAYCODENAME === '')){
            const ins = events.map( e => punchcardStringToDate(e.PUNCHDTM))
            const outs = events.map( e => punchcardStringToDate(e.ENDPUNCHDTM))
            return {
                in: min(...ins),
                out: max(...outs)
            }
        }else if(events.every(e => e.PAYCODENAME === '' ||  
                                    e.PAYCODENAME.slice(0,3) ==='REG' ||
                                    e.PAYCODENAME.slice(0,3) ==='UNS')){
            //adjusted normal work day
            return {
                date: punchcardStringToDate(events[0].EVENTDATE),
                payCode: 'REG',
                halfDay: false,
                ins: events.map(e=>e.PUNCHDTM).filter( e => e!== '').map(e=>punchcardStringToDate(e)),
                outs: events.map(e=>e.ENDPUNCHDTM).filter( e => e!== '').map(e=>punchcardStringToDate(e))
            }
        }else{
            const halfDay = events.some(e => (e.PAYCODENAME === '' || e.PAYCODENAME.slice(0,3) ==='REG') && parseInt(e.HOURS) > 0)
            const codes = events.filter(e=>parseInt(e.HOURS) > 0).map(e => e.PAYCODENAME.slice(0,3)).filter(e => e!=='' && e!=='REG' && e!== 'UNS')
            return {
                date: punchcardStringToDate(events[0].EVENTDATE),
                payCode: codes[0],
                halfDay: halfDay,
                ins: events.map(e=>e.PUNCHDTM).filter( e => e!== '').map(e=>punchcardStringToDate(e)),
                outs: events.map(e=>e.ENDPUNCHDTM).filter( e => e!== '').map(e=>punchcardStringToDate(e))
            }

        }
    }
}
