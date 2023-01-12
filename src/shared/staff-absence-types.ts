/*
 * PayCodes for excused or unexcused absences we want to look at for patterns
 */

export const PayCodeKeys: string[] = ['VAC', 'PBD', 'CRT', 'EXC', 'BRV', 'SCK', 'SCG', 'SCU', 'RHL', 'SCS', 'PHE']
export const AbsencePaycodes: string[] = ['VAC', 'PBD', 'CRT', 'EXC', 'BRV', 'SCK', 'SCG', 'SCU', 'RHL', 'SCS', 'PHE']
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

// A date can have a punch in time and a punch out time, a punch in time and no punch out time, or a Pay Code
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

//Each date should either have a punch in/out or a Pay Code associated with it
export type StaffDates = Map<Date, PayCodeDay | PunchTime>


export interface Absences {
    [code:string]:PayCodeDay[]
}

//Punch Times is a sum of an employees punchard information
export interface PunchTimes {
    name: string
    position: string
    absences: Absences
    punchTimes: StaffDates
    tardies?: StaffDates
    startTime?: number
    endTime?: number
    attDays?: Date[]
}

export interface StaffPunchTimes {
    [name: string] : PunchTimes
}

export interface StaffPositions {
    [position: string]: string[]
}

export interface StaffAbsence{
    name: string
    position: string
    absences: PayCodeTotals
}

export interface AbsenceTotals{
    absences: PayCodeTotals
}

export interface AbsenceDate{
    date: Date
    absences: {name: string
                position: string
                code: string}[]
}

export const isPunchTime = (val: PayCodeDay|PunchTime): val is PunchTime => {
    return (val as PunchTime).in !== undefined
}