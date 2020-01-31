import * as React from 'react'


export const reportTag = (window: Window, action: string, email: string, report: string) => {
    
    console.log(action);
    if(email !== 'rlangworthy@cps.edu'){    
        (<any>window).gtag(
            'event',
            action, {
                'event_category': email,
                'event_label': report,
            }
        )
    }
}