export type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'F' | 'a' | 'b' | 'c' | 'd' | 'f';
export const LetterGradeList = ['A' , 'B' , 'C' , 'D' , 'F' , 'a' , 'b' , 'c' , 'd' , 'f']

export type Score = string | 'Msg' | 'Exc' | 'Inc' | '' | LetterGrade;
export const missingValues = ['Msg', 'MSG', 'msg']
export const incompleteValues = ['Inc', 'INC', 'inc']
export const excusedValues = ['Exc', 'EXC', 'exc', '/']

type KeysEnum<T> = { [P in keyof Required<T>]: true };


export interface StudentReportingDataExportRow {
  'School ID': string
  'School Name': string
  'Student Last Name': string
  'Student First Name': string
  'Student ID': string
  'Grade Level': string
  'Grade Term': string
  'Class ID': string
  'Description':string
  'Room': string
  'Period': string
  'Teacher Name': string
  'Assignment Name': string
  'Assignment ID': string
  'Assignment Due': string
  'Assignment Date': string
  'Grade Entered on': string
  'Score':string	
  'Score Possible': string
  'Category Code': string
  'Category Name': string
  'Category Weight': string
  'Average Mode': string
  'Gradebook Default Indicator': string
  'Max Grades to Drop': string
  'Drop Mode': string
  'Running Term Average': string
  'Running Term Letter Grade': string
  'Posted Term Grade': string
  'Term Grade Override Indicator': string
  'Cumulative/Overall Average': string
  'Semester/Final Letter Grade': string
  'Posted Final Grade': string
  'Homeroom': string
  'FRM Status': string
  'Gender': string
  'Student Address': string
  'Enrollment Days': string
  'Present': string
  'Full Day Unexcused': string
  'Tardy': string
  '1/2 Day Unexcused': string
  '1/2 Day Excused': string
  'Full Day Excused': string
  'DL Status': string
  'EL Program Year': string
}

