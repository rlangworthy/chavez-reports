import * as React from 'react';

import {
    GradeDistribution,
    TeacherClass
} from '../gradebook-audit-interfaces';

interface FailingGradesRenderProps{
  classes: {
    [className: string]: TeacherClass
  }
  hasGrades: string[]
  hasSped: boolean
}

export const FailingGradesRender: React.FunctionComponent<FailingGradesRenderProps> = props => {
    // flatten categoryTable
    /* tslint:disable-next-line:prefer-const */
    let rows: JSX.Element[] = [];
    // put header row in
    const headRow = (
      <tr key={'Failing Students Header'} className='gradebook-header-row'>
        <th>Class Name</th>
        <th>Student Name</th>
        <th>Student ID</th>
        <th>Quarter Grade</th>
        {props.hasSped? (<><th>PDIS</th><th>ELL</th></>):null}
      </tr>
    );
    props.hasGrades.forEach( c => {
      const students = props.classes[c].distribution.failingStudents;
      students.forEach( (s, i) => {
        const studentName = s.studentName;
        const row = (
          <tr key={c + '-' + studentName}>
            { i === 0 &&
            <td className='index-column' rowSpan={students.length}>{props.classes[c].className}</td>
            }
            <td>{studentName}</td>
            <td>{s.studentID}</td>
            <td>{s.quarterGrade}</td>
            {props.hasSped? (<><td>{s.dl}</td><td>{s.el}</td></>):null}
          </tr>
        );
        rows.push(row);
      });
    });

    return (
      <div className='gradebook-audit-display'>
        <h3>Failing Grades</h3>
        <table className={'data-table'}>
          <tbody>
            {headRow}
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
