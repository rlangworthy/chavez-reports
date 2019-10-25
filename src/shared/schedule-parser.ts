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

export interface StudentClassList {
    studentID: string
    studentName: string
    homeroom: string
    courseID: string
    courseDesc: string
    room: string
    teacher: string
}

export const parseSchedule = (rawSched: string[][]): StudentClassList[] => {
    let sched: StudentClassList[][] = []
    let i = 0
    const GROUP_CONST = rawSched[0][GROUP_COL]
    const SCHOOL_NAME = rawSched[0][SCHOOL_COL]
    while(rawSched[i] !== undefined){
        if(rawSched[i][0] === GROUP_CONST && rawSched[i][13] === SCHOOL_NAME){
            i++;
            if(rawSched[i] !== undefined && rawSched[i][SCHED_IND] === 'Student Schedule'){
                i = i+3 //naiive jump to name
                const sName = rawSched[i][NAME]
                const id = rawSched[i+1][STUDENT_INFO_COL]
                const hr = rawSched[i+3][STUDENT_INFO_COL]
                i = i + 7 //naiive jump to course list
                let courses:StudentClassList[] = []
                //loop simply grabs the easy classes to grab by checking for properly formatted 3 part name
                while(rawSched[i] !== undefined 
                    && rawSched[i][COURSE_COL].split('-').length > 1 
                    && rawSched[i][COURSE_COL].split('-')[1] !== ''){ 
                    courses.push({
                        studentID: id,
                        studentName: sName,
                        homeroom: hr,
                        courseID: rawSched[i][COURSE_COL],
                        courseDesc: rawSched[i][DESC_COL],
                        room: rawSched[i][ROOM_COL],
                        teacher: rawSched[i][TEACHER_COL],
                    })
                    i++;
                }
                //es schedule logic to grab broken class names
                //adds final class before moving down to group & school name
                if(rawSched[i] !== undefined 
                    && rawSched[i][COURSE_COL] !== ''){
                        const cName = rawSched[i][COURSE_COL]
                        if(rawSched[i+5] !== undefined){
                            courses.push({
                                studentID: id,
                                studentName: sName,
                                homeroom: hr,
                                courseID: cName + rawSched[i+5][COURSE_COL],
                                courseDesc: rawSched[i][DESC_COL],
                                room: rawSched[i][ROOM_COL],
                                teacher: rawSched[i][TEACHER_COL],
                            })
                        }
                        i++;
                    }
                //length 8 row means more classes with weird offsets
                if(rawSched[i] !==undefined 
                    && rawSched[i].length>=8
                    && rawSched[i+1][3] === 'Student Schedule'){
                        i += 4
                    while(rawSched[i] !== undefined
                        && rawSched[i][COURSE_COL] !== ''){
                        if(rawSched[i][5] !== ''){
                            courses.push({
                                studentID: id,
                                studentName: sName,
                                homeroom: hr,
                                courseID: rawSched[i][COURSE_COL],
                                courseDesc: rawSched[i][2],
                                room: rawSched[i][4],
                                teacher: rawSched[i][5],
                            })
                        }
                        i++
                    }
                }

                sched.push(courses)
            }
        }else{
            i++
        }
    }
    return sched.flat()
}