export const StudentReportingDataExportRowKeys: KeysEnum<StudentReportingDataExportRow> = {
  'School ID': true,
  'School Name': true,
  'Student Last Name': true,
  'Student First Name': true,
  'Description':true,
  'Student ID': true,
  'Grade Level': true,
  'Grade Term': true,
  'Class ID': true,
  'Room': true,
  'Period': true,
  'Teacher Name': true,
  'Assignment Name': true,
  'Assignment ID': true,
  'Assignment Due': true,
  'Assignment Date': true,
  'Grade Entered on': true,
  'Score': true,
  'Score Possible': true,
  'Category Code': true,
  'Category Name': true,
  'Category Weight': true,
  'Average Mode': true,
  'Gradebook Default Indicator': true,
  'Max Grades to Drop': true,
  'Drop Mode': true,
  'Running Term Average': true,
  'Running Term Letter Grade': true,
  'Posted Term Grade': true,
  'Term Grade Override Indicator': true,
  'Cumulative/Overall Average': true,
  'Semester/Final Letter Grade': true,
  'Posted Final Grade': true,
  'Homeroom': true,
  'FRM Status': true,
  'Gender': true,
  'Student Address': true,
  'Enrollment Days': true,
  'Present': true,
  'Full Day Unexcused': true,
  'Tardy':true,
  '1/2 Day Unexcused': true,
  '1/2 Day Excused': true,
  'Full Day Excused': true,
  'DL Status': true,
  'EL Program Year': true,
}
export interface AspenESGradesRow {
  'Student Last Name': string
  'Student First Name': string
  'Student ID' : string
  'Grade Level' : string
  'Homeroom' : string
  'Quarter' : string
  'Course Name' : string
  'Course Number': string
  'Teacher Last Name' : string
  'Teacher First Name' : string
  'Running Term Average': string
  'Running Term Letter Grade': string
  'Posted Term Grade': string
  'Term Grade Override Indicator': string
  'Cumulative Semester Average': string
  'Final Average Letter': string
  'Final Grade': string
  'Final Grade Override Indicator': string
}
export const aspenESGradesRowKeys: KeysEnum<AspenESGradesRow> = {
  'Student Last Name': true,
  'Student First Name': true,
  'Student ID' : true,
  'Grade Level' : true,
  'Homeroom' : true,
  'Quarter' : true,
  'Course Name' : true,
  'Course Number': true,
  'Teacher Last Name' : true,
  'Teacher First Name' : true,
  'Running Term Average': true,
  'Running Term Letter Grade': true,
  'Posted Term Grade': true,
  'Term Grade Override Indicator': true,
  'Cumulative Semester Average': true,
  'Final Average Letter': true,
  'Final Grade': true,
  'Final Grade Override Indicator': true,
}
export interface AspenHSThresholdRow {
  'Student ID': string
  'Student Name': string
  'Grade Level':string
  'Section':string
  'Period':string
  'Course Name':string
  'Numeric Average':string
  'Teacher Name':string
  
}
export interface AspenAssignmentRow {
  'Student Last Name': string
  'Student First Name': string
  'Student ID' : string
  'Grade Level' : string
  'Grade Term' : string
  'Class Name' : string
  'Teacher Last Name' : string
  'Teacher First Name' : string
  'Assignment Name' : string
  'Score' : string
  'Score Possible' : string
  'Category Name' : string
  'Category Weight' : string
  'Assigned Date' : string
  'Assignment Due': string
  'Grade entered on': string
}
export const aspenAssignmentRowKeys: KeysEnum<AspenAssignmentRow> = {
  'Student Last Name': true,
  'Student First Name': true,
  'Student ID' : true,
  'Grade Level' : true,
  'Grade Term' : true,
  'Class Name' : true,
  'Teacher Last Name' : true,
  'Teacher First Name' : true,
  'Assignment Name' : true,
  'Score' : true,
  'Score Possible' : true,
  'Category Name' : true,
  'Category Weight' : true,
  'Assigned Date' : true,
  'Assignment Due': true,
  'Grade entered on': true,
}
export interface AspenCategoriesRow {
  'Teacher First Name': string
  'Teacher Last Name' : string
  'Class Number' : string
  'CLS Cycle' : string
  'Average Mode Setting' : string
  'Category Name' : string
  'Category Weight' : string
  'Category Percentage' : string
  'Max Grades to Drop' : string
}
export const aspenCategoriesRowKeys: KeysEnum<AspenCategoriesRow> = {
  'Teacher First Name': true,
  'Teacher Last Name' : true,
  'Class Number' : true,
  'CLS Cycle' : true,
  'Average Mode Setting' : true,
  'Category Name' : true,
  'Category Weight' : true,
  'Category Percentage' : true,
  'Max Grades to Drop': true,
}
export interface MClassStudentSummary {
  'Student Primary ID': string
  'Assessment Measure-TRC Proficiency Level-Levels': string
  'Assessment Grade' : string
  'Reporting Class ID' : string //homeroom
  'Benchmark Period' : 'BOY' | 'MOY' | 'EOY'
}
export interface RawESCumulativeGradeExtractRow {
    SchoolID:string
    SchoolName: string
    StudentID: string
    StudentFirstName: string
    StudentLastName: string
    StudentHomeroom: string
    StudentGradeLevel: string
    Quarter: string
    SubjectName: string
    TeacherLastName: string
    TeacherFirstName: string
    QuarterAvg: string
    FinalAvg: string
    QuarterGrade: string
  }
export interface RawStudentProfessionalSupportDetailsRow {
    'Student ID': string
    Name: string
    ELL: string
    PDIS: string
    'ELL Program Year Code': string
    Grade: string
    LRE: string
}
export const rawStudentProfessionalSupportDetailsRowKeys: KeysEnum<RawStudentProfessionalSupportDetailsRow> = {
  'Student ID': true,
  Name: true,
  ELL: true,
  PDIS: true,
  'ELL Program Year Code': true,
  Grade: true,
  LRE: true,
}

