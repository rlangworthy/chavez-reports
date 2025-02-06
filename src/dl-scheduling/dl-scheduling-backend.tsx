import * as React from 'react'
import * as gapi from 'googleapis'

import express from 'express'
import path from 'path'
import fs from 'fs-extra'
import opn from 'open'

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
        
        const keyfile = path.join('../../private', 'credentials.json');
        const keys = JSON.parse(fs.readFileSync(keyfile).toString());
        
        
        
        
        const client = new gapi.Auth.OAuth2Client(
            keys.web.client_id,
            keys.web.client_secret,
            keys.web.redirect_uris[2]
            );
        
        const scopes = [
            "https://www.googleapis.com/auth/spreadsheets"
        ]

        //NOTE different from sample, check
        const url = client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
          });

        
        // Open an http server to accept the oauth callback. In this
        // simple example, the only request to our webserver is to
        // /oauth2callback?code=<code>
        const app = express()
        app.get('/oauth2callback', (req, res) => {
        const code = req.query.code;
        client.getToken(code as any, (err, tokens) => {
            if (err) {
            console.error('Error getting oAuth tokens:');
            throw err;
            }
            client.credentials = tokens as any;
            res.send('Authentication successful! Please return to the console.');
            server.close();
            //listMajors(client);
        });
        });
        const server = app.listen(3000, () => {
        // open the browser to the authorize url to start the workflow
        opn(url, {wait: false});
        });


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
        //FIXME - use total columns to filter, ARS doesnt include 
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
                combinedStudent[key] ==='0' ||
                combinedStudent[key] === '0.00')
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