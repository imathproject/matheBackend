const AuthService = require("../services/authService");
const UserService = require("../services/userService");
const emailService = require("../services/emailService");
const captchaService = require("../services/captchaService");
const { tryCatch } = require("../utils/tryCatch");

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax", //Lax or Nonee
};

const login = tryCatch(async (req, res) => {
  await captchaService.verify(req.body.token, "login");

  const { jwt: existingJwt } = req.cookies;

  if (existingJwt) {
    await AuthService.deleteToken(existingJwt);
    res.clearCookie("jwt", refreshCookieOptions);
  }

  const authData = await AuthService.login(req.body.email, req.body.password);

  res.cookie("jwt", authData.refreshToken, {
    ...refreshCookieOptions,
    maxAge: 24 * 60 * 60 * 1000
  });

  return res.status(200).json({
    token: authData.accessToken,
    userId: authData.userId,
    name: authData.name,
    surname: authData.surname,
    email: authData.email,
    completeProfile: authData.completeProfile,
    type: authData.typology,
  });
});

const logout = tryCatch(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) return res.sendStatus(204); //return res.status(400);
  await AuthService.logout(cookies.jwt);
  res.clearCookie("jwt", refreshCookieOptions);
  return res.status(200).json("Logout with success");
});

const refreshToken = tryCatch(async (req, res) => {

  const refreshTokenValue = req.cookies?.jwt;

  if (!refreshTokenValue) {
    console.warn("Refresh attempt without a token.");
    return res.status(401).json({ message: "No refresh token provided" });
  }

  const [newAccessToken, newRefreshToken] = await AuthService.refreshToken(refreshTokenValue);

  res.cookie("jwt", newRefreshToken, {
    ...refreshCookieOptions,
    maxAge: 24 * 60 * 60 * 1000
  });

  console.log("Access token successfully refreshed.");

  return res.status(200).json({
    accessToken: newAccessToken
  });
});

const signUp = tryCatch(async (req, res) => {
  await captchaService.verify(req.body.token, "signup");
  const newUser = await UserService.singUp(req.body);
  await emailService.sendWelcomeEmail(newUser);
  return res.status(200).json({ elements: newUser });
});

const requestNewPassword = tryCatch(async (req, res) => {
  const { token, email } = req.body;
  await captchaService.verify(token, "recover_password");
  const checkcode = await UserService.requestNewPassword(email);
  await emailService.sendPasswordRecoveryEmail(email, checkcode);
  return res.status(200).json({ elements: "Success" });
});

const recoverPassword = tryCatch(async (req, res) => {
  const pass = await UserService.recoverPassword(req.body);
  return res.status(200).json({ elements: pass });
});

const confirmEmail = tryCatch(async (req, res) => {
  const email = await UserService.confirmEmail(req.params.checkcode);
  return res.status(200).json({ elements: email });
});

module.exports = {
  login,
  refreshToken,
  logout,
  signUp,
  requestNewPassword,
  recoverPassword,
  confirmEmail,
};