export interface RawStudentParaprofessionalMinutesRow { 
  'School':string
  'Current Homeroom':string
  'Name':string
  'Birthdate':string
  'Gender':string
  'Grade':string
  'ELL':string
  'ELL Program Year Code':string
  'LRE':string
  'ARS':string
  'PDIS':string
  'Cluster Program':string
  'Medical Condition':string
  'Art GE Dedicated':string
  'Computers Gen Ed Dedicated':string
  'Physical Ed Gen Ed Dedicated':string
  'Health Ed Gen Ed Dedicated':string
  'Library Gen Ed Dedicated':string
  'Music Gen Ed Dedicated':string
  'Vocational Gen Ed Dedicated':string
  'World Language Gen Ed Dedicated':string
  'Art Separated Dedicated':string
  'Computers Separated Dedicated':string
  'Physical Ed Separated Dedicated':string
  'Health Ed Separated Dedicated':string
  'Library Separated Dedicated':string
  'Music Separated Dedicated':string
  'Vocational Separated Dedicated':string
  'World Language Separated Dedicated':string
  'Art Gen Ed Shared':string
  'Computers Gen Ed Shared':string
  'Physical Ed Gen Ed Shared':string
  'Health Ed Gen Ed Shared':string
  'Library Gen Ed Shared':string
  'Music Gen Ed Shared':string
  'Vocational Gen Ed Shared':string
  'World Language Gen Ed Shared':string
  'Art Separated Shared':string
  'Computers Separated Shared':string
  'Physical Ed Separated Shared':string
  'Health Ed Separated Shared':string
  'Library Separated Shared':string
  'Music Separated Shared':string
  'Vocational Separated Shared':string
  'World Language Separated Shared':string
  'Art Comm Dedicated':string
  'Computers Comm Dedicated':string
  'Physical Ed Comm Dedicated':string
  'Health Ed Comm Dedicated':string
  'Library Comm Dedicated':string
  'Music Comm Dedicated':string
  'Vocational Comm Dedicated':string
  'World Language Comm Dedicated':string
  'Art Comm Shared':string
  'Computers Comm Shared':string
  'Physical Ed Comm Shared':string
  'Health Ed Comm Shared':string
  'Library Comm Shared':string
  'Music Comm Shared':string
  'Vocational Comm Shared':string
  'World Language Comm Shared':string
  'Math Gen Ed Dedicated':string
  'ELA Gen Ed Dedicated':string
  'Science Gen Ed Dedicated':string
  'Social Sciences Gen Ed Dedicated':string
  'Math Separated Dedicated':string
  'ELA Separated Dedicated':string
  'Science Separated Dedicated':string
  'Social Sciences Separated Dedicated':string
  'Math Gen Ed Shared':string
  'ELA Gen Ed Shared':string
  'Science GE Shared':string
  'Social Science Gen Ed Shared':string
  'Math Separated Shared':string
  'ELA Separated Shared':string
  'Science Separated Shared':string
  'Social Science Separated Shared':string
  'Math Comm Dedicated':string
  'ELA Comm Dedicated':string
  'Science Comm Dedicated':string
  'Social Sciences Comm Dedicated':string
  'Math Comm Shared':string
  'ELA Comm Shared':string
  'Science Comm Shared':string
  'Social Sciences Comm Shared':string
  'Other1 Gen Ed Dedicated':string
  'Other2 Gen Ed Dedicated':string
  'Other3 Gen Ed Dedicated':string
  'Other1 Separated Dedicated':string
  'Other2 Separated Dedicated':string
  'Other3 Separated Dedicated':string
  'Other1 Gen Ed Shared':string
  'Other2 Gen Ed Shared':string
  'Other1 Separated Shared':string
  'Other2 Separated Shared':string
  'Other1 Comm Dedicated':string
  'Other2 Comm Dedicated':string
  'Other3 Comm Dedicated':string
  'Other1 Comm Shared':string
  'Other2 Comm Shared':string
  'Other3 Comm Shared':string
  'Behavior Aud Dedicated':string
  'Behavior Bath Dedicated':string
  'Behavior Comm Dedicated':string
  'Behavior Gym Dedicated':string
  'Behavior Hall Dedicated':string
  'Behavior Lunch Dedicated':string
  'Behavior Play Ground Dedicated':string
  'BVI Dedicated':string
  'Daily Living Dedicated':string
  'Dressing Dedicated':string
  'Feed Dedicated':string
  'Feed Self Dedicated':string
  'Food Prep Dedicated' :string
  'Lift P Dedicated':string
  'Mon Doc Dedicated' :string
  'Not Independent Dedicated':string
  'Not Toilet Dedicated' :string
  'Toilet Training Dedicated':string
  'Walker Dedicated':string
  'Wheel Chair Dedicated' :string
  'Behavior Aud Shared' :string
  'Behavior Bath Shared':string
  'Behavior Comm Shared':string
  'Behavior Gym Shared':string
  'Behavior Hall Shared':string
  'Behavior Lunch Shared' :string
  'Behavior Play Ground Shared' :string
  'BVI Shared':string
  'Daily Living Shared':string
  'Dressing Shared':string
  'Feed Self Shared' :string
  'Feed Shared' :string
  'Food Prep Shared' :string
  'Lift P Shared' :string
  'Mon Doc Shared' :string
  'Not Independent Shared' :string
  'Not Toilet Shared':string
  'Walker Shared':string
  'Wheel Chair Shared':string
  'CB Include':string
  'Total Behavior Dedicated':string
  'Total Instructional Dedicated':string
  'Total Personal Care Dedicated':string
  'Total Dedicated' :string
  'Total Behavior Shared':string
  'Total Instructional Shared' :string
  'Total Personal Care Shared' :string
  'Total Shared':string
  'Speech indirect min/wk' :string
  'SW indirect min/wk' :string
  'OT indirect min/wk':string
  'PT indirect min/wk':string
  'Nurse indirect min/wk':string
  'Psych indirect min/wk':string
  'Source':string
}
export const RawStudentParaprofessionalMinutesRowKeys: KeysEnum<RawStudentParaprofessionalMinutesRow> = {
  'School':true, 
  'Current Homeroom':true,
  'Name':true,
  'Birthdate':true,
  'Gender':true,
  'Grade':true,
  'ELL':true,
  'ELL Program Year Code':true,
  'LRE':true,
  'ARS':true,
  'PDIS':true,
  'Cluster Program':true,
  'Medical Condition':true,
  'Art GE Dedicated':true,
  'Computers Gen Ed Dedicated':true,
  'Physical Ed Gen Ed Dedicated':true,
  'Health Ed Gen Ed Dedicated':true,
  'Library Gen Ed Dedicated':true,
  'Music Gen Ed Dedicated':true,
  'Vocational Gen Ed Dedicated':true,
  'World Language Gen Ed Dedicated':true,
  'Art Separated Dedicated':true,
  'Computers Separated Dedicated':true,
  'Physical Ed Separated Dedicated':true,
  'Health Ed Separated Dedicated':true,
  'Library Separated Dedicated':true,
  'Music Separated Dedicated':true,
  'Vocational Separated Dedicated':true,
  'World Language Separated Dedicated':true,
  'Art Gen Ed Shared':true,
  'Computers Gen Ed Shared':true,
  'Physical Ed Gen Ed Shared':true,
  'Health Ed Gen Ed Shared':true,
  'Library Gen Ed Shared':true,
  'Music Gen Ed Shared':true,
  'Vocational Gen Ed Shared':true,
  'World Language Gen Ed Shared':true,
  'Art Separated Shared':true,
  'Computers Separated Shared':true,
  'Physical Ed Separated Shared':true,
  'Health Ed Separated Shared':true,
  'Library Separated Shared':true,
  'Music Separated Shared':true,
  'Vocational Separated Shared':true,
  'World Language Separated Shared':true,
  'Art Comm Dedicated':true,
  'Computers Comm Dedicated':true,
  'Physical Ed Comm Dedicated':true,
  'Health Ed Comm Dedicated':true,
  'Library Comm Dedicated':true,
  'Music Comm Dedicated':true,
  'Vocational Comm Dedicated':true,
  'World Language Comm Dedicated':true,
  'Art Comm Shared':true,
  'Computers Comm Shared':true,
  'Physical Ed Comm Shared':true,
  'Health Ed Comm Shared':true,
  'Library Comm Shared':true,
  'Music Comm Shared':true,
  'Vocational Comm Shared':true,
  'World Language Comm Shared':true,
  'Math Gen Ed Dedicated':true,
  'ELA Gen Ed Dedicated':true,
  'Science Gen Ed Dedicated':true,
  'Social Sciences Gen Ed Dedicated':true,
  'Math Separated Dedicated':true,
  'ELA Separated Dedicated':true,
  'Science Separated Dedicated':true,
  'Social Sciences Separated Dedicated':true,
  'Math Gen Ed Shared':true,
  'ELA Gen Ed Shared':true,
  'Science GE Shared':true,
  'Social Science Gen Ed Shared':true,
  'Math Separated Shared':true,
  'ELA Separated Shared':true,
  'Science Separated Shared':true,
  'Social Science Separated Shared':true,
  'Math Comm Dedicated':true,
  'ELA Comm Dedicated':true,
  'Science Comm Dedicated':true,
  'Social Sciences Comm Dedicated':true,
  'Math Comm Shared':true,
  'ELA Comm Shared':true,
  'Science Comm Shared':true,
  'Social Sciences Comm Shared':true,
  'Other1 Gen Ed Dedicated':true,
  'Other2 Gen Ed Dedicated':true,
  'Other3 Gen Ed Dedicated':true,
  'Other1 Separated Dedicated':true,
  'Other2 Separated Dedicated':true,
  'Other3 Separated Dedicated':true,
  'Other1 Gen Ed Shared':true,
  'Other2 Gen Ed Shared':true,
  'Other1 Separated Shared':true,
  'Other2 Separated Shared':true,
  'Other1 Comm Dedicated':true,
  'Other2 Comm Dedicated':true,
  'Other3 Comm Dedicated':true,
  'Other1 Comm Shared':true,
  'Other2 Comm Shared':true,
  'Other3 Comm Shared':true,
  'Behavior Aud Dedicated':true,
  'Behavior Bath Dedicated':true,
  'Behavior Comm Dedicated':true,
  'Behavior Gym Dedicated':true,
  'Behavior Hall Dedicated':true,
  'Behavior Lunch Dedicated':true,
  'Behavior Play Ground Dedicated':true,
  'BVI Dedicated':true,
  'Daily Living Dedicated':true,
  'Dressing Dedicated':true,
  'Feed Dedicated':true,
  'Feed Self Dedicated':true,
  'Food Prep Dedicated' :true,
  'Lift P Dedicated':true,
  'Mon Doc Dedicated' :true,
  'Not Independent Dedicated':true,
  'Not Toilet Dedicated' :true,
  'Toilet Training Dedicated':true,
  'Walker Dedicated':true,
  'Wheel Chair Dedicated' :true,
  'Behavior Aud Shared' :true,
  'Behavior Bath Shared':true,
  'Behavior Comm Shared':true,
  'Behavior Gym Shared':true,
  'Behavior Hall Shared':true,
  'Behavior Lunch Shared' :true,
  'Behavior Play Ground Shared' :true,
  'BVI Shared':true,
  'Daily Living Shared':true,
  'Dressing Shared':true,
  'Feed Self Shared' :true,
  'Feed Shared' :true,
  'Food Prep Shared' :true,
  'Lift P Shared' :true,
  'Mon Doc Shared' :true,
  'Not Independent Shared' :true,
  'Not Toilet Shared':true,
  'Walker Shared':true,
  'Wheel Chair Shared':true,
  'CB Include':true,
  'Total Behavior Dedicated':true,
  'Total Instructional Dedicated':true,
  'Total Personal Care Dedicated':true,
  'Total Dedicated' :true,
  'Total Behavior Shared':true,
  'Total Instructional Shared' :true,
  'Total Personal Care Shared' :true,
  'Total Shared':true,
  'Speech indirect min/wk' :true,
  'SW indirect min/wk' :true,
  'OT indirect min/wk':true,
  'PT indirect min/wk':true,
  'Nurse indirect min/wk':true,
  'Psych indirect min/wk':true,
  'Source':true,
}

