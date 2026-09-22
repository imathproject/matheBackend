const md5 = require("md5");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const jwt = require("jsonwebtoken");

const login = async (email, password) => {
  const hashedPassword = md5(password);
  const user = await User.findOne({
    where: {
      email: email,
      password: hashedPassword,
      verifyEmail: 1,
      ban: 0,
    },
  });

  if (!user) {
    throw { kind: "not_found" };
  }

  const accessToken = jwt.sign(
      { userInfo: { username: user.id, roles: user.typology } },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
      { username: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "24h" }
  );

  await saveRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    userId: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    completeProfile: user.completeProfile,
    typology: user.typology,
  };
};

const logout = async (refreshToken) => {
  try {
    const tokenRecord = await Token.findOne({
      where: { token: refreshToken },
      include: User,
    });

    if (tokenRecord) {
      await deleteTokenById(tokenRecord.id);

     console.log(`User session revoked for token ID: ${tokenRecord.id}`);

    } else {
      console.warn("Logout attempted with a non-existent or already revoked token.");
    }

    return { success: true, message: "Logged out successfully" };

  } catch (err) {
    console.error("Logout Error:", err.message);

    throw {
      kind: "forbidden",
      message: "An error occurred during the logout process"
    };
  }
};

const refreshToken = async (refreshToken) => {
  
  const tokenRecord = await Token.findOne({
    where: { token: refreshToken },
    include: User,
  });

 
  if (!tokenRecord) {
    console.warn("Refresh token not found in database.");
    throw { kind: "expired", message: "Session expired or invalid" };
  }

  const userId = tokenRecord.user_final.id;
  const userRole = tokenRecord.user_final.typology;

  try {
  
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);


    if (userId !== decoded.username) {
      console.error("Token ownership mismatch detected.");
      throw { kind: "forbidden", message: 'Invalid token ownership' };
    }

    const newAccessToken = jwt.sign(
        {
          userInfo: {
            username: decoded.username,
            roles: userRole,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
        { username: decoded.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "24h" }
    );

    await deleteTokenById(tokenRecord.id);
    await saveRefreshToken(userId, newRefreshToken);

    console.log(`New access token generated for user: ${userId}`);

    return [newAccessToken, newRefreshToken];

  } catch (err) {
    if (err.kind) throw err;
    console.error("JWT Verification failed, removing token from DB:", err.message);
    await deleteTokenById(tokenRecord.id);
    throw { kind: "expired", message: "Token verification failed" };
  }
};

const saveRefreshToken = async (userId, token) => {
  try {
    return await Token.create({
      token: token,
      user_id: userId,
    });
  } catch (err) {
    //console.error("Database Error: Failed to save refresh token", err.message);
    throw { kind: "database_error", message: "Failed to persist session" };
  }
};

const deleteTokenById = async (tokenId) => {
  try {
    const deletedRows = await Token.destroy({
      where: { id: tokenId },
    });
    if (deletedRows > 0) {
      return deletedRows;
    }
    else{
      return "Token not found";
    }
  } catch (err) {
    console.error("Database Error: Failed to delete token by ID", err.message);
    throw { kind: "database_error", message: "Error removing token by ID" };
  }
};

const deleteTokenByUser = async (userId) => {
  try {
    await Token.destroy({
      where: { user_id: userId },
    });

    return true;
  } catch (err) {
    console.error("Database Error: Failed to delete tokens for user", err.message);
    throw { kind: "forbidden", message: "Operation not allowed or database error" };
  }
};

const deleteToken = async (tokenValue) => {
  try {
    const deletedRows = await Token.destroy({
      where: { token: tokenValue },
    });
    if (deletedRows > 0) {
      return deletedRows;
    }
    else{
      return "Token not found";
    }
  } catch (err) {
    console.error("Database Error: Failed to revoke token value", err.message);
    throw { kind: "database_error", message: "Failed to logout or revoke session" };
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  deleteToken,
  deleteTokenByUser,
};
