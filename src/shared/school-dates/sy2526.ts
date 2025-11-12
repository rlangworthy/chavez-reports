import * as fns from 'date-fns'
import {
    HolidayDate,
    SchoolYear} from '../initial-school-dates'

// note to self - months are 0-indexed for some reason
const holidayList2526: HolidayDate[] = [
    {
        name: 'Labor Day',
        dates: [new Date(2025, 8, 1)],
    },
    {
        name: "Indigenous Peoples' Day",
        dates: [new Date(2025, 9, 13)],
    },
    {
        name: "Veteran's Day",
        dates: [new Date(2025, 10,11)],
    },
    {
        name: 'Thanksgiving Holiday',
        dates: [new Date(2025, 10,27),new Date(2025, 10,28)]
    },
    {
        name: 'M.L.K. Day',
        dates: [new Date(2026, 0,19)]
    },
    {
        name: "President's Day",
        dates: [new Date(2026, 1,16)],
    },
    {
        name: 'Memorial Day',
        dates: [new Date(2026, 4, 25)]
    },
    {
        name: 'Juneteenth',
        dates: [new Date(2026, 5, 19)]
    },
    {
        name: 'Winter Break',
        dates: fns.eachDay(new Date(2025, 11,22), new Date(2026, 0,2))
    },
    {
        name: 'Spring Break',
        dates: fns.eachDay(new Date(2026,2,23), new Date(2026, 2,27))
    }
]

const irregularDayList: HolidayDate[] = [
    {name: 'Report Card Distribution Days',
    dates: [new Date(2026, 0, 9),new Date(2026, 5, 4)]},
    {name:'School Improvement Days',
    dates: [new Date(2025, 8, 26), new Date(2026, 0, 5), new Date(2026, 1, 17), new Date(2026, 2, 17), new Date(2026, 3, 3)]},
    {name: 'Parent-Teacher Conference Days',
    dates: [new Date(2025, 9,27), new Date(2026, 3, 1)]}]

const defaultStartDay2526 = new Date(2025, 7, 18)
const defaultEndDay2526 = new Date(2026, 5, 4)

export const sy2526: SchoolYear = {
    holidays: holidayList2526,
    irregularDays: irregularDayList,
    startDate: defaultStartDay2526,
    endDate: defaultEndDay2526,
    q1End: new Date(2025, 9, 17),
    q2End: new Date(2025, 11, 19),
    q3End: new Date(2026, 2, 6),
    q4End: new Date(2026, 5, 4),
}