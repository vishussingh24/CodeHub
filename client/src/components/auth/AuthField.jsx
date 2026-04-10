function AuthField({ hint, label, ...inputProps }) {
  return (
    <label className="auth-field">
      <span className="auth-field__label">{label}</span>
      <input className="auth-field__input" {...inputProps} />
      {hint ? <span className="auth-field__hint">{hint}</span> : null}
    </label>
  );
}

export default AuthField;
