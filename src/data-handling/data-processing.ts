import {
    Student,
    StudentInfo,
    SchoolClass,
    Assignment,
    School,} from './data-interfaces'

import {
    StudentReportingDataExportRow
} from '../shared/file-interfaces'

import {
    getStudentInfo,
    parseGrade
    } from './data-utils'

/*
 *Data Processing Loop
 *
 * As files are added we want to update the internal database as appropriate 
 * and make reports available based on that.  This should consolidate a lot of
 * the aggregation and simplify report creation.
 * 
 * Each time a new file of a specific type is uploaded we check if it can be
 * used immediately either adding it to the internal database or placing it in
 * a buffer until it can be used. New files overwrite old ones of the same 
 * type, 
 */

 export const updateReportingDatabase = (rows: StudentReportingDataExportRow[], school: School):School => {
    for (const row of rows) {

        //Create student if none exists
        if(school.students[row['Student ID']] === undefined){
            school.students[row['Student ID']] = {
                info:getStudentInfo(row),
                classes: []
            }
        }
        //Exception case for Kindergarteners who only have student info, no classes 
        if(row['Class ID'] === ''){
            break;
        }

        //Create class if none exists
        if(school.classes[row['Class ID']] === undefined){
            //NOTE: teacher name assumed to be the same across all instances of the class
            school.classes[row['Class ID']] = {
                teachers: [row['Teacher Name']],
                students: {},
                assignments: {},
                'Class ID': row['Class ID'],
                'Description': row['Description'],
                'Average Mode': row['Average Mode'],
                'Gradebook Default Indicator': row['Gradebook Default Indicator'],
                'Max Grades to Drop': row['Max Grades to Drop'],
                'Drop Mode': row['Drop Mode'],
                'Room': row.Room,
                'Period': row.Period,
            }
        }

        //Check if first assignment for this student for this class, add student to class and class to student
        if(!school.students[row['Student ID']].classes.includes(row['Class ID'])){

            //Add class to student schedule and student to class roster along with overall grade information
            school.students[row['Student ID']].classes.push(row['Class ID'])
            
        }

        //check if student has info for this class and term, finishes job of previous if
        if(school.classes[row['Class ID']].students[row['Student ID']] === undefined){
            school.classes[row['Class ID']].students[row['Student ID']] = {}
        }

        
        if(school.classes[row['Class ID']].students[row['Student ID']][row['Grade Term']] === undefined){
            school.classes[row['Class ID']].students[row['Student ID']][row['Grade Term']] = {
                'Student ID': row['Student ID'],
                'Grade Term': row['Grade Term'],
                'Running Term Average': row['Running Term Average'],
                'Running Term Letter Grade': row['Running Term Letter Grade'],
                'Posted Term Grade': row['Posted Term Grade'],
                'Term Grade Override Indicator': row['Term Grade Override Indicator'],
                'Cumulative/Overall Average': row['Cumulative/Overall Average'],
                'Semester/Final Letter Grade': row['Semester/Final Letter Grade'],
                'Posted Final Grade': row['Posted Final Grade'],
            }
        }
        
        
        if(school.classes[row['Class ID']].assignments[row['Grade Term']] === undefined){
            school.classes[row['Class ID']].assignments[row['Grade Term']] = {}
        }

        //Check if first instance of assignment for this class, create assignment
        if(row['Assignment ID'] !== '' && school.classes[row['Class ID']].assignments[row['Grade Term']][row['Assignment ID']] === undefined){
            school.classes[row['Class ID']].assignments[row['Grade Term']][row['Assignment ID']] = {
                "Grade Term": row['Grade Term'],
                scores: {},
                'Assignment ID' : row['Assignment ID'],
                'Assignment Name': row['Assignment Name'],
                'Assignment Due': row['Assignment Due'],
                'Assignment Date': row['Assignment Date'],
                'Score Possible': row['Score Possible'],
                'Category Code': row['Category Code'],
                'Category Name': row['Category Name'],
                'Category Weight': row['Category Weight'],
            }
        }

        //add student score for this assignment if it's an assignment, assumes one student won't have two score for the same assignment
        if(row['Assignment ID'] !== '')
        {
            school.classes[row['Class ID']].assignments[row['Grade Term']][row['Assignment ID']].scores[row['Student ID']] = {
                Score:row.Score,
                //Only Calculation here, turns into a percent Grade
                "Number Score": parseGrade(row.Score)/parseInt(row['Score Possible']) * 100,
                "Grade Entered on":row['Grade Entered on']
            }
        }
    }
    return school
 }

