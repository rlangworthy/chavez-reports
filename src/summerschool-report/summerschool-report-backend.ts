import * as d3 from 'd3';

import {
  RawESCumulativeGradeExtractRow,
  RawStudentProfessionalSupportDetailsRow,
  RawNWEACDF,
  AspenESGradesRow } from '../shared/file-interfaces';

import {
  convertAspGrades
} from '../shared/utils'

type RawESCumulativeGradeExtract = RawESCumulativeGradeExtractRow[]
  
import {
  ReportFiles,
  ReportTitle,
  } from '../shared/report-types'
/*
interface AspenSummerschoolRawData {
  nweaCY: RawNWEACDF
  nweaLY: RawNWEACDF
  grades: AspenGradesExtract
  diverseLearners: RawTotalStudentsSpEdInstruction
}
*/
interface ImpactSummerschoolRawData {
  nweaCY: RawNWEACDF
  nweaLY: RawNWEACDF
  grades: RawESCumulativeGradeExtract
  paraProp: RawStudentProfessionalSupportDetailsRow[]
}

export type SummerschoolStatus = '1A' | '1B' | '2A' | '2B' | '3A' | '3B' | 'SpEd-Exempt' | 'Unknown';
export type SummerschoolWarning = '0W' | '1W' | '2W' | '3W' | 'NoWarning' | 'Unknown';

type SpEdStatus = string;

export interface SummerschoolReportOutputRow {
  studentID: string
  studentFirstName: string
  studentLastName: string
  studentHomeroom: string
  studentGradeLevel: string

  mathGrade: LetterGrade | null
  readingGrade: LetterGrade | null
  lyNWEAMath: number | null
  lyNWEARead: number | null
  cyNWEAMath: number | null
  cyNWEARead: number | null
  ellStatus: boolean
  spEdStatus: SpEdStatus | null

  status: SummerschoolStatus
  statusDescription: string
  warning: SummerschoolWarning
  warningDescription: string
};

export interface Student {
  studentID: string
  studentFirstName: string
  studentLastName: string
  studentHomeroom: string
  studentGradeLevel: string

  mathGrade: LetterGrade | null
  readingGrade: LetterGrade | null
  lyNWEAMath: number | null
  lyNWEARead: number | null
  cyNWEAMath: number | null
  cyNWEARead: number | null
  ellStatus: boolean
  spEdStatus: SpEdStatus | null
}

type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'F';



export const createSummerSchoolReportFromFiles = ( files: ReportFiles) => {
  
  const rg = files.reportFiles[files.reportTitle.files[0].fileDesc].parseResult;
  const cy = files.reportFiles[files.reportTitle.files[1].fileDesc].parseResult;
  const ly = files.reportFiles[files.reportTitle.files[2].fileDesc].parseResult;
  const pp = files.reportFiles[files.reportTitle.files[3].fileDesc].parseResult;

  const aspGrades = rg === null ? null : rg.data as AspenESGradesRow[];
  const rawGrades = aspGrades ? aspGrades.filter(g => g['Quarter']==='4').map(convertAspGrades): aspGrades
  const rawNWEACY = cy === null ? null : cy.data as RawNWEACDF;
  const rawNWEALY = ly === null ? null : ly.data as RawNWEACDF;
  const paraProp = pp === null ? null : pp.data as RawStudentProfessionalSupportDetailsRow[];
  if(rawGrades && rawNWEACY && rawNWEALY && paraProp){
    const students = getStudentsFromAspenData({
      grades: rawGrades,
      nweaCY: rawNWEACY,
      nweaLY: rawNWEALY,
      paraProp: paraProp,
    });

    const summerschoolData = createSummerschoolReport(students);
    return (summerschoolData.sort((a,b)=> a.studentHomeroom.concat(a.status).
      localeCompare(b.studentHomeroom.concat(b.status))));
  } else {
    return []
  }
}

