import * as React from 'react'


export const reportTag = (window: Window, action: string, email: string, report: string) => {
    
    console.log(action);
    if((<any>window).gtag !== undefined){
        console.log("gtag exists")
        console.log((<any>window).gtag)
    }
    (<any>window).gtag(
        'event',
        action, {
            'event_category': email,
            'event_label': report,
        }
    )
}