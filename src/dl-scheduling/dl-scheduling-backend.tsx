import * as React from 'react';
import { ReportFiles } from '../shared/report-types'
import {unparse} from 'papaparse'

import {
    RawStudentSpecialEdInstructionRow,
    RawStudentParaprofessionalMinutesRow,
    } from '../shared/file-interfaces'

import {
    info_columns,
    final_columns,
    display_info
    } from './dl-scheduling-constants'

interface DLSchedulingProps {
    reportFiles?: ReportFiles
}

interface DLSchedulingState {
    dlAide: string
}

export class DLSchedulingReport extends React.PureComponent<DLSchedulingProps, DLSchedulingState> {

    componentWillMount(){
        if(this.props.reportFiles){
            console.log(createDLScheduleDoc(this.props.reportFiles))
            this.setState({
                dlAide: unparse(createDLScheduleDoc(this.props.reportFiles))
            })
        }
    }
    render(): React.ReactNode {
        const file = new File([this.state.dlAide], 'dl_sheet.csv', {
            type: 'text/plain',
            })

        function download() {
            const link = document.createElement('a')
            const url = URL.createObjectURL(file)
            
            link.href = url
            link.download = file.name
            document.body.appendChild(link)
            link.click()
            
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }
        download()
       return <></>
    }
}

const createDLScheduleDoc = (files: ReportFiles):{[key:string]:string}[] => {
    const sped = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult ? 
        files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult?.data as RawStudentSpecialEdInstructionRow[] : []
    const aide = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult ? 
        files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult?.data as RawStudentParaprofessionalMinutesRow[] : []

    /*
    Clear unused columns for sped and aide
    Create a boolean for each column defaulting to true
    check each row for vaild input in each true column
    if a valid input exists change column to false
    go through and remove columns
    Takes a key (studentID in this case) to index object to make merging easy later
    */
    const dropUnusedColumns = (array: {[key: string]: string}[], keyCol: string): {[key: string]:{[key: string]: string}} => {
        const usedColumns = {}
        Object.keys(array[0]).forEach(key => {usedColumns[key] = false})
        array.forEach(row => {
            Object.keys(row).forEach(key => {
                if(!usedColumns[key]){
                    if(row[key] != '0' && row[key] != '##' && row[key] != '' && row[key] != ' '){
                        usedColumns[key] = true
                    }
                }
            })
        })
        const newKeys: string[] = Object.keys(usedColumns).filter(k => usedColumns[k])
        const newArray: {[key: string]: {[key: string]: string}} = {}
        array.forEach(row => {
            newArray[row[keyCol]] = newKeys.reduce((obj, key) => {
                obj[key] = row[key]
                return obj
            }, {} as {[key: string]: string})
        })
        return newArray
    }

    const filteredSped = dropUnusedColumns(sped.filter(row => row.PDIS !== '--') as {[key: string]:any}[], 'Student ID')
    const filteredAide = dropUnusedColumns(aide.filter(row => row.PDIS !== '--') as {[key: string]:any}[], 'Student ID')

    const joinedMinutes:{[key:string]: string}[] = []
    console.log(filteredSped)
    console.log(filteredAide)
    //create joined sped & aide rows
    Object.keys(filteredSped).forEach(studentID => {
        const combinedStudent = {}
        display_info.forEach( key => {
            if(filteredSped[studentID][key]){
                combinedStudent[key] = filteredSped[studentID][key]
            }
        })
        final_columns.forEach(key => {
            if(filteredSped[studentID][key]){
                combinedStudent[key] = filteredSped[studentID][key]
            } else if(filteredAide[studentID] && filteredAide[studentID][key]){
                combinedStudent[key] = filteredAide[studentID][key]
            }
        })
        

        joinedMinutes.push(combinedStudent)
    })
    return joinedMinutes
}