export const getStudentsFromAspenData = ({nweaLY, nweaCY, grades, paraProp}: ImpactSummerschoolRawData): Student[] => {

  // gets the final grade, running second semester grade, first semester grade, running first semester grade,
  // Q4 grade, running Q4 grade, Q3 grade ... in that order
  interface RawStudentInfo {
    subjects: {
      subjectName: string
      quarterAvg: string
      finalAvg: string
    }[]
    firstName: string
    lastName: string
    homeroom: string
    gradeLevel: string
  }

  interface RawSummerStudent {
    [sudentID: string]: RawStudentInfo
  }

  const rawStudents: RawSummerStudent = d3.nest<RawESCumulativeGradeExtractRow, RawStudentInfo>()
                                            .key( r => r.StudentID)
                                            .rollup( rs => {
                                              return {
                                                quarterAvg: rs[0].QuarterAvg,
                                                finalAvg: rs[0].FinalAvg,
                                                firstName: rs[0].StudentFirstName,
                                                lastName: rs[0].StudentLastName,
                                                homeroom: rs[0].StudentHomeroom,
                                                gradeLevel: rs[0].StudentGradeLevel,
                                                subjects: rs.map( r => {
                                                  return {
                                                    subjectName: r.SubjectName,
                                                    quarterAvg: r.QuarterAvg,
                                                    finalAvg: r.FinalAvg,
                                                  }
                                                })
                                              }
                                            }).object(grades.filter( r => r.SubjectName === 'CHGO READING FRMWK' 
                                                                      || r.SubjectName === 'ALGEBRA'
                                                                      || r.SubjectName === 'MATHEMATICS STD'));
  
  const numToLetterGrade = (subject : {subjectName: string, quarterAvg: string, finalAvg: string}): LetterGrade | null => {
    const grade = ((subject.finalAvg !== '') ? parseInt(subject.finalAvg, 10): 
                      (subject.quarterAvg !== '') ? parseInt(subject.quarterAvg, 10): null);
    if(grade === null){
      return grade;
    }else if(grade > 90){
      return 'A';
    }else if(grade > 80){
      return 'B';
    }else if(grade > 70){
      return 'C';
    }else if(grade > 60){
      return 'D';
    }else{
      return 'F';
    }
  }

  const getMathGrade = (student: RawStudentInfo): LetterGrade | null => {
    const math = student.subjects.find( r => r.subjectName === 'MATHEMATICS STD');
    if(math !== undefined){
      return numToLetterGrade(math);
    }
    const alg = student.subjects.find( r => r.subjectName === 'ALGEBRA');
    if(alg !== undefined){
      return numToLetterGrade(alg);
    }
    return null;
  }

  const getReadingGrade = (student: RawStudentInfo): LetterGrade | null => {
    const subj = student.subjects.find( r => r.subjectName === 'CHGO READING FRMWK');
    if(subj !== undefined){
      return numToLetterGrade(subj);
    }
    return null;
  }

  const getNWEAMath = (studentID: string, nweaData: RawNWEACDF): number | null => {
    const MATH_DISCIPLINE = 'Mathematics';
    for (const record of nweaData) {
      if (record.StudentID === studentID) {
        if (record.Discipline === MATH_DISCIPLINE) {
          const parsed = Number.parseInt(record.TestPercentile, 10);
          if (Number.isNaN(parsed)) {
            throw new Error(`Failed to parse NWEA test percentile ${record.TestPercentile}`);
          } else {
            return parsed;
          }
        }
      }
    }
    return null;
  };

  const getNWEARead = (studentID: string, nweaData: RawNWEACDF): number | null => {
    const READ_DISCIPLINE = 'Reading';
    for (const record of nweaData) {
      if (record.StudentID === studentID) {
        if (record.Discipline === READ_DISCIPLINE) {
          const parsed = Number.parseInt(record.TestPercentile, 10);
          if (Number.isNaN(parsed)) {
            throw new Error(`Failed to parse NWEA test percentile ${record.TestPercentile}`);
          } else {
            return parsed;
          }
        }
      }
    }
    return null;
  };

  const getSpEdStatus = (studentID: string, diverseLearnerData: RawStudentProfessionalSupportDetailsRow[]): SpEdStatus | null => {
    // these are special education identification codes that indicate non-severe special ed instruction.
    // If a student has these sped codes, they do not qualify for sped exempt status.  
    // const NON_SPED_EXEMPT_CODES = ['504', 'SPL', '---'];
    for (const record of diverseLearnerData) {
      if (record['Student ID'] === studentID) {
        return record.PDIS;
      }
    }
    // if a student's record is not found in Special Ed records, assume student is not special ed exempt.
    return null; 
  };

  const getELLStatus = (studentID: string, paraPropData: RawStudentProfessionalSupportDetailsRow[]): boolean => {
    const ELL_YES = 'Yes';
    for (const record of paraPropData) {
      if (record['Student ID'] === studentID) {
        if (record.ELL ===  ELL_YES) {
          return true;
        } else {
          return false;
        }
      }
    }
    // if a student's record is not found in Special Ed records, assume student is not an english language learner.
    return false;
  };

  /**
   * Get a list of all unique students.
   *
   * Use ESCumulativeGradesExtract as the canonical reference for studentIDs, names, etc. Get unique
   * records in ESCumulativeGradesExtract by studentID and create a Student object for each of those records.
   */
  const students: Student[] = Object.keys(rawStudents).map( id => {
    const rawStudent = rawStudents[id];

    const student: Student = {
      studentID: id,
      studentFirstName: rawStudent.firstName,
      studentLastName: rawStudent.lastName,
      studentHomeroom: rawStudent.homeroom,
      studentGradeLevel: rawStudent.gradeLevel,

      cyNWEAMath: getNWEAMath(id, nweaCY),
      cyNWEARead: getNWEARead(id, nweaCY),
      lyNWEAMath: getNWEAMath(id, nweaLY),
      lyNWEARead: getNWEARead(id, nweaLY),
      
      mathGrade: getMathGrade(rawStudent),
      readingGrade: getReadingGrade(rawStudent),
      spEdStatus: getSpEdStatus(id, paraProp),
      ellStatus: getELLStatus(id, paraProp),
    }
    return student;
  });

  return students;
};

