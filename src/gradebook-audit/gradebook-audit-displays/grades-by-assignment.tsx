import * as React from 'react'


import { 
    GradeDistribution,
    ClassCategories,
    Assignment, 
    AssignmentStats,
    Teacher,
    Category, } from '../gradebook-audit-interfaces'

interface GradesByAssignmentProps {
    classes: ClassCategories
    hasAsign: string[]
}

export class GradesByAssignmentRender extends React.PureComponent<GradesByAssignmentProps> {
    constructor(props){
        super(props)


    }

    render(){
        return (
            <>
                <h3>Assignment Grades</h3>
                {this.props.hasAsign.map( k => <ClassAssignmentBreakdown classes={this.props.classes} class={k}/>)}
            </>
        )
    }

}

const ClassAssignmentBreakdown: React.SFC<{classes: ClassCategories, class: string, }> = (props) => {
    
    const cats = props.classes[props.class]
    const totalWeight = 0 - Object.keys(cats).reduce( (a,b) => a - cats[b].weight,0)
    const header=(
        <tr key='head'>
            <th>Category</th>
            <th>Weight</th>
            <th>Weight Per Asg</th>
            <th>Assignment</th>
            <th># Graded</th>
            <th>%A's</th>
            <th>%B's</th>
            <th>%C's</th>
            <th>%D's</th>
            <th>%F's</th>
        </tr>
    )

    const CatDisplay = (category: Category): JSX.Element => {
        if(category.assignments.length === 0){return <React.Fragment key={category.name}/>}
        const rows: JSX.Element [] = []
        let totals: number[] = []
        category.assignments.map( (a, i) => {
            if (a.stats.grades){
                const total = a.stats.grades.length
                totals = totals.concat(a.stats.grades);
                rows.push(
                    <tr key={a.assignmentName}>
                        {i===0? 
                        <>
                            <td className='index-column' rowSpan={category.assignments.length}>{category.name}</td>
                            <td rowSpan={category.assignments.length}>{category.weight}%</td>
                            <td rowSpan={category.assignments.length}>
                                {(category.weight/category.assignments.length * 100/totalWeight).toFixed(1) + '%'}
                            </td>
                        </>
                            : null} 
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
                <td>{totals.length}</td>
                <td>{(totals.filter(g => g > 89).length/totals.length * 100).toFixed(1)}%</td>
                <td>{(totals.filter(g => g > 79 && g < 90).length/totals.length * 100).toFixed(1)}%</td>
                <td>{(totals.filter(g => g > 69 && g < 80).length/totals.length * 100).toFixed(1)}%</td>
                <td>{(totals.filter(g => g > 59 && g < 70).length/totals.length * 100).toFixed(1)}%</td>
                <td>{(totals.filter(g => g < 59).length/totals.length * 100).toFixed(1)}%</td>
            </tr>
    )

        return (
            <React.Fragment key={category.name}>
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
                    {Object.keys(cats).map(a => CatDisplay(cats[a]))}
                </tbody>
            </table>
        </React.Fragment>
    )
}