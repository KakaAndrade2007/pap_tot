// src/components/CategorySelector.tsx
import { GraduationCap, Apple, Briefcase, Building2 } from 'lucide-react'

export function CategorySelector({ onSelect }: { onSelect: (cat: any) => void }) {
  const categories = [
    { id: 'aluno', label: 'Aluno', icon: <GraduationCap size={50} /> },
    { id: 'professor', label: 'Professor', icon: <Apple size={50} /> },
    { id: 'funcionario', label: 'Funcionário', icon: <Briefcase size={50} /> },
    { id: 'pessoal_predio', label: 'Pessoal Prédio', icon: <Building2 size={50} /> },
  ]

  return (
    <div className="screen center">
      <header className="category-header">
        <img
          src="/epbjc-logo.svg"
          alt="EPBJC"
          className="school-logo school-logo--header"
        />
        <h1 className="title">BEM-VINDO À EPBJC</h1>
      </header>
      <div className="grid-buttons grid-buttons--2x2">
        {categories.map(cat => (
          <button key={cat.id} className="cat-btn" onClick={() => onSelect(cat.id)}>
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}