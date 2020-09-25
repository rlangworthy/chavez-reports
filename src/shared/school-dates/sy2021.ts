import * as fns from 'date-fns'
import {
    HolidayDate,
    SchoolYear} from '../initial-school-dates'

const holidayList2021: HolidayDate[] = [
    {
        name: 'Labor Day',
        dates: [new Date(2020, 8, 7)],
    },
    {
        name: "Indigenous Peoples' Day",
        dates: [new Date(2020, 9, 12)],
    },
    {
        name: "Veteran's Day",
        dates: [new Date(2020, 10,11)],
    },
    {
        name: 'Thanksgiving Holiday',
        dates: [new Date(2018, 10,25),new Date(2020, 10,26),new Date(2018, 10,27)]
    },
    {
        name: 'M.L.K. Day',
        dates: [new Date(2021, 0,18)]
    },
    {
        name: "President's Day",
        dates: [new Date(2021, 1,15)],
    },
    {
        name: 'Memorial Day',
        dates: [new Date(2021, 4, 31)]
    },
    {
        name: 'Winter Break',
        dates: fns.eachDay(new Date(2020,11,21), new Date(2021, 0,1))
    },
    {
        name: 'Spring Break',
        dates: fns.eachDay(new Date(2021,2,29), new Date(2021, 3,2))
    }
]

const irregularDayList: HolidayDate[] = [
    {name: 'Report Card Distribution Days',
    dates: [new Date(2021, 1,12),new Date(2021, 5, 22)]},
    {name:'School Improvement Days',
    dates: [new Date(2018, 10, 2), new Date(2019, 1, 1), new Date(2019, 3, 5), new Date(2019, 5, 19)]},
    {name: 'Parent-Teacher Conference Days',
    dates: [new Date(2020, 10,18), new Date(2021, 3, 21)]}]

const defaultStartDay2021 = new Date(2020, 8, 8)
const defaultEndDay = new Date(2019, 5, 22)

export const sy2021: SchoolYear = {
    holidays: holidayList2021,
    irregularDays: irregularDayList,
    startDate: defaultStartDay2021,
    endDate: defaultEndDay,
    q1End: new Date(2020, 10, 5),
    q2End: new Date(2021, 1, 4),
    q3End: new Date(2021, 3, 15),
    q4End: new Date(2021, 5, 22),
}