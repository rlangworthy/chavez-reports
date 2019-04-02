import * as React from 'react';
import Chart from 'react-google-charts';

import {
    Assignment,
} from '../gradebook-audit-interfaces';

interface AssignmentImpact extends Assignment{
    numAssignmentsInCategory: number
    impact: number
    averageGrade: number
    medianGrade: number
    lowestGrade: number
}

interface HighImpactAssignmentsRenderProps{
  classes: {
    [className: string]: {
        [categoryName: string]: {
            name: string
            weight: number
            TPL: string
            assignments: Assignment[]
        }   
    }
  }
  hasGrades: string[]
}

export const HighImpactAssignmentsRender: React.SFC<HighImpactAssignmentsRenderProps> = props => {
  /* tslint:disable-next-line:prefer-const */
  let rows: JSX.Element[] = [];
  // put header row in
  const headRow = (
    <tr key={'High Impact Assignments'} className='gradebook-header-row'>
      <th>Class Name</th>
      <th>Relative Assignment Weights</th>
      <th>Assignment Name</th>
      <th>Category Name</th>
      <th>Category Weight</th>
      <th># Assignments in Category</th>
      <th>Assignment Weight</th>
      <th>Average Grade</th>
      <th>Median Grade</th>
      <th>Lowest Grade</th>
    </tr>
  );
  props.hasGrades.forEach( c => {
    const NUM_ASSIGNS_PER_CLASS = 3;
    const topAssignments = getTopAssignments(props.classes[c], NUM_ASSIGNS_PER_CLASS);
    const invertedRedBGStyle = {
      backgroundColor: 'red',
      color: 'white',
      fontWeight: 'bold' as 'bold',
      webkitPrintColorAdjust: 'exact',

    };
    topAssignments.forEach( (a, i) => {
      const row = (
        <tr key={c+ '-' + a.assignmentName + ' ' +  i.toString()}>
          { i === 0 &&
          <td className='index-column' rowSpan={topAssignments.length}>{c}</td>}
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
          <td style={a.numAssignmentsInCategory === 0 ? invertedRedBGStyle : {}}>
            {a.numAssignmentsInCategory}
          </td>
          <td>{a.impact.toFixed(2)}</td>
          <td>{a.averageGrade.toFixed(0)}</td>
          <td>{a.medianGrade.toFixed(0)}</td>
          <td>{a.lowestGrade.toFixed(0)}</td>
        </tr>
      );
      rows.push(row);
    });
  });
  return (
    <div className='gradebook-audit-display'>
      <h3>Highest Impact Assignments</h3>
      <table className={'data-table'}>
        <tbody>
          {headRow}
          {rows}
        </tbody>
      </table>
    </div>
  );
}

const getTopAssignments = (c: {
  [categoryName: string]: {
      name: string
      weight: number
      TPL: string
      assignments: Assignment[]
  }   
}, numAssigns: number): AssignmentImpact[] => {
  const zeroCatsFactor = -100/(Object.keys(c).reduce( (a,b) => a - (c[b].assignments.length > 0 ? c[b].weight:0), 0))
  const classAsgns: AssignmentImpact[][] = Object.keys(c).map( cat => {
    const TPL = c[cat].TPL === 'TPL Yes';
    const total = TPL ? -c[cat].assignments.reduce((a,b) => a - b.maxPoints, 0) : -1
    return c[cat].assignments.map( (a):AssignmentImpact => {
      const rawImpact = TPL ? c[cat].weight*(a.maxPoints/total): c[cat].weight/c[cat].assignments.length
      return {
        ...a,
        numAssignmentsInCategory: c[cat].assignments.length,
        impact: (rawImpact*zeroCatsFactor),
        averageGrade: a.stats.averageGrade,
        medianGrade: a.stats.medianGrade,
        lowestGrade: a.stats.lowestGrade,
      }
    });
  })  


  return classAsgns.reduce((a,b) => a.concat(b)).sort((a,b) => b.impact-a.impact).slice(0,numAssigns);
}

const getChartData = (assignments: AssignmentImpact[]):any => {
  const percentOther = 100 - (-assignments.reduce((a,b) => a - b.impact, 0))
  const data = [['Assignment Name', 'Assignment Weight'] as any]
  assignments.forEach( (a, i) => data.push([(a.impact).toFixed(1) + '%', a.impact]))
  data.push(['Others', percentOther])
  return data;
}