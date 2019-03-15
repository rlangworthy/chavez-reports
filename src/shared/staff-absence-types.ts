export const PayCodeKeys: string[] = ['VAC', 'PBD', 'CRT', 'EXC', 'BRV', 'SCK', 'SCG', 'SCU']

export interface PayCodes{  
    'VAC': Date[]
    'PBD': Date[]
    'CRT': Date[]
    'EXC': Date[]
    'BRV': Date[]
    'SCK': Date[]
    'SCG': Date[]
    'SCU': Date[]
}

export interface StaffAbsence{
    name: string
    position: string
    absences: PayCodes
}

export interface AbsenceTotals{
    absences: PayCodes
}

export interface AbsenceDate{
    date: Date
    absences: {name: string
                position: string
                code: string}[]
}