import * as React from 'react';

import {
    TeacherClasses,
    } from '../gradebook-audit-interfaces'
    


interface AdminOverviewSheetProps {
    teacherClasses: TeacherClasses
}

export const AdminOverviewSheet: React.FunctionComponent<AdminOverviewSheetProps> = props => {
    const teachers = Object.keys(props.teacherClasses)
    const gradebookDefaultTeachers = teachers.filter(t => Object.keys(props.teacherClasses[t]).some(k => props.teacherClasses[t][k].defaultMode && props.teacherClasses[t][k].hasGrades))

    return (
        <div className='admin-overview-sheet'>
            <h3>Chavez Gradebook Audit</h3>
            <h4>Teachers with Average Mode set to Gradebook Default</h4>
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
        </div>
    )

}