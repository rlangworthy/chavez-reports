import * as React from 'react'
import * as gapi from 'googleapis'
import Navbar from 'react-bootstrap/Navbar'
import axios from 'axios'
import { 
    GoogleLogin, 
    GoogleLoginResponse, 
    GoogleLoginResponseOffline } from 'react-google-login';

import {
    useGoogleLogin,
    CredentialResponse,
    TokenResponse,
    } from '@react-oauth/google'


import {ReportHome} from './home'

interface SignInState {
    log: 'New' | 'Form' | 'Signed'
    account: string //GoogleLoginResponse | null
}

interface SignInProps {
    //success: (response: GoogleLoginResponse | GoogleLoginResponseOffline) => void
    //failure: (response: GoogleLoginResponse | GoogleLoginResponseOffline) => void
    setState: (state: SignInState) => void
}


export function SignInWrapper() {
    const [state, setState]: [SignInState, any]  = React.useState({log: 'New', account: ''})

    if( state.log === 'New'){
        return <LoginPage setState={setState}></LoginPage>
    }
    else{
        return (
            <ReportHome account={state.account}/>
        )
    }

}

export function LoginPage(props: SignInProps) {
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            //console.log(tokenResponse);
            const userInfo = await axios.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            { headers: { Authorization: 'Bearer '+ tokenResponse.access_token }},
            );
            const email = userInfo.data.email
            if(email.split('@')[email.split('@').length-1] === 'cps.edu'){

                props.setState({log:'Form', account: email})
            }
            //console.log(userInfo);
        },
        onError: errorResponse => console.log(errorResponse),
        });


    return (
        <>
            <button onClick={e => googleLogin()}>
                Login with Your CPS Email
            </button>
            
        </>
    )
}

/*


export class SignInWrapper extends React.Component<{}, SignInState> {
    constructor(props){
        super(props)
        this.state={log: 'New', account: null}
    }

    render(){
        if(this.state.log==='New'){
            return(<>
                <SignIn success={this.successResponse} failure={this.failureResponse}/>
                
                </>
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

const SignIn = (props: SignInProps) =>   
                            <>
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

*/