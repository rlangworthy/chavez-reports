export const PayCodeKeys: string[] = ['VAC', 'PBD', 'CRT', 'EXC', 'BRV', 'SCK', 'SCG', 'SCU']
export const AbsencePaycodes: string[] = ['VAC', 'PBD', 'CRT', 'EXC', 'BRV', 'SCK', 'SCG', 'SCU']

export const TeacherJobCodes = 
                                ['Bilingual Teacher' , 
                                'PartTime Teacher' , 
                                'Regular Teacher' ,
                                'School Counselor',
                                'Special Education Teacher'] 

export type PayCode = 'VAC'|'PBD'|'CRT'|'EXC'|'BRV'|'SCK'|'SCG'|'SCU'

export interface PayCodeTotals{  
    'VAC': Date[]
    'PBD': Date[]
    'CRT': Date[]
    'EXC': Date[]
    'BRV': Date[]
    'SCK': Date[]
    'SCG': Date[]
    'SCU': Date[]
}

export interface PunchTime {
    in: Date
    out: Date | null
}

export type StaffDates = Map<Date, (PayCode | PunchTime)[]>

export interface PunchTimes {
    name: string
    position: string
    absences: {[code:string]:Date[]}
    punchTimes: StaffDates
    tardies?: Map<Date, PunchTime>
    startTime?: number
    endTime?:number
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