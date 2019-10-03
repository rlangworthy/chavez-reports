import * as React from 'react';

import {
    Assignment, 
    AssignmentStats,
    Category,
    TeacherClass } from '../gradebook-audit-interfaces';

import { 
  hasCategoryWeightsNot100 } from '../gradebook-audit-backend'

import { WarningIcon } from '../../shared/icons';

interface CategoryTableRenderProps{
  classes:{
      [className: string]: TeacherClass
  }
  hasGrades:string[]
}

export const CategoryTableRender: React.SFC<CategoryTableRenderProps> = props => {

    /* tslint:disable-next-line:prefer-const */
    let rows: JSX.Element[] = [];
    // put header row in
    const headRow =(
      <tr key={'Category Table Header'} className='gradebook-header-row'>
        <th>Subject Name</th>
        <th>CategoryName</th>
        <th>Category Weight</th>
        <th>Average Mode</th>
        <th>Average Score</th>
        <th>Num Assignments In Category</th>
        <th>Total Num Blank Grades</th>
        <th>Total Num Excused Grades</th>
        <th>Total Num Incomplete Grades</th>
        <th>Total Num Missing Grades</th>
        <th>Total Num Zero Grades</th>
      </tr>
    );
    const invertedRedBGStyle = {
      backgroundColor: 'red',
      color: 'white',
      fontWeight: 'bold' as 'bold',
    };
    Object.keys(props.classes).forEach( c => {
        const badCategoryWeight = hasCategoryWeightsNot100(props.classes[c].categories);
        let i = 0;
        Object.keys(props.classes[c].categories).forEach( cat => {
            const assignments = props.classes[c].categories[cat].assignments
            const stats = props.classes[c].categories[cat].assignmentStats;
            const row = (
                <tr  key={c + '-' + cat}>
                  { i === 0 &&
                  <td className='index-column' rowSpan={Object.keys(props.classes[c].categories).length}>{props.classes[c].className}</td>
                  }
                  <td>{cat}</td>
                  <td className={ badCategoryWeight ? 'warning' : '' }>
                    {props.classes[c].categories[cat].weight}
                    { badCategoryWeight && 
                      <div className='cell-icon'>
                        <WarningIcon className='warning-icon' />
                      </div>
                    }
                  </td>
                  <td>{props.classes[c].categories[cat].TPL}</td>
                  <td>{assignments.length !== 0 ? stats.averageGrade.toFixed(0) : 'Unknown'}</td>
                  <td style={assignments.length === 0 ? invertedRedBGStyle : {}} className='category-warning'>
                    {assignments.length}
                  </td>
                  <td>{stats.numBlank}</td>
                  <td>{stats.numExcused}</td>
                  <td>{stats.numIncomplete}</td>
                  <td>{stats.numMissing}</td>
                  <td>{stats.numZero}</td>
                </tr>
              );//blank, excused, incomplete, missing, zero -- can include this information
              i += 1;
              rows.push(row);
        });
        const NUM_COLS = 11;
        if (badCategoryWeight) {
          rows.push(
            <tr key={c + '-warning'} className='warning-key-row'>
              <td colSpan={NUM_COLS} className='warning-key-cell'>
                <div className='cell-icon'>
                  <WarningIcon className='warning-icon' />
                </div>
                Category Weights do not add up to 100%.
              </td>
            </tr>
          )
        }
    });
 
    return (
      <div className='gradebook-audit-display'>
        <h3>Category Table</h3>
        <table className={'data-table'}>
          <tbody>
            {headRow}
            {rows}
          </tbody>
        </table>
      </div>
    );
}