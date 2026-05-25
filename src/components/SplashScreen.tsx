import { EpbjcLogo } from './EpbjcLogo'

export function SplashScreen({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      className="splash-screen"
      onClick={onStart}
      aria-label="Toque no ecrã para começar"
    >
      <EpbjcLogo
        className="school-logo school-logo--splash"
        title="Escola Profissional Bento de Jesus Caraça"
      />
      <h1 className="splash-school-name">
        Escola Profissional
        <span>Bento de Jesus Caraça</span>
      </h1>
      <p className="splash-tagline">Totem de Refeições</p>
      <p className="splash-cta blink">Toque no ecrã para começar</p>
    </button>
  )
}
