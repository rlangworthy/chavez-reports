import * as d3 from 'd3'
import {uniq} from 'ramda'
import {compareAsc} from 'date-fns'

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
    } from '../shared/staff-absence-types'

interface SortedPunchcardRow extends RawPunchcardRow {
    parsedEventDate: Date
}

export const createStaffAbsenceReport = (files: ReportFiles): {punchTimes: StaffPunchTimes, positions: StaffPositions} => {
        return punchcardParser(files)
}

const punchcardParser = (files: ReportFiles): {punchTimes: StaffPunchTimes, positions: StaffPositions} => {
    const parse = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult
    if(parse === null)
    {return {punchTimes:{}, positions:{}}}else{
        const data = parse.data as RawPunchcardRow[]
        const staffTimes = d3.nest<RawPunchcardRow, PunchTimes>()
                            .key( r => r.PERSONFULLNAME)
                            .rollup(rs => {
                                const absences:{[code:string]:Date[]} = {};
                                //sort dates by earliest, use map to preserve ordering + use date as key
                                const dates = d3.nest<SortedPunchcardRow>()
                                    .key( r => r.parsedEventDate)
                                    .rollup( ks => {
                                        return ks.map( r=> {
                                            if(r.PAYCODENAME !== ''){
                                                const code = r.PAYCODENAME.slice(0,3);
                                                if(absences[code] !== undefined){
                                                    absences[code] = absences[code].concat([punchcardStringToDate(r.EVENTDATE)])
                                                } else {
                                                    absences[code]= [punchcardStringToDate(r.EVENTDATE)]
                                                }
                                                return r.PAYCODENAME.slice(0,3)
                                            }else{
                                                return {
                                                    in: punchcardStringToDate(r.PUNCHDTM), 
                                                    out: r.ENDPUNCHDTM === '' ? null: punchcardStringToDate(r.ENDPUNCHDTM)
                                                }
                                            }
                                        })
                                    }).map(rs.map( (s:RawPunchcardRow):SortedPunchcardRow => {
                                    return {...s, parsedEventDate: punchcardStringToDate(s.EVENTDATE)}}).sort(compareAsc));
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

        return {punchTimes:staffTimes, positions:positions}
    }
}

