# STAFF ABSENCE REPORT

This report takes punchcard data from Kronos and formats it in a human readable form.  It also provides users the ability to input hours for employees and calculate tardiness (in on time and out on time percentages).

## DATA PARSING

### RAW DATA FORMAT
The relevant columns are described in the table below.

| Column      | Description |
| ----------- | ----------- |
| PERSONNUM | Employee UID |
| PERSONFULLNAME | First, Last M.I. Also Unique|
| POSITION | Human readable position title |
| EVENTDATE| YYYY-MM-DD HH:MM:SS |
| PAYCODENAME | Three letter organization defined paycode plus short description |
| PUNCHDTM | YYYY-MM-DD HH:MM:SS AM/PM |
| ENDPUNCHDTM | YYYY-MM-DD HH:MM:SS AM/PM |
| HOURS | Paid hours for that punchcard event |

### GATHERING DATES AND TIMES
The data structures used for storing and manipulating punchcard data live in `staff-absence-types.ts`.  Each employee has their punchcard data reduced to two maps (this structure allows Date objects as keys, simplifying later code), one for 