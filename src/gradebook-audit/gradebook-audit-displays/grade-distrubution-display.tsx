import * as React from 'react';

import {
  GradeDistribution,
  TeacherClass
} from '../gradebook-audit-interfaces';

interface GradeDistributionProps {
  distribution : GradeDistribution
  className: string
}
interface GradeDistributionDisplayProps{
  classes: {[className: string]: TeacherClass}
  hasGrades: string[]
  noGrades: string[]
}

const GradeDistributionRender: React.SFC<GradeDistributionProps> = props => {
    const gd = props.distribution;
    const total = gd.A+gd.B+gd.C+gd.D+gd.F+gd.Blank
    return (
      <div className='grade-distribution-container'>
        <h5 className='grade-distribution-header'>{props.className}</h5>
        <div className='grade-distribution'>
          <div className='bar-container'>
            <div className='bar bar-a' style={{height: `${(gd.A / total) * 100}%`}}>{gd.A !== 0 ? gd.A : ''}</div>
          </div>
          <div className='bar-container'>
            <div className='bar bar-b' style={{height: `${(gd.B / total) * 100}%`}}>{gd.B !== 0 ? gd.B : ''}</div>
          </div>
          <div className='bar-container'>
            <div className='bar bar-c' style={{height: `${(gd.C / total) * 100}%`}}>{gd.C !== 0 ? gd.C : ''}</div>
          </div>
          <div className='bar-container'>
            <div className='bar bar-d' style={{height: `${(gd.D / total) * 100}%`}}>{gd.D !== 0 ? gd.D : ''}</div>
          </div>
          <div className='bar-container'>
            <div className='bar bar-f' style={{height: `${(gd.F / total) * 100}%`}}>{gd.F !== 0 ? gd.F : ''}</div>
          </div>
          <div className='bar-container'>
            <div className='bar bar-blank' style={{height: `${(gd.Blank / total) * 100}%`}}>{gd.Blank !== 0 ? gd.Blank : ''}</div>
          </div>
        </div>
        <div className='grade-distribution-x-axis'>
          <div className='x-axis-label'>A</div>
          <div className='x-axis-label'>B</div>
          <div className='x-axis-label'>C</div>
          <div className='x-axis-label'>D</div>
          <div className='x-axis-label'>F</div>
          <div className='x-axis-label'>Blank</div>
        </div>
      </div>
    );
  }

export const GradeDistributionDisplay : React.SFC<GradeDistributionDisplayProps> = props => {
  
  return (
        <div>
          <h3>Grade Distributions</h3>
          {props.noGrades.length > 0 ? <div style={{fontStyle:'italic'}}>{'No Grades: ' + props.noGrades.map(gr => props.classes[gr].className)}<hr/></div> : null}
          <div className='grade-distributions'>
          { props.hasGrades.map( (className, i) => {
              return <GradeDistributionRender distribution={props.classes[className].distribution} 
                className={props.classes[className].className} key={i}/>
            })
          }
          </div>
        </div>
  );
}
