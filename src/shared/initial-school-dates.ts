import * as fns from 'date-fns'

export interface HolidayDate {
    name: string
    dates: Date[]
}

export const q4Start = new Date(2019, 4, 5)

const holidays = [new Date(2018, 8,3),new Date(2018, 9,8),new Date(2018, 10,12),new Date(2018, 10,23),new Date(2018, 10,22),
                    new Date(2019, 0,21),new Date(2019, 1,18),new Date(2019, 4,27)]

export const holidayList: HolidayDate[] = [
    {
        name: 'Labor Day',
        dates: [new Date(2018, 8,3)],
    },
    {
        name: 'Columbus Day',
        dates: [new Date(2018, 9,8)],
    },
    {
        name: "Veteran's Day",
        dates: [new Date(2018, 10,12)],
    },
    {
        name: 'Thanksgiving Holiday',
        dates: [new Date(2018, 10,23),new Date(2018, 10,22), new Date(2018, 10,21)]
    },
    {
        name: 'M.L.K. Day',
        dates: [new Date(2019, 0,21)]
    },
    {
        name: "President's Day",
        dates: [new Date(2019, 1,18)],
    },
    {
        name: 'Memorial Day',
        dates: [new Date(2019, 4,27)]
    },
    {
        name: 'Winter Break',
        dates: fns.eachDay(new Date(2018,11,24), new Date(2019, 0,4))
    },
    {
        name: 'Spring Break',
        dates: fns.eachDay(new Date(2019,3,15), new Date(2019, 3,15))
    },
    {
        name: 'Snow Days',
        dates: [new Date(2019,0,30), new Date(2019,0,31)]
    }
]

export const irregularDayList: HolidayDate[] = [
    {name: 'Report Card Distribution Days',
    dates: [new Date(2019, 1,8),new Date(2019, 5, 18)]},
    {name:'School Improement Days',
    dates: [new Date(2018, 10, 2), new Date(2019, 1, 1), new Date(2019, 3, 5), new Date(2019, 5, 19)]},
    {name: 'Parent-Teacher Conference Days',
    dates: [new Date(2018, 10,14), new Date(2019, 3, 10)]}]

const winterBreak: Date[] = [new Date(2018,11,24), new Date(2019, 0,4)]
const springBreak = [new Date(2018,11,24), new Date(2019, 0,4)]
export const defaultStartDay1819 = new Date(2018, 8, 3)
export const defaultEndDay = new Date(2019, 5, 18)

export const defaultSchoolYear = fns.eachDay(defaultStartDay1819, defaultEndDay).filter(d => {
    if(fns.isWeekend(d) || 
    holidayList.reduce( (a:Date[],b) => a.concat(b.dates), []).some( h => fns.isSameDay(h,d))){
        return false;
    }
    return true;
    
})