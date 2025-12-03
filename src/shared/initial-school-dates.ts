import * as fns from 'date-fns'
import {sy2526} from './school-dates/sy2526'

export interface SchoolYear {
    holidays: HolidayDate[]
    irregularDays: HolidayDate[]
    startDate: Date
    endDate: Date
    q1End: Date
    q2End: Date
    q3End: Date
    q4End: Date
}

export interface HolidayDate {
    name: string
    dates: Date[]
}

export const SY_CURRENT = sy2526

export const defaultSchoolYear = (sy: SchoolYear):Date[] => {
    const defaultStartDay = sy.startDate
    const defaultEndDay = sy.endDate
    const holidayList = sy.holidays
    return fns.eachDay(defaultStartDay, defaultEndDay).filter(d => {
        if(fns.isWeekend(d) || 
        holidayList.reduce( (a:Date[],b) => a.concat(b.dates), []).some( h => fns.isSameDay(h,d))){
            return false;
        }
        return true
})}