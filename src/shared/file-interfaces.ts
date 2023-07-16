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