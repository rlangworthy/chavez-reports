import * as React from 'react';

import {
    uniq} from 'ramda'

import {
    TeacherClasses,
    AdminOverview
    } from '../gradebook-audit-interfaces'
    


interface AdminOverviewSheetProps {
    adminOverview: AdminOverview
    teacherClasses: TeacherClasses
    visible: string[]
}





export const AdminOverviewSheet: React.FunctionComponent<AdminOverviewSheetProps> = props => {
    const teachers = Object.keys(props.teacherClasses)
    const gradebookDefaultTeachers = teachers.filter(t => Object.keys(props.teacherClasses[t]).some(k => props.teacherClasses[t][k].defaultMode && props.teacherClasses[t][k].hasGrades))
    const gradeLevels = uniq(teachers.map(t => Object.keys(props.teacherClasses[t]).map(c=>props.teacherClasses[t][c].gradeLevel)).flat()).sort()

    return (
        <div className='admin-overview-sheet'>
            <h2>Chavez Gradebook Audit</h2>
                <GradeBookDefaultOverview visible={props.visible.includes('Gradebook Default') && gradebookDefaultTeachers.length > 0}>
                    {gradebookDefaultTeachers.map(t => {
                        return (
                        <p key={t}>
                            {t} : <i>{Object.keys(props.teacherClasses[t])
                                .filter(k => props.teacherClasses[t][k].defaultMode && props.teacherClasses[t][k].hasGrades)
                                .map(k=> props.teacherClasses[t][k].className).join(', ')}</i>
                        </p>)
                    })}
                </GradeBookDefaultOverview>
            <FailureRateOverview visible={false}>
                {gradeLevels.map(gl => {
                    return ( 
                    <>
                        <h4>{gl==="KG" ? 'KG' : 'Grade ' + gl}</h4>    
                        {teachers.map(t => {if(Object.keys(props.teacherClasses[t]).every(cn => props.teacherClasses[t][cn].gradeLevel !== gl || props.teacherClasses[t][cn].totalAsgn===0)){return (<></>)}
                        return (
                            <>
                                <h5 style={{marginLeft:'50px'}}>{t}</h5>
                                <table className='data-table'>
                                                    <tbody>
                                                        <tr className='gradebook-header-row'>
                                                            <th>Class Name</th>
                                                            <th># Unique Assignments</th>
                                                            <th>% Assignments Graded D or F</th>
                                                            <th># Assignments Over 15% of Total Grade</th>
                                                            <th>% Students Failing</th>
                                                        </tr>
                                {Object.keys(props.teacherClasses[t]).map(cn => {
                                    if(props.teacherClasses[t][cn].gradeLevel === gl && props.teacherClasses[t][cn].totalAsgn>0){
                                        return (            
                                                    <tr>
                                                        <td>{props.teacherClasses[t][cn].className}</td>
                                                        <td>{props.teacherClasses[t][cn].totalAsgn}</td>         
                                                        <td>{props.teacherClasses[t][cn].pctDF.toFixed(2)}</td>
                                                        <td>{props.teacherClasses[t][cn].numberOver15}</td>                                    
                                                        <td>{props.teacherClasses[t][cn].pctStudentsFailing.toFixed(2)}</td>
                                                    </tr>
                                            )}
                                    return <></>
                                    })}
                                        </tbody>
                                </table>
                            </>
                            )})}
                    </>
                    )})}
                </FailureRateOverview>

            <DefaultStatOverviewTable 
                title='Percent Students Failing Above Cutoff' 
                classes={props.adminOverview.pctStudentFailingFlag}
                highlightColumn={5}/>

            <DefaultStatOverviewTable 
                title='Unique Assignments Below Cutoff' 
                classes={props.adminOverview.uniqueAssignmentFlag}
                highlightColumn={2}/>

            <DefaultStatOverviewTable 
                title='Percent Assignments Graded D or F Above Cutoff' 
                classes={props.adminOverview.pctGradedDFFlag}
                highlightColumn={3}/>

            <hr/>
        </div>
    )

}

const DefaultStatOverviewTable: React.FunctionComponent<{title: string, classes: TeacherClasses, highlightColumn: number}> = props => {
    return (
        <>
            <h3>{props.title}</h3>
                <table className='data-table'>
                    <tbody>
                        <tr className='gradebook-header-row'>
                            <th style={{backgroundColor: props.highlightColumn == 0 ? '#FFFF00':''}}>Teacher Name</th>
                            <th style={{backgroundColor: props.highlightColumn == 1 ? '#FFFF00':''}}>Class Name</th>
                            <th style={{backgroundColor: props.highlightColumn == 2 ? '#FFFF00':''}}># Unique Assignments</th>
                            <th style={{backgroundColor: props.highlightColumn == 3 ? '#FFFF00':''}}>% Assignments Graded D or F</th>
                            <th style={{backgroundColor: props.highlightColumn == 4 ? '#FFFF00':''}}># Assignments Over 15% of Total Grade</th>
                            <th style={{backgroundColor: props.highlightColumn == 5 ? '#FFFF00':''}}>% Students Failing</th>
                        </tr>
                        {Object.keys(props.classes).map(t => {
                            return(
                            Object.keys(props.classes[t]).map((cn, i) => 
                                {
                                    return(
                                        <tr>
                                            {i==0 ? <td rowSpan={Object.keys(props.classes[t]).length}><a href={`#`+t}>{t}</a></td>: <></>}
                                            <td>{props.classes[t][cn].className}</td>
                                            <td>{props.classes[t][cn].totalAsgn}</td>         
                                            <td>{props.classes[t][cn].pctDF.toFixed(2)}</td>
                                            <td>{props.classes[t][cn].numberOver15}</td>                                    
                                            <td>{props.classes[t][cn].pctStudentsFailing.toFixed(2)}</td>
                                        </tr>
                        )}))})}
                    </tbody>
                </table>
            </>
    )
}

const FailureRateOverview: React.FunctionComponent<{visible :boolean}> = props => {
    return props.visible ?
    <>
            <h3>Class Assignment and Failure Rate Overview</h3>
            {props.children}

    </>
    :
    <></>
}

const GradeBookDefaultOverview: React.FunctionComponent<{visible :boolean}> = props => {
    return props.visible ? 
    
        <div>
                <h3>Teachers with Average Mode set to Gradebook Default</h3>
                <hr/>
                <p /*className='admin-overview-description'*/>This is a list of teachers and their classes that have the Average Mode set to Gradebook Default.  This is an issue since if an admin and the teacher have different defaults they may not be seeing the same grades.  This should be addressed to be sure grade books are calcluated in the same way.</p>
                <hr/>
                {props.children}
                <hr/>
        </div>
    
    :
    <></>
}