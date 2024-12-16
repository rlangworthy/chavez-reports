import { ReportFiles } from '../shared/report-types'

//FIXME replace these names with javascript styled names

export const display_info = ['Student ID', 'Name','Current Homeroom', 'Grade','ELL Program Year Code','LRE','ARS','PDIS']
export const info_columns = [
    'Current Homeroom', 'Name','Birthdate','Gender','Grade','ELL','ELL Program Year Code',
    'LRE','ARS','PDIS','Cluster Program'
    ]

    export const drop_columns = [
    'School', 'Network','School Code','Para','Access Test RPL','Access Test WPL','Access Test LPL',
    'Access Test SPL','Access Test LitPL','Access Test ComprehensionPL','Access Com', 'Medical Condition'
    ]

    export const teacher_core = [
    'ELA Gen Ed', 'Math Gen Ed', 'Science Gen Ed',
    'Social Sciences Gen Ed', 'ELA Sep', 'Math Sep', 'Science Sep',
    'Social Sciences Sep'
    ]

    export const teacher_specials = [
    'Art Gen Ed', 'Computers Gen Ed', 'Health Ed Gen Ed', 'Library Gen Ed',
     'Music Gen Ed', 'Physical Ed Gen Ed', 'Vocational Gen Ed',
     'World Language Gen Ed', 'Art Sep', 'Computers Sep', 'Health Ed Sep',
     'Library Sep', 'Music Sep', 'Physical Ed Sep', 'Vocational Sep',
     'World Language Sep'
    ]

    export const teacher_rls = [
    'Speech Gen Ed','SW Gen Ed','OT Gen Ed','PT Gen Ed','Nurse Gen Ed','Psych Gen Ed',
    'Speech Sep','SW Sep',  'OT Sep','PT Sep',  'Nurse Sep', 'Psych Sep'
    ]

    export const teacher_rls_totals = [
'Speech indirect min/wk',
'SW indirect min/wk', 'OT indirect min/wk', 'PT indirect min/wk',
'Nurse indirect min/wk', 'Psych indirect min/wk'
]

