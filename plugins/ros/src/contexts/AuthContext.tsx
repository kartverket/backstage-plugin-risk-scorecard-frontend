import React, {ReactNode, useState} from "react";
import {googleAuthApiRef, useApi} from "@backstage/core-plugin-api";

type GoogleTokenRefreshProps = {
    showAuthPrompt: boolean;
    setTokenExpiration: (token: string) => void;
    getGoogleAuthAccessToken: () => Promise<string>;
    refreshGoogleAuthAccessToken: () => Promise<void>;
    refreshingGoogleAuthAccessToken: boolean;
    ignoreRefreshWarningForGoogleAuthAccessToken: () => void;
    tokenHasExpired: boolean;
}


const GoogleTokenRefreshContext = React.createContext<GoogleTokenRefreshProps |undefined>(undefined);

const GoogleTokenRefreshProvider = ({ children } : {children: ReactNode} ) => {
    const [timerForAuthPrompt, setTimerForAuthPrompt] = useState<NodeJS.Timeout | null>(null);
    const [showAuthPrompt, setShowAuthPrompt] = useState<boolean>(false);
    const googleApi = useApi(googleAuthApiRef)
    const [refreshingGoogleAuthAccessToken, setRefreshingAccessToken] = useState<boolean>(false);

    const [timerForTokenHasExpired, setTimerForTokenHasExpired] = useState<NodeJS.Timeout | null>(null);
    const [tokenHasExpired, setTokenHasExpired] = useState<boolean>(false);

    const getGoogleAuthAccessToken = async() => googleApi.getAccessToken(['https://www.googleapis.com/auth/cloudkms'])

    const setNewTimerForAuthPrompt = (timeToLive: number) => {
        if(timerForAuthPrompt) {
            clearTimeout(timerForAuthPrompt)
            setTimerForAuthPrompt(null)
            setShowAuthPrompt(false)
        }

        if(timerForTokenHasExpired) {
            setTimerForTokenHasExpired(null)
            setTokenHasExpired(false)
        }

        let tenMinutes = 600;
        const tokenIsDyingPromptTimer = setTimeout(() => {
            setShowAuthPrompt(true)
        }, (timeToLive - tenMinutes)*1000)

        setTimerForAuthPrompt(tokenIsDyingPromptTimer)

        const tokenIsDeadTimer = setTimeout(() => {
            setTokenHasExpired(true)
        })
        setTimerForTokenHasExpired(tokenIsDeadTimer)
    }

    const setGoogleTokenExpiration = async (token: string) => {
        const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`
        await fetch(tokenInfoUrl).then(x => {
            x.json().then(y => {
                setNewTimerForAuthPrompt(Number(y.expires_in));
            })
        })
    }


    const refreshGoogleAuthAccessToken = async () => {
        setRefreshingAccessToken(true)
        return getGoogleAuthAccessToken().then(token => {
            setGoogleTokenExpiration(token);
            setRefreshingAccessToken(false)
        }).catch(() => {setRefreshingAccessToken(false)});
    }

    const ignoreRefreshWarningForGoogleAuthAccessToken = () => {
        if(timerForAuthPrompt) {
            clearTimeout(timerForAuthPrompt)
        }
        setTimerForAuthPrompt(null)
        setShowAuthPrompt(false)
        setRefreshingAccessToken(false)
        setTokenHasExpired(false)
    }


    const tokenContext : GoogleTokenRefreshProps = {
        showAuthPrompt,
        setTokenExpiration: setGoogleTokenExpiration,
        getGoogleAuthAccessToken,
        refreshGoogleAuthAccessToken,
        refreshingGoogleAuthAccessToken,
        ignoreRefreshWarningForGoogleAuthAccessToken,
        tokenHasExpired
    }

    return <GoogleTokenRefreshContext.Provider value={tokenContext}>{children}</GoogleTokenRefreshContext.Provider>
}

const useGoogleTokenRefresh = () => {
    const context = React.useContext(GoogleTokenRefreshContext);
    if(context === undefined) {
        throw new Error('useGoogleTokenRefresh must be used within a GoogletokenRefreshProvider');
    }

    return context;
}

export {useGoogleTokenRefresh, GoogleTokenRefreshProvider};