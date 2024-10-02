import * as dotenv from 'dotenv';
import * as path from 'path';
import { IAppTypes } from './IAppTypes';

dotenv.config({
    path: path.join(__dirname, '..', '.env')
});

// This function retrieves configuration values based on the provided key
// It takes a key of type keyof IAppTypes, which ensures type safety
// The function will return the corresponding value from the configMap object
export const getConfig = (key: keyof IAppTypes) => {
    const {
        AWS_ACCOUNT,
        AWS_REGION,
        DOMAIN,
        API_SUBDOMAIN,
        WEB_SUBDOMAIN
    } = process.env;


    if (!AWS_ACCOUNT) {
        throw new Error('AWS_ACCOUNT is not set');
    }

    if (!AWS_REGION) {
        throw new Error('AWS_REGION is not set');
    }

    if (!DOMAIN) {
        throw new Error('DOMAIN is not set');
    }

    if (!API_SUBDOMAIN) {
        throw new Error('API_SUBDOMAIN is not set');
    }

    if (!WEB_SUBDOMAIN) {
        throw new Error('WEB_SUBDOMAIN is not set');
    }

    const configMap: IAppTypes = {
        awsAccountId: AWS_ACCOUNT,
        awsRegion: AWS_REGION,
        domainName: DOMAIN,
        apiSubDomain: API_SUBDOMAIN,
        webSubDomain: WEB_SUBDOMAIN,
    };

    return configMap[key];
};

