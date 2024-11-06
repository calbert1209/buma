import './app.css'
import { signal } from '@preact/signals'

const count = signal(0);
window.setInterval(() => count.value++, 3000);

export function App() {
  
  return (
    <h2>Hello world x{count}</h2>
  )
}