export const teacher_additional = [
'Independent Function Gen Ed', 'Social Emotional Gen Ed', 'Other1 Gen Ed',
'Other2 Gen Ed', 'Other3 Gen Ed', 'Independent Function Sep',
'Social Emotional Sep', 'Other1 Sep', 'Other2 Sep', 'Other3 Sep'
    ]

    export const aide_specials = [
    'Art GE Dedicated', 'Computers Gen Ed Dedicated',
     'Physical Ed Gen Ed Dedicated', 'Health Ed Gen Ed Dedicated',
     'Library Gen Ed Dedicated', 'Music Gen Ed Dedicated',
     'Vocational Gen Ed Dedicated', 'World Language Gen Ed Dedicated',
     'Art Separated Dedicated', 'Computers Separated Dedicated',
     'Physical Ed Separated Dedicated', 'Health Ed Separated Dedicated',
     'Library Separated Dedicated', 'Music Separated Dedicated',
     'Vocational Separated Dedicated', 'World Language Separated Dedicated',
     'Art Gen Ed Shared', 'Computers Gen Ed Shared', 'Physical Ed Gen Ed Shared',
     'Health Ed Gen Ed Shared', 'Library Gen Ed Shared', 'Music Gen Ed Shared',
     'Vocational Gen Ed Shared', 'World Language Gen Ed Shared',
     'Art Separated Shared', 'Computers Separated Shared',
     'Physical Ed Separated Shared', 'Health Ed Separated Shared',
     'Library Separated Shared', 'Music Separated Shared',
     'Vocational Separated Shared', 'World Language Separated Shared',
     'Art Comm Dedicated', 'Computers Comm Dedicated',
     'Physical Ed Comm Dedicated', 'Health Ed Comm Dedicated',
     'Library Comm Dedicated', 'Music Comm Dedicated',
     'Vocational Comm Dedicated', 'World Language Comm Dedicated',
     'Art Comm Shared', 'Computers Comm Shared', 'Physical Ed Comm Shared',
     'Health Ed Comm Shared', 'Library Comm Shared', 'Music Comm Shared',
     'Vocational Comm Shared', 'World Language Comm Shared'
    ]
    export const aide_core = [
    'Math Gen Ed Dedicated', 'ELA Gen Ed Dedicated', 'Science Gen Ed Dedicated',
    'Social Sciences Gen Ed Dedicated', 'Math Separated Dedicated',
    'ELA Separated Dedicated', 'Science Separated Dedicated',
    'Social Sciences Separated Dedicated', 'Math Gen Ed Shared',
    'ELA Gen Ed Shared', 'Science GE Shared', 'Social Science Gen Ed Shared',
    'Math Separated Shared', 'ELA Separated Shared', 'Science Separated Shared',
    'Social Science Separated Shared', 'Math Comm Dedicated',
    'ELA Comm Dedicated', 'Science Comm Dedicated',
    'Social Sciences Comm Dedicated', 'Math Comm Shared', 'ELA Comm Shared',
    'Science Comm Shared', 'Social Sciences Comm Shared',
    ]
    export const aide_additional = [
    'Other1 Gen Ed Dedicated', 'Other2 Gen Ed Dedicated',
    'Other3 Gen Ed Dedicated', 'Other1 Separated Dedicated',
    'Other2 Separated Dedicated', 'Other3 Separated Dedicated',
    'Other1 Gen Ed Shared', 'Other2 Gen Ed Shared', 'Other1 Separated Shared',
    'Other2 Separated Shared', 'Other1 Comm Dedicated', 'Other2 Comm Dedicated',
    'Other3 Comm Dedicated', 'Other1 Comm Shared', 'Other2 Comm Shared',
    'Other3 Comm Shared'
    ]
    export const aide_services = [
   'Behavior Aud Dedicated',
   'Behavior Bath Dedicated', 'Behavior Comm Dedicated',
   'Behavior Gym Dedicated', 'Behavior Hall Dedicated',
   'Behavior Lunch Dedicated', 'Behavior Play Ground Dedicated',
   'BVI Dedicated', 'Daily Living Dedicated', 'Dressing Dedicated',
   'Feed Dedicated', 'Feed Self Dedicated', 'Food Prep Dedicated',
   'Lift P Dedicated', 'Mon Doc Dedicated', 'Not Independent Dedicated',
   'Not Toilet Dedicated', 'Toilet Training Dedicated', 'Walker Dedicated',
   'Wheel Chair Dedicated', 'Behavior Aud Shared', 'Behavior Bath Shared',
   'Behavior Comm Shared', 'Behavior Gym Shared', 'Behavior Hall Shared',
   'Behavior Lunch Shared', 'Behavior Play Ground Shared', 'BVI Shared',
   'Daily Living Shared', 'Dressing Shared', 'Feed Self Shared', 'Feed Shared',
   'Food Prep Shared', 'Lift P Shared', 'Mon Doc Shared',
   'Not Independent Shared', 'Not Toilet Shared', 'Walker Shared',
   'Wheel Chair Shared', 'CB Include'
    ]
    export const aide_totals = [
'Total Behavior Dedicated',
'Total Behavior Shared', 'Total Instructional Dedicated',
'Total Instructional Shared', 'Total Personal Care Dedicated',
'Total Personal Care Shared', 'Total Dedicated', 'Total Shared',
'Speech indirect min/wk', 'SW indirect min/wk', 'OT indirect min/wk',
'PT indirect min/wk', 'Nurse indirect min/wk', 'Psych indirect min/wk',
'Source'
    ]

    export const final_columns = teacher_core.concat(teacher_specials, teacher_rls, 
    aide_core, aide_specials, aide_services, aide_totals)