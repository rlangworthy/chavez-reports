import * as React from 'react';
import {partition} from 'ramda';

import {del} from 'idb-keyval'
import { ReportFiles } from '../../shared/report-types'
import { createGradebookReports } from '../gradebook-audit-backend'
import {
    GradeDistributionDisplay,
    CategoryTableRender,
    FailingGradesRender,
    HighImpactAssignmentsRender,
    } from '../gradebook-audit-displays'

import './gradebook-audit-report.css'

interface GradebookAuditReportProps{
    reportFiles?: ReportFiles
}

export const GradebookAuditReport: React.SFC<GradebookAuditReportProps> = (props) => {
    window.addEventListener('beforeunload', () => {del('Gradebook Audit Report')});
    //expects sorted teachers
    const {distributions, categories, teachers} = props.reportFiles ? createGradebookReports(props.reportFiles): {distributions:{}, categories:{}, teachers:[]}
    return (
        <React.Fragment>
        {teachers.map( teacher => {
            const tKey: string = teacher.firstName + teacher.lastName
            if(distributions[tKey] && categories[tKey]){
            const [hasGrades, noGrades]: string[][] = partition( (cn: string) => {
                const gd = distributions[tKey][cn]
                return (gd.A > 0 || 
                        gd.B > 0 || 
                        gd.C > 0 || 
                        gd.D > 0 ||
                        gd.F > 0)}, Object.keys(distributions[tKey]))
            
            const hasAsgn: string[] = Object.keys(categories[tKey]).filter( cn => {
                return Object.keys(categories[tKey][cn]).some( cat => categories[tKey][cn][cat].assignments.length > 0)
            })

            return (
                <div key={tKey} className='gradebook-audit-report'>
                    <h1>{teacher.firstName + ' ' + teacher.lastName}</h1>
                    <GradeDistributionDisplay 
                        classes={distributions[tKey]}
                        hasGrades={hasGrades}
                        noGrades={noGrades}/>
                    <CategoryTableRender 
                        classes={categories[tKey]}
                        hasGrades={hasAsgn}/>
                    <FailingGradesRender 
                        classes={distributions[tKey]}
                        hasGrades={hasGrades}/>
                    <HighImpactAssignmentsRender 
                        classes={categories[tKey]}
                        hasGrades={hasAsgn}/>
                </div>
            )}
        })}
        </React.Fragment>
    )

}




