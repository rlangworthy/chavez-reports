import * as React from 'react';
import {del} from 'idb-keyval'

import {
  SummerschoolReportOutput
} from './';

import { ReportFiles } from '../shared/report-types'
import { createSummerSchoolReportFromFiles } from './summerschool-report-backend'

export interface SummerschoolReportDownloadProps {
  reportFiles?: ReportFiles
}
export const SummerschoolReportDownload: React.SFC<SummerschoolReportDownloadProps> = (props) => {
  window.addEventListener('beforeunload', () => {del('Summerschool Report')});

  const report = props.reportFiles ? createSummerSchoolReportFromFiles(props.reportFiles) : [];

  const hasSummerSchool = (student: SummerschoolReportOutput[0]): boolean => {
    return ['2B','3A', '3B'].indexOf(student.status) !== -1;
  };
  const hasSummerSchoolWarning = (student: SummerschoolReportOutput[0]): boolean => {
    return ['0W', '1W', '2W', '3W'].indexOf(student.warning) !== -1;
  };
  const hasUnknownStatus = (student: SummerschoolReportOutput[0]): boolean => {
    return student.status === 'Unknown';
  };

  const renderSummerschoolTable = (report: SummerschoolReportOutput): JSX.Element => {

    // IMPORTANT -- we only want the 3rd, 6th, and 8th grade students,
    // as they're the only ones who might have to take summer school.
    // Also filter out only the students who are attending summer school, have a summer school warning,
    // or who have an unknown summer school status due to missing data.
    const students = report.filter( student => {
      const isInGrade36or8 = ['03','06','08'].indexOf(student.studentGradeLevel) !== -1;
      if (isInGrade36or8) {
        if (hasSummerSchool(student) || hasSummerSchoolWarning(student) || hasUnknownStatus(student)) {
          return true;
        }
      }
      return false;
    });
    

    const headRow =(
      <tr key={'Summerschool Table Header'}>
        <th>Student ID</th>
        <th>First Name</th>
        <th>Last Name</th>
        <th>HR</th>
        <th>SpEd</th>
        <th>ELL</th>
        <th>LY NWEA Math(Most Recent)</th>
        <th>LY NWEA Read(Most Recent)</th>
        <th>Math grade</th>
        <th>Reading grade</th>
        <th>Summerschool Status</th>
        <th>Description</th>
        <th>Summerschool Warning</th>
        <th>Warning Description</th>
      </tr>
    );

    /* tslint:disable-next-line:prefer-const */
    let rows: JSX.Element[] = [];
    students.forEach( student => {
      const row = (
        <tr key={student.studentID}>
          <td>{student.studentID}</td>
          <td>{student.studentFirstName}</td>
          <td>{student.studentLastName}</td>
          <td>{student.studentHomeroom}</td>
          <td style={{backgroundColor: student.spEdStatus === '504' || 
          student.spEdStatus === 'SPL' ? 'lightyellow':''}}>
          {student.spEdStatus}</td>
          <td style={{backgroundColor: student.ellStatus ? 'lightyellow':''}}>{student.ellStatus ? 'Yes' : 'No'}</td>
          <td>{student.lyNWEAMath+'('+student.cyNWEAMath+')'}</td>
          <td>{student.lyNWEARead+'('+student.cyNWEARead+')'}</td>
          <td>{student.mathGrade}</td>
          <td>{student.readingGrade}</td>
          <td style={{backgroundColor: hasSummerSchool(student) ? 'salmon' : ''}}>{student.status}</td>
          <td style={{backgroundColor: hasSummerSchool(student) ? 'lightsalmon' : ''}}>{student.statusDescription}</td>
          <td style={{backgroundColor: hasSummerSchoolWarning(student) ? 'gold' : ''}}>{student.warning}</td>
          <td style={{backgroundColor: hasSummerSchoolWarning(student) ? 'lightyellow' : ''}}>{student.warningDescription}</td>
        </tr>
      );
      rows.push(row);
    });

    return (
      <table className={'data-table'}>
        <thead>
          {headRow}
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }

  return (
    <div>
      {renderSummerschoolTable(report)};
    </div>
  );
};
