import React, { Component } from 'react';
import { SignInWrapper } from './home/home-cointainers/signin'
import './App.css';
import {Route} from 'react-router';
import { createBrowserHistory } from 'history';
import {ReportWrapper} from './shared/report-wrapper'
import {ReportCards} from './shared/report-types'


export const history = createBrowserHistory({});

//FIXME add report component to ReportCards 
/*
ReportWrapper assumes each child will have a prop for report files

Each report has its information stored in the ReportCards array.  New reports 
can be added there.
The ReportCards array is an array of ReportTitles that contain all the 
information needed to create an info card in the ReportHome component as well
as the component used to display the report and the list of files needed to
generate it.

Submitting files from the report home modal triggers the opening of a new
tab containing a ReportWrapper around the target report component.
The modal opens a broadcast channel and waits for a message from the open tab.
Once open, the new tab sends a message to the modal to let it know the channel
is open.  The modal then sends the appropriate files to the new tab at which
point the ReportWrapper renders the report using the newly sent files.

*/
class App extends Component {

  componentDidUpdate() {
    const location = history.location
    console.log(location)

  }

  
  render() {

    return (
      <>
        <Route exact={true} path={process.env.PUBLIC_URL + '/'} component={SignInWrapper} />
        {ReportCards.map( report => {
          const Component = report.component
          return (
            <Route path={report.link} 
              key={report.title} render={() =>
                <ReportWrapper reportTitle={report.title}>
                  <Component/>
                </ReportWrapper>
              }/>
          )
        })}
      </>
    );
  }
}

export default App;
