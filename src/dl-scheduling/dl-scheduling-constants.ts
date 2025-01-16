import { ReportFiles } from '../shared/report-types'

//FIXME replace these names with javascript styled names

export const display_info = [
    'Student ID',
    'Name',
    'Grade',
    'Current Homeroom', 
    'ELL Program Year Code',
    'LRE',
    'ARS',
    'PDIS']
    
export const info_columns = [
    'Current Homeroom', 'Name','Birthdate','Gender','Grade','ELL','ELL Program Year Code',
    'LRE','ARS','PDIS','Cluster Program'
    ]

export const teacher_drop_columns = [
    'School',
    'Network',
    'School Code',
    'Para',
    'Access Test RPL',
    'Access Test WPL',
    'Access Test LPL',
    'Access Test SPL',
    'Access Test LitPL',
    'Access Test ComprehensionPL',
    'Access Com', 
    'Medical Condition'
    ]

export const teacher_core = [
    'ELA Gen Ed',
    'Math Gen Ed', 
    'Science Gen Ed',
    'Social Sciences Gen Ed',

    'ELA Sep',
    'Math Sep',
    'Science Sep',
    'Social Sciences Sep',
    ]

export const teacher_specials = [
    'Art Gen Ed',
    'Computers Gen Ed',
    'Health Ed Gen Ed', 
    'Library Gen Ed',
    'Music Gen Ed', 
    'Physical Ed Gen Ed', 
    'Vocational Gen Ed',
    'World Language Gen Ed',
 
    'Art Sep', 
    'Computers Sep', 
    'Health Ed Sep',
    'Library Sep', 
    'Music Sep', 
    'Physical Ed Sep', 
    'Vocational Sep',
    'World Language Sep',
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
    'Independent Function Gen Ed', 
    'Social Emotional Gen Ed', 
    'Other1 Gen Ed',
    'Other2 Gen Ed', 
    'Other3 Gen Ed',

    'Independent Function Sep',
    'Social Emotional Sep', 
    'Other1 Sep', 
    'Other2 Sep', 
    'Other3 Sep',
    ]

export const aide_core = [
    'Math Gen Ed Shared',
    'Math Gen Ed Dedicated', 
    'ELA Gen Ed Shared', 
    'ELA Gen Ed Dedicated', 
    'Science GE Shared',
    'Science Gen Ed Dedicated',
    'Social Science Gen Ed Shared',
    'Social Sciences Gen Ed Dedicated',

    
    'Math Separated Shared', 
    'Math Separated Dedicated',
    'ELA Separated Shared', 
    'ELA Separated Dedicated', 
    'Science Separated Shared', 
    'Science Separated Dedicated',
    'Social Science Separated Shared',
    'Social Sciences Separated Dedicated', 

    'Math Comm Shared',
    'Math Comm Dedicated',
    'ELA Comm Shared',
    'ELA Comm Dedicated', 
    'Science Comm Shared',
    'Science Comm Dedicated',
    'Social Sciences Comm Shared',
    'Social Sciences Comm Dedicated', 

    ]

export const aide_specials = [

    'Art Gen Ed Shared', 
    'Art GE Dedicated', 
    'Computers Gen Ed Shared',
    'Computers Gen Ed Dedicated',
    'Physical Ed Gen Ed Shared',
    'Physical Ed Gen Ed Dedicated', 
    'Health Ed Gen Ed Shared',
    'Health Ed Gen Ed Dedicated',
    'Library Gen Ed Shared',
    'Library Gen Ed Dedicated', 
    'Music Gen Ed Shared',
    'Music Gen Ed Dedicated',
    'Vocational Gen Ed Shared', 
    'Vocational Gen Ed Dedicated', 
    'World Language Gen Ed Shared',
    'World Language Gen Ed Dedicated',

    
    'Art Separated Shared', 
    'Art Separated Dedicated', 
    'Computers Separated Shared',
    'Computers Separated Dedicated',
    'Physical Ed Separated Shared', 
    'Physical Ed Separated Dedicated', 
    'Health Ed Separated Shared',
    'Health Ed Separated Dedicated',
    'Library Separated Shared', 
    'Library Separated Dedicated', 
    'Music Separated Shared',
    'Music Separated Dedicated',
    'Vocational Separated Shared', 
    'Vocational Separated Dedicated', 
    'World Language Separated Shared',
    'World Language Separated Dedicated',

    'Art Comm Shared', 
    'Art Comm Dedicated', 
    'Computers Comm Shared', 
    'Computers Comm Dedicated',
    'Physical Ed Comm Shared',
    'Physical Ed Comm Dedicated', 
    'Health Ed Comm Shared', 
    'Health Ed Comm Dedicated',
    'Library Comm Shared', 
    'Library Comm Dedicated', 
    'Music Comm Shared',
    'Music Comm Dedicated',
    'Vocational Comm Shared', 
    'Vocational Comm Dedicated', 
    'World Language Comm Shared',
    'World Language Comm Dedicated',
    ]

export const aide_additional = [
    'Other1 Gen Ed Shared', 
    'Other1 Gen Ed Dedicated', 
    'Other2 Gen Ed Shared', 
    'Other2 Gen Ed Dedicated',
    'Other3 Gen Ed Dedicated', 

    'Other1 Separated Shared',
    'Other1 Separated Dedicated',
    'Other2 Separated Shared', 
    'Other2 Separated Dedicated', 
    'Other3 Separated Dedicated',
    
    'Other1 Comm Shared', 
    'Other1 Comm Dedicated', 
    'Other2 Comm Shared',
    'Other2 Comm Dedicated',
    'Other3 Comm Shared',
    'Other3 Comm Dedicated', 
    ]

export const aide_services = [
   'Behavior Aud Shared', 
   'Behavior Aud Dedicated',
   'Behavior Bath Shared',
   'Behavior Bath Dedicated', 
   'Behavior Comm Shared', 
   'Behavior Comm Dedicated',
   'Behavior Gym Shared', 
   'Behavior Gym Dedicated', 
   'Behavior Hall Shared',
   'Behavior Hall Dedicated',
   'Behavior Lunch Shared', 
   'Behavior Lunch Dedicated', 
   'Behavior Play Ground Shared', 
   'Behavior Play Ground Dedicated',
   'BVI Shared',
   'BVI Dedicated', 
   'Daily Living Shared', 
   'Daily Living Dedicated',
   'Dressing Shared', 
   'Dressing Dedicated',
   'Feed Self Shared', 
   'Feed Self Dedicated', 
   'Feed Shared',
   'Feed Dedicated', 
   'Food Prep Shared', 
   'Food Prep Dedicated',
   'Lift P Shared', 
   'Lift P Dedicated', 
   'Mon Doc Shared',
   'Mon Doc Dedicated', 
   'Not Independent Shared', 
   'Not Independent Dedicated',
   'Not Toilet Shared', 
   'Not Toilet Dedicated', 
   'Walker Shared',
   'Walker Dedicated',
   'Wheel Chair Shared', 
   'Wheel Chair Dedicated', 

   'Toilet Training Dedicated', 
   
   'CB Include'
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

export const aide_drop_columns = [
    'CB Include',
    'Source',
]

export const drop_columns = teacher_drop_columns.concat(teacher_rls, teacher_rls_totals, aide_drop_columns)
export const final_columns = teacher_core.concat(teacher_specials, teacher_additional,
    aide_core, aide_specials, aide_additional, aide_services, aide_totals)