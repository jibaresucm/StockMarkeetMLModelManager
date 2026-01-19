import Navbar from "../components/Navbar.jsx"

function Home() {
  return (
    <>
      <Navbar />

      <main style={{ padding: "2rem" }}>
        <h1>Bienvenido a Mi App</h1>
        <p>
          Regístrate para acceder a todas las funcionalidades.
        </p>

        <div style={{ marginTop: "1rem" }}>
          <button>Registrarse</button>
          <button style={{ marginLeft: "1rem" }}>
            Iniciar sesión
          </button>
        </div>
      </main>
    </>
  )
}

export default Home
