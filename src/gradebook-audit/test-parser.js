//import * as Papa from 'papaparse'
var Papa = require('papaparse')
const fs = require('fs');
const file = fs.createReadStream('report608.csv');
/*
 * Constants for rows
 * Pick up the network & school name from first row
 * First draft just picks up the common case
 */

const SCHED_IND=5
const NAME=4
const SCHOOL_COL=13
const GROUP_COL=0
const STUDENT_INFO_IND=6
const STUDENT_INFO_COL=7
const COURSE_COL=1
const DESC_COL=3
const ROOM_COL=8
const TEACHER_COL=10

const parseSchedule = (rawSched) => {
    var sched = new Object()
    let i = 0
    const GROUP_CONST = rawSched[0][GROUP_COL]
    const SCHOOL_NAME = rawSched[0][SCHOOL_COL]
    while(i < rawSched.length){
        if(rawSched[i][0] === GROUP_CONST && rawSched[i][13] === SCHOOL_NAME){
            i++;
            if(rawSched[i] !== undefined && rawSched[i][5] === 'Student Schedule'){
                i = i+3 //naiive jump to name
                const sName = rawSched[i][NAME]
                const id = rawSched[i+1][STUDENT_INFO_COL]
                const hr = rawSched[i+3][STUDENT_INFO_COL]
                i = i + 7 //naiive jump to course list
                let courses = []
                //loop simply grabs the easy classes to grab by checking for properly formatted 3 part name
                while(rawSched[i] !== undefined && rawSched[i][COURSE_COL].split('-').length === 3){ 
                    courses.push({
                        studentName: sName,
                        homeroom: hr,
                        courseID: rawSched[i][COURSE_COL],
                        courseDesc: rawSched[i][DESC_COL],
                        room: rawSched[i][ROOM_COL],
                        teacher: rawSched[i][TEACHER_COL],
                    })
                    i++;
                }
                sched[id] = courses;
            }
        }else{
            i++
        }
    }

    return sched
}

Papa.parse(file, {
    complete: (results) => {
        const sched = parseSchedule(results.data)
        console.log(sched)
    }
})