export type SummerschoolReportOutput = SummerschoolReportOutputRow[];


export const createSummerschoolReport = (students: Student[]): SummerschoolReportOutput => {

  const isSpEdExempt = (s: Student): boolean => {
    const NON_SPED_EXEMPT_CODES = ['504', 'SPL', '---', '--'];
    return s.spEdStatus !== null && NON_SPED_EXEMPT_CODES.indexOf(s.spEdStatus) === -1;
  };


  const getSummerschoolStatus = (s: Student): {status: SummerschoolStatus, description: string} => {
    // find the highest NWEA Math percentile from current year and previous year
    // and the highest NWEA Read percentile from current year and previous year.
    const max = (...xs: (number|null)[]): number => {
      const dropNull = arr => arr.filter( x => x !== null );
      return Math.max(...dropNull(xs));
    };
    const highNWEAMath = s.lyNWEAMath !== null ? s.lyNWEAMath: -1;
    const highNWEARead = s.lyNWEARead !== null? s.lyNWEARead: -1;
    const missingNWEAMath = s.lyNWEAMath === null && s.cyNWEAMath === null;
    const missingNWEARead = s.lyNWEARead === null && s.cyNWEARead === null;
    const missingNWEA = missingNWEAMath || missingNWEARead;

    /**
     * SpEd Exempt
     */
    // check if special ed status is not null
    // and if special ed status is not one of several special ed statuses that are not summerschool exempt
    if (isSpEdExempt(s)) {
      return {status: 'SpEd-Exempt', description: 'No Summer School'};
    }

    /**
     * Missing grades check: If a non-SpEd student is missing math and reading grades, return Unknown
     */
    if (s.mathGrade === null || s.readingGrade === null) {
      return {status: 'Unknown', description: 'Missing Math or Reading grades'};
    }

    /**
     * ELL students
     */
    // If student is an English Language Learner
    if (s.ellStatus) {
      // If both Reading Grade and Math Grade greater than or equal to C, no summer school
      if ((compareLetterGrade(s.readingGrade, 'C') >= 0 && compareLetterGrade(s.mathGrade, 'C') >= 0) ||
          (!missingNWEA && highNWEAMath >= 24 && highNWEARead >= 24 && 
          compareLetterGrade(s.readingGrade, 'D') >= 0 && compareLetterGrade(s.mathGrade, 'D') >= 0)) {
        return {status: '1A', description: 'No Summer School (ELL)'};
      }
      else {return {status: '1B', description: 'Summer School, No Exam (ELL)'}}
      // Else, fall through to other conditions
    }

    /**
     * Missing NWEA check: If a non-SpEd, non-ELL student is missing NWEA test records from both this year and
     * previous year in either math or reading, return Unknown.
     */
    if (missingNWEAMath || missingNWEARead) {
      return {status: 'Unknown', description: 'Missing NWEA test records for current year and previous year; summerschool status is unknown.'};
    }

    /**
     * Non-SpEd exempt, non-ell students with no missing nwea records or grades.
     */
    // If highest NWEA scores are both at least 24
    if (highNWEAMath >= 24 && highNWEARead >= 24) {
      // If reading and math grades above an F, No Summer School
      if (compareLetterGrade(s.readingGrade, 'F') === 1 && compareLetterGrade(s.mathGrade, 'F') === 1) {
        return {status: '1A', description: 'No Summer School'};
      // Otherwise, Summer School with no exam
      } else {
        return {status: '1B', description: 'Summer School, No Exam'};
      }

    // If highest NWEA scores are both at least 11
    } else if(highNWEAMath >= 11 && highNWEARead >= 11) {
      // If reading and math grades above a D, No Summer School
      if (compareLetterGrade(s.readingGrade, 'D') === 1 && compareLetterGrade(s.mathGrade, 'D') === 1) {
        return {status: '2A', description: 'No Summer School'};
      // Otherwise, Summer School with Exam
      } else {
        return {status: '2B', description: 'Summer School and Exam'};
      }

    // Otherwise (if NWEA scores are 10 or below)
    } else {
      // if reading and math grades are above a D, Summer School with Exam
      if (compareLetterGrade(s.readingGrade, 'D') === 1 && compareLetterGrade(s.mathGrade, 'D') === 1) {
        return {status: '3A', description: 'Summer School and Exam'};
      // Otherwise, Summer School with Exam
      } else {
        return {status: '3B', description: 'Summer School and Exam'};
      }
    }
  };

  const getSummerschoolWarning = (s: Student): {status: SummerschoolWarning, description: string} => {
    // find the highest NWEA Math percentile from current year and previous year
    // and the highest NWEA Read percentile from current year and previous year.
    const max = (...xs: (number|null)[]): number => {
      const dropNull = arr => arr.filter( x => x !== null );
      return Math.max(...dropNull(xs));
    };
    const highNWEAMath = s.lyNWEAMath !== null ? s.lyNWEAMath: -1;
    const highNWEARead = s.lyNWEARead !== null? s.lyNWEARead: -1;
    const missingNWEAMath = s.lyNWEAMath === null && s.cyNWEAMath === null;
    const missingNWEARead = s.lyNWEARead === null && s.cyNWEARead === null;

    // a SpEd student receives no warning
    if (isSpEdExempt(s)) {
      return {status: 'NoWarning', description: ''};
    }

    // if math or reading grades are null, return Unknown
    if (s.mathGrade === null || s.readingGrade === null) {
      return {status: 'Unknown', description: 'Missing Math or Reading grade'};
    }

    // an ELL student recieves a warning if grades are near a D in any subject
    if (s.ellStatus === true) {
      if (highNWEAMath >= 24 && highNWEARead >= 24){
        if (compareLetterGrade(s.readingGrade, 'D') <= 0 || compareLetterGrade(s.mathGrade, 'D') <= 0) {
          return {status: '1W', description: 'Warning (ELL): Close to F in Math or Reading with high NWEA.  If NWEA drops below 24 or grade becomes F, studet will need to go to summer school.'}
        } 
        else {
          return {status: 'NoWarning', description: ''}
        }
    }
      if (compareLetterGrade(s.readingGrade, 'C') <= 0 || compareLetterGrade(s.mathGrade, 'C') <= 0) {
        return {status: '1W', description: 'Warning (ELL): Close to a D in Math or Reading. If Math or reading grade becomes D, student will need to go to summer school.'};
      }
      else {
        return {status: 'NoWarning', description: ''}
      }
      // else fall through to other conditions
    }

    // if missing math or reading NWEA records from both this year and current year,
    // return Unknown
    if (missingNWEAMath || missingNWEARead) {
      return {status: 'Unknown', description: 'Missing both last and current year NWEA records'};
    }

    // a non-SpEd student recieves warnings 1W, 2W, or 3W depending on their nwea scores and grades.
    // If student's NWEA scores are >= 24, student recieves warning 1W if grades are close to an F in
    // any subject.
    if (highNWEAMath >= 24 && highNWEARead >= 24) {
      if (compareLetterGrade(s.readingGrade, 'D') <= 0 || compareLetterGrade(s.mathGrade, 'D') <= 0) {
        return {status: '1W', description: 'Warning: Close to a F in Math or Reading. If Math or Reading grade becomes F, student will need to go to summer school.'};
      } else {
        return {status: 'NoWarning', description: ''};
      }
    }

    // If student's NWEA scores are >= 11 and < 24, student recieves warning 2W if grades are close to a D in
    // any subject
    if (highNWEAMath >= 11 && highNWEARead >= 11) {
      if (compareLetterGrade(s.readingGrade, 'C') <= 0 || compareLetterGrade(s.mathGrade, 'C') <= 0) {
        return {status: '2W', description: 'Warning: Close to a D in Math or Reading with low NWEA. If Math or Reading grade becomes D, student will need to go to summer school.'};
      } else {
        return {status: 'NoWarning', description: ''};
      }

    // If student's NWEA scores are <= 10, student recieves warning 2W if grades are close to a D in
    // any subject
    } else {
        return {status: '3W', description: 'Warning: Student needs to socre above the 10th percentile on NWEA Reading and Math and maintain grade of C or above in Math and Reading to avoid summer school.'};
    }

  };

  // create summmerschool report by making a row for each unique student id.
  const output: SummerschoolReportOutput = students.map( student => {

    const summerschoolStatus = getSummerschoolStatus(student);
    const summerschoolWarning = getSummerschoolWarning(student);

    return {
      ...student,
      status: summerschoolStatus.status,
      statusDescription: summerschoolStatus.description,
      warning: summerschoolWarning.status,
      warningDescription: summerschoolWarning.description,
    };

  });

  return output;
}

const compareLetterGrade = (a: LetterGrade, b: LetterGrade): -1 | 0 | 1 => {
  const order: LetterGrade[] = ['A', 'B', 'C', 'D', 'F'];
  // a is higher than b
  if (order.indexOf(a) < order.indexOf(b)) {
      return 1;
  // a == b
  } else if (order.indexOf(a) === order.indexOf(b)) {
      return 0;
  // a is less than b
  } else {
      return -1;
  }

}

const convertToString = (file: File): Promise<string> => {
  return new Promise( (resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (ev: any) => {
      if (reader.error) {
        reject(reader.error);
      }
      if (ev.target && ev.target.result) {
        resolve(ev.target.result);
      } else {
        reject(reader.error);
      }
    }
  });
};