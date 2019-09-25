import * as React from 'react'


import { 
    GradeLogic,
    AssignmentImpact,
    TeacherClass, } from '../gradebook-audit-interfaces'

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
    const weightStr = tpl === 'Categories only' ? 'Weight Per Asg' : 'Assignment Weight'
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
        category.forEach( (a, i) => {
            if (a.stats.grades){
                const total = a.stats.grades.length
                totals = totals.concat(a.stats.grades);
                rows.push(
                    <tr key={a.assignmentName}>
                        {i===0? 
                        <>
                            <td className='index-column' rowSpan={category.length}>{name}</td>
                            <td rowSpan={category.length}>{category[0].categoryWeight}%</td>
                            {tpl === 'Categories only' || 'Categories and assignments'? 
                            <td rowSpan={category.length}>
                                {a.impact.toFixed(2) + '%'}
                            </td> : <></>}
                        </>
                            : null}
                        {tpl !== 'Categories only' ? 
                            <td>
                                {a.impact.toFixed(2) + '%'}
                            </td>: <></>}
                        <td>{a.assignmentName}</td>
                        <td>{a.stats.grades.length}</td>
                        <td>{(a.stats.grades.filter(g => g > 89).length/total * 100).toFixed(1)}%</td>
                        <td>{(a.stats.grades.filter(g => g > 79 && g < 90).length/total * 100).toFixed(1)}%</td>
                        <td>{(a.stats.grades.filter(g => g > 69 && g < 80).length/total * 100).toFixed(1)}%</td>
                        <td>{(a.stats.grades.filter(g => g > 59 && g < 70).length/total * 100).toFixed(1)}%</td>
                        <td>{(a.stats.grades.filter(g => g < 59).length/total * 100).toFixed(1)}%</td>
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