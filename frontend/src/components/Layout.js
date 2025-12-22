import Header from "./Header";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <div style={{ paddingTop: "80px" }}>
        {children}
      </div>
    </>
  );
}