export interface RawStudentSpecialEdInstructionRow {
  'School':string
  'Current Homeroom':string
  'Name':string
  'Birthdate':string
  'Gender':string
  'Grade':string
  'ELL':string
  'ELL Program Year Code':string
  'LRE':string
  'ARS':string
  'PDIS':string
  'Cluster Program':string
  'Medical Condition':string
  'Art Gen Ed':string
  'Computers Gen Ed':string
  'Health Ed Gen Ed':string
  'Library Gen Ed':string
  'Music Gen Ed':string
  'Physical Ed Gen Ed':string
  'Vocational Gen Ed':string
  'World Language Gen Ed':string
  'Art Sep':string
  'Computers Sep':string
  'Health Ed Sep':string
  'Library Sep':string
  'Music Sep':string
  'Physical Ed Sep':string
  'Vocational Sep':string
  'World Language Sep':string
  'ELA Gen Ed':string
  'Math Gen Ed':string
  'Science Gen Ed':string
  'Social Sciences Gen Ed':string
  'ELA Sep':string
  'Math Sep':string
  'Science Sep':string
  'Social Sciences Sep':string
  'Speech indirect min/wk':string
  'SW indirect min/wk':string
  'OT indirect min/wk':string
  'PT indirect min/wk':string
  'Nurse indirect min/wk':string
  'Psych indirect min/wk':string
  'Independent Function Gen Ed':string
  'Social Emotional Gen Ed':string
  'Other1 Gen Ed':string
  'Other2 Gen Ed':string
  'Other3 Gen Ed':string
  'Independent Function Sep':string
  'Social Emotional Sep':string
  'Other1 Sep':string
  'Other2 Sep':string
  'Other3 Sep':string
  'Speech Gen Ed':string
  'Speech Sep':string
  'SW Gen Ed':string
  'SW Sep':string
  'OT Gen Ed':string
  'OT Sep':string
  'PT Gen Ed':string
  'PT Sep':string
  'Nurse Gen Ed':string
  'Nurse Sep':string
  'Psych Gen Ed':string
  'Psych Sep':string
}
export const RawStudentSpecialEdInstructionRowKeys: KeysEnum<RawStudentSpecialEdInstructionRow> = {
  'School':true, 
  'Current Homeroom':true,
  'Name':true,
  'Birthdate':true,
  'Gender':true,
  'Grade':true,
  'ELL':true,
  'ELL Program Year Code':true,
  'LRE':true,
  'ARS':true,
  'PDIS':true,
  'Cluster Program':true,
  'Medical Condition':true,
  'Art Gen Ed':true,
  'Computers Gen Ed':true,
  'Health Ed Gen Ed':true,
  'Library Gen Ed':true,
  'Music Gen Ed':true,
  'Physical Ed Gen Ed':true,
  'Vocational Gen Ed':true,
  'World Language Gen Ed':true,
  'Art Sep':true,
  'Computers Sep':true,
  'Health Ed Sep':true,
  'Library Sep':true,
  'Music Sep':true,
  'Physical Ed Sep':true,
  'Vocational Sep':true,
  'World Language Sep':true,
  'ELA Gen Ed':true,
  'Math Gen Ed':true,
  'Science Gen Ed':true,
  'Social Sciences Gen Ed':true,
  'ELA Sep':true,
  'Math Sep':true,
  'Science Sep':true,
  'Social Sciences Sep':true,
  'Speech indirect min/wk':true,
  'SW indirect min/wk':true,
  'OT indirect min/wk':true,
  'PT indirect min/wk':true,
  'Nurse indirect min/wk':true,
  'Psych indirect min/wk':true,
  'Independent Function Gen Ed':true,
  'Social Emotional Gen Ed':true,
  'Other1 Gen Ed':true,
  'Other2 Gen Ed':true,
  'Other3 Gen Ed':true,
  'Independent Function Sep':true,
  'Social Emotional Sep':true,
  'Other1 Sep':true,
  'Other2 Sep':true,
  'Other3 Sep':true,
  'Speech Gen Ed':true,
  'Speech Sep':true,
  'SW Gen Ed':true,
  'SW Sep':true,
  'OT Gen Ed':true,
  'OT Sep':true,
  'PT Gen Ed':true,
  'PT Sep':true,
  'Nurse Gen Ed':true,
  'Nurse Sep':true,
  'Psych Gen Ed':true,
  'Psych Sep':true,
}


