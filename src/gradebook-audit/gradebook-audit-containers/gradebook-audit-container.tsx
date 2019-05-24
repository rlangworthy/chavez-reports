import * as React from 'react';
import {partition} from 'ramda';

import {del} from 'idb-keyval'
import { ReportFiles } from '../../shared/report-types'
import { 
    createGradebookReports,
    getAssignmentImpacts } from '../gradebook-audit-backend'
import {
    GradeLogic,
    AssignmentImpact,
    } from '../gradebook-audit-interfaces'
import {
    GradeDistributionDisplay,
    CategoryTableRender,
    FailingGradesRender,
    HighImpactAssignmentsRender,
    GradesByAssignmentRender,} from '../gradebook-audit-displays'

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
            const classes:{[className: string]: {
                tpl: GradeLogic
                assignments : {[category:string]:AssignmentImpact[]} //sorted list of assignments
                }
            } = {}
            const classAsgs:{[className: string]: {
                tpl: GradeLogic
                assignments : AssignmentImpact[] //sorted list of assignments
                }
            } = {}

            hasAsgn.forEach( cName => { 
                classes[cName] = {tpl: categories[tKey][cName][Object.keys(categories[tKey][cName])[0]].TPL as GradeLogic, assignments: getAssignmentImpacts(categories[tKey][cName])}
                classAsgs[cName] = {
                    tpl: classes[cName].tpl, 
                    assignments: Object.keys(classes[cName].assignments)
                        .reduce( (a:AssignmentImpact[],b) => a.concat(classes[cName].assignments[b]),[])
                        .sort((a,b) => b.impact - a.impact)}
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
                        classes={classAsgs}
                        hasGrades={hasAsgn}/>
                    <GradesByAssignmentRender
                        classes={classes}
                        hasAsign={hasAsgn}/>
                </div>
            )}
        })}
        </React.Fragment>
    )

}




