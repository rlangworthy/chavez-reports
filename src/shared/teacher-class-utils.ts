import * as d3 from 'd3-collection'

import {
    ClassCategories,
    ClassCategory,
    SchoolClasses,
    GradeLogic,
    } from './teacher-class-interfaces'

import {
    AspenCategoriesRow
    } from './file-interfaces'


/*
 * Turns a Categories file into a simple category object keyed on class ID
 * Teacher names are a list of the form Lastname, Firstname.
 */
export const getSchoolClasses = (categories: AspenCategoriesRow[]): SchoolClasses => {
    const classes: SchoolClasses = d3.nest<AspenCategoriesRow, ClassCategories>()
        .key(r => r['Class Number'])
        .rollup((rs: AspenCategoriesRow[]):ClassCategories => {
            return {
                teacherNames: [rs[0]["Teacher Last Name"] + ', ' + rs[0]["Teacher First Name"]],
                className: '',
                classID: rs[0]['Class Number'],
                categories: d3.nest<AspenCategoriesRow, ClassCategory>()
                                .key(r => r['Category Name'])
                                .rollup((js:AspenCategoriesRow[]):ClassCategory => {
                                    return{
                                        categoryWeight: parseInt(js[0]["Category Weight"]),
                                    }
                                }).object(rs) as { [categoryName: string]: ClassCategory; },
                gradingLogic:rs[0]["Average Mode Setting"] as GradeLogic,
            } 
        }).object(categories)
    return classes
}