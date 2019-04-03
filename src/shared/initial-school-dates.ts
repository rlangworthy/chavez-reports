import * as fns from 'date-fns'

const holidays = [new Date(2018, 8,3),new Date(2018, 9,8),new Date(2018, 10,12),new Date(2018, 10,23),new Date(2018, 10,22),
                    new Date(2019, 0,21),new Date(2019, 1,18),new Date(2019, 4,27)]

const winterBreak: Date[] = [new Date(2018,11,24), new Date(2019, 0,4)]
const springBreak = [new Date(2018,11,24), new Date(2019, 0,4)]
export const defaultStartDay1819 = new Date(2018, 7, 27)
export const defaultEndDay = new Date()

export const defaultSchoolYear = fns.eachDay(defaultStartDay1819, defaultEndDay).filter(d => {
    if(fns.isWeekend(d) || 
    fns.isWithinRange(d, winterBreak[0], winterBreak[1]) ||
    fns.isWithinRange(d, springBreak[0], springBreak[1]) ||
    holidays.some( h => fns.isSameDay(h,d))){
        return false;
    }
    return true;
    
})