export const AUTH_COOKIE_NAME = "access_token";

export const authCookieOptions =
{
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1"
};