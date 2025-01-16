import * as React from 'react';
import { ReportFiles } from '../shared/report-types'
import {unparse} from 'papaparse'

import {
    isNumeric
    } from '../shared/utils'

import {
    RawStudentSpecialEdInstructionRow,
    RawStudentParaprofessionalMinutesRow,
    } from '../shared/file-interfaces'

import {
    info_columns,
    final_columns,
    display_info,
    drop_columns
    } from './dl-scheduling-constants'
//1/10/25
interface DLSchedulingProps {
    reportFiles?: ReportFiles
}

interface DLSchedulingState {
    dlAide: string
}

export class DLSchedulingReport extends React.PureComponent<DLSchedulingProps, DLSchedulingState> {

    componentWillMount(){
        if(this.props.reportFiles){
            const doc = createDLScheduleDoc(this.props.reportFiles)
            console.log(doc)
            this.setState({
                dlAide: unparse(doc)
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
    Return list of used keys to simplify final sheet creation
    */
    const dropUnusedColumns = (array: {[key: string]: string}[], keyCol: string): [{[key: string]:{[key: string]: string}}, string[]] => {
        const usedColumns = {}
        Object.keys(array[0]).forEach(key => {usedColumns[key] = false})
        array.forEach(row => {
            Object.keys(row).forEach(key => {
                if(!usedColumns[key]){
                    if(row[key] !== '0' && row[key] !== '##' && row[key] !== '' && row[key] !== ' '){
                        usedColumns[key] = true
                    }
                }
            })
        })
        const newKeys: string[] = Object.keys(usedColumns).filter(k => usedColumns[k] && !drop_columns.includes(k))
        const newArray: {[key: string]: {[key: string]: string}} = {}
        array.forEach(row => {
            newArray[row[keyCol]] = newKeys.reduce((obj, key) => {
                obj[key] = row[key]
                return obj
            }, {} as {[key: string]: string})
        })
        return [newArray, newKeys]
    }

    const [filteredSped, spedKeys] = dropUnusedColumns(sped.filter(row => row.PDIS !== '--') as {[key: string]:any}[], 'Student ID')
    const [filteredAide, aideKeys] = dropUnusedColumns(aide.filter(row => row.PDIS !== '--') as {[key: string]:any}[], 'Student ID')

    const finalUsedColumns = final_columns.filter(value => spedKeys.includes(value) || aideKeys.includes(value))
    const joinedMinutes:{[key:string]: string}[] = []
    //create joined sped & aide rows, ordered sped keys for student ID's
    
    const parseGrade = (a): Number => {
        if(a === 'K'){
            return 0
        }
        if(a === 'PK'){
            return -1
        }
        return parseInt(a)
    }

    Object.keys(filteredSped)
    .sort((a,b) => {
        if(filteredSped[a].Grade !== filteredSped[b].Grade){
            
            return parseGrade(filteredSped[a].Grade) > parseGrade(filteredSped[b].Grade) ? -1:1
        }
        return parseInt(filteredSped[a]['ARS']) < parseInt(filteredSped[b]['ARS']) ? -1:1
    })
    .forEach(studentID => {
        //remove students with no assigned minutes
        // this doc is for scheduling and they have nothing to schedule
        // Could be done earlier for efficiency, shouldn't be an issue
        if(filteredSped[studentID]['ARS'] === '0' || 
                filteredSped[studentID]['ARS'] === '##'){
                    return
                }
        const combinedStudent = {}
        display_info.forEach( key => {
            
            if(filteredSped[studentID][key]){
                combinedStudent[key] = filteredSped[studentID][key]
            }
            //ELL code remove N/A values
            if(combinedStudent[key] === 'N/A' || 
                combinedStudent[key] ==='0' || 
                combinedStudent[key]==='##'){
                combinedStudent[key] = ''
            }
        })
        finalUsedColumns.forEach(key => {
            if(filteredSped[studentID][key]){
                combinedStudent[key] = filteredSped[studentID][key]
            }else if((filteredAide[studentID]) && (filteredAide[studentID][key])){
                combinedStudent[key] = filteredAide[studentID][key]
            } else {
                combinedStudent[key] = ''
            }
            //remove ## values and 0's for consistency
            if(combinedStudent[key] === '##' ||
                combinedStudent[key] ==='0')
            {
                combinedStudent[key] = ''
            }
            if(isNumeric(combinedStudent[key])){
                combinedStudent[key] = (parseInt(combinedStudent[key])/5).toString()
            }
            
        })
        joinedMinutes.push({...combinedStudent})
    })
    


    return joinedMinutes
}