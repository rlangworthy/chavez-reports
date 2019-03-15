import * as d3 from 'd3'
import { 
    RawFileParse, } from "../shared/file-types";

import { RawStaffAbsenceRow } from '../shared/file-interfaces'

import { ReportFiles } from '../shared/report-types'

import { 
    stringToDate } from "../shared/utils";

import {
    PayCodeKeys,
    StaffAbsence,
    AbsenceDate
    } from '../shared/staff-absence-types'


export const createStaffAbsenceReport = (files: ReportFiles): {absences: StaffAbsence[], dates: AbsenceDate[]} => {

        return getStaffAbsences(files.reportFiles[files.reportTitle.files[0].fileDesc]);
}

const getStaffAbsences = (parse: RawFileParse): any =>  {
    if (parse.parseResult === null){return {}}
    const rawData = (parse.parseResult.data as RawStaffAbsenceRow[]).filter( r => r.PAYCODENAME !== null && 
        PayCodeKeys.includes(r.PAYCODENAME.substring(0,3)));
    const staffAbsenceObject = d3.nest<RawStaffAbsenceRow, StaffAbsence>()
                                .key( r => r.Emplid.toString())
                                .rollup( rs => {
                                    
                                    return {
                                        name: rs[0].Name,
                                        position: rs[0].Position,
                                        absences: {
                                            'VAC': rs.filter(r => r.PAYCODENAME !== null && r.PAYCODENAME.substring(0,3)==='VAC')
                                                .map( r => {return stringToDate(r.Date)}),
                                            'BRV': rs.filter(r => r.PAYCODENAME !== null && r.PAYCODENAME.substring(0,3)==='BRV')
                                            .map( r => {return stringToDate(r.Date)}),
                                            'CRT':rs.filter(r => r.PAYCODENAME !== null && r.PAYCODENAME.substring(0,3)==='CRT')
                                            .map( r => {return stringToDate(r.Date)}),
                                            'EXC':rs.filter(r => r.PAYCODENAME !== null && r.PAYCODENAME.substring(0,3)==='EXC')
                                            .map( r => {return stringToDate(r.Date)}),
                                            'PBD':rs.filter(r => r.PAYCODENAME !== null && r.PAYCODENAME.substring(0,3)==='PBD')
                                            .map( r => {return stringToDate(r.Date)}),
                                            'SCG':rs.filter(r => r.PAYCODENAME !== null && r.PAYCODENAME.substring(0,3)==='SCG')
                                            .map( r => {return stringToDate(r.Date)}),
                                            'SCK':rs.filter(r => r.PAYCODENAME !== null && r.PAYCODENAME.substring(0,3)==='SCK')
                                            .map( r => {return stringToDate(r.Date)}),
                                            'SCU':rs.filter(r => r.PAYCODENAME !== null && r.PAYCODENAME.substring(0,3)==='SCU')
                                            .map( r => {return stringToDate(r.Date)}),
                                        }
                                    }
                                }).object(rawData);                   
    const staffAbsences = Object.keys(staffAbsenceObject).map( k =>{
        return staffAbsenceObject[k];
    })

    const absenceDateObject = d3.nest<RawStaffAbsenceRow, AbsenceDate>()
                                .key( r => r.Date)
                                .rollup( rs => {

                                    return {
                                        date: stringToDate(rs[0].Date),
                                        absences: rs.map( r => {return {name: r.Name, 
                                            code: (r.PAYCODENAME != null) ? r.PAYCODENAME.substring(0,3): '',
                                            position: r.Position}})
                                    }

                                }).object(rawData);
    const absenceDates = Object.keys(absenceDateObject).map( k =>{
                                    return absenceDateObject[k];
                                })
    
                                          
    return {absences: staffAbsences, dates: absenceDates};

}

