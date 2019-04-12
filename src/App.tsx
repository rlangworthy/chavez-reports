import React, { Component } from 'react';
import { ReportHome } from './home/home-cointainers/home'
import './App.css';
import {Route} from 'react-router';
import { createBrowserHistory } from 'history';
import {HROnePagers} from './weekly-one-pager/weekly-one-pager-displays/weekly-one-pagers-display'
import {ReportWrapper} from './shared/report-wrapper'
import {ReportCards} from './shared/report-types'
import { SummerschoolReportDownload } from './summerschool-report/summerschool-report-download'
import { StudentOnePagers } from './student-one-pager/student-one-pager-displays/student-one-pager-display'
import { StaffAbsenceReport } from './staff-absence-report/absence-containers/staff-absence-download'
import { GradebookAuditReport } from './gradebook-audit/gradebook-audit-containers/gradebook-audit-container'
import { StudentGradeSheets } from './student-grade-sheets/student-grade-display'

export const history = createBrowserHistory({});

//ReportWrapper assumes 
class App extends Component {
  render() {
    return (
      <React.Fragment>
        <Route exact={true} path='/' component={ReportHome} />
        <Route path={ReportCards[0].link} render={() => 
          <ReportWrapper reportTitle={ReportCards[0].title}>
            <GradebookAuditReport/>
          </ReportWrapper>}/>
        <Route path={ReportCards[1].link} render={() => 
          <ReportWrapper reportTitle={ReportCards[1].title}>
            <SummerschoolReportDownload/>
          </ReportWrapper>}/>
          <Route path={ReportCards[2].link} render={() => 
            <ReportWrapper reportTitle={ReportCards[2].title}>
              <StaffAbsenceReport/>
            </ReportWrapper>}/>
        <Route path={ReportCards[4].link} render={() => 
          <ReportWrapper reportTitle={ReportCards[4].title}>
            <HROnePagers/>
          </ReportWrapper>}/>
        <Route path={ReportCards[5].link} render={() => 
          <ReportWrapper reportTitle={ReportCards[5].title}>
            <StudentOnePagers/>
        </ReportWrapper>}/>
        <Route path={ReportCards[6].link} render={() => 
          <ReportWrapper reportTitle={ReportCards[6].title}>
            <StudentGradeSheets/>
        </ReportWrapper>}/>
      </React.Fragment>
    );
  }
}

export default App;
