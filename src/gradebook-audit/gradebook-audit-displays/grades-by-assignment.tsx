import * as React from 'react'


import { 
    AssignmentImpact,
    TeacherClass, } from '../gradebook-audit-interfaces'

import { 
  hasCategoryWeightsNot100 
    } from '../gradebook-audit-backend'

import { WarningIcon } from '../../shared/icons';
import { fontStyle } from 'html2canvas/dist/types/css/property-descriptors/font-style';

interface GradesByAssignmentProps {
    classes: {[className: string]: TeacherClass}
    hasAsign: string[]
}

export class GradesByAssignmentRender extends React.PureComponent<GradesByAssignmentProps> {

    render(){
        return (
            <>
                <h3>Assignment Grades</h3>
                {this.props.hasAsign.map( k => <ClassAssignmentBreakdown classAssignments={this.props.classes[k]} class={this.props.classes[k].className} key={k}/>)}
            </>
        )
    }

}

const ClassAssignmentBreakdown: React.SFC<{classAssignments: TeacherClass, class: string}> = (props) => {
    
    const cats = props.classAssignments.categories
    const tpl = props.classAssignments.tpl
    const badCategoryWeight = hasCategoryWeightsNot100(props.classAssignments.categories);
    
    const weightStr = (tpl === 'Categories only' || tpl === 'Categories Only')? 'Weight Per Asg' : 'Assignment Weight'
    const header=(
        <tr key='head'>
            <th>Category</th>
            <th>Weight</th>
            <th>{weightStr}</th>
            <th>Assignment</th>
            <th># Graded</th>
            <th>%A's</th>
            <th>%B's</th>
            <th>%C's</th>
            <th>%D's</th>
            <th>%F's</th>
        </tr>
    )

    const CatDisplay = (category: AssignmentImpact[], name: string, totalPoints?: number): JSX.Element => {
        if(category.length === 0){return <React.Fragment key={name}/>}
        const rows: JSX.Element [] = []
        let totals: number[] = []
        category.sort((a,b) => b.dueDate > a.dueDate ? -1:1).forEach( (a, i) => {
            if (a.stats.grades){
                const total = a.stats.grades.length
                totals = totals.concat(a.stats.grades);

                const impactFlag = a.impact > 20 ? 'alert' : a.impact > 15 ? 'warning' : ''

                const numGraded = a.stats.grades.length 
                    - a.stats.numBlank 
                    - a.stats.numExcused 
                    - a.stats.numIncomplete 
                    - a.stats.numMissing
                    - a.stats.numZero

                const numA = (a.stats.grades.filter(g => g > 89).length/total * 100)
                const numB = (a.stats.grades.filter(g => g > 79 && g < 90).length/total * 100)
                const numC = (a.stats.grades.filter(g => g > 69 && g < 80).length/total * 100)
                const numD = (a.stats.grades.filter(g => g > 59 && g < 70).length/total * 100)
                const numF = (a.stats.grades.filter(g => g < 59).length/total * 100)
                const lowGradeFlag = numD+numF > 20 ? 'alert' : numD+numF > 15 ? 'warning' : ''
                
                rows.push(
                    <tr key={a.assignmentName}>
                        {i===0? 
                        <>
                            <td className='index-column' rowSpan={category.length}>
                                {name}
                                <p className='data'>
                                    (Total Assignments:{category.length})
                                </p>
                            </td>
                            <td rowSpan={category.length}>{category[0].categoryWeight}%</td>
                            {tpl === 'Categories only' || tpl === 'Categories and assignments' || tpl === 'Categories Only' ? 
                            <td rowSpan={category.length} className={impactFlag}>
                                {a.impact.toFixed(2) + '%'}
                            </td> : <></>}
                        </>
                            : null}
                        {tpl !== 'Categories only' && tpl !== 'Categories Only' ? 
                            <td className={impactFlag}>
                                {a.impact.toFixed(2) + '%'}
                            </td>: <></>}
                        <td>{lowGradeFlag !== '' ?  <div className='cell-icon'>
                                                        <WarningIcon className='warning-icon' />
                                                    </div> :<></>} 
                            {a.assignmentName}</td>
                        <td>{numGraded}</td>
                        <td>{numA.toFixed(1)}%</td>
                        <td>{numB.toFixed(1)}%</td>
                        <td>{numC.toFixed(1)}%</td>
                        <td className={lowGradeFlag}>{numD.toFixed(1)}%</td>
                        <td className={lowGradeFlag}>{numF.toFixed(1)}%</td>
                    </tr>
                )
        }})

        rows.push(
            <tr key='total'>
                <td colSpan={4} style={{textAlign: 'right'}} className='index-column'>Total</td>
                <td className='index-column'>{totals.length}</td>
                <td className='index-column'>{(totals.filter(g => g > 89).length/totals.length * 100).toFixed(1)}%</td>
                <td className='index-column'>{(totals.filter(g => g > 79 && g < 90).length/totals.length * 100).toFixed(1)}%</td>
                <td className='index-column'>{(totals.filter(g => g > 69 && g < 80).length/totals.length * 100).toFixed(1)}%</td>
                <td className='index-column'>{(totals.filter(g => g > 59 && g < 70).length/totals.length * 100).toFixed(1)}%</td>
                <td className='index-column'>{(totals.filter(g => g < 59).length/totals.length * 100).toFixed(1)}%</td>
            </tr>
        )

        return (
            <React.Fragment key={name}>
                {rows}
            </React.Fragment>
        )
    }
    
    return (    
        <React.Fragment key={props.class}>
            <h4>{props.class}</h4>
            <h5>Averaging Mode: {props.classAssignments.tpl}</h5>
            {badCategoryWeight ? 
            <h6 style={{fontStyle:'italics'}}>
                <div style={{width:'16px', display:'inline-block', margin:'0 0.5em'}}>
                    <WarningIcon className='warning-icon'/> 
                </div> 
                Category Weights do not add up to 100%
            </h6> : <></>}
            <table className='data-table'>
                <thead>
                    {header}
                </thead>
                <tbody>
                    {Object.keys(cats).map(a => CatDisplay(cats[a].assignments as AssignmentImpact[], a))}
                </tbody>
            </table>
        </React.Fragment>
    )
}