import * as React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import { 
    GoogleLogin, 
    GoogleLoginResponse, 
    GoogleLoginResponseOffline } from 'react-google-login';


import {ReportHome} from './home'

interface SignInState {
    log: 'New' | 'Form' | 'Signed'
    account: GoogleLoginResponse | null
}

interface SignInProps {
    success: (response: GoogleLoginResponse | GoogleLoginResponseOffline) => void
    failure: (response: GoogleLoginResponse | GoogleLoginResponseOffline) => void
}


export class SignInWrapper extends React.PureComponent<{}, SignInState> {
    constructor(props){
        super(props)
        this.state={log: 'New', account: null}
    }

    render(){
        if(this.state.log==='New'){
            return(
                <SignIn success={this.successResponse} failure={this.failureResponse}/>
            )
        }
        else{
            return(
                <ReportHome account={this.state.account as GoogleLoginResponse}/>
            )
        }
    }

    failureResponse = (response) => {
        console.log(response);
      }
    successResponse = (response:GoogleLoginResponse | GoogleLoginResponseOffline): void => {
        if((response as GoogleLoginResponse).profileObj){
            const user = response as GoogleLoginResponse
            const email = user.getBasicProfile().getEmail()
            if(email.split('@')[email.split('@').length-1] === 'cps.edu'){
                this.setState({log:'Form', account:response as GoogleLoginResponse})
            }

        }
        else 
        {
            this.failureResponse(response)
        }
    }

}

const SignIn = (props: SignInProps) =>   <>
                                <Navbar>
                                    <Navbar.Brand>Chavez Report Suite</Navbar.Brand>
                                </Navbar>
                                <GoogleLogin
                                    clientId="126149146398-0q04pjbq98bov64tsgbgs5mlqmnmj540.apps.googleusercontent.com"
                                    buttonText="Login with Your CPS Email"
                                    onSuccess={props.success}
                                    onFailure={props.failure}
                                    cookiePolicy={'single_host_origin'}
                                />
                            </>

