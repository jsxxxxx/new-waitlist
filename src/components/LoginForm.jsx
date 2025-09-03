import React, { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import styles from "../LoginForm.module.css";

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);

  const auth = getAuth();

  const handleSignUp = async () => {
    setError("");
    setSuccess("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user);
      setSuccess("Sign-up successful!");
    } catch (err) {
      setError("Sign-up failed: " + err.message);
    }
  };
  const handleLogin = async () => {
    setError("");
    setSuccess("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user);
      setSuccess("Login successful!");
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        setSuccess("Password updated successfully.");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError("User is not logged in.");
      }
    } catch (err) {
      setError("Password change failed: " + err.message);
    }
  };

  return (
    <div className={styles.loginForm}>
      <h2>{isSignUp ? "Sign Up" : isChangePassword ? "Change Password" : "Login"}</h2>
      {!isChangePassword && (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </>
      )}
      {isChangePassword && (
        <>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </>
      )}
      <button
        onClick={isSignUp ? handleSignUp : isChangePassword ? handleChangePassword : handleLogin}
      >
        {isSignUp ? "Sign Up" : isChangePassword ? "Change Password" : "Login"}
      </button>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      {!isChangePassword && (
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => setIsSignUp(!isSignUp)} className={styles.toggle}>
            {isSignUp ? "Login here" : "Sign up here"}
          </span>
        </p>
      )}
      {!isSignUp && !isChangePassword && (
        <p>
          Forgot your password?{" "}
          <span onClick={() => setIsChangePassword(true)} className={styles.toggle}>
            Change it here
          </span>
        </p>
      )}
      {isChangePassword && (
        <p>
          Remembered your password?{" "}
          <span onClick={() => setIsChangePassword(false)} className={styles.toggle}>
            Back to login
          </span>
        </p>
      )}
    </div>
  );
};

export default LoginForm;