import { 
  createSummerschoolReport,
  Student,
} from './summerschool-report-backend';

// FIXME Not sure what the actual code is; this works
// because createSummerschoolReport only checks
// that SpEd code isn't one of a few non-exempt
// expected options
const SPED_EXEMPT_STATUS = 'any';

const SPED_504_PLAN = '504';

describe('createSummerschoolReport', () => {

  const blankStudent = (): Student => {
    return {
      studentID: '1',
      studentFirstName: 'Testy',
      studentLastName: 'McTesterson',
      studentGradeLevel: '4',
      studentHomeroom: 'HR 1',
      ellStatus: false,
      spEdStatus: null,
      lyNWEAMath: null,
      lyNWEARead: null,
      cyNWEAMath: null,
      cyNWEARead: null,
      mathGrade: null,
      readingGrade: null
    };
  };
  let student: Student = blankStudent();
  beforeEach( () => {
    student = blankStudent();
  });

  describe('summerschool status', () => {
    it('should set status 0A (No Summer School(ELL)) when an ELL student has lowest Math or Reading of C or greater', () => {
      student.ellStatus = true;
      student.cyNWEAMath = 1;
      student.cyNWEARead = 1;
      student.lyNWEAMath = 1;
      student.lyNWEARead = 1;
      student.mathGrade = 'C';
      student.readingGrade = 'B';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('0A');

      student.mathGrade = 'F';
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].status).not.toEqual('0A');
    });

    it('should set status 1A (No Summer School) when a non-SpEd student has highest NWEA of 24 or greater, lowest Math or Reading of D or greater', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 1;
      student.cyNWEARead = 1;
      student.lyNWEAMath = 25;
      student.lyNWEARead = 26;
      student.mathGrade = 'D';
      student.readingGrade = 'D';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('1A');

      student.lyNWEAMath = 1;
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].status).not.toEqual('1A');

      student.mathGrade = 'F';
      const outputC = createSummerschoolReport([student]);
      expect(outputC[0].status).not.toEqual('1A');
    });

    it('should set status 1A (No Summer School) when an ELL student has highest NWEA of 24 or greater, lowest Math or Reading of D (but not F or C,B,A)', () => {
      student.ellStatus = true;
      student.spEdStatus = null;

      student.cyNWEAMath = 1;
      student.cyNWEARead = 1;
      student.lyNWEAMath = 25;
      student.lyNWEARead = 26;
      student.mathGrade = 'D';
      student.readingGrade = 'A';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('1A');

      student.mathGrade = 'C';
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].status).not.toEqual('1A');

      student.mathGrade = 'F';
      const outputC = createSummerschoolReport([student]);
      expect(outputC[0].status).not.toEqual('1A');
    });

    it('should set status 1B (Summer School, No Test) when a non-SpEd student has highest NWEA of 24 or greater, Math or Reading of F or lower', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 1;
      student.lyNWEAMath = 25;
      student.cyNWEARead = 1;
      student.lyNWEARead = 26;
      student.mathGrade = 'B';
      student.readingGrade = 'F';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('1B');

      student.ellStatus = true;
      const outputELL = createSummerschoolReport([student]);
      expect(outputELL[0].status).toEqual('1B');
      student.ellStatus = false;

      student.lyNWEAMath = 1;
      student.cyNWEAMath = 1;
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].status).not.toEqual('1B');

      student.mathGrade = 'A';
      student.readingGrade = 'A';
      const outputC = createSummerschoolReport([student]);
      expect(outputC[0].status).not.toEqual('1B');
    });

    it('should set status 2A (No Summer School) when a non-SpEd, non-ELL student has highest NWEA of at least 11 but less than 24, and Math or Reading of C or greater', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 1;
      student.lyNWEAMath = 11;
      student.cyNWEARead = 1;
      student.lyNWEARead = 99;
      student.mathGrade = 'C';
      student.readingGrade = 'B';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('2A');

      student.ellStatus = true;
      const outputELL = createSummerschoolReport([student]);
      expect(outputELL[0].status).not.toEqual('2A');
      student.ellStatus = false;
    });

    it('should set status 2B (Summer School) when a non-SpEd student has highest NWEA of at least 11 but less than 24, and Math and Reading of D or lower', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 1;
      student.lyNWEAMath = 11;
      student.cyNWEARead = 1;
      student.lyNWEARead = 99;
      student.mathGrade = 'A';
      student.readingGrade = 'D';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('2B');

      student.ellStatus = true;
      const outputELL = createSummerschoolReport([student]);
      expect(outputELL[0].status).toEqual('2B');
      student.ellStatus = false;
    });

    it('should set status 3A (Summer School) when a non-SpEd, non-ELL student has highest NWEA of 10 or lower, and Math and Reading of C or greater', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 1;
      student.lyNWEAMath = 5;
      student.cyNWEARead = 1;
      student.lyNWEARead = 5;
      student.mathGrade = 'B';
      student.readingGrade = 'C';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('3A');

      student.ellStatus = true;
      const outputELL = createSummerschoolReport([student]);
      expect(outputELL[0].status).not.toEqual('3A');
      student.ellStatus = false;

    });

    it('should set status 3B (Summer School) when a non-SpEd student has highest NWEA of 10 or lower, and Math and Reading of D or lower', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 1;
      student.lyNWEAMath = 5;
      student.cyNWEARead = 1;
      student.lyNWEARead = 5;
      student.mathGrade = 'A';
      student.readingGrade = 'D';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('3B');

      student.ellStatus = true;
      const outputELL = createSummerschoolReport([student]);
      expect(outputELL[0].status).toEqual('3B');
      student.ellStatus = false;
    });

    it('should set status SpEd-Exempt when a student with a special ed status that exempts them from summer school ', () => {
      student.ellStatus = false;
      student.spEdStatus = SPED_EXEMPT_STATUS;

      student.cyNWEAMath = 1;
      student.lyNWEAMath = 5;
      student.cyNWEARead = 1;
      student.lyNWEARead = 5;
      student.mathGrade = 'D';
      student.readingGrade = 'F';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('SpEd-Exempt');

      student.spEdStatus = null;
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].status).not.toEqual('SpEd-Exempt');

      student.spEdStatus = '--';
      const outputC = createSummerschoolReport([student]);
      expect(outputC[0].status).not.toEqual('SpEd-Exempt');
    });

    it('should not set status SpEd-Exempt for ELL students or students with a 504 plan', () => {
      student.ellStatus = false;
      student.spEdStatus = SPED_504_PLAN;

      student.cyNWEAMath = 1;
      student.lyNWEAMath = 5;
      student.cyNWEARead = 1;
      student.lyNWEARead = 5;
      student.mathGrade = 'D';
      student.readingGrade = 'F';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).not.toEqual('SpEd-Exempt');
    });
  });


  describe('missing data', () => {
    it('should set Unknown (Missing NWEA) status if student is missing both last and current year NWEA tests in either discipline', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = null;
      student.lyNWEAMath = null;
      student.cyNWEARead = 1;
      student.lyNWEARead = 5;
      student.mathGrade = 'D';
      student.readingGrade = 'F';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('Unknown');

      student.cyNWEAMath = 99;
      student.lyNWEAMath = 99;
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].status).not.toEqual('Unknown');
    });

    it('should calculate summerschool status using available data if student is missing one of last and current year NWEA tests in either discipline', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = null;
      student.lyNWEAMath = 99;
      student.cyNWEARead = 1;
      student.lyNWEARead = 5;
      student.mathGrade = 'D';
      student.readingGrade = 'F';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).not.toEqual('Unknown');
    });

    it('should set Unknown (Missing Grade) status if non-ELL, non-SpEd student is missing any grade data', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 99; 
      student.lyNWEAMath = 99;
      student.cyNWEARead = 1;
      student.lyNWEARead = 5;
      student.mathGrade = null;
      student.readingGrade = 'F';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).toEqual('Unknown');

      student.mathGrade = 'F';
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].status).not.toEqual('Unknown');
    });

    it('should ignore missing NWEA data if a student is an ELL student with grades of a C or above.', () => {
      student.ellStatus = true;
      student.spEdStatus = null;

      student.cyNWEAMath = 3; 
      student.lyNWEAMath = 1;
      student.cyNWEARead = null;
      student.lyNWEARead = null;
      student.mathGrade = 'B';
      student.readingGrade = 'C';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).not.toEqual('Unknown');
      expect(outputA[0].warning).not.toEqual('Unknown');

      student.ellStatus = false;
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].status).toEqual('Unknown');
      expect(outputB[0].warning).toEqual('Unknown');
    });


    it('should ignore missing NWEA and/or grade data if a student has a summerschool-exempt SpEd status', () => {
      student.ellStatus = true;
      student.spEdStatus = SPED_EXEMPT_STATUS;

      student.cyNWEAMath = 3; 
      student.lyNWEAMath = 1;
      student.cyNWEARead = null;
      student.lyNWEARead = null;
      student.mathGrade = null;
      student.readingGrade = 'F';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].status).not.toEqual('Unknown');
      expect(outputA[0].warning).not.toEqual('Unknown');

      student.spEdStatus = null;
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].status).toEqual('Unknown');
      expect(outputB[0].warning).toEqual('Unknown');
    });

  });

  describe('summerschool warning', () => {
    it('should set warning 0W if an ELL, non-SpEd student\'s lowest grade is a C', () => {
      student.ellStatus = true;
      student.spEdStatus = null;

      student.cyNWEAMath = 3; 
      student.lyNWEAMath = 1;
      student.cyNWEARead = null;
      student.lyNWEARead = null;
      student.mathGrade = 'B';
      student.readingGrade = 'C';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].warning).toEqual('0W');
    });

    it('should set warning 1W if a non-SpEd, non-ELL student has an NWEA score of 24 or higher and a D in any grade', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 50; 
      student.lyNWEAMath = 44;
      student.cyNWEARead = 88;
      student.lyNWEARead = 1;
      student.mathGrade = 'D';
      student.readingGrade = 'C';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].warning).toEqual('1W');

      // ELL students can also fall into this category
      student.ellStatus = true;
      const outputB = createSummerschoolReport([student]);
      expect(outputB[0].warning).not.toEqual('1W');
      student.ellStatus = false;
    });

    it('should set warning 2W if a non-SpEd, non-ELL student has a NWEA score of 11 or higher but less than 24 and a C in any grade', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 1; 
      student.lyNWEAMath = 11;
      student.cyNWEARead = 23;
      student.lyNWEARead = 1;
      student.mathGrade = 'A';
      student.readingGrade = 'C';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].warning).toEqual('2W');

      // ELL students can also fall into this category
      student.ellStatus = true;
      const outputELL = createSummerschoolReport([student]);
      expect(outputELL[0].warning).not.toEqual('2W');
      student.ellStatus = false;
    });

    it('should set warning 3W if a non-ELL, non-SpEd student has a NWEA score of 10 or lower and a C in any grade', () => {
      student.ellStatus = false;
      student.spEdStatus = null;

      student.cyNWEAMath = 1; 
      student.lyNWEAMath = 9;
      student.cyNWEARead = 10;
      student.lyNWEARead = 1;
      student.mathGrade = 'A';
      student.readingGrade = 'C';

      const outputA = createSummerschoolReport([student]);
      expect(outputA[0].warning).toEqual('3W');

      // ELL students can also fall into this category
      student.ellStatus = true;
      const outputELL = createSummerschoolReport([student]);
      expect(outputELL[0].warning).not.toEqual('3W');
      student.ellStatus = false;
    });

  });

});

/*
xdescribe('getStudentsFromIMPACTData', () => {

});
 */
