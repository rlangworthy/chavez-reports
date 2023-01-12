import * as fns from 'date-fns'
import {
    HolidayDate,
    SchoolYear} from '../initial-school-dates'

const holidayList2023: HolidayDate[] = [
    {
        name: 'Labor Day',
        dates: [new Date(2022, 8, 5)],
    },
    {
        name: "Indigenous Peoples' Day",
        dates: [new Date(2022, 9, 10)],
    },
    {
        name: "General Election Day",
        dates: [new Date(2022, 10,8)],
    },
    {
        name: 'Thanksgiving Holiday',
        dates: [new Date(2022, 10,24),new Date(2022, 10,25)]
    },
    {
        name: 'M.L.K. Day',
        dates: [new Date(2023, 0,16)]
    },
    {
        name: "President's Day",
        dates: [new Date(2023, 1,20)],
    },
    {
        name: 'Memorial Day',
        dates: [new Date(2023, 4, 29)]
    },
    {
        name: 'Winter Break',
        dates: fns.eachDay(new Date(2022, 11,23), new Date(2023, 0,6))
    },
    {
        name: 'Spring Break',
        dates: fns.eachDay(new Date(2023,3,3), new Date(2023, 3,7))
    }
]

const irregularDayList: HolidayDate[] = [
    {name: 'Report Card Distribution Days',
    dates: [new Date(2023, 0,13),new Date(2023, 5, 7)]},
    {name:'School Improvement Days',
    dates: [new Date(2022, 9, 21), new Date(2022, 11, 23), new Date(2023, 2, 17), new Date(2022, 5, 8)]},
    {name: 'Parent-Teacher Conference Days',
    dates: [new Date(2022, 10,22), new Date(2023, 2, 29)]}]

const defaultStartDay2023 = new Date(2022, 7, 22)
const defaultEndDay2023 = new Date(2023, 5, 7)

export const sy2023: SchoolYear = {
    holidays: holidayList2023,
    irregularDays: irregularDayList,
    startDate: defaultStartDay2023,
    endDate: defaultEndDay2023,
    q1End: new Date(2022, 9, 20),
    q2End: new Date(2022, 11, 22),
    q3End: new Date(2023, 2, 16),
    q4End: new Date(2023, 5, 7),
}