export const storageKeys = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
}
export const storageValues = {
    accessToken: localStorage.getItem(storageKeys.accessToken),
    refreshToken: localStorage.getItem(storageKeys.refreshToken),
}