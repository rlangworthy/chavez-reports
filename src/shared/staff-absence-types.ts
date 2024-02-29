/*
 * PayCodes for excused or unexcused absences we want to look at for patterns.  
 * The PayCodeKeys and AbsencePaycodes are alieases to help with iterating through paycodes.
 * The PayCode type is for safety.
 * PayCodeTotals are for keeping track of absences both of individual and groups of employees.
 * All three should be updated together when changes need to be made.
 */

export const PayCodeKeys: string[] = ['VAC', 'PBD', 'CRT', 'EXC', 'BRV', 'SCK', 'SCG', 'SCU', 'RHL', 'SCS', 'PHE']
export const AbsencePaycodes: string[] = PayCodeKeys
export type PayCode = 'VAC'|'PBD'|'CRT'|'EXC'|'BRV'|'SCK'|'SCG'|'SCU'|'RHL'|'SCS' | 'PHE'

export interface PayCodeTotals{  
    'VAC': Date[]
    'PBD': Date[]
    'CRT': Date[]
    'EXC': Date[]
    'BRV': Date[]
    'SCK': Date[]
    'SCG': Date[]
    'SCU': Date[]
    'RHL': Date[]
    'SCS': Date[]
    'PHE': Date[]
}

//Job codes for teaching positions

export const TeacherJobCodes = 
                                ['Bilingual Teacher' , 
                                'PartTime Teacher' , 
                                'Regular Teacher' ,
                                'School Counselor',
                                'Special Education Teacher'] 

// Each date with data for an employee will have a punch in time and a punch out time, a punch in time and no punch out time, or a Pay Code.
// Multiple entries for the same day will be turned into a key-value pair in the StaffDates map for that employee.
export interface PunchTime {
    in: Date
    out: Date | null
}

export interface PayCodeDay {
    payCode: string
    halfDay: boolean
    date: Date
    ins: Date[]
    outs: Date[]
}

export type StaffDates = Map<Date, PayCodeDay | PunchTime>

//PayCodeDays are added to an absences object to make calculating totals easier
export interface Absences {
    [code:string]:PayCodeDay[]
}

//Punch Times gathers all of an employees punchcard information, including official start and stop times as well as days of attendance
export interface PunchTimes {
    name: string
    position: string
    absences: Absences
    punchTimes: StaffDates
    attendancePct: number
    tardies?: StaffDates
    startTime?: number
    endTime?: number
    attDays?: Date[]
}

export interface StaffPunchTimes {
    [name: string] : PunchTimes
}

//Interface of an object associating job titles with employees
export interface StaffPositions {
    [position: string]: string[]
}

//Interface for helping display Absences in the Calendar
export interface StaffAbsence{
    name: string
    position: string
    absences: PayCodeTotals
}

//Helps with the calendar display
export interface AbsenceDate{
    date: Date
    absences: {name: string
                position: string
                code: string}[]
}

//Helper function to make StaffDates more useable
export const isPunchTime = (val: PayCodeDay|PunchTime): val is PunchTime => {
    return (val as PunchTime).in !== undefined || (val as PunchTime).out !== undefined
}