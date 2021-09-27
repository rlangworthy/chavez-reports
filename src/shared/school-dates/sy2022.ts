import * as fns from 'date-fns'
import {
    HolidayDate,
    SchoolYear} from '../initial-school-dates'

const holidayList2022: HolidayDate[] = [
    {
        name: 'Labor Day',
        dates: [new Date(2021, 8, 6)],
    },
    {
        name: "Indigenous Peoples' Day",
        dates: [new Date(2021, 9, 11)],
    },
    {
        name: "Veteran's Day",
        dates: [new Date(2021, 10,11)],
    },
    {
        name: 'Thanksgiving Holiday',
        dates: [new Date(2021, 10,25),new Date(2021, 10,26)]
    },
    {
        name: 'M.L.K. Day',
        dates: [new Date(2022, 0,17)]
    },
    {
        name: "President's Day",
        dates: [new Date(2022, 1,21)],
    },
    {
        name: 'Memorial Day',
        dates: [new Date(2022, 4, 30)]
    },
    {
        name: 'Winter Break',
        dates: fns.eachDay(new Date(2021, 11,20), new Date(2021, 11,31))
    },
    {
        name: 'Spring Break',
        dates: fns.eachDay(new Date(2022,3,11), new Date(2022, 3,15))
    }
]

const irregularDayList: HolidayDate[] = [
    {name: 'Report Card Distribution Days',
    dates: [new Date(2022, 1,4),new Date(2022, 5, 14)]},
    {name:'School Improvement Days',
    dates: [new Date(2021, 10, 5), new Date(2022, 0, 28), new Date(2022, 3, 8), new Date(2022, 5, 15)]},
    {name: 'Parent-Teacher Conference Days',
    dates: [new Date(2021, 10,17), new Date(2022, 3, 20)]}]

const defaultStartDay2021 = new Date(2021, 7, 30)
const defaultEndDay2021 = new Date(2022, 5, 14)

export const sy2022: SchoolYear = {
    holidays: holidayList2022,
    irregularDays: irregularDayList,
    startDate: defaultStartDay2021,
    endDate: defaultEndDay2021,
    q1End: new Date(2021, 10, 4),
    q2End: new Date(2022, 0, 27),
    q3End: new Date(2022, 3, 7),
    q4End: new Date(2022, 5, 14),
}