export interface RawPunchcardRow {
  PERSONNUM: string
  PERSONFULLNAME: string
  POSITION: string
  EVENTDATE: string
  PAYCODENAME: string
  PUNCHDTM: string
  ENDPUNCHDTM: string    
  HOURS: string
}

export const rawPunchcardRowKeys: KeysEnum<RawPunchcardRow> = {
  PERSONNUM: true,
  PERSONFULLNAME: true,
  POSITION: true,
  EVENTDATE: true,
  PAYCODENAME: true,
  PUNCHDTM: true,
  ENDPUNCHDTM: true,    
  HOURS: true,
}

export interface RawAssignmentsRow {
  StuStudentId: string
  ClassName: string
  TeacherLast: string
  TeacherFirst: string 
  ASGName: string 
  Score: Score 
  ScorePossible: string
  CategoryName: string
  CategoryWeight: string
  GradeEnteredOn: string
}

export interface RawTeacherCategoriesAndTotalPointsLogicRow {
  SchoolID: string
  SchoolName: string
  TeacherLastName: string
  TeacherFirstName: string
  ClassName: string
  CLSCycle: string
  MultipleWeightMode: string
  TotalPointsLogicSetting: string
  MaxGradestoDrop: string
  CategoryName: string
  CategoryWeight: string
  CategoryPercent: string
}

