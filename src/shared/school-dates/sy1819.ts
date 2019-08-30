import * as fns from 'date-fns'
import {
    HolidayDate,
    SchoolYear} from '../initial-school-dates'

const holidayList1819: HolidayDate[] = [
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

const irregularDayList: HolidayDate[] = [
    {name: 'Report Card Distribution Days',
    dates: [new Date(2019, 1,8),new Date(2019, 5, 18)]},
    {name:'School Improement Days',
    dates: [new Date(2018, 10, 2), new Date(2019, 1, 1), new Date(2019, 3, 5), new Date(2019, 5, 19)]},
    {name: 'Parent-Teacher Conference Days',
    dates: [new Date(2018, 10,14), new Date(2019, 3, 10)]}]

const defaultStartDay1819 = new Date(2018, 8, 3)
const defaultEndDay = new Date(2019, 5, 18)

export const sy1819: SchoolYear = {
    holidays: holidayList1819,
    irregularDays: irregularDayList,
    startDate: defaultStartDay1819,
    endDate: defaultEndDay,
    q1End: new Date(2018, 10, 1),
    q2End: new Date(2018, 0, 31),
    q3End: new Date(2019, 3, 4),
    q4End: new Date(2019, 5, 18),
}
