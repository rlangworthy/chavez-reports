import * as React from 'react';

import {
    uniq} from 'ramda'

import {
    TeacherClasses,
    } from '../gradebook-audit-interfaces'
    


interface AdminOverviewSheetProps {
    teacherClasses: TeacherClasses
}

export const AdminOverviewSheet: React.FunctionComponent<AdminOverviewSheetProps> = props => {
    const teachers = Object.keys(props.teacherClasses)
    const gradebookDefaultTeachers = teachers.filter(t => Object.keys(props.teacherClasses[t]).some(k => props.teacherClasses[t][k].defaultMode && props.teacherClasses[t][k].hasGrades))
    const gradeLevels = uniq(teachers.map(t => Object.keys(props.teacherClasses[t]).map(c=>props.teacherClasses[t][c].className.split('-')[1])).flat()).sort()

    return (
        <div className='admin-overview-sheet'>
            <h2>Chavez Gradebook Audit</h2>
            <h3>Teachers with Average Mode set to Gradebook Default</h3>
            <hr/>
            <p /*className='admin-overview-description'*/>This is a list of teachers and their classes that have the Average Mode set to Gradebook Default.  This is an issue since if an admin and the teacher have different defaults they may not be seeing the same grades.  This should be addressed to be sure grade books are calcluated in the same way.</p>
            <hr/>
            {gradebookDefaultTeachers.map(t => {
                return (
                <p key={t}>
                    {t} : <i>{Object.keys(props.teacherClasses[t])
                        .filter(k => props.teacherClasses[t][k].defaultMode && props.teacherClasses[t][k].hasGrades)
                        .map(k=> props.teacherClasses[t][k].className).join(', ')}</i>
                </p>)
            })}
            <hr/>

            <h3>Class Assignment and Failure Rate Overview</h3>
            {gradeLevels.map(gl => {
                return ( 
                <>
                    <h4>{gl==="KG" ? 'KG' : 'Grade ' + gl}</h4>    
                    {teachers.map(t => {if(Object.keys(props.teacherClasses[t]).every(cn => cn.split('-')[1] !== gl || props.teacherClasses[t][cn].totalAsgn===0)){return (<></>)}
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
                                                        <th>% Sutdents Failing</th>
                                                    </tr>
                            {Object.keys(props.teacherClasses[t]).map(cn => {
                                if(cn.split('-')[1] === gl && props.teacherClasses[t][cn].totalAsgn>0){
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
            <hr/>
        </div>
    )

}