export interface ThresholdReport {
  'Student ID': string
  'Student Name': string
  'Grade Level': string
  'Course ID': string
  'Section': string
  'Period': string
  'Course Name': string
  'Cavg': string
  'Teacher Name': string
}

export interface StudentSearchListRow {
  STUDENT_ID: string
  STUDENT_NAME: string
  STUDENT_ACTIVITY_INDICATOR: string
  textbox8: string //grade level
  STUDENT_CURRENT_HOMEROOM: string
  STUDENT_RACE: string //sex
  STUDENT_ESL_INDICATOR: string //race
}

export const studentSearchListRowKeys: KeysEnum<StudentSearchListRow> = {
  STUDENT_ID: true,
  STUDENT_NAME: true,
  STUDENT_ACTIVITY_INDICATOR: true,
  textbox8: true, //grade level
  STUDENT_CURRENT_HOMEROOM: true,
  STUDENT_RACE: true, //sex
  STUDENT_ESL_INDICATOR: true, //race
}

export interface RawNWEACDFRow {
  Network:string
  School:string
	CurrentGradeLevel:string
	CurrentHomeroom:string
	StudentName:string
	StudentID:string
	TestedSchoolName:string
	Discipline1:string
	GrowthMeasureYN:string
	TestName:string
	TestStartDate:string
	TestStartTime1:string
	TestDurationMinutes:string
	Pauses:string
	PercentageCorrect:string
	RapidGuessingPercentage:string
	TestRITScore:string
	TestStdError:string
	TestPercentile:string
	TestPercentile_32:string
	TypicalFallToFallGrowth:string
	TypicalSpringToSpringGrowth:string
	TypicalFallToSpringGrowth:string
	TypicalFallToWinter:string
	StartGrade:string
	LYSpringTestDate:string
	LYSpringRITScore:string
	SpringProjectedGain:string
	CYSpringProjectedRIT:string
	GrowthNeededtoAchieveProjected:string
	RITtoReadingScore:string
	RITtoReadingMin:string
	RITtoReadingMax:string
}

