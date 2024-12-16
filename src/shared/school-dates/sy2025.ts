import * as fns from 'date-fns'
import {
    HolidayDate,
    SchoolYear} from '../initial-school-dates'

// note to self - months are 0-indexed for some reason
const holidayList2024: HolidayDate[] = [
    {
        name: 'Labor Day',
        dates: [new Date(2024, 8, 2)],
    },
    {
        name: "Indigenous Peoples' Day",
        dates: [new Date(2024, 9, 14)],
    },
    {
        name: "Election Day",
        dates: [new Date(2024, 10,5)],
    },
    {
        name: 'Thanksgiving Holiday',
        dates: [new Date(2024, 10,28),new Date(2024, 10,29)]
    },
    {
        name: 'M.L.K. Day',
        dates: [new Date(2025, 0,20)]
    },
    {
        name: "President's Day",
        dates: [new Date(2025, 1,17)],
    },
    {
        name: 'Memorial Day',
        dates: [new Date(2025, 4, 26)]
    },
    {
        name: 'Winter Break',
        dates: fns.eachDay(new Date(2024, 11,23), new Date(2025, 0,3))
    },
    {
        name: 'Spring Break',
        dates: fns.eachDay(new Date(2025,2,24), new Date(2025, 3,1))
    }
]

const irregularDayList: HolidayDate[] = [
    {name: 'Report Card Distribution Days',
    dates: [new Date(2025, 0, 24),new Date(2025, 5, 12)]},
    {name:'School Improvement Days',
    dates: [new Date(2025, 0, 21), new Date(2025, 2, 31), new Date(2025, 5, 13), new Date(2025, 5, 16)]},
    {name: 'Parent-Teacher Conference Days',
    dates: [new Date(2024, 10,4), new Date(2025, 3, 1)]}]

const defaultStartDay2024 = new Date(2024, 7, 19)
const defaultEndDay2024 = new Date(2025, 5, 16)

export const sy2025: SchoolYear = {
    holidays: holidayList2024,
    irregularDays: irregularDayList,
    startDate: defaultStartDay2024,
    endDate: defaultEndDay2024,
    q1End: new Date(2024, 9, 25),
    q2End: new Date(2025, 0, 17),
    q3End: new Date(2025, 2, 21),
    q4End: new Date(2025, 5, 12),
}