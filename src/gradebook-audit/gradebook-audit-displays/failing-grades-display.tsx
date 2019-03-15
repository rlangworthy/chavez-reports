import * as React from 'react';

import {
    GradeDistribution
} from '../gradebook-audit-interfaces';

interface FailingGradesRenderProps{
  classes: {
    [className: string]: GradeDistribution
}
}

export const FailingGradesRender: React.SFC<FailingGradesRenderProps> = props => {
    // flatten categoryTable
    /* tslint:disable-next-line:prefer-const */
    let rows: JSX.Element[] = [];
    // put header row in
    const headRow = (
      <tr key={'Failing Students Header'}>
        <th>Class Name</th>
        <th>Student Name</th>
        <th>Quarter Grade</th>
      </tr>
    );
    Object.keys(props.classes).forEach( c => {
      const students = props.classes[c].failingStudents;
      students.forEach( (s, i) => {
        const studentName = s.studentName;
        const row = (
          <tr key={c + '-' + studentName}>
            { i === 0 &&
            <td className='index-column' rowSpan={students.length}>{c}</td>
            }
            <td>{studentName}</td>
            <td>{s.quarterGrade}</td>
          </tr>
        );
        rows.push(row);
      });
    });

    return (
      <div className='gradebook-audit-display'>
        <h3>Failing Grades</h3>
        <table className={'data-table'}>
          <thead>
            {headRow}
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