export const rawNWEACDFRowKeys: KeysEnum<RawNWEACDFRow> = {
  Network: true,
	School: true,
	CurrentGradeLevel: true,
	CurrentHomeroom: true,
	StudentName: true,
	StudentID: true,
	TestedSchoolName: true,
	Discipline1: true,
	GrowthMeasureYN: true,
	TestName: true,
	TestStartDate: true,
	TestStartTime1: true,
	TestDurationMinutes: true,
	Pauses: true,
	PercentageCorrect: true,
	RapidGuessingPercentage: true,
	TestRITScore: true,
	TestStdError: true,
	TestPercentile: true,
	TestPercentile_32: true,
	TypicalFallToFallGrowth: true,
	TypicalSpringToSpringGrowth: true,
	TypicalFallToSpringGrowth: true,
	TypicalFallToWinter: true,
	StartGrade: true,
	LYSpringTestDate: true,
	LYSpringRITScore: true,
	SpringProjectedGain: true,
	CYSpringProjectedRIT: true,
	GrowthNeededtoAchieveProjected: true,
	RITtoReadingScore: true,
	RITtoReadingMin: true,
	RITtoReadingMax: true,
}

export interface Tardies {
  'Student ID': string
  Attended: string
  Days: string
}

export const tardiesKeys: KeysEnum<Tardies> = {
    'Student ID': true,
    Attended: true,
    Days: true,
}

