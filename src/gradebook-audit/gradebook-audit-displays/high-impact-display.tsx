import * as React from 'react';
import Chart from 'react-google-charts';

import { WarningIcon } from '../../shared/icons';

import {
    AssignmentImpact,
    GradeLogic,
    TeacherClassImpacts,
    TeacherClass,
} from '../gradebook-audit-interfaces';

import {
  getChartData
  } from '../gradebook-audit-backend'

export interface HighImpactAssignmentsRenderProps{
  classes: {[className:string]:TeacherClass}
  hasGrades: string[]
}

export const HighImpactAssignmentsRender: React.SFC<HighImpactAssignmentsRenderProps> = props => {
  /* tslint:disable-next-line:prefer-const */
  let tables: JSX.Element[] = [];

  props.hasGrades.forEach( c => {
    let rows: JSX.Element[] = [];

    //need to break down calculations based on grading logic, also add warning if it's an expermiental grading logic
    const tpl = props.classes[c].tpl

    const warning = tpl === 'Categories and assignments'
    const [weightStr, numStr] = tpl === 'Categories only' ? ['Assignment Weight','# Assignments in Category']:
      ['Assignment Weight', 'Points in Category']
    const NUM_ASSIGNS_PER_CLASS = 3;
    
    const headRow = (
      <tr key={c + 'High Impact Assignments'} className='gradebook-header-row'>
        <th>Class Name</th>
        <th>Relative Assignment Weights</th>
        <th>Assignment Name</th>
        <th>Category Name</th>
        <th>Category Weight</th>
        <th>{numStr}</th>
        <th>{weightStr}</th>
        <th>Average Grade</th>
        <th>Median Grade</th>
        <th>Lowest Grade</th>
      </tr>
    );
    rows.push(headRow)
    const topAssignments: AssignmentImpact[] = props.classes[c].topAssignments.slice(0, NUM_ASSIGNS_PER_CLASS)
    const invertedRedBGStyle = {
      backgroundColor: 'red',
      color: 'white',
      fontWeight: 'bold' as 'bold',
      WebkitPrintColorAdjust: 'exact' as 'exact',

    };
    topAssignments.forEach( (a, i) => {
      const row = (
        <tr key={c+ '-' + a.assignmentName + ' ' +  i.toString()}>
          { i === 0 &&
          <td className={`index-column ${warning? 'warning' : '' }`} rowSpan={topAssignments.length}>{props.classes[c].className}</td>}
          { i === 0 && 
          <td className='chart-column' rowSpan={topAssignments.length}>
            <Chart 
              width={'12rem'}
              height={'6rem'}
              loader={<div style={{width:'12rem',height:'6rem'}}>Loading Chart</div>}
              chartType='PieChart'
              data={getChartData(topAssignments)} />
          </td>
          }
          <td>(<span className={`high-impact-dot-${(i+1).toString()}`}/>){a.assignmentName}</td>
          <td>{a.categoryName}</td>
          <td>{a.categoryWeight}</td>
          <td style={a.categoryDivisor === 0 ? invertedRedBGStyle : {}}>
            {a.categoryDivisor}
          </td>
          <td>{a.impact.toFixed(2) + '%' + (tpl !== 'Categories only' && tpl !== 'Categories and assignments' ? 
            '(' + a.maxPoints +' points)':'')}</td>
          <td>{a.averageGrade.toFixed(0)}</td>
          <td>{a.medianGrade.toFixed(0)}</td>
          <td>{a.lowestGrade.toFixed(0)}</td>
        </tr>
      );
      rows.push(row);
    });
    if (warning) {
      rows.push(
        <tr key={c + '-warning'} className='warning-key-row'>
          <td colSpan={10} className='warning-key-cell'>
            <div className='cell-icon'>
              <WarningIcon className='warning-icon' />
            </div>
            This class's weighting method is in development and data may not be accurate.
          </td>
        </tr>
      )
    }
    tables.push(
      <table className={'data-table'} key={c}>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  });
  return (
    <div className='gradebook-audit-display'>
      <h3>Highest Impact Assignments</h3>
      {tables}
    </div>
  );
}
