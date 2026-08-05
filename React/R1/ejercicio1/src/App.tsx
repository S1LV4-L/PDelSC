import './App.css'
import { mostrar } from './components/holaMundo'
import { NightDayButton } from './components/NightDayButton'
import './styles/styles.css'

function App() {
  return (
    <>
      <NightDayButton />
      {mostrar()}
    </>
  )
}

export default App