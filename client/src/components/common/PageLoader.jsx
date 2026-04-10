function PageLoader({ label = 'Loading CodeHub...' }) {
  return (
    <main className="app-shell app-shell--centered">
      <div className="loader-card">
        <div className="loader-orbit" aria-hidden="true" />
        <p className="loader-copy">{label}</p>
      </div>
    </main>
  );
}

export default PageLoader;
