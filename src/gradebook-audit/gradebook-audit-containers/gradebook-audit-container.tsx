import * as React from 'react';

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
            const tKey = teacher.firstName + teacher.lastName
            if(distributions[tKey] && categories[tKey]){
            return (
                <div key={tKey} className='gradebook-audit-report'>
                    <h1>{teacher.firstName + ' ' + teacher.lastName}</h1>
                    <GradeDistributionDisplay classes={distributions[tKey]}/>
                    <CategoryTableRender classes={categories[tKey]}/>
                    <FailingGradesRender classes={distributions[tKey]}/>
                    <HighImpactAssignmentsRender classes={categories[tKey]}/>
                </div>
            )}
        })}
        </React.Fragment>
    )

}