export interface GradeValidation {
  'Network Name': string,
  'School Name' : string,
  'School ID' : string,
  'Grade Term' : string,
  'Teacher Name' : string,
  'Course Number' : string,
  'Course Description' : string,
  'Student Name' : string,
  'Student ID' : string,
  'Transcript Column Name' : string,
  'Gradebook Calculation' : string,
  'Post Column Mark' : string,
  'Transcript Mark' : string,
  'Gradebook Score Last Update' : string,
  'Post Column Last Updated' : string,
  'Transcript Column Last Updated' : string,
}

export const gradeValidationKeys : KeysEnum<GradeValidation> = {
  'Network Name': true,
  'School Name' : true,
  'School ID' : true,
  'Grade Term' : true,
  'Teacher Name' : true,
  'Course Number' : true,
  'Course Description' : true,
  'Student Name' : true,
  'Student ID' : true,
  'Transcript Column Name' : true,
  'Gradebook Calculation' : true,
  'Post Column Mark' : true,
  'Transcript Mark' : true,
  'Gradebook Score Last Update' : true,
  'Post Column Last Updated' : true,
  'Transcript Column Last Updated' : true,
}

export interface LexiaReport {
  'Year': string,
  'Month': string,
  'Classes': string,
  'First Name' : string,
  'Last Name' :	string,
  'End of Month Level' : string,
  'Monthly Units' : string,
  'Monthly Minutes' : string,
  'Needs Instruction' : string,
}

export const lexiaReportKeys : KeysEnum<LexiaReport> = {
  'Year': true,
  'Month': true,
  'Classes': true,
  'First Name' : true,
  'Last Name' :	true,
  'End of Month Level' : true,
  'Monthly Units' : true,
  'Monthly Minutes' : true,
  'Needs Instruction' : true,
}