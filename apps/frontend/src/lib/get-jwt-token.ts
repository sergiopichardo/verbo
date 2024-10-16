import { fetchAuthSession } from "@aws-amplify/auth";

export const getJwtToken = async (): Promise<string | undefined> => {
    const session = await fetchAuthSession();
    const jwtToken = session?.tokens?.idToken?.toString();
    return jwtToken;
}