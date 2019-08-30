import * as fns from 'date-fns'
import {
    HolidayDate,
    SchoolYear} from '../initial-school-dates'

const holidayList1920: HolidayDate[] = [
    {
        name: 'Labor Day',
        dates: [new Date(2019, 8,2)],
    },
    {
        name: 'Columbus Day',
        dates: [new Date(2019, 9,14)],
    },
    {
        name: "Veteran's Day",
        dates: [new Date(2019, 10,11)],
    },
    {
        name: 'Thanksgiving Holiday',
        dates: [new Date(2019, 10,27),new Date(2019, 10,28), new Date(2019, 10,29)]
    },
    {
        name: 'M.L.K. Day',
        dates: [new Date(2020, 0,20)]
    },
    {
        name: "President's Day",
        dates: [new Date(2020, 1, 17)],
    },
    {
        name: 'Memorial Day',
        dates: [new Date(2020, 4,25)]
    },
    {
        name: 'Winter Break',
        dates: fns.eachDay(new Date(2019,11,23), new Date(2020, 0,3))
    },
    {
        name: 'Spring Break',
        dates: fns.eachDay(new Date(2020,3,6), new Date(2020, 3,10))
    },
]

const irregularDayList: HolidayDate[] = [
    {name: 'Report Card Distribution Days',
    dates: [new Date(2020, 1,7),new Date(2020, 5, 16)]},
    {name:'School Improement Days',
    dates: [new Date(2019, 10, 8), new Date(2020, 0, 31), new Date(2020, 3, 17), new Date(2020, 5, 17)]},
    {name: 'ES Parent-Teacher Conference Days',
    dates: [new Date(2019, 10,13), new Date(2020, 3, 22)]}

]

export const sy1920: SchoolYear = {
    holidays: holidayList1920,
    irregularDays: irregularDayList,
    startDate: new Date(2019, 8, 2),
    endDate: new Date(2020, 5, 16),
    q1End: new Date(2019, 10, 7),
    q2End: new Date(2020,0 , 30),
    q3End: new Date(2020, 3, 16),
    q4End: new Date(2020, 5, 16),
}